import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '../types';
import { Search, X, Clock, MapPin, ArrowRight } from 'lucide-react';
import { getValidImageUrl } from '../utils/imageHelper';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.key === '/' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) && !isOpen) {
        e.preventDefault();
        // Trigger via parent
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = searchTerm.trim() === ''
    ? []
    : articles.filter(item => {
        const q = searchTerm.toLowerCase();
        return (
          item.judul.toLowerCase().includes(q) ||
          item.ringkasan.toLowerCase().includes(q) ||
          item.negaraLokasi.toLowerCase().includes(q) ||
          item.kategoriLabel.toLowerCase().includes(q) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
        );
      });

  return (
    <div 
      id="search-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berita dunia, ekonomi, teknologi, iklim..."
            className="flex-1 text-slate-900 placeholder-slate-400 text-sm sm:text-base outline-hidden bg-transparent"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestion Body */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {searchTerm.trim() === '' ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs sm:text-sm">Ketik kata kunci untuk mencari seluruh arsip berita DenyutGlobal.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs text-slate-400">Pencarian Populer:</span>
                {['KTT Iklim', 'Kecerdasan Buatan', 'ASEAN', 'Semikonduktor', 'Bencana'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-md text-xs text-slate-600 font-medium transition cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectArticle(item);
                  onClose();
                }}
                className="py-3 px-2 hover:bg-slate-50 rounded-xl transition cursor-pointer flex gap-3 group"
              >
                <img
                  src={getValidImageUrl(item.gambar, item.image, item)}
                  alt={item.judul || item.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 font-semibold rounded">
                      {item.kategoriLabel}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {item.negaraLokasi}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 font-serif-headline line-clamp-1 mb-1">
                    {item.judul}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.ringkasan}
                  </p>
                </div>
                <div className="flex items-center text-slate-400 group-hover:text-rose-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">Tidak ada berita yang cocok dengan "{searchTerm}".</p>
              <p className="text-xs text-slate-400 mt-1">Coba periksa ejaan atau gunakan istilah umum lain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
