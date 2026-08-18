import React, { useState } from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { 
  Search, 
  Bookmark, 
  Menu, 
  X, 
  Globe, 
  Calendar,
  Sparkles,
  Mail
} from 'lucide-react';

interface NavbarProps {
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
  onOpenSubscription?: () => void;
  onOpenEditor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenBookmarks,
  bookmarkCount,
  onOpenSubscription,
  onOpenEditor
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Format today's date in Indonesian
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const handleCategoryClick = (catId: CategoryId) => {
    onSelectCategory(catId);
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top utility row */}
      <div className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <Globe className="w-3.5 h-3.5 text-rose-600" />
              <span>Edisi Global & Indonesia</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Portal Berita Kredibel & Ringkas
            </span>
            {onOpenSubscription && (
              <button
                id="header-subscription-button"
                onClick={onOpenSubscription}
                className="flex items-center gap-1.5 hover:text-rose-600 text-slate-700 transition-colors font-medium cursor-pointer"
                title="Langganan Daily Brief DenyutGlobal Gratis"
              >
                <Mail className="w-3.5 h-3.5 text-rose-600" />
                <span>Langganan</span>
              </button>
            )}
            <button
              id="header-bookmarks-button"
              onClick={onOpenBookmarks}
              className="flex items-center gap-1.5 hover:text-rose-600 transition-colors font-medium cursor-pointer"
              title="Artikel Tersimpan"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Tersimpan</span>
              {bookmarkCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main branding row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => handleCategoryClick('semua')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900 flex items-center justify-center text-white shadow-md relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <Globe className="w-5 h-5 text-rose-400" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-serif-headline">
                Denyut<span className="text-rose-600">Global</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-normal hidden sm:block">
              Menangkap Denyut Dunia, Setiap Hari.
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            id="open-search-button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-lg text-xs sm:text-sm font-medium transition duration-150 border border-slate-200/80 cursor-pointer"
            aria-label="Cari Berita"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Cari Berita...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-400 rounded border border-slate-200">
              /
            </kbd>
          </button>

          {/* Mobile hamburger button */}
          <button
            id="mobile-menu-toggle-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-hidden cursor-pointer"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Category Navigation */}
      <nav id="desktop-category-navigation" className="hidden md:block border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            <li>
              <button
                id="nav-cat-semua"
                onClick={() => handleCategoryClick('semua')}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === 'semua'
                    ? 'text-rose-600 bg-rose-50 border-b-2 border-rose-600 rounded-b-none'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Beranda
              </button>
            </li>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    id={`nav-cat-${cat.id}`}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-rose-600 bg-rose-50 border-b-2 border-rose-600 rounded-b-none'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs">{cat.iconEmoji}</span>
                    <span>{cat.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
            Kategori Berita
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="mobile-nav-cat-semua"
              onClick={() => handleCategoryClick('semua')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer ${
                activeCategory === 'semua'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span>🏠</span>
              <span>Beranda</span>
            </button>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`mobile-nav-cat-${cat.id}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 font-semibold'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.iconEmoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 px-2">
            {onOpenSubscription && (
              <button 
                id="mobile-nav-subscription-button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSubscription();
                }}
                className="hover:text-rose-600 font-medium flex items-center gap-1.5 cursor-pointer text-slate-700"
              >
                <Mail className="w-3.5 h-3.5 text-rose-600" />
                <span>Langganan</span>
              </button>
            )}
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBookmarks();
              }}
              className="text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{bookmarkCount} Berita Tersimpan</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
