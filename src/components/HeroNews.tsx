import React from 'react';
import { NewsItem } from '../types';
import { Clock, MapPin, ExternalLink, ArrowRight, Bookmark, Share2, Radio } from 'lucide-react';

interface HeroNewsProps {
  heroItem: NewsItem;
  secondaryItems: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: NewsItem) => void;
  onShare: (article: NewsItem) => void;
}

export const HeroNews: React.FC<HeroNewsProps> = ({
  heroItem,
  secondaryItems,
  onSelectArticle,
  isBookmarked,
  onToggleBookmark,
  onShare
}) => {
  if (!heroItem) return null;

  const isLive = heroItem.isLiveFeed || heroItem.sourceFeedType === 'bbc' || heroItem.sourceFeedType === 'dw';

  return (
    <section id="hero-news-section" className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b-2 border-slate-900">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif-headline">
            Berita Utama
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              Live RSS: {heroItem.namaSumber}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
            Sorotan Global Terkini
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Hero Card (Large Feature) */}
        <div 
          id={`hero-article-${heroItem.id}`}
          className="lg:col-span-8 group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
        >
          {/* Hero Image Container */}
          <div 
            className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900 cursor-pointer"
            onClick={() => onSelectArticle(heroItem)}
          >
            <img
              src={heroItem.gambar}
              alt={heroItem.judul}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
            />
            {/* Gradient Overlay for text protection */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                {heroItem.kategoriLabel || heroItem.categoryLabel}
              </span>
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-md flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                {heroItem.negaraLokasi || heroItem.location}
              </span>
              {(heroItem.imageType === 'ai_illustration' || heroItem.imageCredit?.includes('Ilustrasi AI') || (heroItem.gambar && heroItem.gambar.startsWith('data:'))) && (
                <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold rounded-md border border-white/20 shadow-sm">
                  Ilustrasi AI
                </span>
              )}
            </div>

            {/* Bookmark & Share quick buttons on image */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                id={`hero-bookmark-${heroItem.id}`}
                onClick={() => onToggleBookmark(heroItem)}
                className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                  isBookmarked(heroItem.id)
                    ? 'bg-rose-600 text-white'
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                title={isBookmarked(heroItem.id) ? 'Hapus dari Tersimpan' : 'Simpan Berita'}
                aria-label="Simpan Berita"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
              <button
                id={`hero-share-${heroItem.id}`}
                onClick={() => onShare(heroItem)}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Bagikan Berita"
                aria-label="Bagikan Berita"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Time & Source Overlay for mobile */}
            <div className="absolute bottom-4 left-4 right-4 text-slate-300 text-xs flex items-center justify-between sm:hidden">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {heroItem.waktu}
              </span>
              <span className="font-semibold text-white">Sumber: {heroItem.namaSumber}</span>
            </div>
          </div>

          {/* Hero Content Body */}
          <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between">
            <div>
              {/* Meta row for desktop */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {heroItem.tanggal} • {heroItem.waktu}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  Sumber: {heroItem.namaSumber}
                </span>
                {heroItem.readTimeMinutes && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500">{heroItem.readTimeMinutes} menit baca</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3 
                onClick={() => onSelectArticle(heroItem)}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 hover:text-rose-600 transition-colors duration-200 cursor-pointer font-serif-headline leading-tight mb-3"
              >
                {heroItem.judul}
              </h3>

              {/* Summary */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
                {heroItem.ringkasan}
              </p>
            </div>

            {/* CTA row */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  id="hero-read-more-button"
                  onClick={() => onSelectArticle(heroItem)}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors duration-200 cursor-pointer"
                >
                  <span>Baca Ringkasan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  id="hero-original-source-link"
                  href={heroItem.urlSumber}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold rounded-xl border border-rose-200 transition-colors duration-200"
                >
                  <span>Baca berita asli</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="text-xs text-slate-400">
                <span>Sumber Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Hot Stories Column (Desktop Sidebar / Companion) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Dinamika Penting
                </span>
                <span className="text-[11px] text-slate-400">Laporan Aktual</span>
              </div>

              <div className="space-y-5">
                {secondaryItems.slice(0, 2).map((item) => (
                  <article
                    key={item.id}
                    id={`secondary-hero-${item.id}`}
                    onClick={() => onSelectArticle(item)}
                    className="group/item cursor-pointer pb-4 border-b border-slate-800/80 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-slate-800 text-rose-400 rounded font-semibold">
                          {item.kategoriLabel}
                        </span>
                        <span>•</span>
                        <span>{item.negaraLokasi}</span>
                      </div>
                      <span className="text-slate-300 font-medium">Sumber: {item.namaSumber}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-100 group-hover/item:text-rose-400 transition-colors font-serif-headline leading-snug mb-2">
                      {item.judul}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.ringkasan}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{item.waktu}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={item.urlSumber}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-rose-300 hover:text-rose-200 underline flex items-center gap-0.5"
                        >
                          Asli <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-rose-400 font-semibold group-hover/item:underline flex items-center gap-1">
                          Baca <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Menyajikan pembaruan terverifikasi dari BBC News & DW.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
