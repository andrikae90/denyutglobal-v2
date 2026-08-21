import React from 'react';
import { NewsItem } from '../types';
import { Clock, MapPin, ExternalLink, Bookmark, ChevronRight, Compass } from 'lucide-react';
import { getValidImageUrl } from '../utils/imageHelper';

interface IndonesiaSectionProps {
  indonesiaItems: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: NewsItem) => void;
  onViewAllIndonesia: () => void;
}

export const IndonesiaSection: React.FC<IndonesiaSectionProps> = ({
  indonesiaItems,
  onSelectArticle,
  isBookmarked,
  onToggleBookmark,
  onViewAllIndonesia
}) => {
  if (!indonesiaItems || indonesiaItems.length === 0) return null;

  return (
    <section id="indonesia-news-section" className="mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b-2 border-rose-600">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" role="img" aria-label="Bendera Indonesia">🇮🇩</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif-headline">
              Berita Indonesia Hari Ini
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kabar terkini seputar peristiwa nasional, kebijakan publik, dan ekonomi domestik
            </p>
          </div>
        </div>

        <button
          onClick={onViewAllIndonesia}
          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer self-start sm:self-auto"
        >
          <span>Lihat Rubrik Indonesia</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indonesiaItems.slice(0, 6).map((item) => {
          const isSaved = isBookmarked(item.id);
          return (
            <article
              key={item.id}
              id={`indonesia-card-${item.id}`}
              onClick={() => onSelectArticle(item)}
              className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={getValidImageUrl(item.gambar, item.image)}
                    alt={item.judul || item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {/* Category & AI Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-xs">
                      {item.kategoriLabel}
                    </span>
                    {(item.imageType === 'ai_illustration' || item.imageCredit?.includes('Ilustrasi AI') || (item.gambar && item.gambar.startsWith('data:'))) && (
                      <span className="px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold rounded shadow-xs">
                        Ilustrasi AI
                      </span>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    id={`indonesia-bookmark-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(item);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-rose-600 text-white'
                        : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                    title={isSaved ? 'Hapus Simpanan' : 'Simpan Berita'}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Location badge */}
                  <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1 drop-shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{item.negaraLokasi || 'Indonesia'}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.tanggal} • {item.waktu}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      Sumber: {item.namaSumber}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors font-serif-headline leading-snug mb-2 line-clamp-2">
                    {item.judul}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                    {item.ringkasan}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <a
                  href={item.urlSumber}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-rose-600 font-semibold transition"
                >
                  <span>Baca berita asli →</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => onSelectArticle(item)}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <span>Baca Ringkasan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
