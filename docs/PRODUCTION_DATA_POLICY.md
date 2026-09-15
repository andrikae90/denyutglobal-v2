# DenyutGlobal Production Data Policy

## Source of truth

Cloudflare D1 (`env.DB`) is the production source of truth for articles, subscribers, and newsletter delivery records.

Local JSON files such as `data_articles_server.json` and `data_subscribers_server.json` are development-only compatibility storage and must never be treated as production data stores.

## Deployment rule

Production requests must use the Cloudflare Worker and D1 bindings defined in `wrangler.jsonc`. Do not deploy the Express/Vite development server as the production application.

## Migration rule

Schema changes belong in `migrations/` and must be applied to the production D1 database before code that depends on the new schema is deployed.

## Secret rule

API credentials must remain in Cloudflare/GitHub secrets or environment bindings. Never commit real Gemini, Resend, Cloudflare, or editorial authentication secrets to the repository.
