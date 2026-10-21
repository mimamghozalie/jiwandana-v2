'use client';

import React from 'react';

export interface SponsorItem {
  name: string;
  src: string;
  alt: string;
}

// ==============================================================================
// VARIABEL PENGATURAN LOGO SESUAI LAYOUT
// Anda dapat dengan mudah memindahkan, menambah, atau mengganti logo di sini.
// ==============================================================================

// 1. TOP TIER (2 Box Lebar di Bagian Atas)
export const topTierSponsors: SponsorItem[] = [
  {
    name: 'ITRA',
    src: '/assets/trailrun/jiwandana_itra.png',
    alt: 'International Trail Running Association (ITRA)',
  },
  {
    name: 'UTMB Index',
    src: '/assets/trailrun/jiwandana_utmb.png',
    alt: 'UTMB Index Race Qualifier',
  },
];

// 2. COLLABORATION (4 Box Berjajar Horizontal)
export const collaborationSponsors: SponsorItem[] = [
  {
    name: 'Perhutani',
    src: '/assets/trailrun/jiwandana_perhutani.png',
    alt: 'Perum Perhutani',
  },
  {
    name: 'ALTI Kab. Mojokerto',
    src: '/assets/trailrun/jiwandana_alti.png',
    alt: 'Asosiasi Lari Trail Indonesia Pengcab Kab. Mojokerto',
  },
  {
    name: 'Media Partner 1',
    src: '/assets/trailrun/jiwandana.png',
    alt: 'Official Media Partner',
  },
  {
    name: 'Gunung Bekel - Jolotundo',
    src: '/assets/trailrun/jiwandana_bekel.png',
    alt: 'Jalur Jolotundo Gunung Penanggungan Gunung Bekel',
  },
];

// 3. SPONSORSHIP (2 Box Besar di Tengah)
export const sponsorshipItems: SponsorItem[] = [
  {
    name: 'Pancasona',
    src: '/assets/trailrun/pancasona.png',
    alt: 'Pancasona Stevedoring & Port Services',
  },
  {
    name: 'DNY',
    src: '/assets/trailrun/jiwandana_dny.png',
    alt: 'DNYr',
  },
];

// 4. SUPPORT (3 Box: 2 di atas, 1 di bawah tengah)
export const supportSponsors: SponsorItem[] = [
  {
    name: 'Arjuno Adventure',
    src: '/assets/trailrun/arjuno_adventure.PNG',
    alt: 'Arjuno Adventure',
  },
  {
    name: 'Soemo hill',
    src: '/assets/trailrun/jiwandana_soemo_hill.png',
    alt: 'Soemo hill',
  },
  {
    name: 'JASMINE PS',
    src: '/assets/trailrun/jiwandana_jasmine.jpeg',
    alt: 'JASMINE PS',
  },
];

// 5. MEDIA PARTNER (2 Box Tersusun Vertikal di Kolom Kanan)
export const mediaPartnerSponsors: SponsorItem[] = [
  {
    name: 'Kedungudi',
    src: '/assets/trailrun/jiwandana_kedungudi.png',
    alt: 'Jalur Kedungudi Penanggungan',
  },
  {
    name: 'Media Partner 2',
    src: '/assets/trailrun/jiwandana_alti.png',
    alt: 'Official Media Partner',
  },
];

