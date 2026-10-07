'use client';

import React from 'react';
import Link from 'next/link';
import { TrailrunCard } from '@/lib/types';
import { type ActivePricingResult, getCategoryPricesFromConfig, getActivePricingTier } from '@/lib/pricing';

interface TrailrunCardItemProps {
  item: TrailrunCard;
  isFlipped: boolean;
  onToggleFlip: () => void;
  onSelectCategory: () => void;
  pricingInfo?: ActivePricingResult | null;
}

export default function TrailrunCardItem({
  item,
  isFlipped,
  onToggleFlip,
  onSelectCategory,
  pricingInfo: propPricingInfo,
}: TrailrunCardItemProps) {
  // Fallback to computed active tier so badges and session states are never missing
  const pricingInfo = propPricingInfo || getActivePricingTier(item.id, 0);
  const configPrices = getCategoryPricesFromConfig(item.id);
  const earlyDisplay = pricingInfo?.prices?.early?.display || configPrices.early;
  const presaleDisplay = pricingInfo?.prices?.presale?.display || configPrices.presale;
  const regularDisplay = pricingInfo?.prices?.regular?.display || configPrices.regular;

  // Visual marketing offset for Early Bird quota display (7K minus 14, 12K minus 16)
  const catKey = (item.id || '').toLowerCase();
  const earlyVisualOffset = catKey === '7k' ? 14 : catKey === '12k' ? 16 : 0;
  const baseEarlyQuota = 50;
  const realEarlyRemaining = typeof pricingInfo?.quotaRemaining === 'number'
    ? pricingInfo.quotaRemaining
    : baseEarlyQuota;
  const displayEarlyRemaining = Math.max(0, realEarlyRemaining - earlyVisualOffset);
  const isEarlySoldOut = Boolean(
    pricingInfo?.isEarlyBirdSoldOut ||
    (pricingInfo?.tiersConfig?.early as any)?.isSoldOut ||
    (pricingInfo?.tiersConfig?.early as any)?.soldOut ||
    (item as any)?.prices?.early?.isSoldOut ||
    (item as any)?.prices?.early?.soldOut
  );

  const isPresaleSoldOut = Boolean(
    pricingInfo?.isPresaleSoldOut ||
    (pricingInfo?.tiersConfig?.presale as any)?.isSoldOut ||
    (pricingInfo?.tiersConfig?.presale as any)?.soldOut ||
    (item as any)?.prices?.presale?.isSoldOut ||
    (item as any)?.prices?.presale?.soldOut
  );

  const isRegularSoldOut = Boolean(
    pricingInfo?.isRegularSoldOut ||
    (pricingInfo?.tiersConfig?.regular as any)?.isSoldOut ||
    (pricingInfo?.tiersConfig?.regular as any)?.soldOut ||
    (item as any)?.prices?.regular?.isSoldOut ||
    (item as any)?.prices?.regular?.soldOut
  );

  const isCategorySoldOut = Boolean(
    pricingInfo?.isCategorySoldOut ||
    pricingInfo?.isSoldOut ||
    (item as any)?.isSoldOut ||
    (item as any)?.soldOut ||
    (item as any)?.status === 'sold_out'
  );

  const isCurrentActiveSoldOut =
    isCategorySoldOut ||
    (pricingInfo?.tierId === 'early' && isEarlySoldOut) ||
    (pricingInfo?.tierId === 'presale' && isPresaleSoldOut) ||
    (pricingInfo?.tierId === 'regular' && isRegularSoldOut);

  return (
    <div className="perspective-1000 w-full min-h-[560px]">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
          }`}
      >
        {/* =========================================================================
            FRONT SIDE OF CARD
        ========================================================================= */}
        <div
          className={`backface-hidden w-full h-full bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#C9A227]/50 group font-sans relative overflow-hidden ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
        >
          {/* 45-Degree Corner Ribbon Badge in Top-Right of Card: "SOLD" if sold out, "OPEN" if active */}
          {(pricingInfo?.tierId === 'early' || pricingInfo?.tierId === 'presale' || pricingInfo?.tierId === 'regular' || isCurrentActiveSoldOut) && (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-30">
              <div
                className={`absolute transform rotate-45 text-white font-black text-[9px] py-1 right-[-34px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider ${isCurrentActiveSoldOut
                  ? 'bg-rose-600 shadow-rose-950/40'
                  : 'bg-emerald-500 shadow-emerald-950/40'
                  }`}
              >
                {isCurrentActiveSoldOut ? 'SOLD' : 'OPEN'}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* 1. FOTO Banner with Badges and Rotate Chip */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-black/10 bg-slate-100">
              <img
                src={item.bannerImage}
                alt={item.categoryName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[11px] font-bold text-[#C9A227] border border-[#C9A227]/40 shadow-sm">
                {item.distance}
              </div>
              <div className="absolute top-3 right-8 sm:right-9 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-semibold text-slate-700 shadow-sm">
                {item.badge}
              </div>

              {/* Rotate Button Chip on Image */}
              {/* <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFlip();
                }}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-950/85 hover:bg-[#ff1a5f] text-white backdrop-blur-md rounded-full text-[11px] font-semibold border border-white/20 hover:border-[#ff1a5f] transition-all shadow-md flex items-center gap-1.5 group/rot z-10 active:scale-95 cursor-pointer"
                title="Putar untuk Profil Elevasi"
              >
                <span className="material-symbols-outlined text-sm group-hover/rot:rotate-180 transition-transform duration-500 text-[#ff1a5f] group-hover/rot:text-white">
                  sync
                </span>
                <span>Profil Elevasi</span>
              </button> */}
            </div>

            {/* 2. Middle Box: Title & Details */}
            <div className="space-y-2 bg-[#f8f8f8] p-4 rounded-xl border border-black/5">
              <h3 className="text-lg font-bold font-sans text-slate-900 group-hover:text-[#C9A227] transition-colors leading-snug">
                {item.categoryName}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-2 border-t border-black/5">
                <div>
                  <span className="block text-slate-400 font-medium">Elevasi</span>
                  <strong className="text-slate-800">{item.elevationGain}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">COT</span>
                  <strong className="text-slate-800">{item.cutOffTime}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Pos Minum</span>
                  <strong className="text-slate-800">{item.waterStations}</strong>
                </div>
              </div>
            </div>

            {/* 3. Price Box (Early, Presale, Regular) with Session Dates & Realtime Quota */}
            <div className="border border-black/10 rounded-xl p-3.5 bg-white space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-black/5 pb-1">
                <span>Harga Sesi</span>
                <span className="text-[10px] text-[#C9A227] font-semibold">
                  {pricingInfo?.tierName ? `Sesi Aktif: ${pricingInfo.tierName}` : '3 Tahapan'}
                </span>
              </div>
              <div className="grid grid-cols-3 text-center divide-x divide-black/10 pt-1">
                {/* Early Bird */}
                <div
                  className={`relative overflow-hidden px-1 space-y-0.5 rounded-lg transition-colors ${isEarlySoldOut
                    ? 'bg-slate-50/60 py-1'
                    : pricingInfo?.tierId === 'early'
                      ? 'bg-rose-50/80 py-1 ring-1 ring-rose-400/80'
                      : ''
                    }`}
                >
                  {isEarlySoldOut ? (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none z-10">
                      <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[6.5px] py-[1.5px] right-[-12px] top-[4px] w-[40px] text-center shadow-xs uppercase tracking-tight">
                        SOLD
                      </div>
                    </div>
                  ) : pricingInfo?.tierId === 'early' ? (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none z-10">
                      <div className="absolute transform rotate-45 bg-emerald-500 text-white font-black text-[6.5px] py-[1.5px] right-[-12px] top-[4px] w-[40px] text-center shadow-xs uppercase tracking-tight">
                        OPEN
                      </div>
                    </div>
                  ) : null}
                  <span className="text-[10px] text-rose-600 uppercase block font-bold">
                    Early Bird
                  </span>
                  <span className="text-[9px] text-slate-400 block font-medium">04–10 Okt</span>
                  <span
                    className={`text-sm font-bold block ${isEarlySoldOut ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                  >
                    {earlyDisplay}
                  </span>
                  <span className="text-[8px] font-semibold block">
                    {isEarlySoldOut || displayEarlyRemaining === 0 ? (
                      <span className="text-rose-600 bg-rose-100 px-1 py-0.5 rounded font-bold">Sold Out</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Sisa {displayEarlyRemaining} Kuota</span>
                    )}
                  </span>
                </div>

                {/* Pre-Sale */}
                <div
                  className={`relative overflow-hidden px-1 space-y-0.5 rounded-lg transition-colors ${isPresaleSoldOut
                    ? 'bg-slate-50/60 py-1'
                    : pricingInfo?.tierId === 'presale'
                      ? 'bg-amber-50/80 py-1 ring-1 ring-[#C9A227]/80'
                      : ''
                    }`}
                >
                  {isPresaleSoldOut ? (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none z-10">
                      <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[6.5px] py-[1.5px] right-[-12px] top-[4px] w-[40px] text-center shadow-xs uppercase tracking-tight">
                        SOLD
                      </div>
                    </div>
                  ) : pricingInfo?.tierId === 'presale' ? (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none z-10">
                      <div className="absolute transform rotate-45 bg-emerald-500 text-white font-black text-[6.5px] py-[1.5px] right-[-12px] top-[4px] w-[40px] text-center shadow-xs uppercase tracking-tight">
                        OPEN
                      </div>
                    </div>
                  ) : null}
                  <span className="text-[10px] text-[#C9A227] uppercase block font-bold">
                    Pre-Sale
                  </span>
                  <span className="text-[9px] text-amber-600/80 block font-medium">11–21 Okt</span>
                  <span
                    className={`text-sm font-bold block ${isPresaleSoldOut ? 'line-through text-slate-400' : 'text-[#C9A227]'
                      }`}
                  >
                    {presaleDisplay}
                  </span>
                  <span className="text-[8px] text-slate-400 block">
                    {isPresaleSoldOut ? (
                      <span className="text-rose-600 bg-rose-100 px-1 py-0.5 rounded font-bold">Sold Out</span>
                    ) : pricingInfo?.tierId === 'presale' ? (
                      <span className="text-amber-700 font-bold">Sedang Aktif</span>
                    ) : (
                      'Sesi 2'
                    )}
                  </span>
                </div>

                {/* Regular */}
                <div
                  className={`relative overflow-hidden px-1 space-y-0.5 rounded-lg transition-colors ${isRegularSoldOut
                    ? 'bg-slate-50/60 py-1'
                    : pricingInfo?.tierId === 'regular'
                      ? 'bg-slate-100/90 py-1 ring-1 ring-slate-400/80'
                      : ''
                    }`}
                >
                  {isRegularSoldOut ? (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none z-10">
                      <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[6.5px] py-[1.5px] right-[-12px] top-[4px] w-[40px] text-center shadow-xs uppercase tracking-tight">
                        SOLD
                      </div>
                    </div>
                  ) : pricingInfo?.tierId === 'regular' ? (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none z-10">
                      <div className="absolute transform rotate-45 bg-emerald-500 text-white font-black text-[6.5px] py-[1.5px] right-[-12px] top-[4px] w-[40px] text-center shadow-xs uppercase tracking-tight">
                        OPEN
                      </div>
                    </div>
                  ) : null}
                  <span className="text-[10px] text-slate-600 uppercase block font-bold">
                    Regular
                  </span>
                  <span className="text-[9px] text-slate-400 block font-medium">22 Okt–08 Nov</span>
                  <span
                    className={`text-sm font-bold block ${isRegularSoldOut ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}
                  >
                    {regularDisplay}
                  </span>
                  <span className="text-[8px] text-slate-400 block">
                    {isRegularSoldOut ? (
                      <span className="text-rose-600 bg-rose-100 px-1 py-0.5 rounded font-bold">Sold Out</span>
                    ) : pricingInfo?.tierId === 'regular' ? (
                      <span className="text-slate-800 font-bold">Sedang Aktif</span>
                    ) : (
                      'Penutupan'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Action Row: "Fasilitas" + "Daftar" */}
          <div className="pt-5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onSelectCategory}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-black/10 font-semibold py-3.5 px-3 rounded-xl transition-all transform active:scale-95 shadow-sm flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              <span>Fasilitas</span>
            </button>
            {isCurrentActiveSoldOut ? (
              <span className="flex-1 bg-slate-100 border border-slate-200 text-slate-400 font-bold py-3.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-center cursor-not-allowed">
                <span>Sold Out</span>
                <span className="material-symbols-outlined text-sm">block</span>
              </span>
            ) : (
              <Link
                href={`/trailrun/daftar?dist=${item.id}`}
                className="flex-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-bold py-3.5 px-3 rounded-xl transition-all transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-center cursor-pointer"
              >
                <span>Daftar</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>

        {/* =========================================================================
            BACK SIDE OF CARD: ELEVATION PROFILE (Matching User's Screenshot)
        ========================================================================= */}
        <div
          className={`backface-hidden rotate-y-180 absolute inset-0 w-full h-full bg-[#121316] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-2xl font-sans text-white ${isFlipped ? 'pointer-events-auto z-10' : 'pointer-events-none'
            }`}
        >
          {/* Top: PROFIL ELEVASI & Code + Close (X) button */}
          {/* <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e929b] block">
                PROFIL ELEVASI
              </span>
              <h4 className="text-3xl font-black text-[#ff1a5f] tracking-tight block mt-0.5">
                {item.categoryCode}
              </h4>
            </div>
            <button
              type="button"
              onClick={onToggleFlip}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup Profil Elevasi"
              title="Putar Kembali"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div> */}

          {/* Middle: Elevation Curve Box matching screenshot */}
          <div className="w-full h-52 sm:h-56 rounded-2xl bg-[#0a0a0c] border border-white/5 relative overflow-hidden flex items-end p-2.5 my-3">
            <svg
              viewBox="0 0 320 220"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`pinkGrad-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff1a5f" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#ff1a5f" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ff1a5f" stopOpacity="0" />
                </linearGradient>
                <filter id={`pinkGlow-${item.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path d={item.elevationSvgFill} fill={`url(#pinkGrad-${item.id})`} />
              <path
                d={item.elevationSvgPath}
                fill="none"
                stroke="#ff1a5f"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#pinkGlow-${item.id})`}
              />
              <circle
                cx={item.summitPoint.x}
                cy={item.summitPoint.y}
                r="4"
                fill="#ffffff"
                stroke="#ff1a5f"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* Bottom: 2x2 Grid of dark tiles matching screenshot */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#16171b] border border-white/5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8e929b] block">
                JARAK
              </span>
              <strong className="text-base sm:text-lg font-bold text-white block mt-0.5">
                {item.backStats.distance}
              </strong>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#16171b] border border-white/5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8e929b] block">
                ELEVASI
              </span>
              <strong className="text-base sm:text-lg font-bold text-white block mt-0.5">
                {item.backStats.elevation}
              </strong>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#16171b] border border-white/5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8e929b] block">
                BATAS WAKTU
              </span>
              <strong className="text-base sm:text-lg font-bold text-white block mt-0.5">
                {item.backStats.cutOff}
              </strong>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#16171b] border border-white/5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8e929b] block">
                WAKTU START
              </span>
              <strong className="text-base sm:text-lg font-bold text-white block mt-0.5">
                {item.backStats.startTime}
              </strong>
            </div>
          </div>

          {/* Flip back button */}
          <div className="pt-3">
            <button
              type="button"
              onClick={onToggleFlip}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>Putar Kembali</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
