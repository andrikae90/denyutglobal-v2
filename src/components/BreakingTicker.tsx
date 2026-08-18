import React, { useState, useEffect } from 'react';
import { BREAKING_TICKERS } from '../data/newsData';
import { ChevronRight, Radio } from 'lucide-react';

interface BreakingTickerProps {
  onSelectBreakingText?: (text: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ onSelectBreakingText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_TICKERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div id="breaking-news-ticker" className="bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded shrink-0 shadow-sm">
          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-200" />
          <span>Terkini</span>
        </div>

        <div 
          className="flex-1 overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => onSelectBreakingText && onSelectBreakingText(BREAKING_TICKERS[currentIndex])}
        >
          <div className="truncate font-medium text-slate-200 hover:text-white transition-colors duration-200 flex items-center gap-2">
            <span className="text-rose-400 font-mono text-xs">[{currentIndex + 1}/{BREAKING_TICKERS.length}]</span>
            <span className="truncate">{BREAKING_TICKERS[currentIndex]}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button 
            id="ticker-prev-button"
            aria-label="Sebelumnya"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + BREAKING_TICKERS.length) % BREAKING_TICKERS.length)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button 
            id="ticker-next-button"
            aria-label="Berikutnya"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % BREAKING_TICKERS.length)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
