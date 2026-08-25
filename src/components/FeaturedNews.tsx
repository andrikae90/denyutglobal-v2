import React from 'react';
import { NewsItem } from '../types';
import { Star, Clock, MapPin, ArrowRight, Bookmark } from 'lucide-react';
import { getValidImageUrl } from '../utils/imageHelper';

interface FeaturedNewsProps {
  featuredItems: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: NewsItem) => void;
}

export const FeaturedNews: React.FC<FeaturedNewsProps> = ({
  featuredItems,
  onSelectArticle,
  isBookmarked,
  onToggleBookmark
}) => {
  if (!featuredItems || featuredItems.length === 0) return null;

  return (
    <section id="featured-news-section" className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b-2 border-slate-900">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif-headline">
            Berita Pilihan Redaksi
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Liputan Mendalam Terpenting
        </span>
      </div>

      {/* Grid of Featured Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredItems.map((item) => (
          <article
            key={item.id}
            id={`featured-card-${item.id}`}
            onClick={() => onSelectArticle(item)}
            className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Image Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={getValidImageUrl(item.gambar, item.image)}
                  alt={item.judul || item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                
                {/* Category & AI Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-xs">
                    {item.kategoriLabel}
                  </span>
                  {(item.imageType === 'ai_illustration' || item.imageCredit?.includes('Ilustrasi AI') || (item.gambar && item.gambar.startsWith('data:'))) && (
                    <span className="px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold rounded shadow-xs">
                      Ilustrasi AI
                    </span>
                  )}
                </div>

                {/* Bookmark button */}
                <button
                  id={`featured-bookmark-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(item);
                  }}
                  className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                    isBookmarked(item.id)
                      ? 'bg-rose-600 text-white'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                  title={isBookmarked(item.id) ? 'Hapus Simpanan' : 'Simpan Berita'}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Location */}
                <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{item.negaraLokasi}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item.tanggal}</span>
                  {item.waktu && (
                    <>
                      <span>•</span>
                      <span>{item.waktu}</span>
                    </>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors font-serif-headline leading-snug mb-2 line-clamp-2">
                  {item.judul}
                </h3>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {item.ringkasan}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {item.readTimeMinutes ? `${item.readTimeMinutes} mnt baca` : '3 mnt baca'}
              </span>
              <span className="text-rose-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Baca Lengkap <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
