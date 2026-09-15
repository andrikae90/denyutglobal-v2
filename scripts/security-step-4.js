import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const workerPath = 'worker.ts';
const packagePath = 'package.json';
const scriptPath = 'scripts/security-step-4.js';
let s = fs.readFileSync(workerPath, 'utf8');

if (!s.includes('RESEND_WEBHOOK_SIGNING_SECRET?: string;')) {
  const envOld = "  RESEND_API_KEY?: string;\n  NEWSLETTER_EMAIL_ENABLED?: string;";
  const envNew = "  RESEND_API_KEY?: string;\n  RESEND_WEBHOOK_SIGNING_SECRET?: string;\n  NEWSLETTER_EMAIL_ENABLED?: string;";
  if (!s.includes(envOld)) throw new Error('Env target not found');
  s = s.replace(envOld, envNew, 1);

  const marker = "// 5.8 RESEND WEBHOOK LISTENER (POST /api/webhooks/resend)";
  const start = s.indexOf(marker);
  const endMarker = "// 6. EDITORIAL AUTH (POST /api/editorial/auth)";
  const end = s.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('Webhook block boundaries not found');

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
  } catch { return false; }
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
  } catch (err) { console.error('Resend webhook signature verification error:', err); }
  return false;
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
          return jsonResponse({ received: false, error: 'Invalid webhook signature.' }, 401, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
        }
        let body: any;
        try { body = JSON.parse(rawBody); } catch { return jsonResponse({ received: false, error: 'Invalid JSON payload.' }, 400); }
        if (!env.DB) return jsonResponse({ received: false, error: 'Cloudflare D1 is unavailable.' }, 503);
        if (body?.type && body?.data?.email) {
          const targetEmail = typeof body.data.email === 'string' ? body.data.email.trim().toLowerCase() : '';
          if (targetEmail && (body.type === 'email.bounced' || body.type === 'email.complained')) {
            const updateRes = await executeWorkerD1Query(env.DB, \`UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE email = ?;\`, [targetEmail]);
            if (!updateRes.success) return jsonResponse({ received: false, error: 'Failed to update subscriber status.' }, 503);
          }
        }
        return jsonResponse({ received: true });
      } catch (e) {
        console.error('Resend webhook error:', e);
        return jsonResponse({ received: false, error: 'Webhook processing failed.' }, 500);
      }
    }

`;
  s = s.slice(0, start) + helper + newBlock + s.slice(end);
  fs.writeFileSync(workerPath, s);
  console.log('Patch 4 applied to worker.ts');
}

const originalPackage = execFileSync('git', ['show', 'HEAD^:package.json'], { encoding: 'utf8' });
fs.writeFileSync(packagePath, originalPackage);
fs.unlinkSync(scriptPath);
execFileSync('git', ['config', 'user.name', 'github-actions[bot]']);
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git', ['add', '-A']);
execFileSync('git', ['commit', '-m', 'security: verify Resend webhook signatures before processing'], { stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });
