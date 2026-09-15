# Ruang Redaksi — Passphrase Hash

Autentikasi Ruang Redaksi menggunakan passphrase yang **tidak disimpan di browser**. Worker menghitung SHA-256 dari passphrase yang sudah menjalani `trim()`, lalu membandingkannya dengan Cloudflare Secret:

`EDITORIAL_PASSPHRASE_SHA256_HASH`

## Cara membuat hash yang benar

Dari root repository jalankan:

```bash
npm run hash:editorial
```

Script akan meminta passphrase secara interaktif dan tidak menampilkan karakter passphrase di terminal. Script hanya menampilkan hasil SHA-256.

Salin **hanya hash SHA-256** tersebut ke Cloudflare Workers → Settings → Variables and Secrets sebagai Secret:

`EDITORIAL_PASSPHRASE_SHA256_HASH`

Jangan masukkan passphrase asli ke:

- GitHub repository
- `wrangler.jsonc`
- `vars`
- `.env` yang di-commit
- source code

## Aturan penting

Hash dibuat dari passphrase setelah `trim()`. Artinya spasi yang tidak sengaja berada di awal atau akhir passphrase tidak ikut dihitung.

Setelah Secret diperbarui di Cloudflare, deploy versi Worker terbaru agar perubahan digunakan oleh deployment tersebut.

## Verifikasi

Buka:

`https://denyutglobal.my.id/redaksi`

Masukkan **passphrase asli**, bukan hash.

Server akan menghitung SHA-256 passphrase tersebut dan membandingkannya dengan `EDITORIAL_PASSPHRASE_SHA256_HASH`.
