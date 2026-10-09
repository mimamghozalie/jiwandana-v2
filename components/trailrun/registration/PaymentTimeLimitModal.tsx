'use client';

import React from 'react';
import { AlertTriangle, Clock, X, ShieldAlert, Check } from 'lucide-react';

interface PaymentTimeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentTimeLimitModal({
  isOpen,
  onClose,
}: PaymentTimeLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-amber-500 shadow-2xl overflow-hidden animate-[scaleUp_0.25s_ease-out] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner with Alert Color */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 p-5 sm:p-6 text-white relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                <Clock className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-rose-700 font-extrabold text-[10px] uppercase tracking-wider mb-1 shadow-xs">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Perhatian Penting</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
                  Batas Waktu Pembayaran 1 Jam
                </h3>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Primary Alert Callout Box */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-extrabold text-rose-900 leading-snug">
                Pembayaran wajib dilakukan dalam waktu 1 jam!
              </h4>
              <p className="text-xs text-rose-700 leading-relaxed font-medium">
                Pendaftaran akan <strong>otomatis dihapus dan dibatalkan</strong> jika pembayaran tidak diselesaikan dalam 1 jam setelah pengisian formulir.
              </p>
            </div>
          </div>

          {/* Key Information Points */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  Batas Waktu Transaksi 60 Menit
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                  Kode QRIS atau Nomor Virtual Account hanya aktif selama 1 jam sejak tagihan dibuat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  Nomor BIB & Slot Kuota Dilepas
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                  Jika waktu habis, slot nomor BIB Anda akan otomatis terbuka kembali untuk pendaftar lain.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  Sistem First-Pay-First-Served
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                  Harga promo Early Bird & kuota kategori dijamin aman setelah pembayaran berhasil diverifikasi.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Dismiss Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-5 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saya Mengerti & Lanjutkan Pendaftaran</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Klik tombol di atas untuk melanjutkan pengisian data pendaftaran.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
