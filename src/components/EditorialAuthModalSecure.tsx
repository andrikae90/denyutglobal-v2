import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, X, KeyRound, Clock } from 'lucide-react';

interface EditorialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
const STORAGE_FAILED_ATTEMPTS_KEY = 'denyutglobal_auth_failed_attempts';
const STORAGE_LOCKOUT_TIMESTAMP_KEY = 'denyutglobal_auth_lockout_until';
const SESSION_AUTH_KEY = 'denyutglobal_editorial_session';
const SESSION_TOKEN_KEY = 'denyutglobal_editorial_token';

export const EditorialAuthModal: React.FC<EditorialAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  isLoading = false,
  errorMessage = null,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState(0);

  const checkLockoutStatus = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_LOCKOUT_TIMESTAMP_KEY);
      if (!raw) return 0;
      const until = Number.parseInt(raw, 10);
      if (Number.isFinite(until) && Date.now() < until) return Math.ceil((until - Date.now()) / 1000);
      sessionStorage.removeItem(STORAGE_LOCKOUT_TIMESTAMP_KEY);
      sessionStorage.removeItem(STORAGE_FAILED_ATTEMPTS_KEY);
    } catch {}
    return 0;
  }, []);

  useEffect(() => {
    if (!lockoutRemainingSeconds) return;
    const timer = window.setInterval(() => {
      setLockoutRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutRemainingSeconds]);

  useEffect(() => {
    if (!isOpen) return;
    setPassphrase('');
    setShowPassword(false);
    setLocalError(errorMessage);
    const remaining = checkLockoutStatus();
    setLockoutRemainingSeconds(remaining);
    if (remaining > 0) {
      setLocalError(`Terlalu banyak percobaan gagal. Akses dikunci sementara. Silakan tunggu ${Math.ceil(remaining / 60)} menit lagi.`);
    }
  }, [isOpen, errorMessage, checkLockoutStatus]);

  if (!isOpen) return null;

  const isLocked = lockoutRemainingSeconds > 0;
  const isBusy = isLoading || isSubmitting;
  const activeError = localError || errorMessage;

  const registerFailedAttempt = () => {
    let attempts = 1;
    try {
      attempts = Number.parseInt(sessionStorage.getItem(STORAGE_FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
      sessionStorage.setItem(STORAGE_FAILED_ATTEMPTS_KEY, String(attempts));
      if (attempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        sessionStorage.setItem(STORAGE_LOCKOUT_TIMESTAMP_KEY, String(until));
        setLockoutRemainingSeconds(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      }
    } catch {}
    return attempts;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const remaining = checkLockoutStatus();
    if (remaining > 0) {
      setLockoutRemainingSeconds(remaining);
      return;
    }
    const value = passphrase.trim();
    if (!value) {
      setLocalError('Silakan masukkan kunci akses / passphrase redaksi.');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);
    try {
      // Jangan simpan atau bandingkan hash passphrase di frontend.
      // Worker melakukan verifikasi terhadap Cloudflare Secret dan menerbitkan session token.
      const response = await fetch('/api/editorial/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ passphrase: value }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.token) {
        const attempts = registerFailedAttempt();
        if (attempts >= MAX_ATTEMPTS) {
          setLocalError('Terlalu banyak percobaan gagal (5/5). Akses dibekukan sementara selama 5 menit untuk keamanan.');
        } else {
          setLocalError(data?.error || `Kunci akses tidak valid. (Sisa percobaan: ${MAX_ATTEMPTS - attempts})`);
        }
        return;
      }

      sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
      sessionStorage.setItem(SESSION_AUTH_KEY, 'active');
      sessionStorage.removeItem(STORAGE_FAILED_ATTEMPTS_KEY);
      sessionStorage.removeItem(STORAGE_LOCKOUT_TIMESTAMP_KEY);
      if (onAuthenticate) onAuthenticate();
    } catch (error: any) {
      setLocalError(error?.message || 'Tidak dapat menghubungi server autentikasi Ruang Redaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="editorial-auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="editorial-auth-title">
      <div id="editorial-auth-modal-container" className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
            <div><h2 id="editorial-auth-title" className="text-base font-bold">Akses Ruang Redaksi</h2><p className="text-xs text-slate-500">Area terbatas untuk jurnalis & editor DenyutGlobal</p></div>
          </div>
          <button type="button" onClick={onClose} disabled={isBusy} aria-label="Tutup" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 disabled:opacity-50"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="editorial-passphrase-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Kunci Akses / Passphrase</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
              <input id="editorial-passphrase-input" type={showPassword ? 'text' : 'password'} value={passphrase} onChange={(event) => { setPassphrase(event.target.value); if (!isLocked) setLocalError(null); }} disabled={isBusy || isLocked} placeholder={isLocked ? 'Form dibekukan...' : 'Masukkan kata sandi redaksi...'} autoFocus={!isLocked} autoComplete="current-password" className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 focus:border-rose-500 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 disabled:bg-slate-100 disabled:text-slate-400" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} disabled={isBusy || isLocked} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>

          {isLocked && <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800"><Clock className="w-4 h-4 text-amber-600 shrink-0" /><span>Akses terkunci sementara. Dapat dicoba kembali dalam <strong>{Math.floor(lockoutRemainingSeconds / 60)}m {lockoutRemainingSeconds % 60}s</strong>.</span></div>}
          {activeError && !isLocked && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"><AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" /><span>{activeError}</span></div>}

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100"><KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span>Passphrase diverifikasi di server dan tidak disimpan di browser.</span></div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isBusy} className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isBusy || isLocked || !passphrase.trim()} className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isBusy ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Memverifikasi...</span></> : <span>Masuk</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
