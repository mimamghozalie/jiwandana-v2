'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPortfolios } from '@/lib/api';
import { PortfolioItem } from '@/lib/types';
import { Plus, Eye, Image as ImageIcon } from 'lucide-react';

export default function AdminPortofolioPage() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPortfolios();
      setPortfolios(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Kelola Portofolio & Dokumentasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Daftar album kejuaraan dan galeri dokumentasi yang telah selesai diselenggarakan.
          </p>
        </div>

        <button
          onClick={() => alert('Fitur upload batch galeri foto ke Supabase Storage siap dihubungkan.')}
          className="px-4 py-2.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Portofolio Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Memuat portofolio...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((p) => (
            <div
              key={p.id}
              className="bg-[#12233c] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4"
            >
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                  <Image src={p.cover_image} alt={p.title} fill className="object-cover" />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 text-[#e9c176]">
                    {p.category}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {p.event_date} • {p.location}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#e9c176]" />
                  <span>{p.gallery_images?.length || 1} Foto HD</span>
                </span>
                <a
                  href={`/portofolio/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e9c176] hover:underline font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Galeri</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
