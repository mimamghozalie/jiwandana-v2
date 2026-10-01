'use client';

import React, { useState } from 'react';
import trailrunData from '@/data/trailrun.json';
import { TrailrunCard, TrailrunRoute } from '@/lib/types';
import TrailrunHero from '@/components/trailrun/TrailrunHero';
import TrailrunCardItem from '@/components/trailrun/TrailrunCardItem';
import TrailrunFacilityModal from '@/components/trailrun/TrailrunFacilityModal';
import TrailrunRouteSection from '@/components/trailrun/TrailrunRouteSection';

export default function TrailrunClient() {
  const [selectedCategory, setSelectedCategory] = useState<TrailrunCard | null>(null);
  const [activeRouteKey, setActiveRouteKey] = useState<string>('10k');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = trailrunData.categories as TrailrunCard[];
  const routes = trailrunData.routes as unknown as Record<string, TrailrunRoute>;

  return (
    <main className="min-h-screen bg-[#f8f8f8] text-slate-800 selection:bg-[#C9A227] selection:text-[#0d1c32]">
      {/* 1. HERO SECTION */}
      <TrailrunHero />

      {/* 2. CATEGORIES SECTION (Cards with 3D Flip Elevation Profile) */}
      <section id="kategori" className="py-16 md:py-24 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227] block">
            Pilihan Kategori Lomba
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-wide">
            Kategori Trailrun
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
            Pilih kategori jarak tempuh sesuai ketahanan fisik Anda. Klik tombol <strong>Profil Elevasi</strong> pada kartu untuk melihat grafik kontur elevasi.
          </p>
        </div>

        {/* Modular Cards Grid loaded from JSON */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {categories.map((item) => (
            <TrailrunCardItem
              key={item.id}
              item={item}
              isFlipped={!!flippedCards[item.id]}
              onToggleFlip={() => toggleFlip(item.id)}
              onSelectCategory={() => setSelectedCategory(item)}
            />
          ))}
        </div>
      </section>

      {/* 3. MODAL POPUP: FASILITAS TERMASUK */}
      <TrailrunFacilityModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />

      {/* 4. ROUTE & ELEVATION SECTION (Interactive Map & Altitude Curve) */}
      <TrailrunRouteSection
        routes={routes}
        activeRouteKey={activeRouteKey}
        onSelectRouteKey={setActiveRouteKey}
      />
    </main>
  );
}
