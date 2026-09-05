/**
 * Canonical 301 Permanent Redirects for Legacy Slugs & De-duplicated Articles
 * Maps old slug -> new destination path (/berita/:newSlug)
 */
export const ARTICLE_PERMANENT_REDIRECTS: Record<string, string> = {
  // Case 1: Normalized Energi Fusi slug artifact (-slug- concatenation)
  'as-percepat-pengembangan-energi-fusi-fasilitas-baru-dibangun-menuju-target-pertengahan-2030-an-slug-as-percepat-pengembangan-energi-fusi-fasilitas-baru-menuju-target-pertengahan-2030-an':
    '/berita/as-percepat-pengembangan-energi-fusi-fasilitas-baru-menuju-target-pertengahan-2030-an',

  // Case 2: Duplicate Prabowo 121 Kebijakan (old slug redirected to canonical final article)
  'prabowo-121-kebijakan-transformatif-21-bulan-pemerintahan':
    '/berita/prabowo-klaim-121-kebijakan-transformatif-21-bulan-pemerintahan',

  // Case 3: Duplicate Polri Karhutla (secondary coverage redirected to primary article)
  'polri-tetapkan-72-tersangka-karhutla-penanganan-menjangkau-sembilan-polda':
    '/berita/polri-tetapkan-72-tersangka-karhutla-sembilan-polda',
};

/**
 * Resolves a redirect destination if the provided slug matches a permanent redirect.
 * Guarantees no redirect loops.
 */
export function getArticleRedirectDestination(rawSlug: string): string | null {
  if (!rawSlug) return null;
  const clean = rawSlug.trim().toLowerCase();
  const dest = ARTICLE_PERMANENT_REDIRECTS[clean];
  if (!dest) return null;

  // Safety check: prevent redirect loops if dest matches the requested slug
  const currentPath = `/berita/${clean}`;
  if (dest.toLowerCase() === currentPath) return null;

  return dest;
}
