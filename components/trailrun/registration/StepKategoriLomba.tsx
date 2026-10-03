'use client';

import React from 'react';
import { TrailrunCard } from '@/lib/types';
import { getCategoryStartingPrice } from '@/lib/pricing';

interface StepKategoriLombaProps {
  categories: TrailrunCard[];
  selectedKategori: string;
  onSelect: (kategoriId: string) => void;
  pricingInfoMap?: Record<string, any>;
}

export default function StepKategoriLomba({
  categories,
  selectedKategori,
  onSelect,
  pricingInfoMap,
}: StepKategoriLombaProps) {
  return (
    <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-3 pb-4 border-b border-black/5">
        <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <span className="material-symbols-outlined text-lg">directions_run</span>
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Kategori Lomba</h2>
          <p className="text-[11px] text-slate-500">Pilih jarak lomba yang ingin Anda ikuti</p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isSelected = selectedKategori === cat.id;
          const info = pricingInfoMap?.[cat.id.toLowerCase()] || pricingInfoMap?.[cat.id];
          const isSoldOut = Boolean(info?.isSoldOut || (cat as any).isSoldOut);
          const startingPrice = getCategoryStartingPrice(cat.id, info);

          return (
            <button
              key={cat.id}
              type="button"
              disabled={isSoldOut}
              onClick={() => !isSoldOut && onSelect(cat.id)}
              className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group ${
                isSoldOut
                  ? 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed'
                  : isSelected
                  ? 'border-[#C9A227] bg-[#C9A227]/5 shadow-md cursor-pointer'
                  : 'border-black/10 bg-white hover:border-[#C9A227]/40 hover:bg-[#f8f8f8] cursor-pointer'
              }`}
            >
              {isSoldOut && (
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none z-10">
                  <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[8px] py-1 right-[-28px] top-[14px] w-[100px] text-center shadow-sm uppercase tracking-wider">
                    SOLD
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSoldOut
                      ? 'border-slate-200 bg-slate-100'
                      : isSelected
                      ? 'border-[#C9A227] bg-[#C9A227]'
                      : 'border-slate-300 group-hover:border-[#C9A227]/50'
                  }`}
                >
                  {isSelected && <span className="material-symbols-outlined text-white text-sm">check</span>}
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-black/10 shrink-0 bg-slate-100">
                  <img src={cat.bannerImage} alt={cat.categoryName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm sm:text-base font-bold transition-colors ${isSelected ? 'text-[#C9A227]' : 'text-slate-900'}`}>
                      {cat.categoryName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 border border-black/5">
                      {cat.badge}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-[#C9A227]">route</span>
                      {cat.distance}
                    </span>
                    {/* <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-[#C9A227]">landscape</span>
                      {cat.elevationGain}
                    </span> */}
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-[#C9A227]">timer</span>
                      {cat.cutOffTime}
                    </span>
                    <span className="sm:hidden font-bold text-[#C9A227] ml-auto">
                      {startingPrice}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Mulai</span>
                  <span className={`text-base font-bold ${isSelected ? 'text-[#C9A227]' : 'text-slate-900'}`}>
                    {startingPrice}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
