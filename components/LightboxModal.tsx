'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function LightboxModal({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose, onNext, onPrev]);

  if (!Array.isArray(images) || images.length === 0 || currentIndex === null || !images[currentIndex]) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Header */}
      <div
        className="w-full flex justify-between items-center z-10 max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs sm:text-sm font-semibold text-[#C9A227] tracking-widest uppercase">
          Dokumentasi ({currentIndex + 1} dari {images.length})
        </span>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-[#C9A227] text-white hover:text-[#0d1c32] transition-all"
          aria-label="Tutup preview"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`Dokumentasi foto ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[70vh] object-contain rounded-xl border border-[#C9A227]/30 shadow-2xl transition-all duration-300"
        />

        {/* Prev Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#C9A227] text-white hover:text-[#0d1c32] border border-[#C9A227]/40 transition-all shadow-xl"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#C9A227] text-white hover:text-[#0d1c32] border border-[#C9A227]/40 transition-all shadow-xl"
            aria-label="Foto selanjutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="w-full max-w-4xl overflow-x-auto py-2 flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => {
                const diff = idx - currentIndex;
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) onNext();
                } else if (diff < 0) {
                  for (let i = 0; i < Math.abs(diff); i++) onPrev();
                }
              }}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                idx === currentIndex
                  ? 'border-[#C9A227] ring-2 ring-[#C9A227]/50 scale-105'
                  : 'border-white/20 opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

