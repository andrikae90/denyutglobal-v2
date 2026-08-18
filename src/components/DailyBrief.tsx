import React from 'react';
import { NewsItem } from '../types';
import { Sparkles, ArrowRight, Clock, MapPin, Mail } from 'lucide-react';

interface DailyBriefProps {
  briefItems: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  onOpenSubscription?: () => void;
}

export const DailyBrief: React.FC<DailyBriefProps> = ({
  briefItems,
  onSelectArticle,
  onOpenSubscription
}) => {
  if (!briefItems || briefItems.length === 0) return null;

  return (
    <section id="daily-brief-section" className="mb-12 bg-gradient-to-br from-slate-900 via-slate-855 to-slate-900 text-white rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-rose-600/90 text-white text-xs font-bold uppercase tracking-wider rounded">
              Ringkasan Hari Ini
            </span>
            <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Edisi Khusus Pagi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-serif-headline tracking-tight text-white">
            5 Berita Dunia yang Perlu Kamu Tahu Hari Ini
          </h2>
        </div>
        <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm text-left sm:text-right">
            Pilihan esensial rangkuman peristiwa penting global dalam 3 menit waktu baca.
          </p>
          {onOpenSubscription && (
            <button
              id="daily-brief-subscription-btn"
              onClick={onOpenSubscription}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-rose-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-end"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Langganan Daily Brief</span>
            </button>
          )}
        </div>
      </div>

      {/* 5 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {briefItems.slice(0, 5).map((item, index) => {
          const numberStr = `0${index + 1}`;
          return (
            <article
              key={item.id}
              id={`daily-brief-item-${item.id}`}
              onClick={() => onSelectArticle(item)}
              className="group bg-slate-800/70 hover:bg-slate-850 p-4 rounded-xl border border-slate-700/60 hover:border-rose-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Number & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-2xl font-black text-rose-500 font-mono">
                    {numberStr}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-700/80 text-[11px] font-semibold text-slate-200 rounded">
                    {item.kategoriLabel}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span className="truncate">{item.negaraLokasi}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors font-serif-headline leading-snug mb-2 line-clamp-3">
                  {item.judul.replace(/^5 Berita Dunia Hari Ini #\d+:\s*/, '')}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {item.ringkasan}
                </p>
              </div>

              {/* Bottom Meta */}
              <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.waktu}
                </span>
                <span className="text-rose-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Baca <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
