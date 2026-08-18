import React, { useState, useEffect } from 'react';
import { NewsItem } from '../types';
import { 
  X, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  AlertCircle,
  ShieldCheck,
  User,
  CheckCircle2,
  HelpCircle,
  Link2,
  RefreshCw,
  FileCheck2,
  Mail
} from 'lucide-react';

interface ArticleModalProps {
  article: NewsItem | null;
  onClose: () => void;
  onSelectArticle: (article: NewsItem) => void;
  relatedArticles: NewsItem[];
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: NewsItem) => void;
  onShare: (article: NewsItem) => void;
  onOpenLegalModal?: (type: any) => void;
  onOpenSubscription?: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectArticle,
  relatedArticles,
  isBookmarked,
  onToggleBookmark,
  onShare,
  onOpenLegalModal,
  onOpenSubscription
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showReportModal) {
          setShowReportModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showReportModal]);

  if (!article) return null;

  const isSaved = isBookmarked(article.id);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xl':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  const isSimulated = article.isDemo === true;
  const isEditorial = article.isEditorial !== false;

  return (
    <div 
      id="article-reader-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Action Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded">
              {article.kategoriLabel || article.categoryLabel || 'Dunia'}
            </span>

            {isSimulated ? (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Data simulasi — bukan berita aktual</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Konten Editorial DenyutGlobal</span>
              </span>
            )}

            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium ml-2">
              <MapPin className="w-3 h-3 text-rose-500" />
              {article.negaraLokasi || article.location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded cursor-pointer font-bold ${
                  fontSize === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Ukuran Teks Standar"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded cursor-pointer font-bold text-sm ${
                  fontSize === 'large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Ukuran Teks Sedang"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`px-2 py-1 rounded cursor-pointer font-bold text-base ${
                  fontSize === 'xl' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Ukuran Teks Besar"
              >
                A++
              </button>
            </div>

            {/* Bookmark button */}
            <button
              id={`modal-bookmark-${article.id}`}
              onClick={() => onToggleBookmark(article)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Hapus Simpanan' : 'Simpan Berita'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {/* Share */}
            <button
              id="modal-share-button"
              onClick={() => onShare(article)}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Bagikan Berita"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              id="modal-close-button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer ml-1"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Reader Body */}
        <div className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Top Notice if Simulated */}
          {isSimulated && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Data simulasi — bukan berita aktual:</strong> Artikel ini merupakan contoh tata letak visual untuk keperluan demonstrasi desain portal berita DenyutGlobal.
              </div>
            </div>
          )}

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 font-serif-headline leading-tight">
            {article.title || article.judul}
          </h1>

          {/* Meta Info: Author, Category, Location, PublishedAt, UpdatedAt */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="w-4 h-4 text-rose-600" />
                <span>Penulis: {article.author || 'Redaksi DenyutGlobal'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Publikasi: {article.tanggal} • {article.waktu}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Lokasi: <strong>{article.negaraLokasi || article.location}</strong></span>
              </div>
            </div>

            {/* Updated badge if article was corrected/updated */}
            {article.updatedAt && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/80 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold self-start md:self-auto">
                <RefreshCw className="w-3 h-3 text-amber-700" />
                <span>Diperbarui pada: {article.updatedAt}</span>
              </div>
            )}
          </div>

          {/* Correction / Update Notes Box according to Editorial Policy */}
          {(article.correctionNotes || article.correctionNote || (article.updatedAt && article.isUpdated)) && (
            <div className="p-4 bg-amber-50/90 border-l-4 border-amber-600 rounded-r-2xl text-xs sm:text-sm text-amber-950 space-y-1.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  {article.correctionStatus === 'updated' 
                    ? 'Pembaruan Berita' 
                    : article.correctionStatus === 'editorial_fix'
                    ? 'Perbaikan Redaksional'
                    : 'Koreksi Berita'}
                </span>
                {article.updatedAt && (
                  <span className="text-amber-800 text-[11px] font-semibold flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    <RefreshCw className="w-3 h-3 text-amber-700" />
                    Diperbarui pada: {article.updatedAt}
                  </span>
                )}
              </div>
              <div className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
                {article.correctionNote || article.correctionNotes ? (
                  <p>
                    <strong className="text-slate-900">Keterangan: </strong>
                    {article.correctionNote || article.correctionNotes}
                  </p>
                ) : (
                  <p>
                    Artikel ini telah diperbarui untuk memperjelas informasi dan menambahkan konteks terverifikasi.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Featured Image & Caption */}
          {(article.image || article.gambar) && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
              <img
                src={article.image || article.gambar}
                alt={article.title || article.judul}
                referrerPolicy="no-referrer"
                className="w-full max-h-[440px] object-cover object-center"
              />
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="italic font-medium">
                  {article.captionGambar || `Visualisasi peristiwa terkait ${article.title || article.judul}`}
                </div>
                {(article.imageType === 'ai_illustration' || article.imageCredit || (article.image && article.image.startsWith('data:'))) && (
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold tracking-wide shrink-0">
                    {article.imageCredit || 'Ilustrasi AI — DenyutGlobal'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Summary Box */}
          <div className="p-4 bg-slate-50 border-l-4 border-rose-600 rounded-r-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
              Ringkasan Editorial
            </span>
            <p className="text-slate-800 font-medium text-sm sm:text-base leading-relaxed italic">
              "{article.summary || article.ringkasan}"
            </p>
          </div>

          {/* Fakta Utama Terverifikasi Section */}
          {article.facts && article.facts.length > 0 && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Fakta Utama Terverifikasi</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {article.facts.map((fact, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{fact.replace(/^[•*-]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Full Body */}
          <div className={`prose prose-slate max-w-none text-slate-800 space-y-4 ${getFontSizeClass()}`}>
            {(article.content || article.isiLengkap) && (article.content || article.isiLengkap)!.length > 0 ? (
              (article.content || article.isiLengkap)!.map((para, idx) => (
                <p key={idx} className="leading-relaxed">
                  {para}
                </p>
              ))
            ) : (
              <p className="leading-relaxed">
                {article.summary || article.ringkasan}
              </p>
            )}
          </div>

          {/* Mengapa Berita Ini Penting? (Why It Matters) */}
          {article.whyItMatters && (
            <div className="p-5 bg-rose-50/60 border border-rose-200/80 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-950 font-serif-headline">
                  Mengapa Berita Ini Penting? (Konteks & Dampak)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {article.whyItMatters}
              </p>
            </div>
          )}

          {/* Referensi Sumber & Data Terverifikasi */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Referensi Sumber & Data Terverifikasi
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              DenyutGlobal menyusun konten editorial original berdasarkan bahan referensi dan verifikasi data publik resmi berikut:
            </p>

            <div className="space-y-2">
              {article.sources && article.sources.length > 0 ? (
                article.sources.map((src, sIdx) => (
                  <div key={sIdx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <strong className="text-white block sm:inline mr-2">{src.name}</strong>
                      {src.date && <span className="text-slate-400">({src.date})</span>}
                      {src.notes && <p className="text-slate-400 text-[11px] mt-0.5">{src.notes}</p>}
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold shrink-0"
                      >
                        <span>Akses Tautan Sumber</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                  <span>Sumber: <strong>{article.namaSumber || 'Redaksi DenyutGlobal'}</strong></span>
                  {article.urlSumber && (
                    <a
                      href={article.urlSumber}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Lihat Rujukan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ajakan Ringan Langganan Daily Brief */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/70 via-slate-50 to-slate-50 border border-rose-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900">
                Suka mendapatkan berita penting tanpa harus mencarinya?
              </p>
              <p className="text-xs text-slate-500">
                Langganan Daily Brief DenyutGlobal.
              </p>
            </div>
            {onOpenSubscription && (
              <button
                id="article-open-subscription-btn"
                type="button"
                onClick={onOpenSubscription}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>📩 Langganan</span>
              </button>
            )}
          </div>

          {/* Integritas Redaksi & Pengajuan Koreksi Pembaca */}
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Integritas Redaksi & Hak Koreksi Pembaca</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Menemukan ketidaksesuaian fakta atau memiliki data tambahan terverifikasi? DenyutGlobal berkomitmen memperbaiki informasi secara transparan dan bertanggung jawab.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenLegalModal && (
                <button
                  onClick={() => onOpenLegalModal('koreksi')}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Kebijakan Koreksi
                </button>
              )}
              <button
                id="button-laporkan-koreksi"
                onClick={() => setShowReportModal(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Laporkan Koreksi</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Topik Terkait
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 border-t-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 font-serif-headline mb-4">
                Berita Terkait di Rubrik {article.kategoriLabel || article.categoryLabel}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectArticle(rel)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer flex gap-3 group"
                  >
                    <img
                      src={rel.image || rel.gambar}
                      alt={rel.title || rel.judul}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 line-clamp-2 leading-snug">
                        {rel.title || rel.judul}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {rel.waktu} • {rel.negaraLokasi || rel.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reader Report Correction Overlay */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif-headline">
                  Pengajuan Koreksi Berita
                </h3>
                <p className="text-xs text-slate-500">
                  DenyutGlobal • Standar Akurasi & Verifikasi
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block truncate">
                Artikel: {article.title || article.judul}
              </span>
              <span className="text-slate-500 block">
                ID: {article.id} • Rubrik: {article.kategoriLabel || article.categoryLabel}
              </span>
            </div>

            {/* Official Policy Notice */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Saluran Pengajuan Resmi:</span>
              </div>
              <p className="leading-relaxed font-medium">
                Saluran pengajuan koreksi akan tersedia setelah kontak redaksi resmi diaktifkan.
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Sesuai prinsip transparansi, setiap koreksi diperiksa oleh editor berdasarkan bukti dan sumber rujukan yang dapat dipertanggungjawabkan.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {onOpenLegalModal && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      onOpenLegalModal('kontak');
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Formulir Kontak Redaksi →</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      onOpenLegalModal('koreksi');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                  >
                    Kebijakan Koreksi
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
