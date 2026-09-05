import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSitemapXml } from '../src/utils/sitemap';
import { isPublicArticle } from '../src/utils/articleGuard';

async function main() {
  console.log('Fetching all published and reviewed articles from production D1...');
  const cmd = `npx wrangler d1 execute denyutglobal-production-db --remote --json --command="SELECT * FROM articles WHERE status = 'published' AND reviewed = 1 ORDER BY created_at DESC;"`;
  const rawOutput = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });

  const parsed = JSON.parse(rawOutput);
  if (!parsed || !parsed[0] || !Array.isArray(parsed[0].results)) {
    throw new Error('Invalid output from D1 query: ' + rawOutput);
  }

  const rawArticles = parsed[0].results;
  console.log(`Retrieved ${rawArticles.length} candidate rows from D1.`);

  // Validate each article with unified articleGuard
  const validArticles = rawArticles.filter(isPublicArticle);
  console.log(`Validated ${validArticles.length} public articles with isPublicArticle.`);

  const sitemapXml = generateSitemapXml(validArticles, 'https://denyutglobal.my.id');

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXml, 'utf-8');
  console.log(`Successfully generated public/sitemap.xml with ${validArticles.length} articles.`);
}

main().catch((err) => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
