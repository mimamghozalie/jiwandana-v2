'use client';

import React from 'react';

interface SponsorItem {
  name: string;
  src: string;
  alt: string;
}

const sponsors: SponsorItem[] = [
  {
    name: 'UTMB Index',
    src: '/assets/trailrun/utmb.jpeg',
    alt: 'UTMB Index',
  },
  {
    name: 'UTMB 20K M',
    src: '/assets/trailrun/20km.png',
    alt: 'UTMB 20K M',
  },
  {
    name: 'ALTI Kab. Mojokerto',
    src: '/assets/trailrun/alti.jpeg',
    alt: 'Asosiasi Lari Trail Indonesia Pengcab Kab. Mojokerto',
  },
  {
    name: 'Perhutani',
    src: '/assets/trailrun/perhutani.jpeg',
    alt: 'Perum Perhutani',
  },
  {
    name: 'Gunung Bekel - Jolotundo',
    src: '/assets/trailrun/gunung_bekel.jpeg',
    alt: 'Jalur Jolotundo Gunung Penanggungan Gunung Bekel',
  },
  {
    name: 'Pancasona',
    src: '/assets/trailrun/pancasona.png',
    alt: 'Pancasona Stevedoring & Port Services',
  },
  {
    name: 'Arjuno Adventure',
    src: '/assets/trailrun/arjuno_adventure.PNG',
    alt: 'Arjuno Adventure',
  },
  {
    name: 'Jiwandana Event Organizer',
    src: '/assets/trailrun/jiwandana.jpeg',
    alt: 'Jiwandana Event Organizer',
  },
];

export default function TrailrunSponsors() {
  return (
    <section id="sponsor" className="py-16 md:py-24 max-w-7xl mx-auto px-6 space-y-10 animate-[fadeIn_0.6s_ease-out]">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-[#C9A227]/80 text-xs font-bold uppercase tracking-widest text-[#C9A227] backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sponsor & Partner</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
          Official Partners & Sponsors
        </h2>
      </div>

      {/* Grid Logo Sponsor */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        {sponsors.map((item, index) => (
          <div
            key={index}
            className="bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl p-4 sm:p-6 flex items-center justify-center shadow-sm hover:shadow-xl hover:border-[#C9A227]/50 transition-all duration-300 group min-h-[120px] sm:min-h-[140px]"
          >
            <img
              src={item.src}
              alt={item.alt}
              className="max-h-16 sm:max-h-20 max-w-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
