import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTestimonials } from '@/lib/api';
import { Star, Quote, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimonial & Apresiasi Klien - JIWANDANA Event Organizer',
  description: 'Ulasan dan apresiasi dari tokoh pencak silat, panitia pelaksana, pelatih, serta institusi atas dedikasi JIWANDANA.',
};

export const revalidate = 60;

export default async function TestimonialPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/20">
            Apresiasi & Reputasi
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-wide">
            Testimonial & Kepercayaan
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans">
            Ulasan dan pengakuan langsung dari para tokoh olahraga bela diri, ketua panitia, kurator seni, dan mitra korporat atas kinerja prima tim JIWANDANA.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testi) => (
            <div
              key={testi.id}
              className="bg-white/5 border border-white/10 hover:border-[#e9c176]/50 rounded-3xl p-8 sm:p-10 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1 text-[#e9c176]">
                    {[...Array(testi.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#e9c176]" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-[#e9c176]/20 group-hover:text-[#e9c176]/40 transition-colors" />
                </div>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">
                  &ldquo;{testi.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/10 mt-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#e9c176]/40">
                  <Image
                    src={testi.avatar_url || 'https://i.pravatar.cc/150?img=67'}
                    alt={testi.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#e9c176] font-serif">
                    {testi.name}
                  </h4>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {testi.role}
                  </p>
                  {testi.event_name && (
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Event: {testi.event_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-[#12233c] to-[#0a1424] border border-[#e9c176]/30 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h3 className="text-2xl font-serif font-bold text-white">
            Wujudkan Event Spektakuler Anda Selanjutnya Bersama Kami
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Bergabunglah dengan puluhan instansi dan ribuan atlet yang telah merasakan kemegahan standar JIWANDANA.
          </p>
          <div className="pt-2">
            <Link
              href="/booking-event"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              <span>Mulai Rencanakan Acara</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
