'use client';

import React from 'react';
import Link from 'next/link';
import { TrailrunCard } from '@/lib/types';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  email: string;
  selectedCategory?: TrailrunCard;
  onReset: () => void;
}

export default function RegistrationSuccessModal({
  isOpen,
  email,
  selectedCategory,
  onReset,
}: RegistrationSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white border border-black/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-[fadeIn_0.3s_ease-out]">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="relative w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold font-serif text-slate-900">Pembayaran Berhasil!</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pendaftaran dan pembayaran Anda telah berhasil dikonfirmasi. Silakan cek email <strong>{email}</strong> untuk
            informasi race pack dan technical meeting.
          </p>
        </div>

        {selectedCategory && (
          <div className="bg-[#f8f8f8] rounded-xl p-4 text-sm border border-black/5">
            <div className="font-bold text-slate-900">{selectedCategory.categoryName}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {selectedCategory.distance} • {selectedCategory.elevationGain}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Link
            href="/trailrun"
            className="w-full bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-3 rounded-xl transition-colors text-sm uppercase tracking-wider shadow-sm text-center"
          >
            Kembali ke Halaman Trailrun
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm uppercase tracking-wider cursor-pointer"
          >
            Daftarkan Peserta Lain
          </button>
        </div>
      </div>
    </div>
  );
}
