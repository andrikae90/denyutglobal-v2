import React, { useState } from 'react';
import { 
  parseCompleteManuscript, 
  ManuscriptParseResult, 
  SECTION_LABELS,
  SupportedSectionKey 
} from '../utils/manuscriptParser';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ArrowDownToLine, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';

export interface FormSnapshot {
  title: string;
  category: any;
  location: string;
  author: string;
  facts: string;
  summary: string;
  whyItMatters: string;
  content: string;
  sources: any[];
  customSlug?: string;
}

interface ManuscriptImportPanelProps {
  onApplyToForm: (parsed: NonNullable<ManuscriptParseResult['parsed']>) => void;
  onRestoreFormSnapshot: (snapshot: FormSnapshot) => void;
  getCurrentFormSnapshot: () => FormSnapshot;
}

export const ManuscriptImportPanel: React.FC<ManuscriptImportPanelProps> = ({
  onApplyToForm,
  onRestoreFormSnapshot,
  getCurrentFormSnapshot
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [rawText, setRawText] = useState('');
  const [parseResult, setParseResult] = useState<ManuscriptParseResult | null>(null);
  const [preImportSnapshot, setPreImportSnapshot] = useState<FormSnapshot | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isCopiedTemplate, setIsCopiedTemplate] = useState(false);

  const TEMPLATE_EXAMPLE = `RUBRIK KATEGORI:
Dunia

LOKASI PERISTIWA:
Jenewa, Swiss

JUDUL NASKAH:
WHO Rilis Protokol Kewaspadaan Global terhadap Lonjakan Flu Musiman Ekstrem

POIN-POIN FAKTA UTAMA TERVERIFIKASI:
- Organisasi Kesehatan Dunia (WHO) mengonfirmasi kenaikan 28% kasus flu musiman di 14 negara.
- Subtipe virus baru menunjukkan laju penularan lebih cepat pada kelompok rentan.
- Seluruh laboratorium rujukan diminta memperketat pengawasan genomik real-time.

RINGKASAN BERITA (LEAD SUMMARY):
Organisasi Kesehatan Dunia merilis panduan mitigasi terpadu menyusul lonjakan signifikan infeksi saluran pernapasan di belahan bumi utara. Lembaga kesehatan lintas negara diinstruksikan mempercepat distribusi vaksinasi pelindung.

KONTEKS SIGNIFIKANSI / MENGAPA INI PENTING (WHY IT MATTERS):
Perkembangan ini krusial bagi kesiapsiagaan sistem kesehatan publik untuk mencegah kelebihan beban fasilitas rawat inap serta menjaga stabilitas rantai pasok obat esensial.

ISI LENGKAP BERITA (STRUKTUR 6-BAGIAN ORIGINAL):
Langkah terkoordinasi segera diambil menyusul laporan komprehensif dari pusat surveilans penyakit menular regional yang mendeteksi anomali transmisi musiman.

Direktur Program Kedaruratan Kesehatan menegaskan bahwa intervensi dini merupakan kunci utama mencegah perluasan klaster di kawasan padat penduduk.

Kapasitas diagnostik di pintu masuk internasional mulai ditingkatkan secara proporsional sesuai standar protokol keamanan hayati internasional.

Para pakar epidemiologi mengingatkan pentingnya kepatuhan higienitas individu dan pemakaian masker di ruang tertutup dengan ventilasi terbatas.

Kementerian kesehatan di wilayah terdampak telah mengaktifkan posko siaga darurat serta cadangan logistik medis strategis.

Redaksi DenyutGlobal terus memantau pemutakhiran data transmisi genomik dari otoritas kesehatan global secara berkala.

SUMBER RUJUKAN TERDAFTAR & KETERLACAKAN DATA:
- World Health Organization Official Briefing (https://who.int/news/flu-protocol-2026) (21 Agustus 2026)
- Global Surveillance Network Report (https://gisaid.org/updates)`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(TEMPLATE_EXAMPLE.trim());
    setIsCopiedTemplate(true);
    setTimeout(() => setIsCopiedTemplate(false), 2000);
  };

  const handlePasteExample = () => {
    setRawText(TEMPLATE_EXAMPLE.trim());
  };

  const handleProcessSplit = () => {
    const result = parseCompleteManuscript(rawText);
    setParseResult(result);

    if (result.success) {
      // Save current state before overriding
      const currentSnapshot = getCurrentFormSnapshot();
      setPreImportSnapshot(currentSnapshot);

      // Apply parsed fields to parent form
      onApplyToForm(result.parsed);
      setHasApplied(true);
    }
  };

  const handleResetImport = () => {
    if (preImportSnapshot) {
      onRestoreFormSnapshot(preImportSnapshot);
    }
    setRawText('');
    setParseResult(null);
    setHasApplied(false);
    setPreImportSnapshot(null);
  };

  const requiredSectionsKeys: SupportedSectionKey[] = [
    'rubrik',
    'lokasi',
    'judul',
    'fakta',
    'ringkasan',
    'konteks',
    'isi',
    'sumber'
  ];

  return (
    <div 
      id="manuscript-auto-splitter-panel"
      className="bg-white border-2 border-slate-300 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4.5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white">
                Naskah Lengkap → Otomatis Terpecah ke Form Editor
              </h3>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-bold uppercase tracking-wider">
                Smart Splitter
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Paste naskah terstruktur satu kali. Sistem otomatis membaca label bagian dan mengisi field editor secara utuh.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyTemplate}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            title="Salin contoh format naskah lengkap ke clipboard"
          >
            {isCopiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopiedTemplate ? 'Tersalin' : 'Salin Format'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label={isOpen ? 'Tutup panel import' : 'Buka panel import'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {/* Main Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="manuscript-raw-input"
                className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Naskah Lengkap</span>
              </label>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePasteExample}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer"
                >
                  Muat Contoh Format
                </button>
                <span className="text-[11px] text-slate-400">
                  {rawText.length > 0 ? `${rawText.length.toLocaleString('id-ID')} karakter` : 'Dukungan naskah panjang tanpa pemotongan'}
                </span>
              </div>
            </div>

            <textarea
              id="manuscript-raw-input"
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (parseResult) setParseResult(null); // Clear previous result on edit
              }}
              rows={8}
              placeholder={`Paste seluruh naskah berita lengkap di sini...\n\nFormat label yang didukung:\nRUBRIK KATEGORI:\n...\n\nLOKASI PERISTIWA:\n...\n\nJUDUL NASKAH:\n...\n\nPOIN-POIN FAKTA UTAMA TERVERIFIKASI:\n...\n\nRINGKASAN BERITA (LEAD SUMMARY):\n...\n\nKONTEKS SIGNIFIKANSI / MENGAPA INI PENTING (WHY IT MATTERS):\n...\n\nISI LENGKAP BERITA (STRUKTUR 6-BAGIAN ORIGINAL):\n...\n\nSUMBER RUJUKAN TERDAFTAR & KETERLACAKAN DATA:\n...`}
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-hidden leading-relaxed placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-split-manuscript"
                onClick={handleProcessSplit}
                disabled={!rawText.trim()}
                className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Pisahkan ke Form Editor</span>
              </button>

              {hasApplied && (
                <button
                  type="button"
                  id="btn-reset-import"
                  onClick={handleResetImport}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Kembalikan form ke kondisi sebelum naskah dipisahkan"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Import</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Parser berbasis struktur teks deterministik — tidak mengubah atau merangkum isi naskah.</span>
            </div>
          </div>

          {/* Error Notice */}
          {parseResult && !parseResult.success && (
            <div 
              id="manuscript-parse-error"
              className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200"
            >
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-rose-950">
                  Gagal Memisahkan Naskah
                </div>
                <p className="leading-relaxed text-rose-800">
                  {parseResult.errorMessage}
                </p>
                <p className="text-[11px] text-rose-700 font-medium">
                  Pastikan naskah menyertakan setidaknya satu label bagian yang didukung (mis. <code>RUBRIK KATEGORI:</code>, <code>JUDUL NASKAH:</code>, <code>ISI LENGKAP BERITA:</code>). Teks Anda tetap aman dan tidak dihapus.
                </p>
              </div>
            </div>
          )}

          {/* Success Summary Report (HASIL PEMISAHAN) */}
          {parseResult && parseResult.success && (
            <div 
              id="manuscript-split-summary"
              className="bg-white border-2 border-emerald-400 rounded-xl p-4 shadow-2xs space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                    HASIL PEMISAHAN NASKAH
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    {parseResult.totalFound} / 8 Bagian Teridentifikasi
                  </span>
                </div>

                <div className="text-[11px] text-emerald-800 font-medium">
                  ✓ Field form editor di bawah telah terisi otomatis secara utuh.
                </div>
              </div>

              {/* Checklist grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {requiredSectionsKeys.map((secKey) => {
                  const isFound = parseResult.foundSections[secKey];
                  const label = SECTION_LABELS[secKey];
                  return (
                    <div 
                      key={secKey}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                        isFound 
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold' 
                          : 'bg-amber-50/80 border-amber-200 text-amber-900 font-normal'
                      }`}
                    >
                      {isFound ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="block text-[11px] truncate">{label}</span>
                        <span className={`text-[10px] font-bold ${isFound ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isFound ? 'Terisi' : 'Belum ditemukan'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Slug Report */}
              {parseResult.foundSections.slug && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Custom SLUG terdeteksi: <strong>{parseResult.parsed.slug}</strong></span>
                </div>
              )}

              {/* Missing sections warning */}
              {parseResult.missingSections.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-amber-950">Peringatan Bagian Belum Ditemukan:</span>{' '}
                    Bagian <strong>{parseResult.missingSections.join(', ')}</strong> tidak ditemukan dalam naskah. Field tersebut dibiarkan kosong tanpa mengarang isi. Anda dapat melengkapinya secara manual di form bawah.
                  </div>
                </div>
              )}

              {/* Next Step Instruction */}
              <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                <span>
                  Alur: Periksa isi form di bawah → <strong>Audit Fakta</strong> → <strong>Publikasikan ke D1</strong>.
                </span>
                <span className="text-slate-400 italic">
                  Belum tersimpan ke database hingga tombol Simpan / Publikasikan ditekan.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
