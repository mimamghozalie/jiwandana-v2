'use client';

import React from 'react';
import pricingConfig from '@/data/trailrun-pricing.json';
import { formatAmountToDisplay } from '@/lib/pricing';
import { Calendar, Clock, Flame, ShieldAlert, Sparkles, Zap } from 'lucide-react';

export default function TrailrunPricingTimeline() {
  const [realtimeData, setRealtimeData] = React.useState<Record<string, any> | null>(null);

  React.useEffect(() => {
    fetch('/api/trailrun/pricing')
      .then((res) => res.json())
      .then((data) => setRealtimeData(data))
      .catch(() => {});
  }, []);

  const tiers = realtimeData?.tiersConfig || pricingConfig.tiers;
  const now = new Date().getTime();

  const getPriceDisplay = (cat: '3k' | '7k' | '12k', tier: 'early' | 'presale' | 'regular' | 'flashsale') => {
    if (tier === 'flashsale') {
      if (cat === '3k') return 'Tutup';
      if (cat === '7k') return '300k';
      if (cat === '12k') return '350k';
    }
    const catData = pricingConfig.categories[cat];
    const p = (catData.prices as any)[tier] as { amount: number; display?: string } | undefined;
    return p?.display || (p?.amount ? formatAmountToDisplay(p.amount) : '-');
  };

  const isEarlySoldOutLive =
    Boolean((tiers.early as any)?.isSoldOut || (tiers.early as any)?.soldOut) ||
    (realtimeData
      ? Boolean(
          realtimeData['3k']?.isEarlyBirdSoldOut &&
          realtimeData['7k']?.isEarlyBirdSoldOut &&
          realtimeData['12k']?.isEarlyBirdSoldOut
        )
      : false);

  const isPresaleSoldOutLive =
    Boolean((tiers.presale as any)?.isSoldOut || (tiers.presale as any)?.soldOut) ||
    (realtimeData
      ? Boolean(
          realtimeData['3k']?.isPresaleSoldOut &&
          realtimeData['7k']?.isPresaleSoldOut &&
          realtimeData['12k']?.isPresaleSoldOut
        )
      : false);

  const isRegularSoldOutLive =
    Boolean((tiers.regular as any)?.isSoldOut || (tiers.regular as any)?.soldOut) ||
    (realtimeData
      ? Boolean(
          realtimeData['3k']?.isRegularSoldOut &&
          realtimeData['7k']?.isRegularSoldOut &&
          realtimeData['12k']?.isRegularSoldOut
        )
      : false);

  // Flash Sale Status
  const flashStart = tiers.flashsale ? new Date(tiers.flashsale.startDate || tiers.flashsale.start_date).getTime() : 0;
  const flashEnd = tiers.flashsale ? new Date(tiers.flashsale.endDate || tiers.flashsale.end_date).getTime() : 0;
  const isFlashActive = Boolean(
    tiers.flashsale &&
    (tiers.flashsale.isActive ?? true) &&
    now >= flashStart &&
    now <= flashEnd
  );
  const flash7kLeft = realtimeData?.['7k']?.quotaRemaining ?? 10;
  const flash12kLeft = realtimeData?.['12k']?.quotaRemaining ?? 10;
  const isFlashSoldOut = now > flashEnd || (flash7kLeft <= 0 && flash12kLeft <= 0);

  const isEarlyActive =
    now >= new Date(tiers.early.startDate || tiers.early.start_date).getTime() &&
    now <= new Date(tiers.early.endDate || tiers.early.end_date).getTime();

  const isPresaleActive =
    now >= new Date(tiers.presale.startDate || tiers.presale.start_date).getTime() &&
    now <= new Date(tiers.presale.endDate || tiers.presale.end_date).getTime();

  const isRegularActive =
    !isFlashActive &&
    now >= new Date(tiers.regular.startDate || tiers.regular.start_date).getTime() &&
    now <= new Date(tiers.regular.endDate || tiers.regular.end_date).getTime();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal & Periode Registrasi</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white drop-shadow-sm">
          Sesi Pendaftaran Peserta
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto drop-shadow-sm">
          Pendaftaran resmi Trail Run Pawitra. Manfaatkan sesi Flash Sale khusus dengan kuota 10 slot per kategori!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. EARLY BIRD CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isEarlyActive && !isEarlySoldOutLive
            ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10'
            : isEarlySoldOutLive
            ? 'border-slate-200 opacity-80'
            : 'border-slate-200 hover:border-rose-300'
        }`}>
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

          <div className="bg-[#c22d2d] py-2.5 px-3 text-center relative">
            <span className="text-white text-sm sm:text-base font-bold tracking-wide uppercase font-serif">
              Early Bird
            </span>
          </div>

          <div className="p-4 text-center space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 block">
                Periode Registrasi
              </span>
              <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                {tiers.early.dateDisplay || '04 Okt - 10 Okt 2026'}
              </strong>
            </div>

            <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
              <Flame className="w-3 h-3 text-rose-500 shrink-0" />
              <span>*50 kuota / race</span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              7K: <strong className="text-rose-600 font-bold">Rp {getPriceDisplay('7k', 'early')}</strong> • 12K: <strong className="text-rose-600 font-bold">Rp {getPriceDisplay('12k', 'early')}</strong>
            </div>
          </div>
        </div>

        {/* 2. PRE-SALE CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isPresaleActive && !isPresaleSoldOutLive
            ? 'border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-md shadow-[#C9A227]/10'
            : isPresaleSoldOutLive
            ? 'border-slate-200 opacity-80'
            : 'border-slate-200 hover:border-[#C9A227]/50'
        }`}>
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

          <div className="bg-[#d98218] py-2.5 px-3 text-center relative">
            <span className="text-white text-sm sm:text-base font-bold tracking-wide uppercase font-serif">
              Pre-Sale
            </span>
          </div>

          <div className="p-4 text-center space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d98218] block">
                Periode Registrasi
              </span>
              <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                {tiers.presale.dateDisplay || '11 Okt - 21 Okt 2026'}
              </strong>
            </div>

            <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Harga Spesial Tahap 2</span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              7K: <strong className="text-amber-600 font-bold">Rp {getPriceDisplay('7k', 'presale')}</strong> • 12K: <strong className="text-amber-600 font-bold">Rp {getPriceDisplay('12k', 'presale')}</strong>
            </div>
          </div>
        </div>

        {/* 3. REGULAR CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isRegularActive && !isRegularSoldOutLive
            ? 'border-slate-800 ring-2 ring-slate-800/30 shadow-md'
            : isRegularSoldOutLive
            ? 'border-slate-200 opacity-80'
            : 'border-slate-200 hover:border-slate-400'
        }`}>
          {isRegularSoldOutLive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                SOLD
              </div>
            </div>
          ) : isFlashActive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-amber-600 text-white font-black text-[8px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                PAUSE
              </div>
            </div>
          ) : isRegularActive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-emerald-500 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                OPEN
              </div>
            </div>
          ) : null}

          <div className="bg-[#1f372e] py-2.5 px-3 text-center relative">
            <span className="text-white text-sm sm:text-base font-bold tracking-wide uppercase font-serif">
              Regular
            </span>
          </div>

          <div className="p-4 text-center space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block">
                Periode Registrasi
              </span>
              <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                {tiers.regular.dateDisplay || '22 Okt - 08 Nov 2026'}
              </strong>
            </div>

            <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
              <span>
                {isFlashActive ? 'Ditunda (Flash Sale Aktif)' : 'Harga Normal Penutupan'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              7K: <strong className="text-slate-800 font-bold">Rp {getPriceDisplay('7k', 'regular')}</strong> • 12K: <strong className="text-slate-800 font-bold">Rp {getPriceDisplay('12k', 'regular')}</strong>
            </div>
          </div>
        </div>

        {/* 4. FLASH SALE CARD (NEW) */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isFlashActive && !isFlashSoldOut
            ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/20'
            : isFlashSoldOut
            ? 'border-slate-200 opacity-90'
            : 'border-orange-300 hover:border-orange-500'
        }`}>
          {isFlashSoldOut ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-rose-600 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                SOLD
              </div>
            </div>
          ) : isFlashActive ? (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-orange-500 text-white font-black text-[10px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider animate-pulse">
                FLASH
              </div>
            </div>
          ) : (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
              <div className="absolute transform rotate-45 bg-amber-500 text-white font-black text-[9px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider">
                SOON
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-orange-600 to-amber-600 py-2.5 px-3 text-center relative">
            <span className="text-white text-sm sm:text-base font-black tracking-wide uppercase font-serif flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Flash Sale</span>
            </span>
          </div>

          <div className="p-4 text-center space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 block">
                {tiers.flashsale?.dateDisplay || '07 Nov (17:00 - 17:30 WIB)'}
              </span>
              <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                Terbatas {tiers.flashsale?.quotaPerCategory || 10} Slot / Kategori
              </strong>
            </div>

            <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-bold">
              <Flame className="w-3 h-3 text-orange-500 shrink-0" />
              <span>
                {isFlashActive ? 'Sedang Berlangsung!' : isFlashSoldOut ? 'Flash Sale Selesai' : 'Segera Dimulai'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-700">
              7K: <strong className="text-orange-600 font-bold">Rp {getPriceDisplay('7k', 'flashsale')}</strong> • 12K: <strong className="text-orange-600 font-bold">Rp {getPriceDisplay('12k', 'flashsale')}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
