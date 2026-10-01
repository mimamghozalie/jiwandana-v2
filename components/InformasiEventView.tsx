'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import eventsData from '@/data/events.json';
import { EventItem } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EventSliderProps {
  items: EventItem[];
  variant?: 'active' | 'upcoming' | 'completed';
  isActiveSection?: boolean;
}

function EventSlider({ items, variant, isActiveSection = false }: EventSliderProps) {
  const effectiveVariant = variant || (isActiveSection ? 'active' : 'upcoming');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).offsetWidth + 20 : 300;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(Math.max(0, index), items.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).offsetWidth + 20 : 300;
    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    scrollToIndex(Math.max(0, activeIndex - 1));
  };

  const handleNext = () => {
    scrollToIndex(Math.min(items.length - 1, activeIndex + 1));
  };

  return (
    <div className="relative group">
      {/* Swipe indicator hint */}
      <div className="absolute -top-10 right-2 flex items-center gap-2 text-xs text-slate-500 font-medium select-none">
        <span>geser</span>
        <span className="material-symbols-outlined text-xs animate-bounce-horizontal">arrow_forward</span>
        <span>swipe</span>
      </div>

      {/* Navigation Arrows (Visible on desktop hover) */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={`hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-black/10 shadow-md items-center justify-center text-slate-700 hover:text-[#C9A227] hover:border-[#C9A227] transition-all disabled:opacity-0 disabled:pointer-events-none`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === items.length - 1}
            className={`hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-black/10 shadow-md items-center justify-center text-slate-700 hover:text-[#C9A227] hover:border-[#C9A227] transition-all disabled:opacity-0 disabled:pointer-events-none`}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slider Container */}
      <div
        ref={scrollRef}
        onScroll={updateIndex}
        className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[85vw] sm:w-[calc(50%-10px)] shrink-0 snap-start bg-white border border-black/10 rounded-2xl p-6 flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-all duration-300 group/card"
          >
            <div className="space-y-4">
              <div className="w-full h-[500px] rounded-xl flex items-center justify-center relative overflow-hidden border border-black/10 bg-slate-100">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover/card:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${item.poster_url}')` }}
                />
                {effectiveVariant === 'completed' && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 rounded-full text-xs font-semibold text-emerald-400 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{item.badge_text || 'Telah Selesai'}</span>
                  </div>
                )}
                {effectiveVariant === 'active' && item.badge_text && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1c32]/85 backdrop-blur-md border border-[#C9A227]/40 rounded-full text-xs font-semibold text-[#C9A227] shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
                    <span>{item.badge_text}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif text-slate-900 group-hover/card:text-[#C9A227] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#C9A227]">calendar_today</span>
                  <span>{item.event_date}</span>
                </p>
              </div>
            </div>

            {effectiveVariant === 'active' && (
              <div className="pt-4 border-t border-black/5 flex justify-between items-center mt-4">
                <span className="text-xs text-slate-500 truncate max-w-[55%]">
                  {item.location || 'Kab. Mojokerto'}
                </span>
                <Link
                  href={`/event/${item.slug}`}
                  className="px-4 py-2 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold text-xs rounded-lg transition-colors shadow-sm shrink-0"
                >
                  Lihat Detail
                </Link>
              </div>
            )}

            {effectiveVariant === 'completed' && (
              <div className="pt-4 border-t border-black/5 flex justify-between items-center mt-4">
                <span className="text-xs text-slate-500 truncate max-w-[50%]">
                  {item.location || 'Kab. Mojokerto'}
                </span>
                <Link
                  href={item.portfolio_url || `/portofolio/${item.slug}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-[#C9A227] text-white hover:text-[#0d1c32] font-semibold text-xs rounded-lg transition-all duration-300 shadow-sm shrink-0 flex items-center gap-1.5"
                >
                  <span>Lihat Dokumentasi</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {items.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === activeIndex
                  ? 'w-6 h-2 bg-[#C9A227]'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function InformasiEventView() {
  const events = eventsData as EventItem[];
  const activeEvents = events.filter((e) => e.status === 'active');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const completedEvents = events.filter((e) => e.status === 'completed' || (e.status as string) === 'selesai');

  const perlombaanCategories = [
    { name: 'Pencak Silat', category: 'pencaksilat' },
    { name: 'Road Run', category: 'roadrun' },
    { name: 'Trail Run', category: 'trailrun' },
    { name: 'Menggambar dan Mewarnai', category: 'menggambardanmewarnai' },
    { name: 'Voli', category: 'voli' },
    { name: 'Panahan', category: 'panahan' },
    { name: 'Street Fight', category: 'streetfight' },
    { name: 'Kick Boxing', category: 'kickboxing' },
    { name: 'Boxing', category: 'boxing' },
    { name: 'Mancing', category: 'mancing' },
    { name: 'PushBike', category: 'pushbike' },
    { name: 'Esport', category: 'esport' },
    { name: 'Badminton', category: 'badminton' },
  ];

  const festivalCategories = [
    { name: 'Silat festival', category: 'silatfestival' },
    { name: 'Paradeband', category: 'paradeband' },
    { name: 'Tari', category: 'tari' },
    { name: 'keBudayaan', category: 'kebudayaan' },
  ];

  return (
    <main className="pt-28 pb-20 min-h-[90vh] bg-[#f8f8f8]">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* PAGE TITLE */}
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#C9A227] tracking-wide">
            Informasi Event
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            Daftar agenda event prestisius, pameran eksklusif, dan jadwal mendatang dari JIWANDANA.
          </p>
        </div>

        {/* SECTION 1: EVENT TERDEKAT */}
        <section className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#C9A227] tracking-widest uppercase">
                Agenda Utama
              </span>
              <h2 className="text-xl font-bold font-serif tracking-wide text-slate-900">
                Event Terdekat
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 border border-[#C9A227]/20 rounded-lg text-xs text-[#C9A227]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Aktif Bulan Ini
            </div>
          </div>

          {/* Slider Event Terdekat */}
          <EventSlider items={activeEvents} variant="active" />
        </section>

        {/* SECTION 2: COMING SOON */}
        <section className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                Mendatang
              </span>
              <h2 className="text-xl font-bold font-serif tracking-wide text-slate-900">
                Coming soon. segera
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-black/5 border border-black/10 rounded-lg text-xs text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Q1 - Q2 2026
            </div>
          </div>

          {/* Slider Upcoming Events */}
          <EventSlider items={upcomingEvents} variant="upcoming" />
        </section>

        {/* SECTION 3: EVENT SELESAI */}
        <section className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                Riwayat Acara
              </span>
              <h2 className="text-xl font-bold font-serif tracking-wide text-slate-900">
                Event Selesai
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Dokumentasi Tersedia
            </div>
          </div>

          {/* Slider Event Selesai */}
          <EventSlider items={completedEvents} variant="completed" />
        </section>

        {/* SECTION 4: KATEGORI EVENT (Perlombaan & Festival) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/10">
          {/* Perlombaan Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#C9A227]/20 pb-4">
              <span className="material-symbols-outlined text-[#C9A227] text-2xl">
                emoji_events
              </span>
              <h2 className="text-xl font-bold font-serif tracking-wide text-[#C9A227]">
                Perlombaan
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {perlombaanCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/booking-event?category=${cat.category}`}
                  className="flex justify-between items-center px-5 py-4 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/50 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm group"
                >
                  <span className="text-sm font-medium tracking-wide text-slate-700 group-hover:text-[#C9A227]">
                    {cat.name}
                  </span>
                  <span className="material-symbols-outlined text-xs text-slate-400 group-hover:text-[#C9A227] transition-colors">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Festival Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#C9A227]/20 pb-4">
              <span className="material-symbols-outlined text-[#C9A227] text-2xl">
                celebration
              </span>
              <h2 className="text-xl font-bold font-serif tracking-wide text-[#C9A227]">
                Festival
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {festivalCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/booking-event?category=${cat.category}`}
                  className="flex justify-between items-center px-5 py-4 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/50 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm group"
                >
                  <span className="text-sm font-medium tracking-wide text-slate-700 group-hover:text-[#C9A227]">
                    {cat.name}
                  </span>
                  <span className="material-symbols-outlined text-xs text-slate-400 group-hover:text-[#C9A227] transition-colors">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
