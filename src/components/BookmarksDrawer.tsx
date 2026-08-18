import React from 'react';
import { NewsItem } from '../types';
import { X, Bookmark, Trash2, ArrowRight, Clock, MapPin } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  onRemoveBookmark: (article: NewsItem) => void;
  onClearAll: () => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  savedArticles,
  onSelectArticle,
  onRemoveBookmark,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="bookmarks-drawer-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Berita Tersimpan</h3>
              <p className="text-xs text-slate-500">{savedArticles.length} artikel disimpan untuk dibaca nanti</p>
            </div>
          </div>
          <button
            id="close-bookmarks-drawer-button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {savedArticles.length > 0 ? (
            savedArticles.map((article) => (
              <div
                key={article.id}
                id={`saved-item-${article.id}`}
                className="group p-3 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200/80 transition-all flex gap-3 cursor-pointer"
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
              >
                <img
                  src={article.gambar}
                  alt={article.judul}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded">
                        {article.kategoriLabel}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBookmark(article);
                        }}
                        className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Hapus dari daftar simpanan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 line-clamp-2 leading-snug font-serif-headline">
                      {article.judul}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{article.negaraLokasi}</span>
                    <span className="text-rose-600 font-medium flex items-center gap-0.5">
                      Baca <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-medium text-slate-600">Belum ada berita yang disimpan.</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Klik ikon penanda (bookmark) pada kartu berita untuk menyimpannya ke daftar bacaan kamu.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {savedArticles.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
            >
              Kosongkan Semua
            </button>
            <span className="text-xs text-slate-400">Tersimpan di browser</span>
          </div>
        )}
      </div>
    </div>
  );
};
