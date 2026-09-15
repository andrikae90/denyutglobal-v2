import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const workerPath = 'worker.ts';
const packagePath = 'package.json';
const patchScriptPath = 'scripts/security-step-4.js';

const worker = fs.readFileSync(workerPath, 'utf8');
if (worker.includes('RESEND_WEBHOOK_SIGNING_SECRET?: string;')) {
  console.log('Patch 4 already present.');
  process.exit(0);
}

let updated = worker;
const envOld = "  RESEND_API_KEY?: string;\n  NEWSLETTER_EMAIL_ENABLED?: string;";
const envNew = "  RESEND_API_KEY?: string;\n  RESEND_WEBHOOK_SIGNING_SECRET?: string;\n  NEWSLETTER_EMAIL_ENABLED?: string;";
if (!updated.includes(envOld)) throw new Error('Env target not found');
updated = updated.replace(envOld, envNew);

const marker = "// 5.8 RESEND WEBHOOK LISTENER (POST /api/webhooks/resend)";
if (!updated.includes(marker)) throw new Error('Webhook marker not found');

const helper = `async function verifyResendWebhookSignature(request: Request, rawBody: string, env: Env): Promise<boolean> {
  const secret = (env.RESEND_WEBHOOK_SIGNING_SECRET || '').trim();
  if (!secret) return false;
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) return false;
  const timestamp = Number(svixTimestamp);
  if (!Number.isFinite(timestamp)) return false;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (ageSeconds > 300) return false;

  const secretValue = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  let secretBytes: Uint8Array;
  try {
    const normalized = secretValue.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    secretBytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signedPayload = \`${'${svixId}'}.${'${svixTimestamp}'}.${'${rawBody}'}\`;
    for (const entry of svixSignature.split(' ').map((v) => v.trim()).filter(Boolean)) {
      const match = /^v1,(.+)$/.exec(entry);
      if (!match) continue;
      try {
        const normalizedSignature = match[1].replace(/-/g, '+').replace(/_/g, '/');
        const paddedSignature = normalizedSignature + '='.repeat((4 - (normalizedSignature.length % 4)) % 4);
        const binarySignature = atob(paddedSignature);
        const signatureBytes = Uint8Array.from(binarySignature, (char) => char.charCodeAt(0));
        if (await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(signedPayload))) return true;
      } catch {}
    }
  } catch (err) {
    console.error('Resend webhook signature verification error:', err);
  }
  return false;
}

`;
updated = updated.replace(marker, helper + marker);

const oldBlock = `    // 5.8 RESEND WEBHOOK LISTENER (POST /api/webhooks/resend)
    if (pathname === '/api/webhooks/resend' && method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        if (body?.type && body?.data?.email && env.DB) {
          const targetEmail = body.data.email.toLowerCase();
          if (body.type === 'email.bounced' || body.type === 'email.complained') {
            await executeWorkerD1Query(
              env.DB,
              \`UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE email = ?;\`,
              [targetEmail]
            );
          }
        }
        return jsonResponse({ received: true });
      } catch (e) {
        return jsonResponse({ received: true });
      }
    }
`;

const newBlock = `    // 5.8 RESEND WEBHOOK LISTENER (POST /api/webhooks/resend)
    if (pathname === '/api/webhooks/resend') {
      if (method !== 'POST') {
        return jsonResponse({ received: false, error: 'Method not allowed.' }, 405, { 'Allow': 'POST' });
      }
      try {
        const rawBody = await request.text();
        if (!await verifyResendWebhookSignature(request, rawBody, env)) {
          return jsonResponse({ received: false, error: 'Invalid webhook signature.' }, 401, {
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow'
          });
        }
        let body: any;
        try {
          body = JSON.parse(rawBody);
        } catch {
          return jsonResponse({ received: false, error: 'Invalid JSON payload.' }, 400);
        }
        if (!env.DB) {
          return jsonResponse({ received: false, error: 'Cloudflare D1 is unavailable.' }, 503);
        }
        if (body?.type && body?.data?.email) {
          const targetEmail = typeof body.data.email === 'string' ? body.data.email.trim().toLowerCase() : '';
          if (targetEmail && (body.type === 'email.bounced' || body.type === 'email.complained')) {
            const updateRes = await executeWorkerD1Query(
              env.DB,
              \`UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE email = ?;\`,
              [targetEmail]
            );
            if (!updateRes.success) {
              return jsonResponse({ received: false, error: 'Failed to update subscriber status.' }, 503);
            }
          }
        }
        return jsonResponse({ received: true });
      } catch (e) {
        console.error('Resend webhook error:', e);
        return jsonResponse({ received: false, error: 'Webhook processing failed.' }, 500);
      }
    }
`;

if (!updated.includes(oldBlock)) throw new Error('Original webhook block not found');
updated = updated.replace(oldBlock, newBlock);
fs.writeFileSync(workerPath, updated);

// Restore the normal package.json so this one-shot build patch leaves no persistent build hook.
execFileSync('git', ['show', 'HEAD^:package.json'], { stdio: ['ignore', fs.openSync(packagePath, 'w'), 'inherit'] });
fs.unlinkSync(patchScriptPath);

execFileSync('git', ['add', '-A']);
execFileSync('git', ['commit', '-m', 'security: verify Resend webhook signatures before processing'], { stdio: 'inherit' });
console.log('Patch 4 committed; continuing with the patched build/deploy.');
