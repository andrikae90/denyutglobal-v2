import React, { useState, useEffect } from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { LegalModalType } from './LegalModal';
import { 
  Globe, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  Send, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import { 
  subscribeNewsletter, 
  unsubscribeNewsletter,
  checkSubscriptionStatus, 
  validateEmail,
  normalizeEmail
} from '../services/subscriptionService';
import { trackSubscribeEvent } from '../utils/analytics';

interface FooterProps {
  onSelectCategory: (category: CategoryId) => void;
  onOpenLegalModal: (type: NonNullable<LegalModalType>) => void;
  onOpenSubscription?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenLegalModal,
  onOpenSubscription
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_subscribed' | 'unsubscribed_success' | 'error'>('idle');
  const [dbStatus, setDbStatus] = useState<'checking' | 'active' | 'unsubscribed' | 'none' | null>(null);
  const [unsubscribeToken, setUnsubscribeToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Periksa status saat email valid dimasukkan
  useEffect(() => {
    const clean = normalizeEmail(email);
    if (!clean || !validateEmail(clean)) {
      setDbStatus(null);
      setUnsubscribeToken(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setDbStatus('checking');
      const res = await checkSubscriptionStatus(clean);
      if (isMounted) {
        setDbStatus(res.status);
        if (res.token) {
          setUnsubscribeToken(res.token);
        } else {
          setUnsubscribeToken(null);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [email]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = normalizeEmail(email);

    if (!trimmed) {
      setErrorMsg('Silakan masukkan alamat email Anda.');
      return;
    }

    if (!validateEmail(trimmed)) {
      setErrorMsg('Silakan masukkan alamat email yang valid.');
      return;
    }

    setStatus('loading');

    // Jika aktif dan klik unsubscribe
    if (dbStatus === 'active') {
      let activeToken = unsubscribeToken;
      if (!activeToken) {
        const freshStatus = await checkSubscriptionStatus(trimmed);
        activeToken = freshStatus.token || null;
      }

      if (!activeToken) {
        setStatus('error');
        setErrorMsg('Token berhenti berlangganan tidak ditemukan. Silakan muat ulang halaman atau coba lagi.');
        return;
      }

      const unsubRes = await unsubscribeNewsletter(trimmed, activeToken);
      if (unsubRes.success) {
        setStatus('unsubscribed_success');
        setDbStatus('unsubscribed');
        setUnsubscribeToken(null);
        setFeedbackMsg(unsubRes.message || 'Alamat email berhasil dinonaktifkan dari newsletter DenyutGlobal.');
        setTimeout(() => {
          setEmail('');
          setStatus('idle');
          setFeedbackMsg('');
        }, 6000);
      } else {
        setStatus('error');
        setErrorMsg(unsubRes.error || 'Gagal memproses permintaan berhenti berlangganan.');
      }
      return;
    }

    const result = await subscribeNewsletter(trimmed);

    if (result.success) {
      if (result.isAlreadySubscribed) {
        setStatus('already_subscribed');
        setDbStatus('active');
        setFeedbackMsg(result.message || 'Email ini sudah terdaftar sebagai pelanggan aktif DenyutGlobal.');
        trackSubscribeEvent('already_subscribed');
      } else {
        setStatus('success');
        setDbStatus('active');
        setFeedbackMsg(result.message || 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.');
        trackSubscribeEvent('new');
      }
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
        setFeedbackMsg('');
      }, 6000);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Pendaftaran belum berhasil. Silakan coba lagi.');
    }
  };

  return (
    <footer id="main-footer" className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Newsletter Strip */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif-headline">
              Langganan DenyutGlobal
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Dapatkan ringkasan berita penting dan Daily Brief DenyutGlobal langsung melalui email Anda.
            </p>
          </div>

          <div className="w-full lg:w-auto max-w-md space-y-2">
            {status === 'success' ? (
              <div role="status" aria-live="polite" className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">
                  {feedbackMsg || 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'}
                </span>
              </div>
            ) : status === 'unsubscribed_success' ? (
              <div role="status" aria-live="polite" className="p-3 bg-amber-950/80 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                <UserX className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium">
                  {feedbackMsg || 'Alamat email Anda telah dinonaktifkan dari daftar langganan.'}
                </span>
              </div>
            ) : status === 'already_subscribed' ? (
              <div role="status" aria-live="polite" className="p-3 bg-blue-950/80 border border-blue-500/30 rounded-xl text-blue-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-medium">
                  {feedbackMsg || 'Email ini sudah terdaftar sebagai pelanggan aktif DenyutGlobal.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2" noValidate>
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="newsletter-email-input"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Masukkan alamat email Anda"
                    disabled={status === 'loading'}
                    aria-label="Alamat Email untuk Langganan"
                    aria-required="true"
                    aria-invalid={Boolean(errorMsg)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>

                {dbStatus === 'active' ? (
                  <button
                    id="newsletter-submit-button"
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </span>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Unsubscribe</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    id="newsletter-submit-button"
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mendaftarkan...</span>
                      </span>
                    ) : (
                      <>
                        <span>{dbStatus === 'unsubscribed' ? 'Langganan Kembali' : 'Langganan'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </form>
            )}

            {errorMsg && (
              <p role="alert" className="text-[11px] text-rose-400 font-medium">
                {errorMsg}
              </p>
            )}

            <p className="text-[11px] text-slate-400 leading-normal">
              Email Anda digunakan untuk layanan newsletter/Daily Brief DenyutGlobal dan tidak digunakan untuk tujuan lain tanpa dasar yang sesuai.{' '}
              <button
                type="button"
                onClick={() => onOpenLegalModal('privasi')}
                className="text-slate-300 hover:text-white underline cursor-pointer"
              >
                Kebijakan Privasi
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-slate-900 flex items-center justify-center text-white shadow-md">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-serif-headline">
                Denyut<span className="text-rose-500">Global</span>
              </span>
            </div>
            
            <p className="text-sm font-semibold text-rose-400 italic">
              “Menangkap Denyut Dunia, Setiap Hari.”
            </p>

            <p className="text-xs text-slate-400 leading-relaxed">
              DenyutGlobal adalah portal berita digital berbahasa Indonesia yang menyajikan informasi dan perkembangan terbaru dari berbagai belahan dunia secara ringkas, jelas, dan berimbang.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <p className="text-amber-400 font-semibold flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Status & Transparansi Redaksi</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                DenyutGlobal saat ini merupakan portal berita digital yang sedang dikembangkan. Informasi mengenai struktur organisasi, kontak, dan operasional redaksi hanya ditampilkan sesuai keadaan sebenarnya dan tidak dibuat-buat.
              </p>
            </div>
          </div>

          {/* Rubrik Navigasi (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
              Rubrik Portal
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onSelectCategory('semua')}
                className="text-left text-slate-400 hover:text-white transition cursor-pointer py-1"
              >
                🏠 Beranda Utama
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="text-left text-slate-400 hover:text-white transition cursor-pointer py-1"
                >
                  {cat.iconEmoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dokumen & Informasi (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
              Informasi & Legal
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  id="footer-tentang-denyutglobal-button"
                  onClick={() => onOpenLegalModal('tentang')}
                  className="w-full text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1 block"
                >
                  Tentang DenyutGlobal
                </button>
              </li>
              <li>
                <button
                  id="footer-kontak-button"
                  onClick={() => onOpenLegalModal('kontak')}
                  className="w-full text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1 block"
                >
                  Kontak
                </button>
              </li>
              <li>
                <button
                  id="footer-pedoman-redaksi-button"
                  onClick={() => onOpenLegalModal('pedoman')}
                  className="w-full text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1 block"
                >
                  Pedoman Redaksi
                </button>
              </li>
              <li>
                <button
                  id="footer-kebijakan-koreksi-button"
                  onClick={() => onOpenLegalModal('koreksi')}
                  className="w-full text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1 block"
                >
                  Kebijakan Koreksi
                </button>
              </li>
              <li>
                <button
                  id="footer-kebijakan-privasi-button"
                  onClick={() => onOpenLegalModal('privasi')}
                  className="w-full text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1 block"
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button
                  id="footer-disclaimer-button"
                  onClick={() => onOpenLegalModal('disclaimer')}
                  className="w-full text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1 block"
                >
                  Disclaimer
                </button>
              </li>
              <li>
                <button
                  id="footer-ketentuan-penggunaan-button"
                  onClick={() => onOpenLegalModal('ketentuan')}
                  className="w-full text-left text-slate-400 hover:text-white transition-colors cursor-pointer py-1 block"
                >
                  Syarat & Ketentuan
                </button>
              </li>
            </ul>
          </div>

          {/* Prototype Notice Box (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Fase Pengembangan</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Seluruh proses penulisan dan asistensi editorial diverifikasi secara ketat berdasar 13 Butir Standar Pedoman Redaksi.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px]">
              <button
                onClick={() => onOpenLegalModal('pedoman')}
                className="text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Lihat Pedoman Redaksi →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong>DenyutGlobal</strong>. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Menangkap Denyut Dunia, Setiap Hari</span>
            <span>•</span>
            <span>Bahasa Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
