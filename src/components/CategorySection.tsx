import React from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { Grid, ArrowRight } from 'lucide-react';

interface CategorySectionProps {
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  newsCountPerCategory: Record<string, number>;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  activeCategory,
  onSelectCategory,
  newsCountPerCategory
}) => {
  return (
    <section id="categories-overview-section" className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b-2 border-slate-900">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-rose-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif-headline">
            Kategori Berita
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          8 Rubrik Utama DenyutGlobal
        </span>
      </div>

      {/* 8 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const count = newsCountPerCategory[cat.id] || 0;

          return (
            <div
              key={cat.id}
              id={`category-card-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl sm:text-3xl p-2 bg-slate-100/80 rounded-lg group-hover:scale-110 transition-transform">
                    {cat.iconEmoji}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {count} artikel
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 group-hover:text-rose-600 text-base font-serif-headline mb-1">
                  {cat.label}
                </h3>
                
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-rose-600">
                <span>Lihat Rubrik</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
