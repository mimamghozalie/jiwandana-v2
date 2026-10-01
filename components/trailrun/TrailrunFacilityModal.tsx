'use client';

import React from 'react';
import Link from 'next/link';
import { TrailrunCard } from '@/lib/types';

interface TrailrunFacilityModalProps {
  category: TrailrunCard | null;
  onClose: () => void;
}

export default function TrailrunFacilityModal({
  category,
  onClose,
}: TrailrunFacilityModalProps) {
  if (!category) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1622] border border-white/15 rounded-3xl max-w-md w-full shadow-2xl relative transform scale-100 transition-transform duration-300 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle background overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{ backgroundImage: "url('/assets/jiwandana_trailrun_1.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1622]/85 via-[#0e1622]/95 to-[#090f18] pointer-events-none" />

        {/* Header bar */}
        <div className="relative z-10 px-6 py-5 flex justify-between items-center border-b border-white/10">
          <h3 className="text-base sm:text-lg font-bold tracking-widest text-white uppercase font-sans">
            FASILITAS TERMASUK
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close popup"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content: 2-column grid of facilities matching visual layout */}
        <div className="relative z-10 p-6 sm:p-8 space-y-7">
          <div className="grid grid-cols-2 gap-y-7 gap-x-4 sm:gap-x-8">
            {/* Row 1: Left - MEDALI FINISHER, Right - BIB + CHIP */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d97706] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                <div>MEDALI</div>
                <div>FINISHER</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d97706] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                <div>BIB + CHIP</div>
              </div>
            </div>

            {/* Row 2: Left - ASURANSI JIWA, Right - TAS RACEPACK */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d97706] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                <div>ASURANSI</div>
                <div>JIWA</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d97706] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                <div>TAS</div>
                <div>RACEPACK</div>
              </div>
            </div>

            {/* Row 3: Left - WATER STATION, Right - TIM MEDIS */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d97706] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                <div>WATER</div>
                <div>STATION</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d97706] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                <div>TIM MEDIS</div>
              </div>
            </div>

            {/* Row 4: Left - MAKANAN PASCA LOMBA */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d97706] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                <div>MAKANAN</div>
                <div>PASCA</div>
                <div>LOMBA</div>
              </div>
            </div>
          </div>

          {/* Action / Registration Button */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <Link
              href={`/trailrun/daftar?dist=${category.id}`}
              className="w-full bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-bold py-3.5 rounded-xl text-center shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">assignment</span>
              <span>Daftar {category.categoryName}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
