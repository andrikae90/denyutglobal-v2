import React, { useState } from 'react';
import { RadarNewsItem, RadarVerificationResult } from '../types';
import { runRadar9PointVerification, getRadarStatusMeta } from '../utils/radarVerification';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  ArrowRight, 
  Building2, 
  Link2, 
  FileCheck2,
  Lock,
  SearchCheck,
  Check
} from 'lucide-react';

interface RadarVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  radarItem: RadarNewsItem | null;
  onConfirmPrimarySource: (radarId: string, confirmation: {
    namaLembaga: string;
    urlKonfirmasi: string;
    dokumenResmi?: string;
  }) => void;
  onProceedToDraft: (radarItem: RadarNewsItem) => void;
  isProcessingDraft?: boolean;
}

export const RadarVerificationModal: React.FC<RadarVerificationModalProps> = ({
  isOpen,
  onClose,
  radarItem,
  onConfirmPrimarySource,
  onProceedToDraft,
  isProcessingDraft = false
}) => {
  if (!isOpen || !radarItem) return null;

  const [namaLembaga, setNamaLembaga] = useState(radarItem.konfirmasiPrimer?.namaLembaga || '');
  const [urlKonfirmasi, setUrlKonfirmasi] = useState(radarItem.konfirmasiPrimer?.urlKonfirmasi || '');
  const [dokumenResmi, setDokumenResmi] = useState(radarItem.konfirmasiPrimer?.dokumenResmi || '');
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  const verification: RadarVerificationResult = radarItem.verificationResult || runRadar9PointVerification(radarItem);
  const statusMeta = getRadarStatusMeta(radarItem.status, radarItem.isVerified, radarItem.jenisSumber);

  const handleSaveConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLembaga.trim() || !urlKonfirmasi.trim()) {
      return;
    }

    onConfirmPrimarySource(radarItem.id, {
      namaLembaga: namaLembaga.trim(),
      urlKonfirmasi: urlKonfirmasi.trim(),
      dokumenResmi: dokumenResmi.trim() || undefined
    });

    setConfirmSuccess(`Konfirmasi sumber primer (${namaLembaga}) berhasil disimpan. Status telah ditingkatkan ke Sumber Primer + Konteks.`);
    setTimeout(() => setConfirmSuccess(null), 4000);
  };

  return (
    <div 
      id="radar-verification-modal"
      className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <SearchCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-headline">
                Verifikasi Sumber & Audit 9 Poin Radar
              </h3>
              <p className="text-xs text-slate-400">
                Pemeriksaan kelayakan integritas sumber sebelum pembuatan draft original
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-slate-200 text-slate-800">
                  {radarItem.kategoriLabel}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  radarItem.jenisSumber === 'primer' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  Sumber {radarItem.jenisSumber}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${statusMeta.badgeBg}`}>
                {statusMeta.label}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 font-serif-headline">
              {radarItem.judulTopik}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
              <div><strong>Sumber:</strong> {radarItem.namaSumber}</div>
              <div><strong>Waktu:</strong> {radarItem.waktu}</div>
              <div><strong>Lokasi:</strong> {radarItem.lokasi}</div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className={`p-4 rounded-xl border ${
            verification.verdict === 'terverifikasi'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : verification.verdict === 'perlu_verifikasi'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              {verification.verdict === 'terverifikasi' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : verification.verdict === 'perlu_verifikasi' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-bold text-sm uppercase tracking-wide">
                STATUS HASIL VERIFIKASI: {verification.verdict === 'terverifikasi' ? 'TERVERIFIKASI' : verification.verdict === 'perlu_verifikasi' ? 'PERLU VERIFIKASI' : 'TIDAK LAYAK'}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {verification.summary}
            </p>
          </div>

          {/* 9-Point Verification Checklist Table */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>9 Poin Pemeriksaan Sumber Primer DenyutGlobal</span>
              <span className="text-[11px] font-normal text-slate-500">
                Waktu audit: {verification.checkedAt}
              </span>
            </h5>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {verification.checks.map(check => (
                <div key={check.id} className="p-3 flex items-start gap-3 text-xs hover:bg-slate-50 transition">
                  <div className="mt-0.5 shrink-0">
                    {check.passed === true ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : check.passed === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800">
                        {check.id}. {check.question}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        check.passed === true 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : check.passed === 'warning' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {check.passed === true ? 'YA / MEMENUHI' : check.passed === 'warning' ? 'PERIKSA' : 'TIDAK MEMENUHI'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {check.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Attach Primary Source Confirmation (Especially for Secondary Sources) */}
          {radarItem.jenisSumber === 'sekunder' && (
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Hubungkan Konfirmasi Sumber Primer
                </h5>
              </div>
              <p className="text-xs text-slate-600">
                Karena topik ini berasal dari media sekunder, masukkan tautan atau rilis resmi instansi berwenang (misal: Polri, Kemenkes, Pengadilan, BPBD, atau rilis artis) untuk meningkatkan status menjadi <strong>Sumber Primer + Konteks</strong>.
              </p>

              {confirmSuccess && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{confirmSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveConfirmation} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Instansi / Lembaga Primer:
                    </label>
                    <input
                      type="text"
                      value={namaLembaga}
                      onChange={e => setNamaLembaga(e.target.value)}
                      placeholder="Contoh: Divisi Humas Polri / Mahkamah Agung"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nomor Dokumen / Siaran Pers (Opsional):
                    </label>
                    <input
                      type="text"
                      value={dokumenResmi}
                      onChange={e => setDokumenResmi(e.target.value)}
                      placeholder="Contoh: Siaran Pers No. SP/24/VIII/2026"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    URL Rilis / Konfirmasi Resmi Primer:
                  </label>
                  <input
                    type="url"
                    value={urlKonfirmasi}
                    onChange={e => setUrlKonfirmasi(e.target.value)}
                    placeholder="https://instansi-resmi.go.id/siaran-pers/..."
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Simpan Konfirmasi Primer</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <a
            href={radarItem.urlSumber}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium underline"
          >
            <span>Buka Tautan Rilis Sumber</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToDraft(radarItem);
              }}
              disabled={isProcessingDraft || (!verification.canDraft && radarItem.jenisSumber === 'sekunder' && !radarItem.konfirmasiPrimer?.ada)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-sm"
              title={
                !verification.canDraft && radarItem.jenisSumber === 'sekunder' && !radarItem.konfirmasiPrimer?.ada
                  ? 'Wajib melengkapi konfirmasi sumber primer sebelum menyusun draft.'
                  : 'Gunakan bahan ini untuk menyusun draft original'
              }
            >
              <span>📝 Susun Draft Original DenyutGlobal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
