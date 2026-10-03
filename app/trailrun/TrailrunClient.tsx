'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import trailrunData from '@/data/trailrun.json';
import { trailrunRoutes } from '@/data/routes';
import { TrailrunCard, TrailrunRoute } from '@/lib/types';
import type { ActivePricingResult } from '@/lib/pricing';
import TrailrunHero from '@/components/trailrun/TrailrunHero';
import TrailrunCardItem from '@/components/trailrun/TrailrunCardItem';
import TrailrunFacilityModal from '@/components/trailrun/TrailrunFacilityModal';
import TrailrunRouteSection from '@/components/trailrun/TrailrunRouteSection';

export default function TrailrunClient() {
  const [selectedCategory, setSelectedCategory] = useState<TrailrunCard | null>(null);
  const [activeRouteKey, setActiveRouteKey] = useState<string>('3k');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [pricingData, setPricingData] = useState<Record<string, ActivePricingResult>>({});

  useEffect(() => {
    // Fetch live quota & pricing from database
    fetch('/api/trailrun/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPricingData(data);
        }
      })
      .catch((err) => {
        console.warn('Realtime pricing fetch error:', err);
      });
  }, []);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = trailrunData.categories as TrailrunCard[];
  const routes = trailrunRoutes as unknown as Record<string, TrailrunRoute>;

  return (
    <div className="relative min-h-screen selection:bg-[#C9A227] selection:text-[#0d1c32]">
      {/* Full-page Fixed Background Banner Image with Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/banner_trailrun.png"
          alt="Banner Trailrun Lintas Candi"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Full-page Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 via-50% to-[#f8f8f8]" />
      </div>

      {/* Main Content Sections */}
      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <TrailrunHero />

        {/* 2. CATEGORIES SECTION (Cards with 3D Flip Elevation Profile) */}
        <section id="kategori" className="py-16 md:py-24 max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-[#C9A227]/80 text-xs font-bold uppercase tracking-widest text-[#C9A227] backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pilihan Kategori Lomba</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
              Kategori Trailrun
            </h2>
            <p className="text-white text-sm md:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              Pilih kategori jarak tempuh sesuai ketahanan fisik Anda. Klik tombol{' '}
              <strong className="text-[#C9A227] font-bold">Profil Elevasi</strong> pada kartu untuk melihat grafik kontur elevasi.
            </p>
          </div>

          {/* Modular Cards Grid loaded from JSON with Realtime Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {categories.map((item) => (
              <TrailrunCardItem
                key={item.id}
                item={item}
                pricingInfo={pricingData[item.id] || null}
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
        {/* <TrailrunRouteSection
          routes={routes}
          activeRouteKey={activeRouteKey}
          onSelectRouteKey={setActiveRouteKey}
        /> */}
      </div>
    </div>
  );
}
