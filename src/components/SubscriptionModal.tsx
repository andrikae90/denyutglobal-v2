import React, { useState } from 'react';
import { 
  Mail, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Send
} from 'lucide-react';

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateEmail = (input: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();

    // 1. Validasi kosong
    if (!trimmedEmail) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    // 2. Validasi format
    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return;
    }

    setStatus('loading');

    // Simulate saving to storage with resilient error handling
    try {
      setTimeout(() => {
        try {
          const existingRaw = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
            ? localStorage.getItem('denyutglobal_subscribers')
            : null;
          const existingList: { email: string; subscribedAt: string }[] = existingRaw 
            ? JSON.parse(existingRaw) 
            : [];

          // Save new subscriber if not already present
          const alreadySubscribed = existingList.some(item => item.email.toLowerCase() === trimmedEmail.toLowerCase());
          if (!alreadySubscribed) {
            existingList.push({
              email: trimmedEmail,
              subscribedAt: new Date().toISOString()
            });
            if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
              localStorage.setItem('denyutglobal_subscribers', JSON.stringify(existingList));
            }
          }

          setStatus('success');
        } catch (storageErr) {
          console.error('Storage error during subscription registration:', storageErr);
          setStatus('error');
          setErrorMessage('Pendaftaran belum berhasil. Silakan coba lagi.');
        }
      }, 450);
    } catch (err) {
      console.error('Submission error:', err);
      setStatus('error');
      setErrorMessage('Pendaftaran belum berhasil. Silakan coba lagi.');
    }
  };

  const handleReset = () => {
    setEmail('');
    setStatus('idle');
    setErrorMessage(null);
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
          <div id="subscription-success-view" className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-950">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-emerald-900">
                  ✓ Terima kasih!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                  Alamat email Anda berhasil didaftarkan untuk menerima Daily Brief DenyutGlobal.
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
                Daftarkan email lain
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
        ) : (
          /* Form Registration View */
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

            {/* Error Message Box */}
            {errorMessage && (
              <div 
                id="subscription-error-box"
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Masukkan alamat email Anda"
                    disabled={status === 'loading'}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 pr-10 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden transition duration-150"
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
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
                    <span>Langganan</span>
                  </>
                )}
              </button>
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
