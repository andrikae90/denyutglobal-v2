export type CategoryId = 
  | 'semua'
  | 'dunia'
  | 'politik'
  | 'ekonomi'
  | 'teknologi'
  | 'sains'
  | 'olahraga'
  | 'bencana'
  | 'indonesia';

export type ArticleStatus = 'draft' | 'review' | 'approved' | 'published';

export type CorrectionType = 'none' | 'corrected' | 'updated' | 'editorial_fix';

export type ClaimType = 'fakta' | 'konteks' | 'opini_analisis';

export type ClaimStatus = 'verified' | 'pending_source_verification' | 'needs_verification' | 'missing_source';

export interface SourceAuditItem {
  name: string;
  url: string;
  status: 'terverifikasi_mendukung' | 'sumber_tidak_dapat_diakses' | 'tidak_mendukung' | 'belum_diverifikasi';
  statusLabel?: string;
  technicalError?: string;
  httpStatus?: number;
}

export interface FactCheckClaim {
  id: string;
  claim: string;
  type: ClaimType; // 'fakta' | 'konteks' | 'opini_analisis'
  supported: boolean;
  sourceTrace: string; // Source name/URL or 'Sumber belum tersedia — perlu verifikasi editor.'
  issue?: string; // Reason why it needs verification or warning detail
  status: ClaimStatus;
  technicalReason?: string;
  sourceStatus?: 'terverifikasi_mendukung' | 'sumber_tidak_dapat_diakses' | 'tidak_mendukung' | 'belum_diverifikasi';
}

export interface FactCheckResult {
  passed: boolean;
  canPublish: boolean;
  hasUnverifiedClaims: boolean;
  summary: string;
  claims: FactCheckClaim[];
  unsupportedClaims: string[];
  missingSourceClaims: string[];
  forbiddenKeywordsFound: string[];
  conflictWarnings?: string[];
  checkedAt: string;
  checkedBy?: string;
  sourceAudit: {
    totalSources: number;
    sourcesProvided: boolean;
    sourcesTraceable: boolean;
    sourceContentFetched?: boolean;
    verifiedSourceCount?: number;
    sourceFetchFailures?: string[];
    sourceStatuses?: SourceAuditItem[];
    note: string;
  };
}

export interface ArticleSource {
  id?: string;
  name: string;
  url: string;
  date?: string;
  notes?: string;
}

export interface NewsItem {
  id: string;
  title?: string;
  judul: string; // compatibility alias for title
  slug?: string;
  summary?: string;
  ringkasan: string; // compatibility alias for summary
  content?: string[];
  isiLengkap?: string[]; // compatibility alias for content
  facts?: string[];
  whyItMatters?: string;
  category?: Exclude<CategoryId, 'semua'>;
  kategori: Exclude<CategoryId, 'semua'>; // compatibility alias
  categoryLabel?: string;
  kategoriLabel: string;
  location?: string;
  negaraLokasi: string;
  publishedAt?: string;
  tanggal: string;
  waktu: string;
  updatedAt?: string;
  correctedAt?: string;
  correctionNote?: string;
  correctionNotes?: string;
  correctionStatus?: CorrectionType;
  isUpdated?: boolean;
  author?: string;
  sources?: ArticleSource[];
  sourceUrls?: string[];
  image?: string;
  gambar: string; // compatibility alias for image
  captionGambar?: string;
  imageType?: 'ai_illustration' | 'photo' | 'none' | string;
  imageCredit?: string;
  status?: ArticleStatus;
  reviewed?: boolean;
  editorialRevisionNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
  factCheckResult?: FactCheckResult;
  isAiGeneratedDraft?: boolean;
  isHero?: boolean;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isDailyBrief?: boolean;
  briefOrder?: number;
  readTimeMinutes?: number;
  tags?: string[];
  isEditorial?: boolean;
  isDemo?: boolean;
  isLiveFeed?: boolean;
  sourceFeedType?: 'bbc' | 'dw' | 'antara' | 'editorial' | 'demo';
  // Legacy or Wire-reference helper fields
  namaSumber?: string;
  urlSumber?: string;
  originalTitle?: string;
  titleId?: string;
  originalSummary?: string;
  summaryId?: string;
  translatedAt?: string;
  isTranslated?: boolean;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  iconEmoji: string;
  description: string;
  colorClass: string;
  badgeClass: string;
}

export type RadarCategoryKey =
  | 'kriminal_keamanan'
  | 'hukum_pengadilan'
  | 'bencana_kedaruratan'
  | 'kesehatan'
  | 'ekonomi_keuangan'
  | 'energi_sumberdaya'
  | 'pemerintah_kenegaraan'
  | 'lingkungan'
  | 'teknologi_sains'
  | 'olahraga'
  | 'artis_hiburan'
  | 'dunia';

export type RadarSourceType = 'primer' | 'sekunder';

export type RadarStatus =
  | 'sumber_primer_terkonfirmasi' // 🟢 SUMBER PRIMER TERKONFIRMASI
  | 'sumber_primer_konteks'       // 🔵 SUMBER PRIMER + KONTEKS
  | 'perlu_verifikasi'            // 🟡 PERLU VERIFIKASI
  | 'tidak_layak';                // 🔴 TIDAK LAYAK OTOMATIS

export interface ArticleRevisionResult {
  title: string;
  summary: string;
  facts: string[];
  content: string[];
  whyItMatters: string;
  changesSummary: string[];
  conflictWarnings?: string[];
  statusFakta: string;
}

export interface Verification9PointItem {
  id: number;
  question: string;
  passed: boolean | 'warning';
  detail: string;
}

export interface RadarVerificationResult {
  verdict: 'terverifikasi' | 'perlu_verifikasi' | 'tidak_layak';
  checks: Verification9PointItem[];
  summary: string;
  primaryConfirmed: boolean;
  canDraft: boolean;
  checkedAt: string;
}

export interface RadarNewsItem {
  id: string;
  kategoriRadar: RadarCategoryKey;
  kategoriLabel: string;
  judulTopik: string;
  namaSumber: string;
  jenisSumber: RadarSourceType; // Primer / Sekunder
  lembagaKategori?: string;     // e.g., 'Polri', 'BNPB', 'Bank Indonesia', 'Mahkamah Agung'
  waktu: string;                // Tanggal & Waktu Rilis
  lokasi: string;               // Lokasi Faktual jika ada
  faktaUtama: string[];         // Fakta singkat
  urlSumber: string;            // URL Sumber Resmi
  status: RadarStatus;          // 🟢 / 🔵 / 🟡 / 🔴
  keteranganStatus?: string;
  konfirmasiPrimer?: {
    ada: boolean;
    namaLembaga?: string;
    urlKonfirmasi?: string;
    dokumenResmi?: string;
  };
  verificationResult?: RadarVerificationResult;
  isVerified?: boolean;
}

