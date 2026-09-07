import React from 'react';
import { 
  LegalDocument, 
  LegalDocId, 
  LEGAL_DOCUMENTS 
} from '../data/legalContent';
import { 
  ArrowLeft, 
  Calendar, 
  Shield, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ExternalLink
} from 'lucide-react';

interface LegalPageViewProps {
  document: LegalDocument;
  onNavigateLegal: (path: string) => void;
  onBackToHome: () => void;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({
  document: doc,
  onNavigateLegal,
  onBackToHome
}) => {
  const navDocs: { id: LegalDocId; label: string; path: string }[] = [
    { id: 'tentang-kami', label: 'Tentang Kami', path: '/tentang-kami' },
    { id: 'kontak', label: 'Kontak', path: '/kontak' },
    { id: 'privacy-policy', label: 'Kebijakan Privasi', path: '/privacy-policy' },
    { id: 'ketentuan-layanan', label: 'Ketentuan Layanan', path: '/ketentuan-layanan' },
    { id: 'disclaimer', label: 'Disclaimer', path: '/disclaimer' },
    { id: 'pedoman-redaksi', label: 'Pedoman Redaksi', path: '/pedoman-redaksi' },
    { id: 'pedoman-media-siber', label: 'Pedoman Media Siber', path: '/pedoman-media-siber' },
    { id: 'kebijakan-koreksi', label: 'Kebijakan Koreksi', path: '/kebijakan-koreksi' }
  ];

  return (
    <div id="legal-page-container" className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onBackToHome();
              }}
              className="hover:text-rose-600 transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Beranda
            </a>
            <span>/</span>
            <span className="text-slate-400">Informasi & Legal</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">{doc.title}</span>
          </nav>

          {/* Badge & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                {doc.categoryBadge}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Pembaruan: {doc.lastUpdated}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 font-serif-headline tracking-tight leading-tight">
              {doc.title}
            </h1>

            {doc.tagline && (
              <p className="text-rose-600 font-medium italic text-sm sm:text-base">
                {doc.tagline}
              </p>
            )}

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-1">
              {doc.summary}
            </p>
          </div>

          {/* Quick Cross-Navigation Pills */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Dokumen Kebijakan & Redaksi DenyutGlobal:
            </p>
            <div className="flex flex-wrap gap-2">
              {navDocs.map((item) => {
                const isActive = item.id === doc.id;
                return (
                  <a
                    key={item.id}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateLegal(item.path);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="space-y-6">
          {doc.sections.map((section, idx) => {
            const secNum = section.number ?? idx + 1;
            return (
              <section
                key={idx}
                id={`section-${secNum}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-7 space-y-4"
              >
                {/* Section Header */}
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-2xs">
                    {secNum}
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-serif-headline">
                      {section.heading}
                    </h2>
                    {section.subheading && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {section.subheading}
                      </p>
                    )}
                  </div>
                </div>

                {/* Paragraphs */}
                <div className="sm:pl-10 space-y-3 text-slate-700 text-sm leading-relaxed">
                  {section.paragraphs.map((par, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {par}
                    </p>
                  ))}

                  {/* Bullet Points */}
                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {section.bulletPoints.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                          <span className="text-slate-700 text-sm leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Callout Box */}
                  {section.callout && (
                    <div
                      className={`my-3 p-4 rounded-xl border flex items-start gap-3 ${
                        section.callout.type === 'warning'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : section.callout.type === 'tip'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {section.callout.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        {section.callout.type === 'tip' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        {section.callout.type === 'info' && <Info className="w-4 h-4 text-rose-600" />}
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed">
                        {section.callout.title && (
                          <strong className="block font-bold mb-0.5">
                            {section.callout.title}
                          </strong>
                        )}
                        <p>{section.callout.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {/* Official Editorial Contact Card for /kontak & /kebijakan-koreksi */}
          {(doc.id === 'kontak' || doc.id === 'kebijakan-koreksi') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Mail className="w-5 h-5 text-rose-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-headline">
                  {doc.id === 'kebijakan-koreksi' ? 'Saluran Pengajuan Koreksi & Hak Jawab' : 'Hubungi Tim Redaksi'}
                </h3>
              </div>

              <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
                <p>
                  {doc.id === 'kebijakan-koreksi'
                    ? 'Laporan koreksi dan hak jawab dapat dikirimkan melalui kontak resmi redaksi. Tim redaksi kami berkomitmen meninjau setiap data pembanding secara cermat sesuai Pedoman Pemberitaan Media Siber.'
                    : 'Untuk keperluan korespondensi editorial, klarifikasi berita, tawaran kerja sama, maupun pertanyaan publik, Anda dapat berkomunikasi langsung dengan kami melalui saluran surat elektronik resmi berikut:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Redaksi & Verifikasi Berita
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      redaksi@denyutglobal.my.id
                    </p>
                    <p className="text-xs text-slate-500">
                      Khusus ralat fakta, laporan hak jawab, dan klarifikasi informasi naskah.
                    </p>
                    <div className="pt-1">
                      <a
                        href={`mailto:redaksi@denyutglobal.my.id?subject=${encodeURIComponent(
                          doc.id === 'kebijakan-koreksi'
                            ? '[KOREKSI BERITA] - Judul / URL Artikel'
                            : '[REDAKSI] - Pertanyaan / Informasi'
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shadow-2xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Kirim Email ke Redaksi
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Layanan Pembaca & Kerja Sama
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      halo@denyutglobal.my.id
                    </p>
                    <p className="text-xs text-slate-500">
                      Pertanyaan umum seputar layanan portal, kemitraan, dan saran publik.
                    </p>
                    <div className="pt-1">
                      <a
                        href="mailto:halo@denyutglobal.my.id?subject=%5BLAYANAN%20PEMBACA%5D%20-%20Halo%20DenyutGlobal"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Kirim Email Umum
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 mt-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Panduan Lampiran:</strong> Saat mengirimkan permohonan koreksi atau hak jawab, mohon sertakan tautan (URL) artikel yang dimaksud, nama narasumber/organisasi, dan dokumen atau data rujukan yang sah.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Back Button and Notice */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onBackToHome();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 font-semibold text-xs sm:text-sm shadow-2xs transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-rose-600" />
              Kembali ke Beranda DenyutGlobal
            </a>

            <div className="text-xs text-slate-400 text-center sm:text-right">
              &copy; 2026 DenyutGlobal &bull; Seluruh Hak Cipta Dilindungi Undang-Undang
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
