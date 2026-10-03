'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  FileText,
  Download,
  BookOpen,
  Gavel,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface EventDetailClientProps {
  slug: string;
}

export default function EventDetailClient({ slug }: EventDetailClientProps) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEvent = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg('');

    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      const json = await res.json();

      if (json.success && json.data) {
        setEvent(json.data);
        setErrorMsg('');
      } else {
        setEvent(null);
        setErrorMsg(json.message || 'Event tidak ditemukan di database.');
      }
    } catch {
      setEvent(null);
      setErrorMsg('Gagal memuat data event dari server. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchEvent(false);
  }, [fetchEvent]);

  // Loading Skeleton State
  if (loading) {
    return (
      <main className="pt-20 bg-[#f8f8f8] min-h-screen text-slate-800">
        <section className="py-16 md:py-24 max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="h-5 w-44 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse" />
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
            {/* Flyer Skeleton */}
            <div className="w-full lg:w-1/2 aspect-3/4 max-h-[550px] bg-slate-200 rounded-2xl animate-pulse" />

            {/* Content Skeleton */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-200 rounded-md animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-200 rounded-md animate-pulse" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
              </div>

              <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Not Found or Error State
  if (errorMsg || !event) {
    return (
      <main className="pt-20 bg-[#f8f8f8] min-h-screen text-slate-800">
        <section className="py-20 md:py-28 max-w-xl mx-auto px-6 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-slate-900">Event Tidak Ditemukan</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {errorMsg || `Event dengan slug "${slug}" tidak terdaftar di database kami.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fetchEvent(true)}
              className="px-5 py-2.5 bg-white border border-black/10 hover:border-[#C9A227] text-slate-700 hover:text-[#C9A227] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Coba Lagi</span>
            </button>

            <Link
              href="/informasi-event"
              className="px-5 py-2.5 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Informasi Event</span>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Dokumen pendukung diambil murni dari response API database
  const juknisUrl =
    event.juknis_url && event.juknis_url.trim() !== '' && event.juknis_url !== '#'
      ? event.juknis_url.trim()
      : null;

  const guideBookUrl =
    event.guide_book_url && event.guide_book_url.trim() !== '' && event.guide_book_url !== '#'
      ? event.guide_book_url.trim()
      : null;

  const rulesUrl =
    event.rules_url && event.rules_url.trim() !== '' && event.rules_url !== '#'
      ? event.rules_url.trim()
      : null;

  return (
    <main className="pt-20 bg-[#f8f8f8]">
      <section className="py-16 md:py-24 bg-[#f8f8f8] min-h-screen text-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header Bar with Back Link & Live Refresh Button */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/informasi-event"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-[#C9A227] transition-colors group text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Kembali ke Informasi Event</span>
            </Link>

            <button
              type="button"
              onClick={() => fetchEvent(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#C9A227] px-3 py-1.5 rounded-lg border border-black/5 hover:border-[#C9A227]/30 bg-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Perbarui data terbaru dari database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
              <span>{isRefreshing ? 'Memuat...' : 'Refresh Data'}</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
            {/* Left: Flyer Image */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="bg-white border border-black/10 rounded-2xl p-3 shadow-xl relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-full text-xs font-semibold text-[#C9A227] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {event.status === 'active'
                      ? 'Pendaftaran Dibuka'
                      : event.status === 'completed'
                        ? 'Event Telah Selesai'
                        : event.badge_text || 'Coming Soon'}
                  </span>
                </div>

                {/* Event Title */}
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#C9A227] leading-tight">
                  {event.title}
                </h1>

                {/* Description */}
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {event.description}
                </p>

                {/* Event Details Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white border border-black/10 rounded-xl p-4 flex gap-3 items-center shadow-xs">
                    <div className="w-10 h-10 rounded-lg bg-[#C9A227]/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-[#C9A227]" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        Tanggal Pelaksanaan
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5">
                        {event.event_date}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 flex gap-3 items-center shadow-xs">
                    <div className="w-10 h-10 rounded-lg bg-[#C9A227]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#C9A227]" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        Lokasi Acara
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5">
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Documents Section */}
              <div className="space-y-4">
                {/* Actions Block */}
                <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center lg:text-left">
                    Aksi Pendaftaran & Panduan Resmi
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {event.status === 'completed' ? (
                      <Link
                        href={event.portfolio_url || `/portofolio/${event.slug}`}
                        className="flex-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-3.5 px-4 rounded-xl text-center shadow-md transition-all transform active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Lihat Dokumentasi</span>
                      </Link>
                    ) : (
                      <a
                        href={event.registration_url || `/booking-event?category=${event.category}`}
                        target={event.registration_url?.startsWith('http') ? '_blank' : undefined}
                        rel={event.registration_url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-3.5 px-4 rounded-xl text-center shadow-md transition-all transform active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Daftar Sekarang</span>
                      </a>
                    )}

                    {juknisUrl && (
                      <a
                        href={juknisUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0d1c32] font-semibold py-3.5 px-4 rounded-xl text-center transition-all transform active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-white shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Juknis</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Guidebook Button */}
                {guideBookUrl && (
                  <div>
                    <a
                      href={guideBookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0d1c32] font-semibold py-3.5 px-4 rounded-xl text-center transition-all transform active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-white shadow-xs"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Buku Pedoman</span>
                    </a>
                  </div>
                )}

                {/* Rules Button */}
                {rulesUrl && (
                  <div>
                    <a
                      href={rulesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glow-btn w-full border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0d1c32] font-semibold py-3.5 px-4 rounded-xl text-center transition-all transform active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>Peraturan Pertandingan</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Rundown if exists */}
              {event.rundown && (
                <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-black/5 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-[#C9A227]" />
                    <span>Rundown & Tahapan Acara</span>
                  </div>
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
