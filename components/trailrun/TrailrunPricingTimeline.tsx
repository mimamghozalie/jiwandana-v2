'use client';

import React from 'react';
import pricingConfig from '@/data/trailrun-pricing.json';
import { Calendar, Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export default function TrailrunPricingTimeline() {
  const { tiers } = pricingConfig;
  const now = new Date().getTime();

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
          isEarlyActive
            ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10'
            : 'border-slate-200 hover:border-rose-300'
        }`}>
          {/* Header Banner - Red (matches poster) */}
          <div className="bg-[#c22d2d] py-3 px-4 text-center relative">
            <span className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-serif">
              Early Bird
            </span>
            {isEarlyActive && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-white text-rose-600 text-[10px] font-black uppercase tracking-wider animate-pulse">
                Aktif
              </span>
            )}
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
              3K: <strong className="text-rose-600 font-bold">Rp {pricingConfig.categories['3k'].prices.early.display}</strong> • 7K: <strong className="text-rose-600 font-bold">Rp {pricingConfig.categories['7k'].prices.early.display}</strong> • 12K: <strong className="text-rose-600 font-bold">Rp {pricingConfig.categories['12k'].prices.early.display}</strong>
            </div>
          </div>
        </div>

        {/* 2. PRE-SALE CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isPresaleActive
            ? 'border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-md shadow-[#C9A227]/10'
            : 'border-slate-200 hover:border-[#C9A227]/50'
        }`}>
          {/* Header Banner - Amber / Gold (matches poster) */}
          <div className="bg-[#d98218] py-3 px-4 text-center relative">
            <span className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-serif">
              Pre-Sale
            </span>
            {isPresaleActive && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-white text-[#d98218] text-[10px] font-black uppercase tracking-wider animate-pulse">
                Aktif
              </span>
            )}
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
              3K: <strong className="text-amber-600 font-bold">Rp {pricingConfig.categories['3k'].prices.presale.display}</strong> • 7K: <strong className="text-amber-600 font-bold">Rp {pricingConfig.categories['7k'].prices.presale.display}</strong> • 12K: <strong className="text-amber-600 font-bold">Rp {pricingConfig.categories['12k'].prices.presale.display}</strong>
            </div>
          </div>
        </div>

        {/* 3. REGULAR CARD */}
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm bg-white ${
          isRegularActive
            ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-md shadow-emerald-600/10'
            : 'border-slate-200 hover:border-slate-400'
        }`}>
          {/* Header Banner - Dark Slate (matches poster) */}
          <div className="bg-[#1f372e] py-3 px-4 text-center relative">
            <span className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-serif">
              Regular
            </span>
            {isRegularActive && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-white text-[#1f372e] text-[10px] font-black uppercase tracking-wider animate-pulse">
                Aktif
              </span>
            )}
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
              3K: <strong className="text-slate-800 font-bold">Rp {pricingConfig.categories['3k'].prices.regular.display}</strong> • 7K: <strong className="text-slate-800 font-bold">Rp {pricingConfig.categories['7k'].prices.regular.display}</strong> • 12K: <strong className="text-slate-800 font-bold">Rp {pricingConfig.categories['12k'].prices.regular.display}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
