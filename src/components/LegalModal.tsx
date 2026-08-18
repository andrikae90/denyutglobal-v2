import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  FileText, 
  HelpCircle, 
  AlertCircle, 
  Globe, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Bot, 
  Scale, 
  Eye, 
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Info,
  Loader2
} from 'lucide-react';

export type LegalModalType = 'tentang' | 'kontak' | 'privasi' | 'ketentuan' | 'disclaimer' | 'pedoman' | 'koreksi' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
  onSelectModal?: (type: NonNullable<LegalModalType>) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, onSelectModal }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Pertanyaan umum');
  const [contactMessage, setContactMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Dynamic SEO metadata when modal is active
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescEl = document.querySelector('meta[name="description"]');
    const originalDesc = metaDescEl?.getAttribute('content') || '';

    if (type === 'tentang') {
      document.title = 'Tentang DenyutGlobal – Portal Berita Indonesia dan Dunia';
      if (metaDescEl) {
        metaDescEl.setAttribute(
          'content',
          'Kenali DenyutGlobal, portal informasi dan berita digital berbahasa Indonesia yang menyajikan perkembangan Indonesia dan dunia dengan mengutamakan akurasi, transparansi sumber, dan nilai tambah editorial.'
        );
      }
    } else if (type === 'kontak') {
      document.title = 'Kontak DenyutGlobal – Hubungi Redaksi';
      if (metaDescEl) {
        metaDescEl.setAttribute(
          'content',
          'Hubungi DenyutGlobal untuk pertanyaan, masukan, laporan koreksi berita, atau informasi mengenai website.'
        );
      }
    } else if (type === 'koreksi') {
      document.title = 'Kebijakan Koreksi Berita – DenyutGlobal';
      if (metaDescEl) {
        metaDescEl.setAttribute(
          'content',
          'Kebijakan koreksi, ralat, dan pembaruan informasi portal berita digital DenyutGlobal.'
        );
      }
    } else if (type === 'privasi') {
      document.title = 'Kebijakan Privasi DenyutGlobal';
      if (metaDescEl) {
        metaDescEl.setAttribute(
          'content',
          'Kebijakan Privasi DenyutGlobal menjelaskan bagaimana informasi pengguna ditangani ketika menggunakan website dan layanan DenyutGlobal.'
        );
      }
    } else if (type === 'ketentuan') {
      document.title = 'Ketentuan Penggunaan DenyutGlobal';
      if (metaDescEl) {
        metaDescEl.setAttribute(
          'content',
          'Ketentuan penggunaan website DenyutGlobal, termasuk aturan penggunaan konten, sumber informasi, tautan eksternal, formulir kontak, dan layanan website.'
        );
      }
    } else if (type === 'disclaimer') {
      document.title = 'Disclaimer DenyutGlobal';
      if (metaDescEl) {
        metaDescEl.setAttribute(
          'content',
          'Disclaimer DenyutGlobal mengenai akurasi informasi, sumber berita, penggunaan AI, tautan pihak ketiga, konten editorial, dan batasan informasi di website.'
        );
      }
    }

    return () => {
      document.title = originalTitle;
      if (metaDescEl) {
        metaDescEl.setAttribute('content', originalDesc);
      }
    };
  }, [type]);

  if (!type) return null;

  const isLargeModal = type === 'pedoman' || type === 'koreksi' || type === 'tentang' || type === 'kontak' || type === 'privasi' || type === 'ketentuan' || type === 'disclaimer';

  const renderContent = () => {
    switch (type) {
      case 'koreksi':
        return (
          <div id="kebijakan-koreksi-page" className="space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                  Transparansi & Akurasi Redaksi
                </span>
                <span className="text-xs text-slate-500">• DenyutGlobal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif-headline tracking-tight">
                Kebijakan Koreksi Berita DenyutGlobal
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1.5 font-medium">
                Komitmen DenyutGlobal untuk memperbaiki informasi yang tidak akurat secara transparan dan bertanggung jawab.
              </p>
            </div>

            {/* 12 Butir Kebijakan Koreksi */}
            <div className="space-y-4">
              {/* 1. Komitmen Akurasi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Komitmen Akurasi
                  </h2>
                </div>
                <div className="pl-8 space-y-1.5 text-slate-700">
                  <p>DenyutGlobal berupaya menyajikan informasi yang akurat berdasarkan sumber yang dapat diperiksa.</p>
                  <p>Meskipun setiap berita melalui proses pemeriksaan, kesalahan tetap mungkin terjadi.</p>
                  <p className="text-rose-700 font-medium">
                    Jika ditemukan kesalahan faktual, DenyutGlobal akan melakukan koreksi sesuai tingkat kesalahannya.
                  </p>
                </div>
              </div>

              {/* 2. Jenis Perubahan */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Jenis Perubahan
                  </h2>
                </div>
                <div className="pl-8 space-y-3 text-slate-700">
                  <p className="font-medium text-slate-900">DenyutGlobal membedakan tiga kategori perubahan artikel:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                      <div className="font-bold text-rose-900 flex items-center gap-1.5 text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Koreksi</span>
                      </div>
                      <p className="text-xs text-rose-950/80 leading-relaxed">
                        Perubahan untuk memperbaiki informasi yang terbukti salah atau tidak akurat.
                      </p>
                    </div>

                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5 text-xs sm:text-sm">
                        <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Pembaruan</span>
                      </div>
                      <p className="text-xs text-blue-950/80 leading-relaxed">
                        Penambahan informasi baru setelah artikel pertama kali diterbitkan.
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>Perbaikan Redaksional</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Perubahan ejaan, tata bahasa, format, atau kejelasan tulisan yang tidak mengubah fakta utama.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Prosedur Koreksi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Prosedur Koreksi
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p className="font-medium text-slate-900">Jika terdapat kesalahan, redaksi menjalankan prosedur berikut:</p>
                  <ol className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-decimal list-inside pl-1">
                    <li>Informasi diperiksa kembali.</li>
                    <li>Sumber yang relevan diperiksa.</li>
                    <li>Editor menentukan apakah perubahan merupakan koreksi atau pembaruan.</li>
                    <li>Artikel diperbaiki.</li>
                    <li>Waktu pembaruan dicatat.</li>
                    <li>Jika kesalahan material, berikan keterangan koreksi yang dapat dilihat pembaca.</li>
                  </ol>
                </div>
              </div>

              {/* 4. Keterangan Koreksi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Keterangan Koreksi
                  </h2>
                </div>
                <div className="pl-8 space-y-2.5 text-slate-700">
                  <p>Untuk kesalahan penting, tampilkan catatan koreksi transparan pada artikel:</p>
                  <div className="p-4 bg-slate-50 border-l-4 border-rose-600 rounded-r-xl font-mono text-xs text-slate-800 space-y-1">
                    <div className="font-bold text-rose-800">Koreksi:</div>
                    <p>Artikel ini telah diperbarui untuk memperbaiki informasi mengenai [bagian yang dikoreksi].</p>
                    <div className="text-slate-500 pt-1 font-semibold">Diperbarui pada: [tanggal dan waktu]</div>
                  </div>
                  <p className="text-rose-700 font-medium pt-1">
                    Jangan menghapus kesalahan material secara diam-diam tanpa mencatat bahwa koreksi telah dilakukan.
                  </p>
                  <p className="text-xs text-slate-500">
                    Untuk kesalahan kecil seperti typo yang tidak memengaruhi makna, tidak wajib membuat catatan koreksi khusus.
                  </p>
                </div>
              </div>

              {/* 5. Pembaruan Berita */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    5
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Pembaruan Berita
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Jika terdapat perkembangan baru terhadap suatu peristiwa, artikel dapat diperbarui.</p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
                    Tampilkan: <span className="font-bold text-blue-700">Diperbarui pada: [tanggal dan waktu]</span>
                  </div>
                  <p>
                    Pembaruan harus dibedakan dari informasi yang sudah tersedia ketika artikel pertama kali diterbitkan.
                  </p>
                </div>
              </div>

              {/* 6. Pengajuan Koreksi oleh Pembaca */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    6
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Pengajuan Koreksi oleh Pembaca
                  </h2>
                </div>
                <div className="pl-8 space-y-2.5 text-slate-700">
                  <p>
                    DenyutGlobal menyediakan mekanisme yang memungkinkan pembaca melaporkan dugaan kesalahan pada setiap artikel melalui tombol/link <strong>Laporkan Koreksi</strong>.
                  </p>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="font-bold text-amber-900">Status Saluran Pengajuan:</div>
                    <p className="leading-relaxed">
                      Saluran pengajuan koreksi akan tersedia setelah kontak redaksi resmi diaktifkan.
                    </p>
                    <p className="text-[11px] text-amber-800 italic pt-0.5">
                      Sesuai standar integritas, DenyutGlobal tidak membuat alamat surel atau kontak fiktif.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Pemeriksaan Laporan */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    7
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Pemeriksaan Laporan
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Setiap laporan koreksi tidak otomatis dianggap benar.</p>
                  <p className="font-medium text-slate-900">Editor harus memeriksa:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                    <li>klaim yang dilaporkan;</li>
                    <li>sumber pendukung;</li>
                    <li>tanggal informasi;</li>
                    <li>konteks;</li>
                    <li>informasi lain yang relevan.</li>
                  </ul>
                  <p className="pt-1">Jika laporan terbukti benar, lakukan koreksi.</p>
                  <p className="text-rose-700 font-medium">
                    Jika belum dapat diverifikasi, jangan mengubah artikel berdasarkan klaim yang belum terbukti.
                  </p>
                </div>
              </div>

              {/* 8. Informasi yang Tidak Dapat Diverifikasi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    8
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Informasi yang Tidak Dapat Diverifikasi
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Jika suatu informasi belum dapat dipastikan:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                    <li>jangan menyajikannya sebagai fakta;</li>
                    <li>gunakan bahasa yang menunjukkan ketidakpastian;</li>
                    <li>atau tahan publikasi sampai informasi dapat diverifikasi.</li>
                  </ul>
                </div>
              </div>

              {/* 9. Kesalahan Sumber */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    9
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Kesalahan Sumber
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>
                    Jika terjadi kesalahan dalam atribusi sumber, perbaiki atribusi tersebut dan perbarui artikel bila diperlukan.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                    <p>• Jangan membuat sumber pengganti.</p>
                    <p>• Jangan mengklaim menggunakan sumber yang sebenarnya tidak digunakan.</p>
                  </div>
                </div>
              </div>

              {/* 10. Perubahan Besar */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    10
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Perubahan Besar
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Jika artikel mengalami perubahan substansial karena fakta baru atau koreksi besar:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                    <li>pertahankan tanggal publikasi awal;</li>
                    <li>tampilkan waktu pembaruan terbaru;</li>
                    <li>jelaskan bahwa artikel telah diperbarui jika perubahan tersebut material.</li>
                  </ul>
                  <p className="text-rose-700 font-medium pt-1">
                    Jangan menggunakan tanggal baru untuk membuat artikel lama terlihat sebagai berita baru.
                  </p>
                </div>
              </div>

              {/* 11. Transparansi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    11
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Transparansi
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>DenyutGlobal tidak akan dengan sengaja menyembunyikan kesalahan faktual yang material.</p>
                  <p>Koreksi dilakukan berdasarkan bukti dan sumber yang dapat diperiksa.</p>
                </div>
              </div>

              {/* 12. AI dan Koreksi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    12
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    AI dan Koreksi
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Jika artikel dibuat dengan bantuan AI:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                    <li>AI tidak boleh menentukan sendiri bahwa suatu fakta benar;</li>
                    <li>editor tetap bertanggung jawab atas pemeriksaan;</li>
                    <li>koreksi harus dilakukan berdasarkan sumber dan bukti;</li>
                    <li>AI tidak boleh membuat alasan atau sumber untuk membenarkan kesalahan.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pedoman':
        return (
          <div id="pedoman-redaksi-page" className="space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                  Standar & Etika Jurnalistik
                </span>
                <span className="text-xs text-slate-500">• DenyutGlobal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif-headline tracking-tight">
                Pedoman Redaksi DenyutGlobal
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1.5 font-medium">
                Prinsip dan standar dalam menyusun, memeriksa, dan memperbarui berita DenyutGlobal.
              </p>
            </div>

            {/* Catatan Status Portal */}
            <div className="p-4 bg-amber-50/90 border border-amber-300/80 rounded-2xl text-xs sm:text-sm text-amber-950 flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-900 uppercase tracking-wider text-xs">
                  Catatan Status Portal
                </div>
                <p className="leading-relaxed">
                  DenyutGlobal saat ini merupakan portal berita digital yang sedang dikembangkan. Informasi mengenai struktur organisasi, kontak, dan operasional redaksi hanya boleh ditampilkan sesuai keadaan sebenarnya dan tidak boleh dibuat-buat.
                </p>
              </div>
            </div>

            {/* 13 Butir Pedoman Redaksi */}
            <div className="space-y-4">
              {/* 1. Prinsip Redaksi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Prinsip Redaksi
                  </h2>
                </div>
                <div className="pl-8 space-y-1.5 text-slate-700">
                  <p>DenyutGlobal berkomitmen menyajikan informasi yang jelas, akurat, berimbang, dan mudah dipahami.</p>
                  <p>Setiap berita yang diterbitkan harus melalui proses pemeriksaan sebelum dipublikasikan.</p>
                </div>
              </div>

              {/* 2. Akurasi dan Verifikasi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Akurasi dan Verifikasi
                  </h2>
                </div>
                <div className="pl-8 space-y-1.5 text-slate-700">
                  <p>DenyutGlobal berupaya memeriksa fakta penting berdasarkan sumber yang dapat dipertanggungjawabkan.</p>
                  <p>Data seperti nama, tanggal, lokasi, angka, pernyataan, dan fakta utama harus diperiksa sebelum publikasi.</p>
                  <p className="text-rose-700 font-medium">Jika informasi belum dapat dipastikan, berita tidak boleh ditulis seolah-olah sudah terbukti.</p>
                </div>
              </div>

              {/* 3. Penggunaan AI */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline flex items-center gap-2">
                    <span>Penggunaan AI</span>
                    <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200">
                      Asistensi Editorial
                    </span>
                  </h2>
                </div>

                <div className="pl-8 space-y-3 text-slate-700">
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">AI dapat digunakan sebagai alat bantu editorial untuk:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                      <li>menyusun draft;</li>
                      <li>memperbaiki struktur tulisan;</li>
                      <li>membantu merangkum fakta yang sudah diberikan editor;</li>
                      <li>membantu pemeriksaan konsistensi tulisan.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                    AI bukan pengganti pemeriksaan editor.
                  </div>

                  <div>
                    <p className="font-semibold text-rose-700 mb-1">AI tidak boleh digunakan untuk:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-rose-900/90 text-xs sm:text-sm">
                      <li>membuat fakta;</li>
                      <li>membuat sumber palsu;</li>
                      <li>membuat kutipan palsu;</li>
                      <li>mengarang peristiwa;</li>
                      <li>menerbitkan berita secara otomatis tanpa pemeriksaan manusia.</li>
                    </ul>
                  </div>

                  <p className="font-medium text-slate-900 pt-1">
                    Setiap artikel yang dibantu AI tetap harus diperiksa oleh editor sebelum dipublikasikan.
                  </p>
                </div>
              </div>

              {/* 4. Sumber Informasi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Sumber Informasi
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>DenyutGlobal dapat menggunakan berbagai sumber sebagai referensi, termasuk:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                    <li>situs resmi pemerintah;</li>
                    <li>lembaga negara;</li>
                    <li>organisasi internasional;</li>
                    <li>pernyataan resmi;</li>
                    <li>laporan publik;</li>
                    <li>media berita yang kredibel;</li>
                    <li>sumber lain yang relevan dan dapat diverifikasi.</li>
                  </ul>
                  <p className="pt-1">Sumber yang digunakan harus dicantumkan secara transparan pada artikel jika relevan.</p>
                  <p className="text-xs text-slate-500 italic">
                    DenyutGlobal tidak mengklaim sebagai bagian dari organisasi atau media yang menjadi sumber referensi.
                  </p>
                </div>
              </div>

              {/* 5. Konten Original */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    5
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Konten Original
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>DenyutGlobal berupaya menghasilkan tulisan editorial sendiri.</p>
                  <p>Artikel dari pihak lain tidak boleh disalin dan dipublikasikan ulang sebagai artikel DenyutGlobal.</p>
                  <p>
                    Jika menggunakan informasi dari sumber eksternal, DenyutGlobal harus memberikan nilai tambah melalui penyusunan editorial, konteks, verifikasi, atau penjelasan yang relevan.
                  </p>
                </div>
              </div>

              {/* 6. Judul Berita */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    6
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Judul Berita
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Judul harus:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                    <li>menggambarkan isi artikel;</li>
                    <li>tidak menyesatkan;</li>
                    <li>tidak berlebihan;</li>
                    <li>tidak menggunakan sensasi yang tidak didukung fakta.</li>
                  </ul>
                  <p className="text-rose-700 font-medium">
                    DenyutGlobal tidak menggunakan judul clickbait yang menjanjikan informasi yang tidak terdapat dalam artikel.
                  </p>
                </div>
              </div>

              {/* 7. Koreksi Berita */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    7
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Koreksi Berita
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Jika ditemukan kesalahan setelah publikasi, DenyutGlobal akan melakukan koreksi atau pembaruan.</p>
                  <p>Perubahan penting harus dapat diketahui pembaca.</p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
                    Jika artikel diperbarui secara signifikan, tampilkan waktu: <br />
                    <span className="font-bold text-rose-600">Diperbarui pada: [tanggal dan waktu]</span>
                  </div>
                </div>
              </div>

              {/* 8. Pemisahan Fakta dan Opini */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    8
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Pemisahan Fakta dan Opini
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Fakta, konteks, dan opini harus dibedakan.</p>
                  <p>Analisis atau interpretasi tidak boleh disajikan sebagai fakta.</p>
                  <p>
                    Jika sebuah artikel mengandung analisis editorial, tampilkan dengan jelas bahwa bagian tersebut merupakan konteks atau analisis.
                  </p>
                </div>
              </div>

              {/* 9. Berita Sensitif */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    9
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Berita Sensitif
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>
                    Untuk isu seperti konflik, bencana, kematian, kriminalitas, kesehatan, dan tragedi kemanusiaan, DenyutGlobal harus menghindari bahasa yang sensasional atau mengeksploitasi korban.
                  </p>
                  <p className="text-rose-700 font-medium">
                    Informasi yang belum terverifikasi tidak boleh diperlakukan sebagai fakta.
                  </p>
                </div>
              </div>

              {/* 10. Foto dan Media */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    10
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Foto dan Media
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>DenyutGlobal hanya boleh menggunakan gambar, video, atau media yang memiliki hak penggunaan yang sesuai.</p>
                  <p>Jangan mengambil gambar dari situs lain hanya karena gambar tersebut tersedia di internet.</p>
                  <p>
                    Jika sebuah gambar berasal dari sumber eksternal, informasi atribusi atau lisensi harus dicantumkan jika diperlukan.
                  </p>
                </div>
              </div>

              {/* 11. Konten Bersponsor */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    11
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Konten Bersponsor
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Konten berbayar, iklan, atau kerja sama komersial harus dibedakan dengan jelas dari berita editorial.</p>
                  <p className="text-rose-700 font-medium">
                    Konten bersponsor tidak boleh dibuat seolah-olah merupakan laporan editorial independen.
                  </p>
                </div>
              </div>

              {/* 12. Transparansi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    12
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Transparansi
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>Setiap artikel yang dipublikasikan harus, jika tersedia:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
                    <li>mencantumkan tanggal publikasi;</li>
                    <li>mencantumkan waktu publikasi;</li>
                    <li>mencantumkan nama penulis/editor;</li>
                    <li>mencantumkan sumber atau referensi yang digunakan;</li>
                    <li>mencantumkan waktu pembaruan jika artikel diperbarui.</li>
                  </ul>
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 font-semibold mt-2">
                    Jangan membuat identitas penulis, kantor, biro, atau jaringan koresponden yang tidak benar-benar ada.
                  </div>
                </div>
              </div>

              {/* 13. Tanggung Jawab Redaksi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    13
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Tanggung Jawab Redaksi
                  </h2>
                </div>
                <div className="pl-8 space-y-2 text-slate-700">
                  <p>DenyutGlobal berupaya memperbaiki kesalahan secara terbuka dan bertanggung jawab.</p>
                  <p>Pembaca dapat menghubungi redaksi melalui saluran kontak resmi yang tersedia di website.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tentang':
        return (
          <div id="tentang-denyutglobal-page" className="space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Header Section */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-rose-700" />
                  Profil & Integritas Redaksi
                </span>
                <span className="text-xs text-slate-500">• DenyutGlobal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif-headline tracking-tight">
                Tentang DenyutGlobal
              </h1>
              <p className="text-rose-600 font-semibold text-base sm:text-lg italic mt-1 font-serif-headline">
                “Menangkap Denyut Dunia, Setiap Hari.”
              </p>
            </div>

            {/* Deskripsi Utama */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 text-slate-700">
              <p className="leading-relaxed">
                <strong>DenyutGlobal</strong> adalah portal informasi dan berita digital berbahasa Indonesia yang menyajikan perkembangan terkini dari Indonesia dan berbagai penjuru dunia secara ringkas, jelas, dan mudah dipahami.
              </p>
              <p className="leading-relaxed">
                DenyutGlobal berkomitmen menghadirkan informasi dengan mengutamakan akurasi, transparansi sumber, konteks, dan nilai tambah editorial.
              </p>
            </div>

            {/* Prinsip Kami (4 Prinsip) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Prinsip Kami
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Akurat */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm font-serif-headline">
                      Akurat
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                    Kami berupaya memeriksa fakta dan menggunakan sumber yang dapat dipertanggungjawabkan sebelum informasi dipublikasikan.
                  </p>
                </div>

                {/* 2. Transparan */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm font-serif-headline">
                      Transparan
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                    Kami mencantumkan sumber dan informasi publikasi secara jelas sesuai kebutuhan setiap artikel.
                  </p>
                </div>

                {/* 3. Original */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm font-serif-headline">
                      Original
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                    DenyutGlobal menyusun konten editorial sendiri dan tidak bertujuan menyalin atau menerbitkan ulang artikel pihak lain.
                  </p>
                </div>

                {/* 4. Bertanggung Jawab */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      4
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm font-serif-headline">
                      Bertanggung Jawab
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                    Kami menyediakan mekanisme pembaruan dan koreksi apabila ditemukan informasi yang perlu diperbaiki.
                  </p>
                </div>
              </div>
            </div>

            {/* Teknologi dan AI */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Teknologi dan AI
                </h2>
              </div>
              <div className="space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat menggunakan teknologi kecerdasan buatan sebagai alat bantu dalam proses editorial, seperti membantu menyusun draft, merapikan struktur tulisan, dan memeriksa konsistensi informasi yang telah diberikan editor.
                </p>
                <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1.5">
                  <p className="font-semibold text-indigo-900">
                    Prinsip Transparansi AI:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-indigo-900/90 leading-relaxed">
                    <li>AI bukan pengganti pemeriksaan editorial. Artikel yang diterbitkan harus melalui proses pemeriksaan sebelum dipublikasikan.</li>
                    <li>DenyutGlobal tidak menyatakan bahwa seluruh berita ditulis manusia jika sebenarnya menggunakan AI.</li>
                    <li>DenyutGlobal tidak menyatakan bahwa AI melakukan verifikasi sumber secara otomatis jika fitur tersebut tidak benar-benar tersedia.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sumber Informasi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Sumber Informasi
                </h2>
              </div>
              <div className="space-y-2 text-slate-700">
                <p>
                  DenyutGlobal menggunakan berbagai sumber informasi yang relevan dan dapat diverifikasi, termasuk sumber resmi pemerintah, lembaga negara, organisasi internasional, pernyataan resmi, laporan publik, serta media berita yang kredibel.
                </p>
                <p>
                  Sumber referensi dicantumkan pada artikel sesuai dengan informasi yang digunakan.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong>Catatan Afiliasi:</strong> DenyutGlobal tidak mencantumkan daftar sumber tertentu sebagai mitra resmi kecuali memang terdapat kerja sama resmi.
                </div>
              </div>
            </div>

            {/* Tentang Redaksi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Tentang Redaksi
                </h2>
              </div>
              <div className="space-y-2.5 text-slate-700">
                <p>
                  DenyutGlobal saat ini dikembangkan sebagai portal berita digital independen. Informasi mengenai struktur organisasi, penulis, dan kontak redaksi ditampilkan sesuai kondisi sebenarnya.
                </p>
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-bold text-amber-900 block">Komitmen Integritas Informasi:</span>
                  <p className="leading-relaxed">
                    Sesuai prinsip kejujuran redaksi, DenyutGlobal tidak membuat alamat kantor, gedung redaksi, biro luar negeri, jaringan koresponden, nomor telepon, email fiktif, atau nama wartawan yang belum benar-benar tersedia.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Website & Koreksi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Website */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Status Website
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  DenyutGlobal merupakan platform digital yang terus dikembangkan. Fitur dan sistem editorial dapat diperbarui untuk meningkatkan kualitas, akurasi, dan pengalaman pembaca.
                </p>
              </div>

              {/* Koreksi */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Koreksi & Pembaruan
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Jika Anda menemukan informasi yang kurang tepat, pembaca dapat melaporkannya melalui saluran kontak resmi DenyutGlobal yang tersedia di website. Setiap laporan akan diperiksa sebelum dilakukan perubahan.
                </p>
                <p className="text-[11px] text-amber-800 italic pt-1">
                  *DenyutGlobal tidak menyediakan kontak atau email fiktif.
                </p>
              </div>
            </div>

            {/* Tautan Navigasi Cepat Dokumen Terkait */}
            {onSelectModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Dokumen Kebijakan Terkait:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectModal('pedoman')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                    <span>Pedoman Redaksi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('koreksi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kebijakan Koreksi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'kontak':
        return (
          <div id="kontak-denyutglobal-page" className="space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-rose-700" />
                  Saluran Komunikasi & Redaksi
                </span>
                <span className="text-xs text-slate-500">• DenyutGlobal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif-headline tracking-tight">
                Kontak DenyutGlobal
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1 font-serif-headline">
                Hubungi DenyutGlobal untuk pertanyaan, masukan, atau laporan koreksi informasi.
              </p>
            </div>

            {/* Informasi Kontak Resmi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Informasi Kontak
                </h2>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-2">
                <p className="font-bold text-slate-900 text-sm">
                  Pengunjung dan pembaca dapat menghubungi Redaksi DenyutGlobal secara langsung melalui formulir kontak yang tersedia di halaman ini.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  DenyutGlobal menjunjung tinggi prinsip kejujuran dan transparansi. Seluruh komunikasi dan masukan pembaca diterima melalui formulir kontak resmi di bawah ini. Kami tidak mencantumkan alamat kantor fisik, nomor telepon, alamat gedung, biro redaksi, jaringan koresponden, akun media sosial, ataupun alamat email yang tidak aktif atau fiktif.
                </p>
              </div>
            </div>

            {/* Bagian Laporan Koreksi Berita */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Menemukan Kesalahan Berita?
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Hak Koreksi Pembaca
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jika pembaca menemukan informasi yang diduga tidak akurat, mereka dapat mengirimkan laporan koreksi. Untuk mempermudah dan mempercepat verifikasi redaksi, mohon sertakan:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <li><strong>URL artikel</strong> yang dimaksud;</li>
                <li><strong>Bagian yang dianggap tidak akurat</strong> (kalimat atau paragraf);</li>
                <li><strong>Alasan atau bukti pendukung</strong> yang dapat diverifikasi;</li>
                <li><strong>Sumber pembanding</strong> jika tersedia.</li>
              </ul>
              <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setContactSubject('Laporan koreksi');
                    if (!contactMessage) {
                      setContactMessage('URL artikel:\n\nBagian yang dianggap tidak akurat:\n\nAlasan/bukti pendukung:\n\nSumber pembanding:\n');
                    }
                    const formSection = document.getElementById('contact-form-section');
                    formSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Laporkan Koreksi</span>
                </button>

                {onSelectModal && (
                  <button
                    type="button"
                    onClick={() => onSelectModal('koreksi')}
                    className="text-xs font-semibold text-slate-600 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    Pelajari Kebijakan Koreksi →
                  </button>
                )}
              </div>
            </div>

            {/* Formulir Kontak */}
            <div id="contact-form-section" className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-rose-600" />
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Formulir Kontak
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">
                  Semua kolom bertanda * wajib diisi
                </span>
              </div>

              {formSubmitted ? (
                <div id="contact-form-success" className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Pesan berhasil dikirim. Terima kasih telah menghubungi DenyutGlobal.</span>
                  </div>
                  <button
                    id="contact-form-reset-button"
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setContactName('');
                      setContactEmail('');
                      setContactSubject('Pertanyaan umum');
                      setContactMessage('');
                      setSubmitError(null);
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    ← Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form
                  id="contact-form-denyutglobal"
                  action="https://formspree.io/f/moeanvyg"
                  method="POST"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
                      setSubmitError('Harap lengkapi semua kolom yang wajib diisi.');
                      return;
                    }

                    setIsSubmitting(true);
                    setSubmitError(null);

                    try {
                      const response = await fetch('https://formspree.io/f/moeanvyg', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                          name: contactName.trim(),
                          email: contactEmail.trim(),
                          subject: contactSubject,
                          message: contactMessage.trim()
                        })
                      });

                      if (response.ok) {
                        setFormSubmitted(true);
                        setSubmitError(null);
                      } else {
                        const data = await response.json().catch(() => null);
                        if (data && data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                          setSubmitError(data.errors.map((err: any) => err.message).join(', '));
                        } else {
                          setSubmitError('Terjadi kendala saat mengirim pesan ke Formspree. Silakan coba beberapa saat lagi.');
                        }
                      }
                    } catch (err) {
                      console.error('Contact form submission error:', err);
                      setSubmitError('Gagal terhubung ke layanan Formspree. Periksa koneksi internet Anda dan coba lagi.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  {submitError && (
                    <div 
                      id="contact-form-error-alert"
                      className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nama */}
                    <div>
                      <label htmlFor="contact-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nama <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="contact-name-input"
                        type="text"
                        name="name"
                        required
                        disabled={isSubmitting}
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value);
                          if (submitError) setSubmitError(null);
                        }}
                        placeholder="Nama lengkap Anda..."
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="contact-email-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="contact-email-input"
                        type="email"
                        name="email"
                        required
                        disabled={isSubmitting}
                        value={contactEmail}
                        onChange={(e) => {
                          setContactEmail(e.target.value);
                          if (submitError) setSubmitError(null);
                        }}
                        placeholder="alamat@email.com..."
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Subjek */}
                  <div>
                    <label htmlFor="contact-subject-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subjek <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="contact-subject-select"
                      name="subject"
                      disabled={isSubmitting}
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="Pertanyaan umum">Pertanyaan umum</option>
                      <option value="Laporan koreksi">Laporan koreksi</option>
                      <option value="Saran">Saran</option>
                      <option value="Masalah teknis">Masalah teknis</option>
                      <option value="Kerja sama">Kerja sama</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Pesan */}
                  <div>
                    <label htmlFor="contact-message-textarea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pesan <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="contact-message-textarea"
                      name="message"
                      required
                      disabled={isSubmitting}
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => {
                        setContactMessage(e.target.value);
                        if (submitError) setSubmitError(null);
                      }}
                      placeholder="Tuliskan pesan, rincian pertanyaan, saran, atau laporan koreksi Anda di sini..."
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition leading-relaxed font-sans disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Privasi Formulir */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    Informasi yang dikirim melalui formulir kontak hanya digunakan untuk menanggapi pesan dan menangani permintaan terkait DenyutGlobal sesuai{' '}
                    {onSelectModal ? (
                      <button
                        type="button"
                        onClick={() => onSelectModal('privasi')}
                        className="text-rose-600 font-semibold hover:underline cursor-pointer"
                      >
                        Kebijakan Privasi
                      </button>
                    ) : (
                      'Kebijakan Privasi'
                    )}
                    . Layanan pengiriman pesan didukung oleh Formspree.
                  </div>

                  {/* Tombol Kirim */}
                  <div className="flex items-center justify-end pt-2">
                    <button
                      id="contact-submit-button"
                      type="submit"
                      disabled={isSubmitting || !contactName.trim() || !contactEmail.trim() || !contactMessage.trim()}
                      className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Kirim Pesan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Tautan Dokumen Terkait */}
            {onSelectModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Dokumen Kebijakan Terkait:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectModal('tentang')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tentang DenyutGlobal</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('koreksi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kebijakan Koreksi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('privasi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kebijakan Privasi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'privasi':
        return (
          <div id="kebijakan-privasi-page" className="space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  Privasi & Perlindungan Data
                </span>
                <span className="text-xs text-slate-500">• DenyutGlobal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif-headline tracking-tight">
                Kebijakan Privasi DenyutGlobal
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1 font-serif-headline">
                Kebijakan ini menjelaskan bagaimana DenyutGlobal menangani informasi pengguna ketika mengakses website.
              </p>
            </div>

            {/* 1. Pendahuluan */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Pendahuluan
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal menghargai privasi pengunjung.
                </p>
                <p>
                  Kebijakan Privasi ini menjelaskan jenis informasi yang dapat dikumpulkan, bagaimana informasi tersebut digunakan, dan bagaimana pengguna dapat mengelola informasi mereka ketika menggunakan website DenyutGlobal.
                </p>
                <p className="text-xs text-slate-500">
                  Dengan menggunakan website DenyutGlobal, pengguna dianggap telah membaca dan memahami kebijakan ini.
                </p>
              </div>
            </div>

            {/* 2. Informasi yang Kami Kumpulkan */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Informasi yang Kami Kumpulkan
                </h2>
              </div>
              <div className="pl-8 space-y-3 text-slate-700">
                <p>
                  DenyutGlobal hanya mengumpulkan informasi yang diperlukan untuk menjalankan dan meningkatkan layanan. Informasi dapat berasal dari:
                </p>

                {/* Sub: Informasi yang diberikan pengguna */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    A. Informasi yang Diberikan Pengguna
                  </h3>
                  <p className="text-xs sm:text-sm">
                    Jika pengguna mengirim formulir kontak, informasi yang dapat diberikan antara lain:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-1">
                    <li>Nama lengkap;</li>
                    <li>Alamat email;</li>
                    <li>Subjek pesan;</li>
                    <li>Isi pesan atau lampiran teks yang disampaikan.</li>
                  </ul>
                  <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900 mt-2">
                    <strong>Keterbukaan Sistem:</strong> Formulir kontak DenyutGlobal saat ini masih dalam tahap pengembangan dan belum terhubung ke layanan pengiriman email atau basis data penyimpanan server pihak ketiga. Kami tidak mengklaim menyimpan data tersebut pada server jika sistem belum memiliki backend penyimpanan.
                  </div>
                </div>

                {/* Sub: Informasi teknis */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    B. Informasi Teknis
                  </h3>
                  <p className="text-xs sm:text-sm">
                    Website dapat memproses informasi teknis standar tertentu seperti:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-1">
                    <li>Jenis perangkat;</li>
                    <li>Browser / peramban;</li>
                    <li>Sistem operasi;</li>
                    <li>Halaman yang dikunjungi;</li>
                    <li>Waktu akses;</li>
                    <li>Informasi teknis lainnya yang tersedia melalui layanan infrastruktur hosting atau browser.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Penggunaan Informasi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Penggunaan Informasi
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>Informasi dapat digunakan untuk:</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Menyediakan dan mengoperasikan website;</li>
                  <li>Menanggapi pesan pengguna;</li>
                  <li>Menangani laporan koreksi dan ralat berita;</li>
                  <li>Meningkatkan pengalaman pengguna;</li>
                  <li>Memahami penggunaan website;</li>
                  <li>Menjaga keamanan dan mencegah penyalahgunaan;</li>
                  <li>Memenuhi kewajiban hukum jika berlaku.</li>
                </ul>
                <p className="text-xs text-slate-500 pt-1">
                  DenyutGlobal tidak menggunakan data pengguna untuk tujuan yang tidak dijelaskan dalam kebijakan ini tanpa dasar hukum yang sesuai.
                </p>
              </div>
            </div>

            {/* 4. Formulir Kontak */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Formulir Kontak
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Jika pengguna mengirimkan formulir kontak, informasi tersebut hanya digunakan untuk menangani pesan atau permintaan terkait DenyutGlobal.
                </p>
                <p>
                  Jika formulir belum terhubung ke sistem penyimpanan atau email, DenyutGlobal tidak mengklaim bahwa data telah disimpan atau dikirim. Ketika layanan email atau backend resmi ditambahkan di kemudian hari, Kebijakan Privasi ini akan diperbarui untuk menjelaskan layanan tersebut.
                </p>
              </div>
            </div>

            {/* 5. Cookie dan Penyimpanan Lokal */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  5
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Cookie dan Penyimpanan Lokal
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat menggunakan cookie, local storage (penyimpanan lokal browser), atau teknologi serupa untuk fungsi website tertentu, seperti:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Menyimpan preferensi pembaca (misalnya filter kategori aktif);</li>
                  <li>Menjaga fungsi aplikasi (seperti daftar artikel tersimpan/bookmarks);</li>
                  <li>Meningkatkan kenyamanan pengalaman pengguna.</li>
                </ul>
                <p className="text-xs text-slate-500">
                  DenyutGlobal tidak menggunakan cookie pihak ketiga untuk pelacakan lintas situs. Jika Google Analytics atau layanan iklan ditambahkan di kemudian hari, kebijakan ini akan diperbarui sesuai teknologi yang benar-benar digunakan.
                </p>
              </div>
            </div>

            {/* 6. Google Analytics & 7. Iklan dan AdSense */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 6. Google Analytics */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    6
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Google Analytics
                  </h2>
                </div>
                <div className="pl-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  DenyutGlobal saat ini belum menggunakan Google Analytics atau layanan analitik pihak ketiga yang mengumpulkan data pengguna. Jika layanan tersebut diaktifkan di kemudian hari, Kebijakan Privasi akan diperbarui sebelum atau pada saat penerapannya sesuai kebutuhan.
                </div>
              </div>

              {/* 7. Iklan dan AdSense */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    7
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                    Iklan dan AdSense
                  </h2>
                </div>
                <div className="pl-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  DenyutGlobal saat ini belum menampilkan iklan Google AdSense. Jika layanan periklanan diaktifkan di kemudian hari, Kebijakan Privasi akan diperbarui untuk menjelaskan penggunaan cookie, teknologi iklan, dan informasi terkait sesuai kebijakan Google yang berlaku.
                </div>
              </div>
            </div>

            {/* 8. Berbagi Informasi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  8
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Berbagi Informasi
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p className="font-semibold text-slate-900">
                  DenyutGlobal tidak menjual informasi pribadi pengguna.
                </p>
                <p>
                  Informasi hanya dapat dibagikan kepada pihak ketiga apabila:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Diperlukan untuk menyediakan layanan yang digunakan website;</li>
                  <li>Diwajibkan oleh hukum atau putusan pengadilan;</li>
                  <li>Diperlukan untuk keamanan atau pencegahan penyalahgunaan sistem;</li>
                  <li>Pengguna memberikan persetujuan atau dasar hukum lain yang sesuai.</li>
                </ul>
              </div>
            </div>

            {/* 9. Keamanan */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  9
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Keamanan
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal berupaya menggunakan langkah teknis dan organisatoris yang wajar untuk melindungi informasi pengguna.
                </p>
                <p className="text-xs text-slate-500">
                  Namun tidak ada sistem internet yang dapat dijamin sepenuhnya aman. DenyutGlobal tidak memberikan janji keamanan absolut terhadap segala bentuk insiden siber di luar kendali wajar.
                </p>
              </div>
            </div>

            {/* 10. Hak Pengguna */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  10
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Hak Pengguna
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Tergantung pada hukum perlindungan data yang berlaku, pengguna dapat memiliki hak untuk:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Mengetahui bagaimana informasi digunakan;</li>
                  <li>Meminta koreksi informasi;</li>
                  <li>Meminta penghapusan informasi tertentu;</li>
                  <li>Menarik persetujuan jika pemrosesan berdasarkan persetujuan;</li>
                  <li>Mengajukan pertanyaan mengenai privasi.</li>
                </ul>
                <div className="pt-2">
                  {onSelectModal ? (
                    <button
                      onClick={() => onSelectModal('kontak')}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Sampaikan Permintaan via Kontak DenyutGlobal →</span>
                    </button>
                  ) : (
                    <p className="text-xs text-slate-500">Permintaan dapat disampaikan melalui halaman Kontak DenyutGlobal.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 11. Tautan ke Situs Eksternal */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  11
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Tautan ke Situs Eksternal
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Artikel DenyutGlobal dapat menyertakan tautan menuju website pihak ketiga sebagai sumber rujukan.
                </p>
                <p className="text-xs text-slate-600">
                  DenyutGlobal tidak bertanggung jawab atas kebijakan privasi atau praktik website eksternal tersebut. Pengguna disarankan membaca kebijakan privasi masing-masing website yang dikunjungi.
                </p>
              </div>
            </div>

            {/* 12. Anak-anak */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  12
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Anak-anak
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal tidak secara khusus ditujukan untuk mengumpulkan informasi pribadi anak-anak.
                </p>
                <p className="text-xs text-slate-600">
                  Jika orang tua atau wali mengetahui bahwa anak memberikan informasi pribadi kepada DenyutGlobal tanpa dasar yang sesuai, mereka dapat menghubungi DenyutGlobal melalui halaman Kontak.
                </p>
              </div>
            </div>

            {/* 13. Perubahan Kebijakan Privasi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  13
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Perubahan Kebijakan Privasi
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Kebijakan Privasi dapat diperbarui apabila terdapat perubahan pada fitur website, teknologi, layanan pihak ketiga, sistem analitik, sistem periklanan, atau ketentuan hukum yang berlaku.
                </p>
                <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800">
                  Terakhir diperbarui: 15 Agustus 2026
                </div>
              </div>
            </div>

            {/* 14. Hubungi Kami */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  14
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Hubungi Kami
                </h2>
              </div>
              <div className="pl-8 space-y-2.5 text-slate-700">
                <p>
                  Untuk pertanyaan mengenai privasi dan pengelolaan data, pengguna dapat menggunakan halaman:
                </p>
                {onSelectModal ? (
                  <button
                    onClick={() => onSelectModal('kontak')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Kontak DenyutGlobal</span>
                  </button>
                ) : (
                  <p className="font-semibold text-slate-900">Kontak DenyutGlobal</p>
                )}
                <p className="text-[11px] text-slate-500">
                  DenyutGlobal tidak mencantumkan alamat email, alamat kantor, atau nomor telepon fiktif.
                </p>
              </div>
            </div>

            {/* Tautan Navigasi Dokumen Terkait */}
            {onSelectModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Dokumen Kebijakan Terkait:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectModal('tentang')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tentang DenyutGlobal</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('kontak')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-600" />
                    <span>Kontak Redaksi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('koreksi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kebijakan Koreksi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('pedoman')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    <span>Pedoman Redaksi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'ketentuan':
        return (
          <div id="ketentuan-penggunaan-page" className="space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-slate-700" />
                  Ketentuan Layanan & Hukum
                </span>
                <span className="text-xs text-slate-500">• DenyutGlobal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif-headline tracking-tight">
                Ketentuan Penggunaan DenyutGlobal
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1 font-serif-headline">
                Aturan penggunaan website, konten berita, rujukan sumber, tautan eksternal, dan batasan tanggung jawab.
              </p>
            </div>

            {/* 1. Penerimaan Ketentuan */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Penerimaan Ketentuan
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Dengan mengakses dan menggunakan website <strong>DenyutGlobal</strong>, pengguna dianggap telah membaca dan memahami Ketentuan Penggunaan ini.
                </p>
                <p>
                  Jika pengguna tidak menyetujui ketentuan ini, pengguna dapat berhenti menggunakan website.
                </p>
                <p className="text-xs text-slate-500">
                  Ketentuan ini dapat diperbarui apabila terdapat perubahan pada layanan atau kebijakan DenyutGlobal.
                </p>
              </div>
            </div>

            {/* 2. Tentang DenyutGlobal */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Tentang DenyutGlobal
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal adalah portal informasi dan berita digital berbahasa Indonesia yang menyajikan informasi mengenai perkembangan Indonesia dan dunia.
                </p>
                <p>
                  DenyutGlobal berupaya menyajikan informasi secara akurat, jelas, transparan, dan bertanggung jawab.
                </p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  DenyutGlobal bukan merupakan bagian dari, atau secara otomatis mewakili, organisasi, lembaga pemerintah, atau media yang dicantumkan sebagai sumber referensi.
                </p>
              </div>
            </div>

            {/* 3. Penggunaan Informasi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Penggunaan Informasi
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Informasi pada DenyutGlobal disediakan untuk tujuan informasi umum. Pengguna dapat membaca, mengakses, dan membagikan tautan menuju artikel DenyutGlobal dengan cara yang wajar.
                </p>
                <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider pt-1">
                  Pengguna tidak diperbolehkan menggunakan website untuk:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Melakukan aktivitas ilegal;</li>
                  <li>Menyebarkan malware atau kode berbahaya;</li>
                  <li>Mencoba mengakses sistem secara tidak sah;</li>
                  <li>Mengganggu keamanan atau operasional website;</li>
                  <li>Menyalahgunakan formulir atau fitur website;</li>
                  <li>Menyebarkan informasi yang sengaja menyesatkan dengan mengatasnamakan DenyutGlobal.</li>
                </ul>
              </div>
            </div>

            {/* 4. Akurasi Informasi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Akurasi Informasi
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal berupaya melakukan pemeriksaan fakta sebelum publikasi. Namun, informasi berita dapat berubah seiring perkembangan suatu peristiwa.
                </p>
                <p>
                  DenyutGlobal tidak menjamin bahwa setiap informasi akan selalu lengkap, bebas kesalahan, atau tetap berlaku setelah diterbitkan.
                </p>
                <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  Jika ditemukan kesalahan, DenyutGlobal dapat memperbarui atau mengoreksi artikel sesuai Kebijakan Koreksi Berita.
                </p>
              </div>
            </div>

            {/* 5. Sumber dan Referensi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  5
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Sumber dan Referensi
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>Artikel dapat menggunakan sumber dari:</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Lembaga pemerintah;</li>
                  <li>Organisasi internasional;</li>
                  <li>Sumber resmi;</li>
                  <li>Laporan publik;</li>
                  <li>Media berita;</li>
                  <li>Sumber lain yang relevan.</li>
                </ul>
                <p className="text-xs text-slate-600 pt-1">
                  Pencantuman suatu sumber tidak berarti DenyutGlobal memiliki hubungan kerja sama atau afiliasi resmi dengan sumber tersebut, kecuali dinyatakan secara jelas.
                </p>
                <p className="text-xs text-slate-500">
                  Pengguna yang ingin membaca informasi lengkap dari sumber eksternal disarankan mengunjungi sumber asli melalui tautan yang disediakan.
                </p>
              </div>
            </div>

            {/* 6. Hak Kekayaan Intelektual */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  6
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Hak Kekayaan Intelektual
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Nama, logo, desain, tampilan, kode, tulisan original, dan elemen lain yang dibuat khusus untuk DenyutGlobal dapat dilindungi oleh hak kekayaan intelektual sesuai hukum yang berlaku. Pengguna tidak boleh menyalin, menggandakan, menjual kembali, atau mendistribusikan bagian dari website secara tidak sah.
                </p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Informasi, merek, logo, gambar, atau materi milik pihak ketiga tetap menjadi milik pemegang hak masing-masing. DenyutGlobal tidak mengklaim kepemilikan atas materi pihak ketiga hanya karena materi tersebut disebut atau ditautkan sebagai sumber.
                </p>
              </div>
            </div>

            {/* 7. Artikel dan Konten Original */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  7
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Artikel dan Konten Original
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal berupaya menghasilkan konten editorial sendiri. Artikel tidak dimaksudkan untuk menggantikan artikel lengkap dari sumber asli.
                </p>
                <p className="text-xs text-slate-500">
                  Jika sebuah artikel menggunakan sumber eksternal, sumber tersebut dicantumkan sesuai kebutuhan dan pembaca dapat mengunjungi sumber asli.
                </p>
              </div>
            </div>

            {/* 8. Penggunaan AI */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  8
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Penggunaan AI
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat menggunakan teknologi kecerdasan buatan sebagai alat bantu editorial. AI dapat digunakan untuk membantu:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Menyusun draft;</li>
                  <li>Mengatur struktur tulisan;</li>
                  <li>Membantu penyuntingan;</li>
                  <li>Membantu pemeriksaan konsistensi informasi yang diberikan editor.</li>
                </ul>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                  <strong>AI Bukan Pengganti Pemeriksaan Editorial:</strong>
                  <p>
                    Artikel yang dipublikasikan harus melalui proses pemeriksaan sebelum diterbitkan. DenyutGlobal tidak mengizinkan AI menghasilkan fakta, sumber, kutipan, atau peristiwa fiktif untuk dipublikasikan sebagai fakta.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Tautan Eksternal */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  9
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Tautan Eksternal
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Website dapat menyediakan tautan menuju situs pihak ketiga. Tautan tersebut diberikan untuk membantu pembaca menemukan sumber atau informasi tambahan.
                </p>
                <p className="text-xs text-slate-500">
                  DenyutGlobal tidak mengendalikan isi, keamanan, kebijakan privasi, atau praktik website pihak ketiga. Pengguna mengakses website eksternal atas tanggung jawab mereka sendiri.
                </p>
              </div>
            </div>

            {/* 10. Formulir Kontak */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  10
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Formulir Kontak
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Pengguna harus memberikan informasi yang benar ketika menggunakan formulir kontak. Pengguna tidak boleh menggunakan formulir untuk:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Spam;</li>
                  <li>Penipuan;</li>
                  <li>Ancaman;</li>
                  <li>Distribusi malware;</li>
                  <li>Konten ilegal;</li>
                  <li>Pesan yang sengaja mengganggu operasional website.</li>
                </ul>
                <p className="text-xs text-slate-600 pt-1">
                  Laporan koreksi harus disampaikan dengan itikad baik dan, jika memungkinkan, disertai bukti atau sumber pendukung.
                </p>
              </div>
            </div>

            {/* 11. Ketersediaan Website */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  11
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Ketersediaan Website
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal berupaya menjaga website tetap tersedia. Namun, website dapat mengalami:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Pemeliharaan;</li>
                  <li>Gangguan teknis;</li>
                  <li>Pembaruan sistem;</li>
                  <li>Kesalahan jaringan;</li>
                  <li>Gangguan layanan pihak ketiga.</li>
                </ul>
                <p className="text-xs text-slate-500">
                  DenyutGlobal tidak menjamin website akan selalu tersedia tanpa gangguan.
                </p>
              </div>
            </div>

            {/* 12. Batasan Tanggung Jawab */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  12
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Batasan Tanggung Jawab
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Informasi pada DenyutGlobal disediakan untuk tujuan informasi umum. DenyutGlobal tidak bertanggung jawab atas keputusan yang dibuat pengguna hanya berdasarkan informasi dari website.
                </p>
                <p className="text-xs text-slate-600">
                  Untuk keputusan yang membutuhkan nasihat profesional, pengguna sebaiknya berkonsultasi dengan profesional atau sumber resmi yang relevan.
                </p>
              </div>
            </div>

            {/* 13. Perubahan Konten */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  13
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Perubahan Konten
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>DenyutGlobal dapat:</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Memperbarui artikel;</li>
                  <li>Memperbaiki kesalahan;</li>
                  <li>Mengubah struktur website;</li>
                  <li>Menambah atau menghapus fitur;</li>
                  <li>Memperbarui kebijakan.</li>
                </ul>
                <p className="text-xs text-slate-500">
                  Perubahan material akan dicatat atau dijelaskan sesuai kebutuhan.
                </p>
              </div>
            </div>

            {/* 14. Penghentian Akses */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  14
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Penghentian Akses
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat membatasi akses terhadap fitur tertentu apabila terdapat indikasi penyalahgunaan, aktivitas ilegal, atau tindakan yang dapat membahayakan keamanan website.
                </p>
              </div>
            </div>

            {/* 15. Hubungan dengan Kebijakan Lain */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  15
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Hubungan dengan Kebijakan Lain
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>Ketentuan Penggunaan ini harus dibaca bersama:</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Kebijakan Privasi;</li>
                  <li>Pedoman Redaksi;</li>
                  <li>Kebijakan Koreksi Berita;</li>
                  <li>Disclaimer;</li>
                  <li>Halaman Tentang DenyutGlobal.</li>
                </ul>
              </div>
            </div>

            {/* 16. Perubahan Ketentuan */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  16
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Perubahan Ketentuan
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat memperbarui Ketentuan Penggunaan ini dari waktu ke waktu. Jika terjadi perubahan, versi terbaru akan ditampilkan pada halaman ini.
                </p>
                <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800">
                  Terakhir diperbarui: 15 Agustus 2026
                </div>
              </div>
            </div>

            {/* 17. Kontak */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  17
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Kontak
                </h2>
              </div>
              <div className="pl-8 space-y-2.5 text-slate-700">
                <p>
                  Pertanyaan mengenai Ketentuan Penggunaan dapat disampaikan melalui halaman:
                </p>
                {onSelectModal ? (
                  <button
                    onClick={() => onSelectModal('kontak')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Kontak DenyutGlobal</span>
                  </button>
                ) : (
                  <p className="font-semibold text-slate-900">Kontak DenyutGlobal</p>
                )}
                <p className="text-[11px] text-slate-500">
                  DenyutGlobal tidak membuat alamat email, alamat kantor, nomor telepon, atau identitas redaksi yang belum benar-benar tersedia.
                </p>
              </div>
            </div>

            {/* Tautan Navigasi Dokumen Terkait */}
            {onSelectModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Dokumen Kebijakan Terkait:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectModal('tentang')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tentang DenyutGlobal</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('privasi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kebijakan Privasi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('koreksi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kebijakan Koreksi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('pedoman')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    <span>Pedoman Redaksi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'disclaimer':
        return (
          <div id="disclaimer-page" className="space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Pernyataan Hukum & Batasan
                </span>
                <span className="text-xs text-slate-500">• DenyutGlobal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif-headline tracking-tight">
                Disclaimer DenyutGlobal
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1 font-serif-headline">
                Pernyataan batasan tanggung jawab mengenai akurasi informasi, sumber berita, penggunaan AI, tautan eksternal, konten editorial, dan batasan website.
              </p>
            </div>

            {/* 1. Informasi Umum */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Informasi Umum
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Seluruh informasi yang tersedia di <strong>DenyutGlobal</strong> disediakan untuk tujuan informasi umum.
                </p>
                <p>
                  DenyutGlobal berupaya menyajikan informasi secara akurat, jelas, dan bertanggung jawab berdasarkan sumber serta informasi yang tersedia pada saat artikel disusun.
                </p>
                <p className="text-xs text-slate-500">
                  Namun, perkembangan suatu peristiwa dapat berubah dan informasi awal dapat mengalami pembaruan.
                </p>
              </div>
            </div>

            {/* 2. Tidak Ada Jaminan Mutlak */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Tidak Ada Jaminan Mutlak
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal berupaya menjaga akurasi dan memperbarui informasi apabila terdapat perkembangan atau koreksi. Namun, DenyutGlobal tidak menjamin bahwa seluruh informasi di website:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Selalu lengkap;</li>
                  <li>Selalu terbaru;</li>
                  <li>Selalu bebas dari kesalahan;</li>
                  <li>Berlaku untuk semua keadaan.</li>
                </ul>
                <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  Jika ditemukan kesalahan faktual, DenyutGlobal dapat memperbaiki atau memperbarui artikel sesuai Kebijakan Koreksi Berita.
                </p>
              </div>
            </div>

            {/* 3. Sumber Informasi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Sumber Informasi
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat menggunakan berbagai sumber sebagai referensi, termasuk:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Sumber resmi pemerintah;</li>
                  <li>Lembaga negara;</li>
                  <li>Organisasi internasional;</li>
                  <li>Pernyataan resmi;</li>
                  <li>Laporan publik;</li>
                  <li>Media berita;</li>
                  <li>Sumber lain yang relevan dan dapat diverifikasi.</li>
                </ul>
                <p className="text-xs text-slate-600 pt-1">
                  Pencantuman suatu sumber tidak berarti DenyutGlobal memiliki hubungan kerja sama, afiliasi, atau dukungan resmi dari sumber tersebut. DenyutGlobal tidak mengklaim sebagai bagian dari organisasi atau media yang disebutkan sebagai sumber.
                </p>
                <p className="text-xs text-slate-500">
                  Pembaca dapat menggunakan tautan sumber yang tersedia untuk memeriksa informasi lebih lanjut.
                </p>
              </div>
            </div>

            {/* 4. Konten Editorial Original */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Konten Editorial Original
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal berupaya menyusun konten editorial sendiri berdasarkan fakta dan sumber yang tersedia.
                </p>
                <p>
                  Informasi dari sumber eksternal digunakan sebagai referensi dan tidak dimaksudkan untuk menggantikan artikel lengkap dari sumber asli.
                </p>
                <p className="text-xs text-slate-500">
                  DenyutGlobal berupaya memberikan nilai tambah melalui penyusunan informasi, konteks, dan penjelasan yang relevan.
                </p>
              </div>
            </div>

            {/* 5. Penggunaan AI */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  5
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Penggunaan AI
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat menggunakan teknologi kecerdasan buatan sebagai alat bantu dalam proses editorial. AI dapat membantu:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Menyusun draft;</li>
                  <li>Merapikan struktur tulisan;</li>
                  <li>Membantu penyuntingan;</li>
                  <li>Membantu pemeriksaan konsistensi informasi yang diberikan editor.</li>
                </ul>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                  <strong>AI Bukan Pengganti Pemeriksaan Editorial Manusia:</strong>
                  <p>
                    Konten yang akan dipublikasikan harus melalui proses pemeriksaan sebelum diterbitkan. DenyutGlobal tidak bermaksud menerbitkan informasi yang dibuat AI tanpa pemeriksaan sebagai fakta.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Berita yang Berkembang */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  6
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Berita yang Berkembang
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Untuk peristiwa yang sedang berlangsung, informasi dapat berubah dengan cepat. Artikel dapat diperbarui ketika terdapat informasi baru atau koreksi. Pembaca sebaiknya memperhatikan:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Waktu publikasi;</li>
                  <li>Waktu pembaruan;</li>
                  <li>Sumber yang dicantumkan.</li>
                </ul>
                <p className="text-xs text-slate-500 pt-1">
                  Untuk kejadian yang sangat cepat berubah, informasi terbaru dari sumber resmi terkait sebaiknya menjadi rujukan tambahan.
                </p>
              </div>
            </div>

            {/* 7. Topik Sensitif */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  7
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Topik Sensitif
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Informasi mengenai konflik, bencana, kriminalitas, kesehatan, ekonomi, politik, kematian, atau keadaan darurat dapat berubah dan memiliki konteks yang kompleks.
                </p>
                <p>
                  Pembaca tidak seharusnya mengambil keputusan penting hanya berdasarkan satu artikel.
                </p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Untuk keputusan medis, hukum, keuangan, keselamatan, atau keputusan profesional lainnya, gunakan sumber resmi dan konsultasikan dengan profesional yang sesuai.
                </p>
              </div>
            </div>

            {/* 8. Tautan Pihak Ketiga */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  8
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Tautan Pihak Ketiga
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  DenyutGlobal dapat menyediakan tautan menuju website pihak ketiga. Tautan tersebut dapat digunakan untuk:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                  <li>Membaca sumber asli;</li>
                  <li>Memperoleh informasi tambahan;</li>
                  <li>Memeriksa referensi.</li>
                </ul>
                <p className="text-xs text-slate-500">
                  DenyutGlobal tidak mengendalikan isi atau kebijakan website pihak ketiga dan tidak bertanggung jawab atas perubahan yang terjadi pada website tersebut.
                </p>
              </div>
            </div>

            {/* 9. Gambar dan Media */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  9
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Gambar dan Media
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Gambar, video, logo, atau materi visual yang berasal dari pihak ketiga tetap menjadi milik pemegang hak masing-masing. DenyutGlobal tidak mengklaim kepemilikan atas materi pihak ketiga.
                </p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Materi visual hanya boleh digunakan sesuai hak, izin, lisensi, atau ketentuan penggunaannya. Jangan menganggap gambar yang tersedia di internet sebagai bebas hak cipta.
                </p>
              </div>
            </div>

            {/* 10. Iklan dan Konten Komersial */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  10
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Iklan dan Konten Komersial
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Jika DenyutGlobal menampilkan iklan atau konten komersial di masa mendatang, konten tersebut harus dibedakan dari konten editorial sesuai ketentuan yang berlaku.
                </p>
                <p>
                  DenyutGlobal tidak akan menyatakan bahwa sebuah produk, layanan, organisasi, atau perusahaan didukung oleh DenyutGlobal kecuali terdapat dasar yang jelas untuk pernyataan tersebut.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <strong>Pernyataan Status Periklanan:</strong>
                  <p>
                    DenyutGlobal saat ini <strong>belum memasang iklan Google AdSense</strong> atau jaringan periklanan pihak ketiga. Jika Google AdSense atau layanan iklan lainnya diaktifkan di kemudian hari, informasi mengenai penggunaan teknologi iklan akan dijelaskan secara transparan dalam Kebijakan Privasi sesuai implementasi sebenarnya.
                  </p>
                </div>
              </div>
            </div>

            {/* 11. Tidak Ada Nasihat Profesional */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  11
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Tidak Ada Nasihat Profesional
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Informasi DenyutGlobal bukan pengganti nasihat medis, nasihat hukum, nasihat keuangan, nasihat investasi, nasihat keselamatan, atau konsultasi profesional lainnya.
                </p>
                <p className="text-xs text-slate-500">
                  Pengguna bertanggung jawab mengevaluasi informasi sebelum mengambil keputusan.
                </p>
              </div>
            </div>

            {/* 12. Kesalahan dan Koreksi */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  12
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Kesalahan dan Koreksi
                </h2>
              </div>
              <div className="pl-8 space-y-2.5 text-slate-700">
                <p>
                  Jika pembaca menemukan informasi yang diduga tidak akurat, pembaca dapat melaporkannya melalui halaman Kontak DenyutGlobal:
                </p>
                {onSelectModal ? (
                  <button
                    onClick={() => onSelectModal('kontak')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Lapor Ralat / Kontak DenyutGlobal</span>
                  </button>
                ) : (
                  <p className="font-semibold text-slate-900">Kontak DenyutGlobal</p>
                )}
                <p className="text-xs text-slate-600">
                  DenyutGlobal akan memeriksa laporan tersebut berdasarkan sumber dan bukti yang tersedia. Koreksi dilakukan apabila informasi yang dilaporkan terbukti perlu diperbaiki sesuai mekanisme di Kebijakan Koreksi Berita.
                </p>
              </div>
            </div>

            {/* 13. Perubahan Disclaimer */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  13
                </span>
                <h2 className="text-base font-bold text-slate-900 font-serif-headline">
                  Perubahan Disclaimer
                </h2>
              </div>
              <div className="pl-8 space-y-2 text-slate-700">
                <p>
                  Disclaimer ini dapat diperbarui apabila terdapat perubahan pada layanan, teknologi, sistem editorial, penggunaan AI, layanan analitik, sistem periklanan, atau ketentuan hukum yang berlaku.
                </p>
                <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800">
                  Terakhir diperbarui: 15 Agustus 2026
                </div>
              </div>
            </div>

            {/* Tautan Navigasi Dokumen Terkait */}
            {onSelectModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Dokumen Kebijakan Terkait:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectModal('tentang')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tentang DenyutGlobal</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('privasi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kebijakan Privasi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('ketentuan')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5 text-slate-700" />
                    <span>Ketentuan Penggunaan</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('koreksi')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kebijakan Koreksi</span>
                  </button>
                  <button
                    onClick={() => onSelectModal('pedoman')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    <span>Pedoman Redaksi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id="legal-info-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        className={`w-full ${isLargeModal ? 'max-w-4xl max-h-[92vh]' : 'max-w-lg'} bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-7 relative overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-legal-modal-button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer z-10"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={isLargeModal ? 'overflow-y-auto pr-1 sm:pr-2 flex-1 space-y-4' : ''}>
          {renderContent()}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            DenyutGlobal • Standar Integritas & Transparansi
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer ml-auto shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

