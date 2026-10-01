'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DocItem {
  id: string;
  category: 'photo' | 'video' | 'bts';
  tag: string;
  title: string;
  image: string;
  location: string;
  date: string;
  description: string;
  link?: string;
}

const docItems: DocItem[] = [
  {
    id: '1',
    category: 'video',
    tag: 'KONI CHAMPIONSHIP 1',
    title: 'Perlombaan Pencak Silat',
    image: '/assets/4.jpeg',
    location: 'GOR Olahraga Dinas Pendidikan Kab. Mojokerto',
    date: '14-16 Agustus 2026',
    description: 'Dokumentasi rekaman visual dan video sinematik kejuaraan nasional pencak silat dengan 3 gelanggang digital dan 1.200+ pesilat.',
    link: '/portofolio/koni-1',
  },

];

export default function DokumentasiClient() {
  const [filter, setFilter] = useState<'all' | 'photo' | 'video' | 'bts'>('all');
  const [selectedItem, setSelectedItem] = useState<DocItem | null>(null);

  const filteredItems = docItems.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <main className="pt-20 bg-[#f8f8f8]">
      <section className="py-24 bg-[#f8f8f8] min-h-screen text-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-16 space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#C9A227] tracking-wide">
              Dokumentasi Event
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
              Dokumentasi visual serta rekaman kesuksesan event-event prestisius yang telah kami kelola secara profesional.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${filter === 'all'
                  ? 'bg-[#C9A227] text-[#0d1c32] font-semibold'
                  : 'border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] bg-white'
                }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilter('photo')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${filter === 'photo'
                  ? 'bg-[#C9A227] text-[#0d1c32] font-semibold'
                  : 'border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] bg-white'
                }`}
            >
              Foto Galeri
            </button>
            <button
              type="button"
              onClick={() => setFilter('video')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${filter === 'video'
                  ? 'bg-[#C9A227] text-[#0d1c32] font-semibold'
                  : 'border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] bg-white'
                }`}
            >
              Video Sinematik
            </button>
            <button
              type="button"
              onClick={() => setFilter('bts')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${filter === 'bts'
                  ? 'bg-[#C9A227] text-[#0d1c32] font-semibold'
                  : 'border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] bg-white'
                }`}
            >
              Behind the Scenes
            </button>
          </div>

          {/* Documentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="doc-item bg-white border border-black/10 hover:border-[#C9A227]/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 transform hover:-translate-y-1.5 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.category === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                        <span className="material-symbols-outlined text-white text-5xl drop-shadow-md group-hover:scale-110 transition-transform">
                          play_circle
                        </span>
                      </div>
                    )}
                    {item.category === 'bts' && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-[10px] uppercase font-semibold text-[#C9A227] rounded-md border border-white/10">
                        Behind The Scenes
                      </span>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <span className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider block">
                      {item.tag}
                    </span>
                    <h3 className="text-lg font-bold font-serif leading-snug text-slate-900 group-hover:text-[#C9A227] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-black/5 gap-2">
                    <span className="flex items-center gap-1 truncate max-w-[65%]">
                      <span className="material-symbols-outlined text-xs text-[#C9A227] shrink-0">
                        location_on
                      </span>
                      <span className="truncate">{item.location}</span>
                    </span>
                    <span className="shrink-0">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX / DETAIL MODAL (Matching dokumentasi.html) */}
      {selectedItem && (
        <div
          id="detail-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white border border-black/10 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row transform scale-100 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              id="close-modal"
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-50 text-slate-700 bg-white/90 p-2 rounded-full hover:bg-white shadow-md transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-xl block">close</span>
            </button>

            {/* Media Container */}
            <div className="w-full md:w-3/5 h-64 md:h-[450px] relative bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              {selectedItem.category === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <span className="material-symbols-outlined text-[#C9A227] text-7xl animate-pulse">
                    play_circle
                  </span>
                </div>
              )}
            </div>

            {/* Info Container */}
            <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider block">
                  {selectedItem.tag}
                </span>
                <h3 className="text-2xl font-bold font-serif tracking-wide text-slate-900 leading-tight">
                  {selectedItem.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 border-t border-black/10 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#C9A227]">
                      location_on
                    </span>
                    <span>{selectedItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#C9A227]">
                      calendar_today
                    </span>
                    <span>{selectedItem.date}</span>
                  </div>
                </div>

                {selectedItem.link && (
                  <Link
                    href={selectedItem.link}
                    className="w-full py-2.5 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold text-xs rounded-xl text-center uppercase tracking-wider transition-colors shadow-sm block"
                  >
                    Lihat Portofolio Lengkap
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
