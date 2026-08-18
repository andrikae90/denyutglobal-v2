import React, { useState, useMemo } from 'react';
import { NewsItem, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { NewsCard } from './NewsCard';
import { 
  LayoutGrid, 
  List, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  RefreshCcw,
  ArrowUpDown
} from 'lucide-react';

interface LatestNewsProps {
  articles: NewsItem[];
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectArticle: (article: NewsItem) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: NewsItem) => void;
  onShare: (article: NewsItem) => void;
}

export const LatestNews: React.FC<LatestNewsProps> = ({
  articles,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectArticle,
  isBookmarked,
  onToggleBookmark,
  onShare
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'terbaru' | 'relevan'>('terbaru');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Filter articles based on active category & search query
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      // Category filter
      const matchesCategory = activeCategory === 'semua' || item.kategori === activeCategory;
      
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.judul.toLowerCase().includes(q) ||
        item.ringkasan.toLowerCase().includes(q) ||
        item.negaraLokasi.toLowerCase().includes(q) ||
        item.namaSumber.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [articles, activeCategory, searchQuery]);

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <section id="latest-news-section" className="mb-14">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-3 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif-headline">
              Berita Terbaru
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Arus informasi terhangat dari berbagai penjuru dunia secara berkala.
          </p>
        </div>

        {/* View & Search Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* In-section Search */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="latest-news-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Saring berita..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Grid"
              aria-label="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Daftar"
              aria-label="Tampilan Daftar"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          id="filter-cat-semua"
          onClick={() => onSelectCategory('semua')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === 'semua'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Rubrik
        </button>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.iconEmoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Info */}
      {(activeCategory !== 'semua' || searchQuery) && (
        <div className="flex items-center justify-between bg-rose-50/80 border border-rose-200 rounded-xl px-4 py-2.5 mb-6 text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Menampilkan:</span>
            {activeCategory !== 'semua' && (
              <span className="px-2 py-0.5 bg-rose-100 rounded-md font-bold uppercase">
                Rubrik {activeCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 bg-white rounded-md border border-rose-200 font-medium">
                Pencarian: "{searchQuery}"
              </span>
            )}
            <span>({filteredArticles.length} berita ditemukan)</span>
          </div>

          <button
            onClick={() => {
              onSelectCategory('semua');
              onSearchChange('');
            }}
            className="font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Articles Grid / List */}
      {displayedArticles.length > 0 ? (
        <div 
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {displayedArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              viewMode={viewMode}
              onSelectArticle={onSelectArticle}
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              onShare={onShare}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Tidak ada berita yang sesuai
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            Coba gunakan kata kunci pencarian lain atau pilih rubrik kategori yang berbeda.
          </p>
          <button
            onClick={() => {
              onSelectCategory('semua');
              onSearchChange('');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tampilkan Semua Berita
          </button>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            id="load-more-articles-button"
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4 text-slate-500" />
            <span>Muat Lebih Banyak Berita</span>
            <span className="text-xs text-slate-500">
              ({filteredArticles.length - visibleCount} tersisa)
            </span>
          </button>
        </div>
      )}
    </section>
  );
};
