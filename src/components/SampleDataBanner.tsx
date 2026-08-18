import React from 'react';
import { ShieldCheck, Radio, RefreshCw } from 'lucide-react';

interface SampleDataBannerProps {
  status: 'live' | 'demo' | 'loading';
  totalLive?: number;
  lastUpdated?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  publishedCount?: number;
}

export const SampleDataBanner: React.FC<SampleDataBannerProps> = ({
  status = 'demo',
  totalLive = 0,
  lastUpdated,
  onRefresh,
  isLoading = false,
  publishedCount = 0
}) => {
  return (
    <div id="editorial-integrity-banner" className="bg-slate-900 text-slate-100 text-xs px-4 py-2 border-b border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px] uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Konten Editorial Original
          </span>
          <span className="text-slate-200 font-medium">
            Artikel disusun oleh Tim Redaksi DenyutGlobal berbasis verifikasi fakta independen & rujukan transparan.
          </span>
          {publishedCount > 0 && (
            <span className="text-slate-400 text-xs hidden sm:inline">
              ({publishedCount} artikel terverifikasi)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded text-xs font-medium transition cursor-pointer"
              title="Periksa kawat berita referensi (BBC/DW/ANTARA)"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isLoading ? 'Sinkron...' : 'Kawat Referensi'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
