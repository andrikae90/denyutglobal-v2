import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  X,
  KeyRound,
  Clock
} from 'lucide-react';

interface EditorialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

// ======================================================================================
// KONFIGURASI HASH KEAMANAN RUANG REDAKSI (SHA-256)
// Masukkan string heksadesimal hash SHA-256 (64 karakter huruf kecil) dari passphrase Anda.
// Contoh format: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
// ======================================================================================
export const EDITORIAL_PASSPHRASE_SHA256_HASH = '518f21a9a8470c890258ddaa2dc85c5483f597e22d7dc4b4a825208aa0eb1ea7';

// Konfigurasi Rate Limiting
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 menit (300.000 ms)
const STORAGE_FAILED_ATTEMPTS_KEY = 'denyutglobal_auth_failed_attempts';
const STORAGE_LOCKOUT_TIMESTAMP_KEY = 'denyutglobal_auth_lockout_until';
const SESSION_AUTH_KEY = 'denyutglobal_editorial_session';

/**
 * Menghitung hash SHA-256 dari string input menggunakan Web Crypto API standar browser.
 */
async function computeSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Periksa apakah input saat ini sedang terkunci akibat percobaan gagal
  const checkLockoutStatus = useCallback((): number => {
    try {
      const lockoutUntilStr = sessionStorage.getItem(STORAGE_LOCKOUT_TIMESTAMP_KEY);
      if (lockoutUntilStr) {
        const lockoutUntil = parseInt(lockoutUntilStr, 10);
        const now = Date.now();
        if (now < lockoutUntil) {
          return Math.ceil((lockoutUntil - now) / 1000);
        } else {
          // Kunci telah berakhir
          sessionStorage.removeItem(STORAGE_LOCKOUT_TIMESTAMP_KEY);
          sessionStorage.removeItem(STORAGE_FAILED_ATTEMPTS_KEY);
        }
      }
    } catch {
      // Abaikan jika sessionStorage tidak tersedia
    }
    return 0;
  }, []);

  // Timer hitung mundur jika terkunci
  useEffect(() => {
    let timer: any = null;
    if (lockoutRemainingSeconds > 0) {
      timer = setInterval(() => {
        setLockoutRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setLocalError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutRemainingSeconds]);

  // SEO: Add noindex, nofollow robots meta tag when auth modal is open
  useEffect(() => {
    if (!isOpen) return;

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let createdRobotsMeta = false;

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
      createdRobotsMeta = true;
    }

    const previousRobotsContent = robotsMeta.getAttribute('content');
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (createdRobotsMeta && robotsMeta && robotsMeta.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      } else if (robotsMeta) {
        if (previousRobotsContent !== null) {
          robotsMeta.setAttribute('content', previousRobotsContent);
        } else {
          robotsMeta.removeAttribute('content');
        }
      }
    };
  }, [isOpen]);

  // Reset internal states saat modal dibuka/ditutup
  useEffect(() => {
    if (isOpen) {
      setPassphrase('');
      setShowPassword(false);
      setLocalError(null);
      setIsSubmitting(false);
      const remainingSec = checkLockoutStatus();
      setLockoutRemainingSeconds(remainingSec);
      if (remainingSec > 0) {
        setLocalError(`Terlalu banyak percobaan gagal. Akses dikunci sementara. Silakan tunggu ${Math.ceil(remainingSec / 60)} menit lagi.`);
      }
    }
  }, [isOpen, checkLockoutStatus]);

  // Sync external error message
  useEffect(() => {
    if (errorMessage) {
      setLocalError(errorMessage);
    }
  }, [errorMessage]);

  if (!isOpen) return null;

  const isLocked = lockoutRemainingSeconds > 0;
  const isBusy = isLoading || isSubmitting;
  const activeError = localError || errorMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pastikan tidak sedang terkunci
    const remaining = checkLockoutStatus();
    if (remaining > 0) {
      setLockoutRemainingSeconds(remaining);
      setLocalError(`Terlalu banyak percobaan gagal. Akses dikunci sementara. Silakan tunggu ${Math.ceil(remaining / 60)} menit lagi.`);
      return;
    }

    if (!passphrase.trim()) {
      setLocalError('Silakan masukkan kunci akses / passphrase redaksi.');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      // 1. Hitung hash SHA-256 dari passphrase yang dimasukkan
      const computedHash = await computeSHA256(passphrase.trim());

      // 2. Bandingkan dengan konstanta HASH yang dikonfigurasi
      const expectedHash = EDITORIAL_PASSPHRASE_SHA256_HASH.trim().toLowerCase();

      // Periksa apakah konfigurasi hash sudah diisi atau masih placeholder
      if (!expectedHash || expectedHash === 'masukkan_hash_sha256_passphrase_redaksi_di_sini') {
        setLocalError('Konfigurasi hash kunci akses redaksi belum diatur di EditorialAuthModal.tsx.');
        setIsSubmitting(false);
        return;
      }

      if (computedHash.toLowerCase() === expectedHash) {
        // AUTENTIKASI BERHASIL
        // Hubungi endpoint server untuk mendapatkan session token otorisasi API
        try {
          const res = await fetch('/api/editorial/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passphraseHash: computedHash.toLowerCase() })
          });
          if (res.ok) {
            const authData = await res.json();
            if (authData.token) {
              sessionStorage.setItem('denyutglobal_editorial_token', authData.token);
            }
          }
        } catch (authFetchErr) {
          console.warn('Server auth exchange warning (continuing with local session):', authFetchErr);
        }

        // Fallback jikalau fetch server gagal, buat signed token lokal yang kompatibel dengan worker/server
        if (!sessionStorage.getItem('denyutglobal_editorial_token')) {
          const exp = Date.now() + 24 * 60 * 60 * 1000;
          const expHex = exp.toString(16);
          const sig = await computeSHA256(`${expHex}:${computedHash.toLowerCase()}`);
          sessionStorage.setItem('denyutglobal_editorial_token', `dg_${expHex}_${sig}`);
        }

        // Hapus catatan percobaan gagal
        try {
          sessionStorage.removeItem(STORAGE_FAILED_ATTEMPTS_KEY);
          sessionStorage.removeItem(STORAGE_LOCKOUT_TIMESTAMP_KEY);
          sessionStorage.setItem(SESSION_AUTH_KEY, 'active');
        } catch (storageErr) {
          console.error('Session storage error:', storageErr);
        }

        // Panggil callback autentikasi sukses
        if (onAuthenticate) {
          onAuthenticate();
        }
      } else {
        // AUTENTIKASI GAGAL
        let currentFailedAttempts = 1;
        try {
          const storedAttempts = sessionStorage.getItem(STORAGE_FAILED_ATTEMPTS_KEY);
          currentFailedAttempts = (storedAttempts ? parseInt(storedAttempts, 10) : 0) + 1;
          sessionStorage.setItem(STORAGE_FAILED_ATTEMPTS_KEY, currentFailedAttempts.toString());
        } catch {
          // Ignore storage error
        }

        if (currentFailedAttempts >= MAX_ATTEMPTS) {
          // Kunci selama 5 menit
          const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
          try {
            sessionStorage.setItem(STORAGE_LOCKOUT_TIMESTAMP_KEY, lockoutUntil.toString());
          } catch {
            // Ignore storage error
          }
          setLockoutRemainingSeconds(LOCKOUT_DURATION_MS / 1000);
          setLocalError('Terlalu banyak percobaan gagal (5/5). Akses dibekukan sementara selama 5 menit untuk keamanan.');
        } else {
          const sisa = MAX_ATTEMPTS - currentFailedAttempts;
          setLocalError(`Kunci akses tidak valid. (Sisa percobaan: ${sisa})`);
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Terjadi kesalahan saat memproses verifikasi kriptografi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="editorial-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editorial-auth-title"
    >
      <div 
        id="editorial-auth-modal-container"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all text-slate-900"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 id="editorial-auth-title" className="text-base font-bold text-slate-900">
                Akses Ruang Redaksi
              </h2>
              <p className="text-xs text-slate-500">
                Area terbatas untuk jurnalis & editor DenyutGlobal
              </p>
            </div>
          </div>
          <button
            id="editorial-auth-close-button"
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Tutup"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label 
              htmlFor="editorial-passphrase-input" 
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Kunci Akses / Passphrase
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="editorial-passphrase-input"
                type={showPassword ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  if (activeError && !isLocked) setLocalError(null);
                }}
                disabled={isBusy || isLocked}
                placeholder={isLocked ? "Form dibekukan..." : "Masukkan kata sandi redaksi..."}
                autoFocus={!isLocked}
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 focus:border-rose-500 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
              <button
                id="editorial-auth-toggle-visibility-button"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isBusy || isLocked}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden disabled:opacity-50 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Lockout Notice */}
          {isLocked && (
            <div 
              id="editorial-auth-lockout-notice"
              className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800"
            >
              <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
              <span>
                Akses terkunci sementara. Dapat dicoba kembali dalam <strong>{Math.floor(lockoutRemainingSeconds / 60)}m {lockoutRemainingSeconds % 60}s</strong>.
              </span>
            </div>
          )}

          {/* Error Message */}
          {activeError && !isLocked && (
            <div 
              id="editorial-auth-error-message"
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Sesi terautentikasi akan otomatis terkunci saat tab browser ditutup.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              id="editorial-auth-cancel-button"
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              id="editorial-auth-submit-button"
              type="submit"
              disabled={isBusy || isLocked || !passphrase.trim()}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

