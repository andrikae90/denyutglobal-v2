import React, { useState } from 'react';
import { RadarNewsItem, RadarCategoryKey, RadarStatus } from '../types';
import { RADAR_CATEGORIES_CONFIG } from '../data/radarPrimarySources';
import { X, Plus, Radio, Building2 } from 'lucide-react';

interface AddPrimaryTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRadarItem: (item: RadarNewsItem) => void;
}

export const AddPrimaryTopicModal: React.FC<AddPrimaryTopicModalProps> = ({
  isOpen,
  onClose,
  onAddRadarItem
}) => {
  if (!isOpen) return null;

  const [kategoriRadar, setKategoriRadar] = useState<RadarCategoryKey>('kriminal_keamanan');
  const [judulTopik, setJudulTopik] = useState('');
  const [namaSumber, setNamaSumber] = useState('');
  const [lembagaKategori, setLembagaKategori] = useState('');
  const [jenisSumber, setJenisSumber] = useState<'primer' | 'sekunder'>('primer');
  const [lokasi, setLokasi] = useState('');
  const [urlSumber, setUrlSumber] = useState('');
  const [faktaUtamaText, setFaktaUtamaText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCategoryConfig = RADAR_CATEGORIES_CONFIG.find(c => c.key === kategoriRadar) || RADAR_CATEGORIES_CONFIG[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!judulTopik.trim()) {
      setFormError('Judul topik rilis wajib diisi.');
      return;
    }
    if (!namaSumber.trim()) {
      setFormError('Nama sumber / instansi resmi wajib diisi.');
      return;
    }
    if (!urlSumber.trim()) {
      setFormError('URL rilis / siaran pers resmi wajib diisi.');
      return;
    }
    if (!faktaUtamaText.trim()) {
      setFormError('Poin fakta utama wajib diisi minimal satu poin.');
      return;
    }

    const factsList = faktaUtamaText
      .split('\n')
      .map(f => f.trim().replace(/^[-*•0-9.]\s*/, ''))
      .filter(f => f.length > 0);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const status: RadarStatus = jenisSumber === 'primer' 
      ? 'sumber_primer_terkonfirmasi' 
      : 'perlu_verifikasi';

    const newItem: RadarNewsItem = {
      id: `radar-custom-${Date.now()}`,
      kategoriRadar,
      kategoriLabel: selectedCategoryConfig.name,
      judulTopik: judulTopik.trim(),
      namaSumber: namaSumber.trim(),
      jenisSumber,
      lembagaKategori: lembagaKategori.trim() || namaSumber.trim(),
      waktu: `${formattedDate} • ${formattedTime}`,
      lokasi: lokasi.trim() || 'Indonesia',
      faktaUtama: factsList,
      urlSumber: urlSumber.trim(),
      status,
      keteranganStatus: jenisSumber === 'primer'
        ? `Rilis resmi terdaftar: ${namaSumber.trim()}`
        : `Sumber sekunder terdaftar: ${namaSumber.trim()} (Perlu konfirmasi primer)`
    };

    onAddRadarItem(newItem);
    onClose();
  };

  return (
    <div 
      id="add-primary-topic-modal"
      className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-headline">
                Tambah Topik Rilis Radar Baru
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan rilis resmi instansi primer atau radar topik baru
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kategori Sumber Primer:
              </label>
              <select
                value={kategoriRadar}
                onChange={e => setKategoriRadar(e.target.value as RadarCategoryKey)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-rose-500"
              >
                {RADAR_CATEGORIES_CONFIG.map(cat => (
                  <option key={cat.key} value={cat.key}>
                    [{cat.code}] {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jenis Sumber:
              </label>
              <select
                value={jenisSumber}
                onChange={e => setJenisSumber(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-rose-500"
              >
                <option value="primer">🟢 Sumber Primer Resmi (Pemerintah/Aparat/Organisasi)</option>
                <option value="sekunder">🟡 Sumber Sekunder (Media untuk Radar Topik)</option>
              </select>
            </div>
          </div>

          {/* Guidelines hint */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">
              Panduan Kategori [{selectedCategoryConfig.code}] {selectedCategoryConfig.name}:
            </div>
            <p><strong>Prioritas Instansi:</strong> {selectedCategoryConfig.primaryAgencies.join(', ')}</p>
            <p><strong>Aturan Integritas:</strong> {selectedCategoryConfig.rules}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Judul Topik / Rilis Siaran Pers:
            </label>
            <input
              type="text"
              value={judulTopik}
              onChange={e => setJudulTopik(e.target.value)}
              placeholder="Contoh: Humas Polda Metro Jaya Ungkap Hasil Penertiban Siber..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Instansi / Sumber:
              </label>
              <input
                type="text"
                value={namaSumber}
                onChange={e => setNamaSumber(e.target.value)}
                placeholder="Contoh: Divisi Humas Polri"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lokasi / Yurisdiksi:
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={e => setLokasi(e.target.value)}
                placeholder="Contoh: Jakarta Pusat, DKI Jakarta"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              URL Sumber / Tautan Siaran Pers Resmi:
            </label>
            <input
              type="url"
              value={urlSumber}
              onChange={e => setUrlSumber(e.target.value)}
              placeholder="https://humas.polri.go.id/siaran-pers/..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Fakta Utama Terverifikasi (Satu baris per poin):
            </label>
            <textarea
              rows={4}
              value={faktaUtamaText}
              onChange={e => setFaktaUtamaText(e.target.value)}
              placeholder="- Poin fakta 1: Kejadian atau temuan faktual...&#10;- Poin fakta 2: Angka/data terukur dan keterangan resmi...&#10;- Poin fakta 3: Tindak lanjut yang diambil..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono text-[11px] leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan ke Radar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
