'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import portfoliosData from '@/data/portfolios.json';
import { PortfolioItem } from '@/lib/types';

export default function PortofolioPage() {
  const [portfolios] = useState<PortfolioItem[]>(portfoliosData as unknown as PortfolioItem[]);
  const [filter, setFilter] = useState<'all' | 'perlombaan' | 'festival' | 'internasional'>('all');

  const filteredItems = portfolios.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });


  return (
    <main className="pt-20 bg-[#f8f8f8]">
      <section className="py-24 bg-[#f8f8f8] min-h-screen text-slate-800">
        <div className="max-w-[1200px] mx-auto px-5 md:px-16">
          <div className="text-center mb-16 space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#C9A227] tracking-wide">
              Portofolio Kejuaraan & Festival
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
              Dokumentasi perhelatan akbar pencak silat nasional dan internasional yang telah kami produksi secara spektakuler.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${
                filter === 'all'
                  ? 'bg-[#C9A227] border border-[#C9A227] text-[#0d1c32] font-semibold hover:bg-[#b08d20]'
                  : 'bg-white border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] hover:bg-[#C9A227]/[0.08]'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilter('perlombaan')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${
                filter === 'perlombaan'
                  ? 'bg-[#C9A227] border border-[#C9A227] text-[#0d1c32] font-semibold hover:bg-[#b08d20]'
                  : 'bg-white border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] hover:bg-[#C9A227]/[0.08]'
              }`}
            >
              Perlombaan
            </button>
            <button
              type="button"
              onClick={() => setFilter('festival')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${
                filter === 'festival'
                  ? 'bg-[#C9A227] border border-[#C9A227] text-[#0d1c32] font-semibold hover:bg-[#b08d20]'
                  : 'bg-white border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] hover:bg-[#C9A227]/[0.08]'
              }`}
            >
              Festival Seni
            </button>
            <button
              type="button"
              onClick={() => setFilter('internasional')}
              className={`px-6 py-2 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${
                filter === 'internasional'
                  ? 'bg-[#C9A227] border border-[#C9A227] text-[#0d1c32] font-semibold hover:bg-[#b08d20]'
                  : 'bg-white border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227] hover:bg-[#C9A227]/[0.08]'
              }`}
            >
              Tingkat Internasional
            </button>
          </div>

          {/* Portfolio Grid (Masonry style with varied row/col spans) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]" id="portfolio-grid">
            {filteredItems.map((item, index) => {
              // Item 1 (or large item) spans 8 cols and 2 rows
              const isLarge = index === 0;
              const colSpan = isLarge ? 'md:col-span-8 md:row-span-2' : 'md:col-span-4 md:row-span-1';
              
              const categoryBadge = 
                item.slug === 'koni-1' || item.category === 'perlombaan'
                  ? 'Perlombaan Nasional'
                  : item.category === 'festival'
                  ? 'Festival Seni'
                  : 'Tingkat Internasional';

              return (
                <div
                  key={item.id}
                  className={`portfolio-item ${colSpan} relative overflow-hidden group border border-black/10 hover:border-[#C9A227]/50 rounded-2xl transition-all duration-300 shadow-md bg-white`}
                >
                  <Link href={`/portofolio/${item.slug}`} className="block w-full h-full relative">
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                      <h3 className="text-white text-2xl md:text-3xl font-serif font-bold mb-2">
                        {item.title}
                      </h3>
                      <span className="text-[#C9A227] text-xs font-semibold uppercase tracking-widest">
                        {categoryBadge}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <button
              type="button"
              className="border border-[#C9A227] text-[#C9A227] px-10 py-4 rounded-xl font-medium uppercase tracking-widest hover:bg-[#C9A227] hover:text-[#0d1c32] bg-white transition-all duration-300 shadow-sm"
            >
              Muat Lebih Banyak
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

