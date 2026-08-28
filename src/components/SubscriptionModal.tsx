import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Send,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import { 
  subscribeNewsletter, 
  unsubscribeNewsletter,
  checkSubscriptionStatus, 
  validateEmail,
  normalizeEmail
} from '../services/subscriptionService';
import { trackSubscribeEvent } from '../utils/analytics';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegalModal?: (type: 'tentang' | 'kontak' | 'pedoman' | 'koreksi' | 'privasi' | 'disclaimer' | 'ketentuan') => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onOpenLegalModal
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_subscribed' | 'unsubscribed_success' | 'error'>('idle');
  const [dbStatus, setDbStatus] = useState<'checking' | 'active' | 'unsubscribed' | 'none' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Periksa status langganan dari basis data saat email valid diketikkan
  useEffect(() => {
    const clean = normalizeEmail(email);
    if (!clean || !validateEmail(clean)) {
      setDbStatus(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setDbStatus('checking');
      const res = await checkSubscriptionStatus(clean);
      if (isMounted) {
        setDbStatus(res.status);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [email]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = normalizeEmail(email);

    // 1. Validasi awal di sisi klien
    if (!trimmedEmail) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }

    setStatus('loading');

    // Jika pengguna yang aktif memilih untuk berhenti berlangganan
    if (dbStatus === 'active') {
      const unsubRes = await unsubscribeNewsletter(trimmedEmail, '');
      if (unsubRes.success) {
        setStatus('unsubscribed_success');
        setDbStatus('unsubscribed');
        setFeedbackMessage(unsubRes.message || 'Alamat email Anda telah dinonaktifkan dari daftar pengiriman newsletter DenyutGlobal.');
      } else {
        setStatus('error');
        setErrorMessage(unsubRes.error || 'Gagal memproses permintaan berhenti berlangganan. Silakan coba lagi.');
      }
      return;
    }

    // Pendaftaran atau Re-subscribe
    const result = await subscribeNewsletter(trimmedEmail);

    if (result.success) {
      if (result.isAlreadySubscribed) {
        setStatus('already_subscribed');
        setDbStatus('active');
        setFeedbackMessage(result.message || 'Email ini sudah terdaftar sebagai pelanggan aktif DenyutGlobal.');
        trackSubscribeEvent('already_subscribed');
      } else {
        setStatus('success');
        setDbStatus('active');
        setFeedbackMessage(result.message || 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.');
        trackSubscribeEvent('new');
      }
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Pendaftaran belum berhasil. Silakan coba lagi.');
    }
  };

  const handleReset = () => {
    setEmail('');
    setStatus('idle');
    setDbStatus(null);
    setErrorMessage(null);
    setFeedbackMessage('');
  };

  return (
    <div 
      id="subscription-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="subscription-modal-container"
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 text-left animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
      >
        {/* Close Button */}
        <button
          id="subscription-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          aria-label="Tutup Jendela Langganan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded uppercase tracking-wider">
              Newsletter Gratis
            </span>
          </div>
        </div>

        {/* Success View */}
        {status === 'success' ? (
          <div id="subscription-success-view" className="space-y-4 py-2" role="status" aria-live="polite">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-950">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-emerald-900">
                  ✓ Berhasil Terdaftar
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                  {feedbackMessage || 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ringkasan berita esensial dan perkembangan global penting akan dikirimkan secara berkala tanpa biaya berlangganan apa pun.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Kelola email lain
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : status === 'unsubscribed_success' ? (
          /* Unsubscribed View */
          <div id="subscription-unsubscribed-view" className="space-y-4 py-2" role="status" aria-live="polite">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-950">
              <UserX className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-amber-900">
                  Berhenti Berlangganan Berhasil
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  {feedbackMessage || 'Alamat email Anda telah dinonaktifkan dari daftar pengiriman Daily Brief.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Data Anda telah diperbarui menjadi tidak aktif. Anda dapat mendaftar kembali kapan saja melalui website DenyutGlobal.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Kelola email lain
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : status === 'already_subscribed' ? (
          /* Already Subscribed View */
          <div id="subscription-already-subscribed-view" className="space-y-4 py-2" role="status" aria-live="polite">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-950">
              <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-blue-900">
                  Status Langganan Aktif
                </h4>
                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                  {feedbackMessage || 'Email ini sudah terdaftar sebagai pelanggan aktif DenyutGlobal.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Alamat email Anda sudah aktif di sistem kami dan akan terus menerima pembaruan Daily Brief tanpa tindakan tambahan.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Kelola email lain
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Form Registration / Status View */
          <div className="space-y-4">
            <div>
              <h3 
                id="subscription-modal-title" 
                className="text-xl sm:text-2xl font-black font-serif-headline text-slate-900 tracking-tight"
              >
                Langganan DenyutGlobal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Dapatkan ringkasan berita penting dan Daily Brief DenyutGlobal langsung melalui email Anda.
              </p>
            </div>

            {/* Status indicator pill when checking / found status */}
            {dbStatus === 'checking' && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span>Memeriksa status langganan di database...</span>
              </div>
            )}

            {dbStatus === 'active' && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">Email ini saat ini aktif berlangganan</span>
                </div>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase">
                  Aktif
                </span>
              </div>
            )}

            {dbStatus === 'unsubscribed' && (
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Status: Pernah berlangganan (Non-aktif)</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-full uppercase">
                  Unsubscribed
                </span>
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div 
                id="subscription-error-box"
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
              <div className="space-y-1.5">
                <label 
                  htmlFor="subscription-email-input" 
                  className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    id="subscription-email-input"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Masukkan alamat email Anda"
                    disabled={status === 'loading'}
                    aria-label="Alamat Email"
                    aria-required="true"
                    aria-invalid={Boolean(errorMessage)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 pr-10 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden transition duration-150"
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Dynamic Action Button (Subscribe vs Unsubscribe) */}
              {dbStatus === 'active' ? (
                <button
                  id="subscription-submit-button"
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 px-5 bg-slate-800 hover:bg-slate-900 active:bg-black text-rose-300 hover:text-rose-200 text-xs sm:text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 border border-slate-700"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                      <span>Memproses Unsubscribe...</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4 text-rose-400" />
                      <span>Unsubscribe (Berhenti Berlangganan)</span>
                    </>
                  )}
                </button>
              ) : dbStatus === 'unsubscribed' ? (
                <button
                  id="subscription-submit-button"
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 px-5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengaktifkan Kembali...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Langganan Kembali (Subscribe)</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  id="subscription-submit-button"
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 px-5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Langganan (Subscribe)</span>
                    </>
                  )}
                </button>
              )}
            </form>

            {/* Privacy and Transparency Notice */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  Email Anda digunakan untuk layanan newsletter/Daily Brief DenyutGlobal dan tidak digunakan untuk tujuan lain tanpa dasar yang sesuai.{' '}
                  {onOpenLegalModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalModal('privasi');
                      }}
                      className="text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Kebijakan Privasi
                    </button>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Layanan ini sepenuhnya gratis tanpa biaya berlangganan.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
