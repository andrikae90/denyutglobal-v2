import fs from 'node:fs';
import { execSync } from 'node:child_process';

const path = 'worker.ts';
let s = fs.readFileSync(path, 'utf8');

// Idempotent: the patch may run in the follow-up workflow triggered by its own commit.
if (s.includes("'X-Frame-Options': 'SAMEORIGIN'") && s.includes("status: 'available'") && !s.includes('hasGeminiKey:')) {
  console.log('Security Patch 5 already present; nothing to commit.');
  process.exit(0);
}

const oldJson = `function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {\n  return new Response(JSON.stringify(data), {\n    status,\n    headers: {\n      'Content-Type': 'application/json; charset=utf-8',\n      'X-Robots-Tag': 'noindex, nofollow',\n      'Access-Control-Allow-Origin': '*',\n      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',\n      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Editorial-Token',\n      ...headers\n    }\n  });\n}`;
const newJson = `function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {\n  const appUrl = 'https://denyutglobal.my.id';\n  return new Response(JSON.stringify(data), {\n    status,\n    headers: {\n      'Content-Type': 'application/json; charset=utf-8',\n      'X-Robots-Tag': 'noindex, nofollow',\n      'X-Content-Type-Options': 'nosniff',\n      'X-Frame-Options': 'SAMEORIGIN',\n      'Referrer-Policy': 'strict-origin-when-cross-origin',\n      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',\n      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',\n      'Access-Control-Allow-Origin': appUrl,\n      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',\n      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Editorial-Token',\n      ...headers\n    }\n  });\n}`;
if (!s.includes(oldJson)) throw new Error('jsonResponse block not found');
s = s.replace(oldJson, newJson);

const oldPreflight = `    // 1. CORS Preflight\n    if (method === 'OPTIONS') {\n      return new Response(null, {\n        status: 204,\n        headers: {\n          'Access-Control-Allow-Origin': '*',\n          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',\n          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Editorial-Token',\n          'Access-Control-Max-Age': '86400'\n        }\n      });\n    }`;
const newPreflight = `    // 1. CORS Preflight — only the production origin is allowed\n    if (method === 'OPTIONS') {\n      const requestedOrigin = request.headers.get('Origin') || '';\n      const allowedOrigin = 'https://denyutglobal.my.id';\n      const corsOrigin = requestedOrigin === allowedOrigin ? allowedOrigin : allowedOrigin;\n      return new Response(null, {\n        status: 204,\n        headers: {\n          'Access-Control-Allow-Origin': corsOrigin,\n          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',\n          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Editorial-Token',\n          'Access-Control-Max-Age': '86400',\n          'Vary': 'Origin',\n          'X-Content-Type-Options': 'nosniff',\n          'X-Frame-Options': 'SAMEORIGIN',\n          'Referrer-Policy': 'strict-origin-when-cross-origin',\n          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'\n        }\n      });\n    }`;
if (!s.includes(oldPreflight)) throw new Error('preflight block not found');
s = s.replace(oldPreflight, newPreflight);

const oldHealth = `      return jsonResponse({\n        status: 'ok',\n        runtime: 'cloudflare_workers',\n        hasD1: !!env.DB,\n        hasGeminiKey: !!(env.GEMINI_API_KEY || (globalThis as any).process?.env?.GEMINI_API_KEY)\n      });`;
const newHealth = `      return jsonResponse({\n        status: 'ok',\n        runtime: 'cloudflare_workers'\n      });`;
if (!s.includes(oldHealth)) throw new Error('health block not found');
s = s.replace(oldHealth, newHealth);

const oldD1 = `      if (!env.DB) {\n        return jsonResponse({\n          success: false,\n          d1_connected: false,\n          d1_source: 'none',\n          error: 'Cloudflare D1 binding (env.DB) is not present.',\n          mode: 'Cloudflare Workers Binding'\n        });\n      }`;
const newD1 = `      if (!env.DB) {\n        return jsonResponse({\n          success: false,\n          error: 'Layanan basis data sementara tidak tersedia.'\n        }, 503);\n      }`;
if (!s.includes(oldD1)) throw new Error('D1 missing block not found');
s = s.replace(oldD1, newD1);

const oldD1Success = `        return jsonResponse({\n          success: true,\n          d1_connected: true,\n          d1_source: 'd1_binding',\n          total_articles_in_d1: total,\n          error: null,\n          mode: 'Cloudflare Workers Native D1 Binding'\n        });`;
const newD1Success = `        return jsonResponse({\n          success: true,\n          status: 'available'\n        });`;
if (!s.includes(oldD1Success)) throw new Error('D1 success block not found');
s = s.replace(oldD1Success, newD1Success);

const oldD1Fail = `      return jsonResponse({\n        success: false,\n        d1_connected: false,\n        d1_source: 'd1_binding',\n        total_articles_in_d1: 0,\n        error: queryRes.error,\n        mode: 'Cloudflare Workers Native D1 Binding'\n      }, 502);`;
const newD1Fail = `      return jsonResponse({\n        success: false,\n        error: 'Layanan basis data sementara tidak tersedia.'\n      }, 503);`;
if (!s.includes(oldD1Fail)) throw new Error('D1 fail block not found');
s = s.replace(oldD1Fail, newD1Fail);

fs.writeFileSync(path, s);
execSync('git config user.name "denyutglobal-security-bot"');
execSync('git config user.email "security@denyutglobal.my.id"');
execSync('git add worker.ts');
execSync('git commit -m "security: harden API diagnostics and CORS"');
execSync('git push origin HEAD:main');
console.log('Security Patch 5 applied and pushed.');
