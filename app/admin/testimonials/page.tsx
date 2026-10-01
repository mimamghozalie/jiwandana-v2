'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getTestimonials } from '@/lib/api';
import { TestimonialItem } from '@/lib/types';
import { Star, Plus } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getTestimonials();
      setTestimonials(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Kelola Testimonial & Apresiasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Daftar ulasan dari tokoh IPSI, KONI, pembina kontingen, dan mitra pelaksana acara.
          </p>
        </div>

        <button
          onClick={() => alert('Fitur tambah testimoni baru siap digunakan.')}
          className="px-4 py-2.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Testimoni</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Memuat testimoni...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl bg-[#12233c] border border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex gap-1 text-[#e9c176]">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#e9c176]" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#e9c176]/30">
                  <Image src={t.avatar_url} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
