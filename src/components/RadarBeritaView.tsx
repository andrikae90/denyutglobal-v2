import React, { useState, useMemo } from 'react';
import { RadarNewsItem, RadarCategoryKey, RadarStatus } from '../types';
import { RADAR_CATEGORIES_CONFIG } from '../data/radarPrimarySources';
import { getRadarStatusMeta } from '../utils/radarVerification';
import { 
  Radio, 
  Search, 
  Filter, 
  ExternalLink, 
  SearchCheck, 
  ArrowRight, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2,
  Building2,
  Clock,
  MapPin,
  List,
  Loader2,
  Check
} from 'lucide-react';

interface RadarBeritaViewProps {
  radarItems: RadarNewsItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenVerification: (item: RadarNewsItem) => void;
  onUseRadarAsDraft: (item: RadarNewsItem) => void;
  onOpenAddModal: () => void;
  processingDraftId: string | null;
}

export const RadarBeritaView: React.FC<RadarBeritaViewProps> = ({
  radarItems,
  isLoading,
  onRefresh,
  onOpenVerification,
  onUseRadarAsDraft,
  onOpenAddModal,
  processingDraftId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RadarCategoryKey | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<RadarStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return radarItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.kategoriRadar !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.judulTopik} ${item.namaSumber} ${item.lokasi} ${(item.faktaUtama || []).join(' ')} ${item.kategoriLabel}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [radarItems, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div id="radar-berita-container" className="space-y-5">
      {/* Editorial Principles & Radar Workflow Banner */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-serif-headline">
                Radar Berita Sumber Primer DenyutGlobal
              </h3>
              <p className="text-xs text-slate-400">
                Sistem pendeteksi topik dan ekstraksi fakta dari sumber resmi tangan pertama
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Rilis Primer Manual</span>
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Radar</span>
            </button>
          </div>
        </div>

        {/* Workflow Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-[10px] font-bold text-center">
          <div className="p-1.5 bg-slate-800/80 rounded-md text-rose-400 border border-slate-700">1. RADAR BERITA</div>
          <div className="p-1.5 bg-slate-800/80 rounded-md text-emerald-400 border border-slate-700">2. SUMBER PRIMER</div>
          <div className="p-1.5 bg-slate-800/80 rounded-md text-blue-400 border border-slate-700">3. VERIFIKASI 9 POIN</div>
          <div className="p-1.5 bg-slate-800/80 rounded-md text-amber-400 border border-slate-700">4. DRAFT ORIGINAL</div>
          <div className="p-1.5 bg-slate-800/80 rounded-md text-teal-400 border border-slate-700">5. AUDIT FAKTA</div>
          <div className="p-1.5 bg-slate-800/80 rounded-md text-purple-400 border border-slate-700">6. REVIEW EDITORIAL</div>
          <div className="p-1.5 bg-slate-800/80 rounded-md text-pink-400 border border-slate-700">7. ILUSTRASI AI</div>
          <div className="p-1.5 bg-slate-800/80 rounded-md text-emerald-300 border border-slate-700">8. PUBLISH</div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
          <strong>Kaidah Radar:</strong> Radar hanya menemukan topik dan fakta. Radar <strong>DILARANG</strong> menyalin, memparafrase otomatis, atau menyamarkan artikel media lain. Topik dari media sekunder wajib ditandai <span className="text-amber-400 font-bold">🟡 PERLU VERIFIKASI</span> dan di-cross-check ke sumber primer sebelum naskah DenyutGlobal dipublikasikan.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari topik radar, instansi resmi (Polri, BMKG, KPK, BI...), lokasi, atau kata kunci..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'sumber_primer_terkonfirmasi', label: '🟢 Primer Terkonfirmasi' },
              { id: 'sumber_primer_konteks', label: '🔵 Primer + Konteks' },
              { id: 'perlu_verifikasi', label: '🟡 Perlu Verifikasi' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* 11 Categories Filter Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Kategori ({radarItems.length})
            </button>

            {RADAR_CATEGORIES_CONFIG.map(cat => {
              const count = radarItems.filter(i => i.kategoriRadar === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="opacity-70">[{cat.code}]</span>
                  <span>{cat.name}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Radar Items Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Menampilkan <strong>{filteredItems.length}</strong> topik pantauan radar</span>
          <span>Diperbarui otomatis secara real-time</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
            <Radio className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Tidak ada topik radar yang cocok dengan filter</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba atur ulang kata kunci pencarian atau pilih kategori sumber lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => {
              const statusMeta = getRadarStatusMeta(item.status, item.isVerified, item.jenisSumber);
              const catConfig = RADAR_CATEGORIES_CONFIG.find(c => c.key === item.kategoriRadar);
              const isProcessing = processingDraftId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3.5 hover:border-slate-300 hover:shadow-xs transition"
                >
                  <div className="space-y-2.5">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${catConfig?.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                          {catConfig ? `[${catConfig.code}] ${catConfig.name}` : item.kategoriLabel}
                        </span>

                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          item.jenisSumber === 'primer'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {item.jenisSumber === 'primer' ? 'Sumber Primer' : 'Sumber Sekunder'}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${statusMeta.badgeBg}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Title / Topic */}
                    <h4 className="text-sm font-bold text-slate-900 font-serif-headline leading-snug">
                      {item.judulTopik}
                    </h4>

                    {/* Metadata summary */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{item.namaSumber}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.waktu}</span>
                      </span>
                      {item.lokasi && item.lokasi !== 'Tidak disebutkan dalam sumber' && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{item.lokasi}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Main Facts Bullet Points */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Poin Fakta Teridentifikasi:
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {item.faktaUtama.slice(0, 3).map((fakta, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-rose-500 font-bold">•</span>
                            <span className="line-clamp-2">{fakta}</span>
                          </li>
                        ))}
                      </ul>
                      {item.faktaUtama.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium block pt-0.5">
                          + {item.faktaUtama.length - 3} poin fakta lainnya
                        </span>
                      )}
                    </div>

                    {/* Warning Notice for Secondary Sources */}
                    {item.jenisSumber === 'sekunder' && !item.konfirmasiPrimer?.ada && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-snug">
                          <strong>SUMBER SEKUNDER:</strong> Topik terdeteksi dari media sekunder. Wajib melakukan verifikasi dan konfirmasi sumber primer sebelum naskah DenyutGlobal dipublikasikan.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <a
                      href={item.urlSumber}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium underline"
                    >
                      <span>Cek Dokumen Rilis</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenVerification(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title="Jalankan audit 9 poin verifikasi fakta"
                      >
                        <SearchCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>🔎 Verifikasi</span>
                      </button>

                      <button
                        onClick={() => onUseRadarAsDraft(item)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Menyusun Naskah Original...</span>
                          </>
                        ) : (
                          <>
                            <span>📝 Gunakan sebagai Bahan Draft</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
