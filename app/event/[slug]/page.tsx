import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventBySlug, getEvents } from '@/lib/api';
import type { Metadata } from 'next';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const events = await getEvents();
  const defaultSlugs = ['koni-championship-1', 'koni-1', 'dsc-diponegoro', 'trailrun-lintas-candi'];
  const allSlugs = new Set([...events.map((e) => e.slug), ...defaultSlugs]);
  return Array.from(allSlugs).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Event Tidak Ditemukan' };

  return {
    title: `${event.title} - JIWANDANA Event Organizer`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.poster_url ? [event.poster_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  // Dokumen pendukung diambil murni dari Supabase (disembunyikan jika tidak ada agar tidak miss info)
  const rawJuknis = event.juknis_url || (event as any).juknis || '';
  const juknisUrl =
    rawJuknis && rawJuknis.trim() !== '' && rawJuknis !== '#'
      ? rawJuknis.trim()
      : null;

  const rawPedoman =
    event.guide_book_url ||
    (event as any).guidebook_url ||
    (event as any).pedoman ||
    (event as any).buku_pedoman ||
    (event as any).pedoman_url ||
    '';
  const guideBookUrl =
    rawPedoman && rawPedoman.trim() !== '' && rawPedoman !== '#'
      ? rawPedoman.trim()
      : null;

  const rawRules =
    event.rules_url ||
    (event as any).peraturan ||
    (event as any).peraturan_url ||
    '';
  const rulesUrl =
    rawRules && rawRules.trim() !== '' && rawRules !== '#'
      ? rawRules.trim()
      : null;

  return (
    <main className="pt-20 bg-[#f8f8f8]">
      <section className="py-16 md:py-24 bg-[#f8f8f8] min-h-screen text-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {/* Back Link */}
          <div className="mb-8">
            <Link
              href="/informasi-event"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-[#C9A227] transition-colors group"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span>Kembali ke Informasi Event</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
            {/* Left: Flyer Image */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="bg-white border border-black/10 rounded-2xl p-3 shadow-xl relative overflow-hidden group">
                <img
                  src={event.poster_url || '/assets/4.jpeg'}
                  alt={`${event.title} Flyer`}
                  className="w-full h-auto rounded-xl object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Right: Event Info */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between py-2 space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-full text-xs font-semibold text-[#C9A227] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    {event.status === 'active'
                      ? 'Pendaftaran Dibuka'
                      : event.status === 'completed'
                        ? 'Event Telah Selesai'
                        : event.badge_text || 'Coming Soon'}
                  </span>
                </div>

                <h1 className="text-2xl md:text-2xl font-bold font-serif text-[#C9A227] leading-tight">
                  {event.title}
                </h1>

                <p className="text-slate-600 leading-relaxed text-base">
                  {event.description}
                </p>

                {/* Event Details Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex gap-3 items-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl text-[#C9A227]">
                      calendar_today
                    </span>
                    <div>
                      <div className="text-xs text-slate-500">Tanggal Pelaksanaan</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {event.event_date}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 flex gap-3 items-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl text-[#C9A227]">
                      location_on
                    </span>
                    <div>
                      <div className="text-xs text-slate-500">Lokasi Acara</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Documents Section */}
              <div className="space-y-4">
                {/* Actions Block */}
                <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 text-center lg:text-left">
                    Aksi Pendaftaran & Panduan
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {event.status === 'completed' ? (
                      <Link
                        href={event.portfolio_url || `/portofolio/${event.slug}`}
                        className="flex-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-4 rounded-xl text-center shadow-md transition-all transform active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-md">photo_library</span>
                        <span>Lihat Dokumentasi</span>
                      </Link>
                    ) : (
                      <a
                        href={event.registration_url || `/booking-event?category=${event.category}`}
                        target={event.registration_url?.startsWith('http') ? '_blank' : undefined}
                        rel={event.registration_url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-4 rounded-xl text-center shadow-md transition-all transform active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-md">assignment</span>
                        <span>Daftar Sekarang</span>
                      </a>
                    )}

                    {juknisUrl && juknisUrl !== '#' && (
                      <a
                        href={juknisUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0d1c32] font-semibold py-4 rounded-xl text-center transition-all transform active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-white shadow-sm"
                      >
                        <span className="material-symbols-outlined text-md">download</span>
                        <span>Unduh Juknis</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Guidebook Button */}
                {guideBookUrl && guideBookUrl !== '#' && (
                  <div>
                    <a
                      href={guideBookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0d1c32] font-semibold py-4 rounded-xl text-center transition-all transform active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-white shadow-sm"
                    >
                      Buku Pedoman
                    </a>
                  </div>
                )}

                {/* Rules Button with Glow Animation */}
                {rulesUrl && rulesUrl !== '#' && (
                  <div>
                    <a
                      href={rulesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glow-btn w-full border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0d1c32] font-semibold py-4 rounded-xl text-center transition-all transform active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-md">gavel</span>
                      <span>Peraturan</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Rundown if exists */}
              {event.rundown && (
                <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-3 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Rundown & Tahapan Acara
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                    {event.rundown}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
