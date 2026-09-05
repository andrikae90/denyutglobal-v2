const fs = require('fs');
const { execSync } = require('child_process');

const targetIds = [
  'art-1788130017453',
  'art-1787463713763',
  'art-1787391937917',
  'art-1788175056641',
  'art-1787956846906'
];

const sql = `SELECT * FROM articles WHERE id IN (${targetIds.map(id => `'${id}'`).join(',')});`;
const cmd = `npx wrangler d1 execute denyutglobal-production-db --remote --json --command="${sql}"`;
const out = JSON.parse(execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }));
const rows = out[0].results;

fs.writeFileSync('batch2_snapshot.json', JSON.stringify(rows, null, 2), 'utf-8');
console.log(`Saved snapshot of ${rows.length} articles to batch2_snapshot.json.`);