// ==============================================================================
// KOMPONEN CARD LOGO REUSABLE
// ==============================================================================
function SponsorCard({
  item,
  minHeightClass = 'min-h-[110px] sm:min-h-[130px]',
  imgMaxHeightClass = 'max-h-16 sm:max-h-20',
}: {
  item: SponsorItem;
  minHeightClass?: string;
  imgMaxHeightClass?: string;
}) {
  return (
    <div
      className={`bg-white/40 hover:bg-white/50 backdrop-blur-md border border-white/15 hover:border-[#C9A227]/60 rounded-2xl p-4 sm:p-6 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 group ${minHeightClass}`}
      title={item.name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={item.alt}
        className={`${imgMaxHeightClass} max-w-full w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md filter brightness-105 contrast-105`}
        loading="lazy"
      />
    </div>
  );
}

// ==============================================================================
// LABEL SECTION SUB-HEADER
// ==============================================================================
function SectionLabel({ title }: { title: string }) {
  return (
    <div className="text-center my-6">
      <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-[#C9A227] bg-black/40 px-4 py-1.5 rounded-full border border-[#C9A227]/30 backdrop-blur-xs">
        {title}
      </span>
    </div>
  );
}

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function TrailrunSponsors() {
  return (
    <section id="sponsor" className="py-16 md:py-24 max-w-6xl mx-auto px-6 space-y-12 animate-[fadeIn_0.6s_ease-out]">
      {/* Header Utama Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-[#C9A227]/80 text-xs font-bold uppercase tracking-widest text-[#C9A227] backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sponsor &amp; Partner</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
          Official Partners &amp; Sponsors
        </h2>
      </div>

      <div className="space-y-10">
        {/* ROW 1: TOP TIER (2 Box Lebar di Bagian Atas) */}
        {topTierSponsors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {topTierSponsors.map((item, index) => (
              <SponsorCard
                key={index}
                item={item}
                minHeightClass="min-h-[130px] sm:min-h-[150px]"
                imgMaxHeightClass="max-h-20 sm:max-h-24"
              />
            ))}
          </div>
        )}

        {/* ROW 2: COLLABORATION (Label + 4 Box Berjajar Horizontal) */}
        {collaborationSponsors.length > 0 && (
          <div className="space-y-4">
            <SectionLabel title="Collaboration" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto">
              {collaborationSponsors.map((item, index) => (
                <SponsorCard
                  key={index}
                  item={item}
                  minHeightClass="min-h-[110px] sm:min-h-[130px]"
                  imgMaxHeightClass="max-h-16 sm:max-h-20"
                />
              ))}
            </div>
          </div>
        )}

        {/* ROW 3: SPONSORSHIP (Label + 2 Box Besar di Tengah) */}
        {sponsorshipItems.length > 0 && (
          <div className="space-y-4">
            <SectionLabel title="Sponsorship" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {sponsorshipItems.map((item, index) => (
                <SponsorCard
                  key={index}
                  item={item}
                  minHeightClass="min-h-[150px] sm:min-h-[180px]"
                  imgMaxHeightClass="max-h-24 sm:max-h-32"
                />
              ))}
            </div>
          </div>
        )}

        {/* ROW 4: DUA KOLOM BAWAH (Kiri: SUPPORT, Kanan: MEDIA PARTNER) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto pt-4">
          {/* KOLOM KIRI: SUPPORT (3 Box: 2 di atas, 1 di bawah tengah) */}
          <div className="space-y-4">
            <SectionLabel title="Support" />
            <div className="space-y-4">
              {/* 2 box baris atas */}
              <div className="grid grid-cols-2 gap-4">
                {supportSponsors.slice(0, 2).map((item, index) => (
                  <SponsorCard
                    key={index}
                    item={item}
                    minHeightClass="min-h-[125px] sm:min-h-[145px]"
                    imgMaxHeightClass="max-h-16 sm:max-h-22"
                  />
                ))}
              </div>
              {/* 1 box baris bawah (center) */}
              {supportSponsors.length > 2 && (
                <div className="max-w-[65%] mx-auto">
                  <SponsorCard
                    item={supportSponsors[2]}
                    minHeightClass="min-h-[125px] sm:min-h-[145px]"
                    imgMaxHeightClass="max-h-16 sm:max-h-22"
                  />
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: MEDIA PARTNER (2 Box Tersusun Vertikal) */}
          <div className="space-y-4">
            <SectionLabel title="Media Partner" />
            <div className="flex flex-col gap-4 max-w-[60%] sm:max-w-[55%] mx-auto">
              {mediaPartnerSponsors.map((item, index) => (
                <SponsorCard
                  key={index}
                  item={item}
                  minHeightClass="min-h-[100px] sm:min-h-[115px]"
                  imgMaxHeightClass="max-h-18 sm:max-h-14"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
