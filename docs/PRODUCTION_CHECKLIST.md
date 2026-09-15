# DenyutGlobal Production Checklist

- [ ] Cloudflare Worker is the only production runtime.
- [ ] D1 migrations are applied to `denyutglobal-production-db`.
- [ ] `GEMINI_API_KEY` is configured as a secret/binding, not committed.
- [ ] `RESEND_API_KEY` is configured as a secret/binding, not committed.
- [ ] Editorial authentication secrets are configured only as secrets/bindings.
- [ ] Newsletter delivery is intentionally enabled only after sender/domain verification.
- [ ] `robots.txt` and `sitemap.xml` return successfully in production.
- [ ] Article canonical URLs resolve to public article pages.
- [ ] Test/editorial endpoints are not indexable.
- [ ] A production smoke test is run after every deployment.
