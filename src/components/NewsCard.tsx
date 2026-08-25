import React from 'react';
import { NewsItem } from '../types';
import { Clock, MapPin, Bookmark, Share2, ArrowRight } from 'lucide-react';
import { getValidImageUrl } from '../utils/imageHelper';

interface NewsCardProps {
  article: NewsItem;
  viewMode?: 'grid' | 'list';
  onSelectArticle: (article: NewsItem) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: NewsItem) => void;
  onShare: (article: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  viewMode = 'grid',
  onSelectArticle,
  isBookmarked,
  onToggleBookmark,
  onShare
}) => {
  const isSaved = isBookmarked(article.id);

  if (viewMode === 'list') {
    return (
      <article
        id={`news-card-list-${article.id}`}
        onClick={() => onSelectArticle(article)}
        className="group bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all duration-200 p-4 flex flex-col sm:flex-row gap-4 cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative sm:w-56 sm:h-36 h-48 w-full shrink-0 rounded-lg overflow-hidden bg-slate-100">
          <img
            src={getValidImageUrl(article.gambar, article.image)}
            alt={article.judul || article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider rounded">
              {article.kategoriLabel || article.categoryLabel}
            </span>
            {(article.imageType === 'ai_illustration' || article.imageCredit?.includes('Ilustrasi AI') || (article.gambar && article.gambar.startsWith('data:'))) && (
              <span className="px-1.5 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-bold rounded shadow-xs">
                Ilustrasi AI
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  {article.negaraLokasi}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {article.tanggal} ({article.waktu})
                </span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors font-serif-headline leading-snug mb-1.5">
              {article.judul}
            </h3>

            <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-2">
              {article.ringkasan}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px]">
              {article.readTimeMinutes ? `${article.readTimeMinutes} menit baca` : '3 menit baca'}
            </span>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                id={`btn-bookmark-list-${article.id}`}
                onClick={() => onToggleBookmark(article)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Hapus Simpanan' : 'Simpan Berita'}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                id={`btn-share-list-${article.id}`}
                onClick={() => onShare(article)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Bagikan"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid view (Standard card)
  return (
    <article
      id={`news-card-${article.id}`}
      onClick={() => onSelectArticle(article)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      <div>
        {/* Thumbnail */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={getValidImageUrl(article.gambar, article.image)}
            alt={article.judul || article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />

          {/* Category & AI Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider rounded shadow-xs">
              {article.kategoriLabel || article.categoryLabel}
            </span>
            {(article.imageType === 'ai_illustration' || article.imageCredit?.includes('Ilustrasi AI') || (article.gambar && article.gambar.startsWith('data:'))) && (
              <span className="px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-bold rounded shadow-xs">
                Ilustrasi AI
              </span>
            )}
          </div>

          {/* Quick bookmark */}
          <button
            id={`btn-bookmark-grid-${article.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
              isSaved
                ? 'bg-rose-600 text-white'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isSaved ? 'Hapus Simpanan' : 'Simpan Berita'}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Location */}
          <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>{article.negaraLokasi}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{article.tanggal}</span>
            {article.waktu && (
              <>
                <span>•</span>
                <span>{article.waktu}</span>
              </>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors font-serif-headline leading-snug mb-2 line-clamp-2">
            {article.judul}
          </h3>

          <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
            {article.ringkasan}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">
          {article.readTimeMinutes ? `${article.readTimeMinutes} menit baca` : '3 menit baca'}
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            id={`btn-share-grid-${article.id}`}
            onClick={() => onShare(article)}
            className="p-1 text-slate-400 hover:text-slate-700 transition"
            title="Bagikan Berita"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-rose-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Baca <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
