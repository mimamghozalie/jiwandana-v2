'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PortfolioItem } from '@/lib/types';
import LightboxModal from '@/components/LightboxModal';
import { ArrowLeft, Calendar, MapPin, Trophy } from 'lucide-react';

interface PortfolioClientProps {
  portfolio: PortfolioItem;
}

export default function PortfolioClient({ portfolio }: PortfolioClientProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const rawImages = portfolio?.gallery_images;
  let images: string[] = [];
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    images = rawImages;
  } else if (typeof rawImages === 'string') {
    try {
      const parsed = JSON.parse(rawImages);
      images = Array.isArray(parsed) ? parsed : [rawImages];
    } catch {
      images = [rawImages];
    }
  }
  if (images.length === 0 && portfolio?.cover_image) {
    images = [portfolio.cover_image];
  }

  const isKoni1 =
    portfolio?.slug === 'koni-1' ||
    portfolio?.slug === 'koni-championship-1' ||
    (portfolio?.title ? portfolio.title.toLowerCase().includes('koni') : false);

  const displayTitle = portfolio?.title || 'KONI CHAMPIONSHIP I';
  const displayDescription = portfolio?.description || '';


  return (
    <main className="pt-20 bg-[#f8f8f8]">
      {/* Video Backdrop Header if koni-1, otherwise hero image */}
      {isKoni1 ? (
        <div className="relative w-full h-[48vh] min-h-[360px] max-h-[600px] md:h-[58vh] md:min-h-[440px] overflow-hidden bg-black border-b border-black/10 shadow-xl">
          <iframe
            src="https://drive.google.com/file/d/1ipIpYelkAXQ2qy2HSCU-RZbyzbdW5GDo/preview?autoplay=true&vq=medium"
            className="absolute top-1/2 left-1/2 w-screen h-[56.25vw] min-h-full min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0 bg-black pointer-events-auto"
            allow="autoplay; encrypted-media; fullscreen"
            title="Video Backdrop KONI CHAMPIONSHIP I"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />

          {/* Floating Back Link */}
          <div className="absolute top-6 left-6 z-20">
            <Link
              href="/portofolio"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#C9A227] hover:border-[#C9A227]/50 transition-all group shadow-lg text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Kembali ke Portofolio</span>
            </Link>
          </div>

          {/* Highlight Badge */}
          <div className="absolute bottom-6 left-6 sm:left-12 z-20 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#C9A227]/40 text-xs text-[#C9A227] font-medium shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
              Highlight Video Dokumentasi
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 pt-8">
          <Link
            href="/portofolio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/10 text-slate-700 hover:text-[#C9A227] hover:border-[#C9A227]/50 transition-all group shadow-sm text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Portofolio</span>
          </Link>
        </div>
      )}

      {/* Main Content Section */}
      <section className="py-14 md:py-20 bg-[#f8f8f8] min-h-screen text-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-full text-xs font-semibold text-[#C9A227] uppercase tracking-wider mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
              Dokumentasi Event
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-[#C9A227] leading-tight mb-4">
              {displayTitle.toUpperCase()}
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed">
              {displayDescription}
            </p>
            <span className="block w-16 h-[3px] bg-gradient-to-r from-[#C9A227] to-[#e2be4b] rounded-full mx-auto mt-4" />
          </div>

          {/* Meta Info Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 mb-12">
            {portfolio?.event_date && (
              <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-black/10 shadow-sm">
                <Calendar className="w-4 h-4 text-[#C9A227]" />
                {portfolio.event_date}
              </span>
            )}
            {portfolio?.location && (
              <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-black/10 shadow-sm">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                {portfolio.location}
              </span>
            )}
            {portfolio?.client && (
              <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-black/10 shadow-sm">
                <Trophy className="w-4 h-4 text-[#C9A227]" />
                {portfolio.client}
              </span>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="gallery-grid">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                onClick={() => setActivePhotoIndex(index)}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-md cursor-pointer hover:border-[#C9A227]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`${portfolio.title} foto ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="material-symbols-outlined text-[#C9A227] text-2xl">zoom_in</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Second Video Backdrop for koni-1 */}
          {isKoni1 && (
            <div className="relative w-full h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden bg-black rounded-2xl border border-black/10 shadow-2xl mt-16">
              <iframe
                src="https://drive.google.com/file/d/1_CV47A0RF5miQBQOzUB_R16ulZzL93Do/preview?autoplay=true&vq=medium"
                className="absolute top-1/2 left-1/2 w-screen h-[56.25vw] min-h-full min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0 bg-black pointer-events-auto"
                allow="autoplay; encrypted-media; fullscreen"
                title="Video Dokumentasi Bawah KONI CHAMPIONSHIP I"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <a
              href="https://drive.google.com/drive/folders/1lUGmMzSWWpTJFFL07nGO-MZ7OoJE7M4Y?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0d1c32] font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 transform active:scale-95 text-sm uppercase tracking-wider shadow-sm bg-white"
            >
              <span className="material-symbols-outlined text-lg">event</span>
              Lihat Semua Dokumentasi
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <LightboxModal
        images={images}
        currentIndex={activePhotoIndex}
        onClose={() => setActivePhotoIndex(null)}
        onNext={() => {
          if (activePhotoIndex !== null) {
            setActivePhotoIndex((activePhotoIndex + 1) % images.length);
          }
        }}
        onPrev={() => {
          if (activePhotoIndex !== null) {
            setActivePhotoIndex((activePhotoIndex - 1 + images.length) % images.length);
          }
        }}
      />
    </main>
  );
}

