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
        className="bg-[#0e1622] border border-white/15 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl relative transform scale-100 transition-transform duration-300 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle background overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{ backgroundImage: "url('/assets/banner_trailrun.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1622]/90 via-[#0e1622]/95 to-[#090f18] pointer-events-none" />

        {/* Header bar */}
        <div className="relative z-10 px-6 py-5 flex justify-between items-center border-b border-white/10 shrink-0">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#C9A227] uppercase block">
              {category.categoryName} • {category.distance}
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-wider text-white uppercase font-sans mt-0.5">
              Fasilitas Termasuk
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close popup"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content: Dynamic grid of facilities from trailrun.json */}
        <div className="relative z-10 p-5 sm:p-7 overflow-y-auto flex-1">
          {category.facilities && category.facilities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {category.facilities.map((facility, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#C9A227]/40 hover:bg-white/[0.07] transition-all"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#d97706] to-[#92400e] border border-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md">
                    <svg
                      className="w-4 h-4 text-white stroke-[3.5]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-100 uppercase leading-snug">
                    {facility}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada data fasilitas untuk kategori ini.
            </div>
          )}
        </div>

        {/* Action / Registration Button */}
        <div className="relative z-10 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0e1622]/90">
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
  );
}
