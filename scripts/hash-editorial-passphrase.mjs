#!/usr/bin/env node

import { createHash } from 'node:crypto';
import readline from 'node:readline';

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      reject(new Error('Jalankan perintah ini langsung di terminal interaktif.'));
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode?.(wasRaw ?? false);
      rl.close();
    };

    const onData = (chunk) => {
      const key = chunk.toString('utf8');
      if (key === '\u0003') {
        cleanup();
        reject(new Error('Dibatalkan.'));
      }
    };

    stdin.on('data', onData);
    stdin.setRawMode(true);
    stdin.resume();

    rl.question(prompt, (answer) => {
      cleanup();
      resolve(answer);
    });
  });
}

try {
  const passphrase = await readHidden('Masukkan passphrase Ruang Redaksi: ');
  const normalized = passphrase.trim();

  if (!normalized) {
    throw new Error('Passphrase kosong setelah trim().');
  }

  const hash = createHash('sha256').update(normalized, 'utf8').digest('hex');

  console.log('\nHash SHA-256 yang harus dimasukkan ke Cloudflare:');
  console.log(hash);
  console.log('\nNama secret: EDITORIAL_PASSPHRASE_SHA256_HASH');
  console.log('Jangan memasukkan passphrase asli ke GitHub atau wrangler.jsonc.');
} catch (error) {
  console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
