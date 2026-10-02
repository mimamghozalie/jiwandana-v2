'use client';

import React from 'react';

export default function TrailrunHero() {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden flex items-center justify-center pt-20">
      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 z-0 bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/jiwandana_trailrun_1.jpeg"
          className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-1000"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-trail-runner-in-the-mountains-5120/1080p.mp4"
            type="video/mp4"
          />
        </video>
        {/* Subtle gradient overlay to make foreground text pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f8f8] via-black/40 to-black/70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white space-y-5">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A227]/60 text-xs font-semibold uppercase tracking-widest text-[#C9A227] backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kawasan Purbakala Trowulan • Mojokerto</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/70 border border-rose-500/60 text-[11px] font-bold text-rose-300 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Early Bird: 04 – 10 Okt 2026</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
          Trailrun Lintas Candi
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
          Menyusuri keindahan situs purbakala kerajaan Majapahit, menaklukkan elevasi alam bebas, dan
          menguji batas ketangguhan diri dalam semangat sportivitas nusantara.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <a
            href="#kategori"
            className="px-6 py-3.5 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all transform active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">directions_run</span>
            <span>Pilih Kategori</span>
          </a>
          <a
            href="#rute"
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all backdrop-blur-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">alt_route</span>
            <span>Navigasi Lintasan & Elevasi</span>
          </a>
        </div>
      </div>
    </section>
  );
}
