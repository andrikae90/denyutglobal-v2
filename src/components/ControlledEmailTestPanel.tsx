import React, { useState } from 'react';
import {
  Mail,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Info,
  Clock,
  Lock
} from 'lucide-react';

interface ControlledEmailTestPanelProps {
  onClose?: () => void;
}

export const ControlledEmailTestPanel: React.FC<ControlledEmailTestPanelProps> = () => {
  const [emailInput, setEmailInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    type: 'success' | 'warning' | 'error' | 'already_sent' | 'unsubscribed';
    title: string;
    message: string;
    subInfo?: string;
    messageId?: string;
  } | null>(null);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setValidationError('Silakan masukkan alamat email yang valid.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setValidationError('Silakan masukkan alamat email yang valid.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    if (!validateEmail(emailInput)) {
      return;
    }

    setStatusResult(null);
    setIsConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
  };

  const handleExecuteControlledTest = async () => {
    setIsConfirmOpen(false);
    if (isSending) return;

    const normalizedEmail = emailInput.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return;
    }

    setIsSending(true);
    setStatusResult(null);
    setValidationError(null);

    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('denyutglobal_editorial_token') || ''
        : '';

      const response = await fetch('/api/editorial/newsletter/controlled-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-editorial-token': token
        },
        body: JSON.stringify({
          email: normalizedEmail
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok === true && data.email_sent === true) {
        setStatusResult({
          type: 'success',
          title: 'Pengiriman Berhasil',
          message: 'Berhasil. Satu email test telah dikirim melalui Resend.',
          subInfo: 'Periksa inbox atau folder spam email penguji.',
          messageId: data.provider_message_id ? 'Provider message ID berhasil dibuat.' : undefined
        });
      } else if (data.reason === 'SUBSCRIBER_UNSUBSCRIBED') {
        setStatusResult({
          type: 'unsubscribed',
          title: 'Status Berhenti Berlangganan',
          message: 'Email ini berstatus berhenti berlangganan sehingga tidak dapat digunakan untuk controlled test.',
          subInfo: 'Status subscriber tidak diubah.'
        });
      } else if (data.reason === 'CONTROLLED_TEST_ALREADY_SENT' || data.message?.includes('ALREADY SENT')) {
        setStatusResult({
          type: 'already_sent',
          title: 'Test Sudah Pernah Dikirim',
          message: 'Email test untuk penerima ini sudah pernah dikirim. Tidak ada email kedua yang dikirim.',
          subInfo: 'Proteksi idempotency aktif untuk mencegah duplikasi pengiriman.'
        });
      } else if (data.reason === 'TEST_RECIPIENT_NOT_FOUND') {
        setStatusResult({
          type: 'warning',
          title: 'Penerima Belum Terdaftar',
          message: 'Alamat email penguji belum terdaftar di database subscriber.',
          subInfo: 'Gunakan alamat email yang sudah terdaftar sebagai subscriber aktif DenyutGlobal.'
        });
      } else if (data.reason === 'SUBSCRIBER_PENDING_VERIFICATION') {
        setStatusResult({
          type: 'warning',
          title: 'Subscriber Belum Terverifikasi',
          message: 'Subscriber masih dalam status pending verifikasi. Controlled test hanya dapat dikirim ke subscriber aktif.',
          subInfo: 'Silakan verifikasi email subscriber terlebih dahulu.'
        });
      } else {
        setStatusResult({
          type: 'error',
          title: 'Pengiriman Gagal',
          message: 'Pengiriman test gagal. Tidak ada email kedua yang dikirim.',
          subInfo: data.error ? String(data.error) : 'Pastikan RESEND_API_KEY dan domain pengirim telah terverifikasi.'
        });
      }
    } catch (err) {
      setStatusResult({
        type: 'error',
        title: 'Kesalahan Jaringan',
        message: 'Pengiriman test gagal. Tidak ada email kedua yang dikirim.',
        subInfo: 'Tidak dapat menghubungi server backend. Silakan periksa koneksi Anda.'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="controlled-email-test-panel" className="space-y-6 max-w-3xl mx-auto w-full">
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 font-serif-headline">
                  Controlled Real Email Test
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 tracking-wider">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Uji coba pengiriman 1 email nyata ke existing active subscriber
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium">Strict Safe Mode</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Gunakan fitur ini untuk menguji pengiriman satu email nyata melalui Resend.
          Fitur ini hanya untuk pengujian dan tidak mengirim newsletter ke subscriber lain.
        </p>

        {/* Security / Policy Safeguards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-semibold">Tepat 1 Recipient</strong>
              <span className="text-[11px] text-slate-500">Maksimal 1 email per request, tidak ada broadcast.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-semibold">Cron Dinonaktifkan</strong>
              <span className="text-[11px] text-slate-500">NEWSLETTER_EMAIL_ENABLED tetap bernilai false.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-semibold">Data Subscriber Utuh</strong>
              <span className="text-[11px] text-slate-500">Tidak mengubah status atau token subscriber.</span>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleOpenConfirm} className="space-y-4 pt-2" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="controlled-test-email-input"
              className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
            >
              Email Penguji
            </label>
            <div className="relative">
              <input
                id="controlled-test-email-input"
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isSending}
                placeholder="Masukkan email subscriber yang sudah terdaftar"
                aria-label="Email Penguji"
                aria-describedby="controlled-test-email-desc"
                aria-invalid={Boolean(validationError)}
                className={`w-full text-xs sm:text-sm bg-white border ${
                  validationError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-indigo-500'
                } rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:border-transparent transition`}
              />
            </div>
            <p
              id="controlled-test-email-desc"
              className="text-[11px] text-slate-500 leading-relaxed"
            >
              Gunakan hanya satu alamat email yang Anda kontrol sendiri dan sudah terdaftar sebagai subscriber aktif.
            </p>

            {validationError && (
              <p
                role="alert"
                aria-live="polite"
                className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-150"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              id="controlled-test-submit-btn"
              type="submit"
              disabled={isSending || !emailInput.trim()}
              aria-label="Uji Kirim 1 Email"
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isSending || !emailInput.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-indigo-200'
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mengirim email test...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Uji Kirim 1 Email</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-400 text-center sm:text-right">
              Tindakan ini memerlukan otorisasi redaksi aktif.
            </span>
          </div>
        </form>

        {/* Results / Feedback Section */}
        {statusResult && (
          <div
            role="alert"
            aria-live="polite"
            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 animate-in fade-in duration-200 ${
              statusResult.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : statusResult.type === 'already_sent'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : statusResult.type === 'unsubscribed'
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : statusResult.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {statusResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusResult.type === 'already_sent' || statusResult.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : statusResult.type === 'unsubscribed' ? (
                <Info className="w-4 h-4 text-slate-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusResult.title}</span>
            </div>

            <p className="font-medium pl-6">{statusResult.message}</p>

            {statusResult.subInfo && (
              <p className="text-[11px] opacity-90 pl-6">{statusResult.subInfo}</p>
            )}

            {statusResult.messageId && (
              <div className="pl-6 pt-1">
                <span className="inline-block px-2.5 py-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-mono font-semibold rounded-md border border-emerald-200">
                  {statusResult.messageId}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div
          id="controlled-test-confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={handleCancelConfirm}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 id="confirm-modal-title" className="font-bold text-base text-slate-900 font-serif-headline">
                  Konfirmasi Pengiriman Uji Coba
                </h3>
                <p className="text-xs text-slate-500">
                  Pengiriman 1 Email Nyata Terkontrol
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <p className="font-medium leading-relaxed">
                Anda akan mengirim SATU email TEST ke alamat ini.
                Tidak ada subscriber lain yang akan menerima email.
                Lanjutkan?
              </p>
              <div className="p-2 bg-white/80 rounded-lg border border-amber-200 font-mono text-[11px] text-slate-800 break-all">
                {emailInput.trim().toLowerCase()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                id="controlled-test-confirm-cancel-btn"
                type="button"
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="controlled-test-confirm-submit-btn"
                type="button"
                onClick={handleExecuteControlledTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-200"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ya, Kirim 1 Email Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
