import Link from 'next/link';
import React from 'react';

interface TrailrunHeroProps {
  isOpen?: boolean;
}

export default function TrailrunHero({ isOpen = false }: TrailrunHeroProps) {
  return (
    <section className="relative w-full h-[100dvh] min-h-[640px] flex items-center justify-center pt-20">
      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-6">
        {/* Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 text-xs">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-[#C9A227]/80 text-xs font-bold uppercase tracking-widest text-[#C9A227] shadow-lg backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kawasan Purbakala lereng penanggunangan • Mojokerto</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/85 border border-rose-400/80 text-[11px] font-bold text-rose-200 shadow-lg backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Early Bird: 04 – 10 Okt 2026</span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          Trailrun Lintas Candi
        </h1>

        {/* Subtitle / Description */}
        <p className="text-sm sm:text-base md:text-lg text-slate-100 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
          Menyusuri keindahan situs purbakala kerajaan Majapahit, menaklukkan elevasi alam bebas, dan
          menguji batas ketangguhan diri dalam semangat sportivitas nusantara.
        </p>

        {/* CTA Button */}
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <a
            href={isOpen ? '#kategori' : '#countdown'}
            className="px-8 py-4 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all transform active:scale-95 shadow-[0_4px_24px_rgba(201,162,39,0.6)] flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">
              {isOpen ? 'directions_run' : 'timer'}
            </span>
            <span>{isOpen ? 'Pilih Kategori Lomba' : 'Hitung Mundur Pembukaan'}</span>
          </a>
        </div>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link href="/trailrun/peserta"
            className="px-8 py-4 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all transform active:scale-95 shadow-[0_4px_24px_rgba(201,162,39,0.6)] flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">
              person
            </span>
            <span>Cek data diri</span>
          </Link>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href={isOpen ? '#kategori' : '#countdown'}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-200 hover:text-[#C9A227] transition-colors cursor-pointer group select-none"
      >
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 group-hover:opacity-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {isOpen ? 'Jelajahi Kategori' : 'Hitung Mundur Pembukaan'}
        </span>
        <span className="material-symbols-outlined text-xl animate-bounce drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          keyboard_double_arrow_down
        </span>
      </a>
    </section>
  );
}
