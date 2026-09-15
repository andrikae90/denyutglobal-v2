# DenyutGlobal Image Storage — Patch #7

## Target architecture

- Cloudflare R2 is the intended primary object store for editorial images.
- D1 stores article metadata and the R2 object key/URL, not image binaries.
- Existing image URLs must remain untouched during migration.
- New uploads must validate MIME type and maximum size before writing to R2.
- R2 upload access must be authenticated by the editorial session; the bucket must not expose an unauthenticated write API.
- Public reads may be served through a controlled Worker route or a custom R2 domain.

## Required Cloudflare setup before enabling the binding

Create a production R2 bucket in the same Cloudflare account as the Worker. Recommended bucket name:

`denyutglobal-media`

Then bind it in `wrangler.jsonc` as `MEDIA_BUCKET`:

```json
"r2_buckets": [
  {
    "binding": "MEDIA_BUCKET",
    "bucket_name": "denyutglobal-media"
  }
]
```

Do not add this binding until the bucket exists; otherwise the production deployment can fail.

## Migration rule

Do not bulk-rewrite existing article image URLs yet. First verify the R2 bucket, upload/read route, and rollback path in production. Existing images remain the source of truth until each object has a verified R2 copy.

## Safety requirements

- Allow only image MIME types required by the editorial UI (for example `image/jpeg`, `image/png`, `image/webp`).
- Enforce a server-side byte limit.
- Generate server-side object keys; never use an arbitrary user-supplied path as an R2 key.
- Never expose R2 write credentials to the browser.
- Set explicit `Content-Type` and cache metadata on stored objects.
- Return generic errors without exposing storage internals.
- Add an integrity/checksum check for migration jobs.
- Keep a second backup before deleting or replacing legacy images.

Cloudflare's Workers R2 API supports server-side `put()`/`get()` through an R2 binding. Single PUT is suitable for small/medium images; larger files can use multipart upload.
