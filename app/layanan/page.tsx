import React from 'react';
import Link from 'next/link';
import { getServices } from '@/lib/api';
import { Trophy, Sparkles, Compass, ShieldCheck, Check, ArrowRight, PhoneCall } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Layanan Kami - JIWANDANA Event Organizer',
  description: 'Katalog lengkap spesialisasi layanan JIWANDANA: Manajemen kejuaraan beladiri silat, festival kebudayaan, race management, dan corporate event.',
};

export const revalidate = 60;

export default async function LayananPage() {
  const services = await getServices();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'emoji_events':
        return <Trophy className="w-8 h-8 text-[#e9c176]" />;
      case 'theater_comedy':
        return <Sparkles className="w-8 h-8 text-[#e9c176]" />;
      case 'sprint':
        return <Compass className="w-8 h-8 text-[#e9c176]" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-[#e9c176]" />;
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227] bg-[#C9A227]/10 px-4 py-1 rounded-full border border-[#C9A227]/20">
            Solusi Acara Profesional
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-wide">
            Katalog Layanan JIWANDANA
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            Menghadirkan layanan end-to-end produksi perhelatan dari tahap rancangan konsep, perizinan, pengadaan sarana teknis, hingga pertunjukan akbar di hari H.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#12233c] to-[#0a1424] border border-white/10 hover:border-[#e9c176]/40 transition-all shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-[#e9c176]/30 flex items-center justify-center shadow-md">
                    {getIcon(service.icon)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#e9c176]">
                      Layanan Unggulan 0{index + 1}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                      {service.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {service.full_desc}
                </p>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#e9c176]">
                    Fasilitas & Standar Teknis:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.features.map((feat, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <Check className="w-4 h-4 text-[#e9c176] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href={`/booking-event?category=${service.slug}`}
                    className="px-6 py-3 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    Konsultasi & Pesan Layanan Ini
                  </Link>
                </div>
              </div>

              {/* Decorative Visual Card */}
              <div className="lg:col-span-5 relative">
                <div className="w-full h-64 sm:h-80 rounded-2xl bg-white/5 border border-[#e9c176]/20 p-8 flex flex-col justify-between relative overflow-hidden shadow-inner group">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#e9c176]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="text-right">
                    <span className="text-5xl font-serif font-bold text-white/10 group-hover:text-[#e9c176]/20 transition-colors">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-[#e9c176] font-semibold">
                      Standar JIWANDANA
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Didukung oleh tim teknis bersertifikasi dan vendor terpercaya di Indonesia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-[#12233c] to-[#0d1c32] border border-[#e9c176]/30 rounded-3xl p-10 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Butuh Konsep Khusus atau Custom Event?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Kami juga melayani paket kombinasi, perhelatan peringatan hari jadi instansi, dan perlombaan multi-cabang sesuai kebutuhan Anda.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/booking-event?category=other"
              className="px-8 py-3.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              Ajukan Custom Event
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
