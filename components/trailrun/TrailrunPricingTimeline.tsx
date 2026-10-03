'use client';

import React from 'react';
import pricingConfig from '@/data/trailrun-pricing.json';
import { formatAmountToDisplay } from '@/lib/pricing';
import { Calendar, Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export default function TrailrunPricingTimeline() {
  const { tiers } = pricingConfig;
  const now = new Date().getTime();

  const getPriceDisplay = (cat: '3k' | '7k' | '12k', tier: 'early' | 'presale' | 'regular') => {
    const p = pricingConfig.categories[cat].prices[tier] as { amount: number; display?: string };
    return p.display || formatAmountToDisplay(p.amount);
  };

  const [realtimeData, setRealtimeData] = React.useState<Record<string, any> | null>(null);

  React.useEffect(() => {
    fetch('/api/trailrun/pricing')
      .then((res) => res.json())
      .then((data) => setRealtimeData(data))
      .catch(() => {});
  }, []);

  const isEarlySoldOutLive =
    Boolean((tiers.early as any).isSoldOut || (tiers.early as any).soldOut) ||
    (realtimeData
      ? Boolean(
          realtimeData['3k']?.isEarlyBirdSoldOut &&
          realtimeData['7k']?.isEarlyBirdSoldOut &&
          realtimeData['12k']?.isEarlyBirdSoldOut
        )
      : false);

  const isPresaleSoldOutLive =
    Boolean((tiers.presale as any).isSoldOut || (tiers.presale as any).soldOut) ||
    (realtimeData
      ? Boolean(
          realtimeData['3k']?.isPresaleSoldOut &&
          realtimeData['7k']?.isPresaleSoldOut &&
          realtimeData['12k']?.isPresaleSoldOut
        )
      : false);

  const isRegularSoldOutLive =
    Boolean((tiers.regular as any).isSoldOut || (tiers.regular as any).soldOut) ||
    (realtimeData
      ? Boolean(
          realtimeData['3k']?.isRegularSoldOut &&
          realtimeData['7k']?.isRegularSoldOut &&
          realtimeData['12k']?.isRegularSoldOut
        )
      : false);

  const isEarlyActive =
    now >= new Date(tiers.early.startDate).getTime() &&
    now <= new Date(tiers.early.endDate).getTime();

  const isPresaleActive =
    now >= new Date(tiers.presale.startDate).getTime() &&
    now <= new Date(tiers.presale.endDate).getTime();

  const isRegularActive =
    now >= new Date(tiers.regular.startDate).getTime() &&
    now <= new Date(tiers.regular.endDate).getTime();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal & Periode Registrasi</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
          Sesi Pendaftaran Peserta
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Pendaftaran dibuka dalam 3 tahapan resmi. Kuota Early Bird terbatas hanya 50 peserta per kategori race.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. EARLY BIRD CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isEarlyActive && !isEarlySoldOutLive
            ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10'
            : isEarlySoldOutLive
            ? 'border-slate-200 opacity-90'
            : 'border-slate-200 hover:border-rose-300'
        }`}>
          {/* 45-Degree Corner Ribbon Badge in Top-Right: SOLD if sold out, OPEN if active */}
          {isEarlySoldOutLive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                SOLD
              </div>
            </div>
          ) : isEarlyActive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-emerald-500 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                OPEN
              </div>
            </div>
          ) : null}

          {/* Header Banner - Red (matches poster) */}
          <div className="bg-[#c22d2d] py-3 px-4 text-center relative">
            <span className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-serif">
              Early Bird
            </span>
          </div>

          <div className="p-5 text-center space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block">
                Periode Registrasi
              </span>
              <strong className="text-base sm:text-lg font-bold text-slate-900 block">
                {tiers.early.dateDisplay || '04 Oktober - 10 Oktober 2026'}
              </strong>
            </div>

            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
              <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{tiers.early.description || '*Only 50 kuota / kategori race'}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              3K: <strong className="text-rose-600 font-bold">Rp {getPriceDisplay('3k', 'early')}</strong> • 7K: <strong className="text-rose-600 font-bold">Rp {getPriceDisplay('7k', 'early')}</strong> • 12K: <strong className="text-rose-600 font-bold">Rp {getPriceDisplay('12k', 'early')}</strong>
            </div>
          </div>
        </div>

        {/* 2. PRE-SALE CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isPresaleActive && !isPresaleSoldOutLive
            ? 'border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-md shadow-[#C9A227]/10'
            : isPresaleSoldOutLive
            ? 'border-slate-200 opacity-90'
            : 'border-slate-200 hover:border-[#C9A227]/50'
        }`}>
          {/* 45-Degree Corner Ribbon Badge in Top-Right: SOLD if sold out, OPEN if active */}
          {isPresaleSoldOutLive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                SOLD
              </div>
            </div>
          ) : isPresaleActive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-emerald-500 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                OPEN
              </div>
            </div>
          ) : null}

          {/* Header Banner - Amber / Gold (matches poster) */}
          <div className="bg-[#d98218] py-3 px-4 text-center relative">
            <span className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-serif">
              Pre-Sale
            </span>
          </div>

          <div className="p-5 text-center space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d98218] block">
                Periode Registrasi
              </span>
              <strong className="text-base sm:text-lg font-bold text-slate-900 block">
                {tiers.presale.dateDisplay || '11 Oktober - 21 Oktober 2026'}
              </strong>
            </div>

            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Harga Spesial Tahap 2</span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              3K: <strong className="text-amber-600 font-bold">Rp {getPriceDisplay('3k', 'presale')}</strong> • 7K: <strong className="text-amber-600 font-bold">Rp {getPriceDisplay('7k', 'presale')}</strong> • 12K: <strong className="text-amber-600 font-bold">Rp {getPriceDisplay('12k', 'presale')}</strong>
            </div>
          </div>
        </div>

        {/* 3. REGULAR CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isRegularActive && !isRegularSoldOutLive
            ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-md shadow-emerald-600/10'
            : isRegularSoldOutLive
            ? 'border-slate-200 opacity-90'
            : 'border-slate-200 hover:border-slate-400'
        }`}>
          {/* 45-Degree Corner Ribbon Badge in Top-Right: SOLD if sold out, OPEN if active */}
          {isRegularSoldOutLive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                SOLD
              </div>
            </div>
          ) : isRegularActive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-emerald-500 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                OPEN
              </div>
            </div>
          ) : null}

          {/* Header Banner - Dark Slate (matches poster) */}
          <div className="bg-[#1f372e] py-3 px-4 text-center relative">
            <span className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-serif">
              Regular
            </span>
          </div>

          <div className="p-5 text-center space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                Periode Registrasi
              </span>
              <strong className="text-base sm:text-lg font-bold text-slate-900 block">
                {tiers.regular.dateDisplay || '22 Oktober - 08 November 2026'}
              </strong>
            </div>

            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Penutupan Pendaftaran Resmi</span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              3K: <strong className="text-slate-800 font-bold">Rp {getPriceDisplay('3k', 'regular')}</strong> • 7K: <strong className="text-slate-800 font-bold">Rp {getPriceDisplay('7k', 'regular')}</strong> • 12K: <strong className="text-slate-800 font-bold">Rp {getPriceDisplay('12k', 'regular')}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
