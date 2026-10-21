'use client';

import React from 'react';
import Link from 'next/link';
import RegistrationModeTabs from '@/components/trailrun/registration/RegistrationModeTabs';
import TrailrunBulkRegister from '@/components/trailrun/TrailrunBulkRegister';

export default function KelompokClient() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-800 antialiased selection:bg-[#C9A227] selection:text-[#0d1c32] pt-20">
      {/* ===== HERO BANNER ===== */}
      <section className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/jiwandana_trailrun_1.jpeg"
            alt="Trailrun Lintas Candi Majapahit"
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f8f8] via-black/30 to-black/70" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A227]/60 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#C9A227] backdrop-blur-md shadow-lg mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pendaftaran Komunitas / Rombongan</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
            Pendaftaran Kolektif (Excel)
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-xl mx-auto mt-3 leading-relaxed drop-shadow">
            Daftarkan 5 hingga 20 pelari dalam satu transaksi kolektif dengan tarif Pre-Sale terkunci &amp; promo spesial.
          </p>
        </div>
      </section>

      {/* ===== FORM SECTION ===== */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 pb-20">
        {/* REGISTRATION TYPE TABS (Individu vs Kolektif) */}
        <RegistrationModeTabs />

        {/* Trailrun Bulk Register Component */}
        <TrailrunBulkRegister />

        {/* Bottom Back to Trailrun Overview Link */}
        <div className="mt-8 text-center">
          <Link
            href="/trailrun"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#C9A227] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Halaman Informasi Lomba</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
