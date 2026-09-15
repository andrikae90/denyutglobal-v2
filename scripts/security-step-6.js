import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const workerPath = 'worker.ts';
const packagePath = 'package.json';

let worker = fs.readFileSync(workerPath, 'utf8');

if (!worker.includes('const editorialAuthRateLimit = new Map')) {
  const marker = 'let memoryArticlesCache: NewsItem[] = [];';
  if (!worker.includes(marker)) throw new Error('Patch #6 marker not found: memoryArticlesCache');
  const helper = `${marker}\n\ntype EditorialAuthRateState = { windowStart: number; attempts: number; blockedUntil: number };\nconst editorialAuthRateLimit = new Map<string, EditorialAuthRateState>();\nconst EDITORIAL_AUTH_WINDOW_MS = 60_000;\nconst EDITORIAL_AUTH_MAX_ATTEMPTS = 5;\nconst EDITORIAL_AUTH_BLOCK_MS = 15 * 60_000;\nconst EDITORIAL_AUTH_MAX_TRACKED_CLIENTS = 5_000;\n\nfunction getEditorialAuthClientKey(request: Request): string {\n  return (request.headers.get('CF-Connecting-IP') || 'unknown').trim() || 'unknown';\n}\n\nfunction checkEditorialAuthRateLimit(request: Request): { allowed: boolean; retryAfter: number } {\n  const now = Date.now();\n  const key = getEditorialAuthClientKey(request);\n  const state = editorialAuthRateLimit.get(key);\n\n  if (!state) {\n    editorialAuthRateLimit.set(key, { windowStart: now, attempts: 1, blockedUntil: 0 });\n    return { allowed: true, retryAfter: 0 };\n  }\n\n  if (state.blockedUntil > now) {\n    return { allowed: false, retryAfter: Math.max(1, Math.ceil((state.blockedUntil - now) / 1000)) };\n  }\n\n  if (now - state.windowStart >= EDITORIAL_AUTH_WINDOW_MS) {\n    state.windowStart = now;\n    state.attempts = 1;\n    state.blockedUntil = 0;\n    return { allowed: true, retryAfter: 0 };\n  }\n\n  state.attempts += 1;\n  if (state.attempts > EDITORIAL_AUTH_MAX_ATTEMPTS) {\n    state.blockedUntil = now + EDITORIAL_AUTH_BLOCK_MS;\n    return { allowed: false, retryAfter: Math.ceil(EDITORIAL_AUTH_BLOCK_MS / 1000) };\n  }\n\n  return { allowed: true, retryAfter: 0 };\n}\n\nfunction clearEditorialAuthRateLimit(request: Request): void {\n  editorialAuthRateLimit.delete(getEditorialAuthClientKey(request));\n}\n\nfunction pruneEditorialAuthRateLimit(): void {\n  const now = Date.now();\n  for (const [key, state] of editorialAuthRateLimit) {\n    if (state.blockedUntil <= now && now - state.windowStart > EDITORIAL_AUTH_WINDOW_MS) {\n      editorialAuthRateLimit.delete(key);\n    }\n  }\n  while (editorialAuthRateLimit.size > EDITORIAL_AUTH_MAX_TRACKED_CLIENTS) {\n    const oldestKey = editorialAuthRateLimit.keys().next().value;\n    if (!oldestKey) break;\n    editorialAuthRateLimit.delete(oldestKey);\n  }\n}\n`;
  worker = worker.replace(marker, helper);
}

const authStart = "    if (pathname === '/api/editorial/auth' && method === 'POST') {";
const authGuard = `      pruneEditorialAuthRateLimit();\n      const authRate = checkEditorialAuthRateLimit(request);\n      if (!authRate.allowed) {\n        return jsonResponse({ success: false, error: 'Terlalu banyak percobaan autentikasi. Silakan coba lagi nanti.' }, 429, { 'Retry-After': String(authRate.retryAfter), 'Cache-Control': 'no-store' });\n      }\n`;
if (!worker.includes(authGuard)) {
  if (!worker.includes(authStart)) throw new Error('Patch #6 marker not found: editorial auth route');
  worker = worker.replace(`${authStart}\n      try {`, `${authStart}\n${authGuard}      try {`);
}

const successMarker = "          activeEditorialSessions.set(sessionToken, expiresAt);";
if (!worker.includes('clearEditorialAuthRateLimit(request);')) {
  if (!worker.includes(successMarker)) throw new Error('Patch #6 marker not found: editorial auth success');
  worker = worker.replace(successMarker, `${successMarker}\n          clearEditorialAuthRateLimit(request);`);
}

const statusRoute = "    if (pathname === '/api/subscription-status' || pathname === '/api/subscription/status') {";
if (!worker.includes(`${statusRoute}\n      if (method !== 'GET' && method !== 'POST')`)) {
  if (!worker.includes(statusRoute)) throw new Error('Patch #6 marker not found: subscription status route');
  worker = worker.replace(statusRoute, `${statusRoute}\n      if (method !== 'GET' && method !== 'POST') {\n        return jsonResponse({ success: false, error: 'Method not allowed.' }, 405, { 'Allow': 'GET, POST' });\n      }`);
}

worker = worker.replace(/return jsonResponse\(\{\n\s*success: true,\n\s*exists: false,\n\s*status: 'none',\n\s*isSubscribed: false\n\s*\}\);/, "return jsonResponse({\n          success: true,\n          isSubscribed: false\n        });");

const editorialGetRoute = "    if (pathname === '/api/editorial/articles' && method === 'GET') {";
const fallbackBlock = /\n\s*return jsonResponse\(\{\n\s*success: true,\n\s*source: 'server_store',\n\s*count: memoryArticlesCache\.length,\n\s*data: memoryArticlesCache\n\s*\}\);\n\s*\}/;
if (worker.includes(editorialGetRoute) && fallbackBlock.test(worker)) {
  worker = worker.replace(fallbackBlock, `\n      return jsonResponse({\n        success: false,\n        error: 'Cloudflare D1 tidak tersedia. Akses artikel redaksi dihentikan.'\n      }, 503);\n    }`);
}

fs.writeFileSync(workerPath, worker);

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts.build = 'vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs';
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

fs.unlinkSync(new URL(import.meta.url).pathname);

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { stdio: 'inherit' });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { stdio: 'inherit' });
execFileSync('git', ['add', 'worker.ts', 'package.json', 'scripts/security-step-6.js'], { stdio: 'inherit' });
execFileSync('git', ['commit', '-m', 'security: harden editorial auth and API endpoints'], { stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });
