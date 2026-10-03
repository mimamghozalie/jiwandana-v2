'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Flame, Zap, ShieldCheck, Lock } from 'lucide-react';
import pricingConfig from '@/data/trailrun-pricing.json';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface TrailrunCountdownProps {
  onStatusChange?: (isOpen: boolean) => void;
}

export default function TrailrunCountdown({ onStatusChange }: TrailrunCountdownProps) {
  // Target opening time from pricing config (default: 04 Oktober 2026, 10:00:00 WIB)
  const targetDateStr = pricingConfig.tiers.early.startDate || '2026-10-04T10:00:00+07:00';
  const targetTime = new Date(targetDateStr).getTime();

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = (): TimeLeft => {
      const difference = targetTime - Date.now();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    };

    // Initial check
    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    // Stop timer if already open
    if (initial.total <= 0) {
      onStatusChange?.(true);
      return;
    }

    const timer = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current);

      if (current.total <= 0) {
        clearInterval(timer);
        onStatusChange?.(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onStatusChange]);

  const isOpen = mounted && timeLeft.total <= 0;

  // Jika pendaftaran sudah dibuka, sembunyikan section countdown sepenuhnya
  if (isOpen) {
    return null;
  }

  return (
    <section id="countdown" className="relative py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Outer Luxury Glassmorphic Card */}
      <div className="relative rounded-3xl overflow-hidden bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-6 sm:p-10 md:p-12 transition-all">
        
        {/* Ambient Glow & Accent Backlights */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#C9A227]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header Badge & Live Status */}
        <div className="relative z-10 text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/60 text-[#C9A227] text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-md">
              <Clock className="w-3.5 h-3.5 animate-pulse text-[#C9A227]" />
              <span>Registrasi Dibuka Pukul 10:00 WIB</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Early Bird Kuota 50 / Kategori</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-wide leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Hitung Mundur Pembukaan <span className="text-[#C9A227]">Pukul 10:00 WIB</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pendaftaran resmi Trailrun Lintas Candi 2026 akan dibuka tepat pada pukul{' '}
            <strong className="text-[#C9A227] font-bold">10:00 WIB</strong>. Persiapkan data diri Anda untuk mengamankan slot terbatas Early Bird!
          </p>
        </div>

        {/* Countdown Digits Board */}
        <div className="relative z-10 my-8 sm:my-10 max-w-3xl mx-auto">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {/* Hari */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 sm:p-5 text-center shadow-inner backdrop-blur-md group hover:border-[#C9A227]/40 transition-colors">
              <div className="text-2xl sm:text-4xl md:text-6xl font-black font-mono text-white tracking-tight drop-shadow-[0_2px_12px_rgba(201,162,39,0.5)]">
                {mounted ? String(timeLeft.days).padStart(2, '0') : '00'}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C9A227] mt-1 sm:mt-2">
                Hari
              </div>
            </div>

            {/* Jam */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 sm:p-5 text-center shadow-inner backdrop-blur-md group hover:border-[#C9A227]/40 transition-colors">
              <div className="text-2xl sm:text-4xl md:text-6xl font-black font-mono text-white tracking-tight drop-shadow-[0_2px_12px_rgba(201,162,39,0.5)]">
                {mounted ? String(timeLeft.hours).padStart(2, '0') : '00'}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C9A227] mt-1 sm:mt-2">
                Jam
              </div>
            </div>

            {/* Menit */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 sm:p-5 text-center shadow-inner backdrop-blur-md group hover:border-[#C9A227]/40 transition-colors">
              <div className="text-2xl sm:text-4xl md:text-6xl font-black font-mono text-white tracking-tight drop-shadow-[0_2px_12px_rgba(201,162,39,0.5)]">
                {mounted ? String(timeLeft.minutes).padStart(2, '0') : '00'}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C9A227] mt-1 sm:mt-2">
                Menit
              </div>
            </div>

            {/* Detik */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 sm:p-5 text-center shadow-inner backdrop-blur-md group hover:border-[#C9A227]/40 transition-colors">
              <div className="text-2xl sm:text-4xl md:text-6xl font-black font-mono text-amber-400 tracking-tight drop-shadow-[0_2px_12px_rgba(201,162,39,0.7)] animate-pulse">
                {mounted ? String(timeLeft.seconds).padStart(2, '0') : '00'}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 mt-1 sm:mt-2">
                Detik
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto pt-2 pb-6">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center shrink-0 text-[#C9A227]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">50 Slot Early Bird</div>
              <div className="text-[11px] text-slate-400">Kuota khusus per kategori jarak</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Batas Bayar 1 Jam</div>
              <div className="text-[11px] text-slate-400">Konfirmasi QRIS/VA otomatis</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Tiket Resmi Terjamin</div>
              <div className="text-[11px] text-slate-400">Termasuk BIB & Fasilitas Lengkap</div>
            </div>
          </div>
        </div>

        {/* Locked Status Notice Row */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center w-full pt-2 border-t border-white/10">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black/50 border border-[#C9A227]/40 text-amber-200 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-md">
            <Lock className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>Kategori lomba akan terbuka otomatis tepat saat countdown selesai (10:00 WIB)</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 py-2 px-3 rounded-lg bg-black/40 border border-white/5 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Pendaftaran aktif otomatis</span>
          </div>
        </div>

      </div>
    </section>
  );
}
