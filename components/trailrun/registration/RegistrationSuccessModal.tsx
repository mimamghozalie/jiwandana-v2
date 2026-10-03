'use client';

import React from 'react';
import Link from 'next/link';
import { TrailrunCard } from '@/lib/types';
import { formatCurrency } from './types';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  name?: string;
  phone?: string;
  bibNumber?: string;
  orderId?: string;
  totalPayment?: number;
  email?: string;
  selectedCategory?: TrailrunCard;
  onReset: () => void;
}

export default function RegistrationSuccessModal({
  isOpen,
  name,
  phone,
  bibNumber,
  orderId,
  totalPayment,
  email,
  selectedCategory,
  onReset,
}: RegistrationSuccessModalProps) {
  if (!isOpen) return null;

  const rawPhone = phone || '';
  const cleanPhone = rawPhone.replace(/^0/, '62').replace(/[^0-9]/g, '');

  const categoryTitle = selectedCategory
    ? `${selectedCategory.categoryName} (${selectedCategory.distance})`
    : 'Trailrun Lintas Candi 2026';

  // Format pesan WhatsApp resmi konfirmasi pembayaran & pendaftaran
  const waLines = [
    `*BUKTI PENDAFTARAN & PEMBAYARAN RESMI*`,
    `*TRAILRUN LINTAS CANDI 2026*`,
    `----------------------------------------`,
    `Halo *${name || 'Peserta'}*, pendaftaran dan pembayaran Anda telah *BERHASIL (LUNAS)*!`,
    ``,
    `📋 *Rincian Peserta:*`,
    `• Nama: *${name || '-'}*`,
    `• No. BIB: *${bibNumber || '-'}*`,
    `• Kategori: *${categoryTitle}*`,
    `• No. WhatsApp: *${phone || '-'}*`,
  ];

  if (orderId) {
    waLines.push(`• Order ID: *${orderId}*`);
  }
  if (totalPayment) {
    waLines.push(`• Total Bayar: *${formatCurrency(totalPayment)}*`);
  }
  waLines.push(`• Status: *LUNAS (PAID)* ✅`);
  waLines.push(``);
  waLines.push(`Simpan bukti WhatsApp ini saat registrasi ulang / pengambilan Race Pack & Technical Meeting.`);
  waLines.push(`Terima kasih dan sampai jumpa di garis start! 🏃‍♂️⛰️`);

  const waMessage = waLines.join('\n');
  const targetWaNumber = cleanPhone || '6282171914989';
  const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waMessage)}`;
  const panitiaWaUrl = `https://wa.me/6282171914989?text=${encodeURIComponent(
    `Halo Panitia Trailrun Lintas Candi, saya ${name || 'peserta'} (BIB: ${bibNumber || '-'}, Order: ${orderId || '-'}), ingin konfirmasi bukti pendaftaran.`
  )}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-[fadeIn_0.3s_ease-out] max-h-[95vh] overflow-y-auto">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-500 text-3xl sm:text-4xl">check_circle</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold font-serif text-slate-900">Pembayaran Berhasil!</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pendaftaran dan pembayaran Anda telah berhasil dikonfirmasi. Informasi bukti pendaftaran dan jadwal race pack
            dikirimkan ke nomor WhatsApp{' '}
            <strong className="text-slate-900 font-semibold">{phone || 'Anda'}</strong>.
          </p>
        </div>

        {/* Detail Ringkasan Peserta & BIB */}
        <div className="bg-[#f8f8f8] rounded-xl p-4 text-sm border border-black/5 text-left space-y-2.5">
          {selectedCategory && (
            <div className="flex justify-between items-center pb-2.5 border-b border-black/5">
              <div>
                <div className="font-bold text-slate-900 text-sm">{selectedCategory.categoryName}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedCategory.distance} • {selectedCategory.elevationGain}
                </div>
              </div>
              {bibNumber && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">No. BIB</span>
                  <span className="font-mono font-bold text-amber-600 text-sm sm:text-base">{bibNumber}</span>
                </div>
              )}
            </div>
          )}

          <div className="text-xs space-y-1.5 text-slate-600">
            {name && (
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Peserta:</span>
                <span className="font-semibold text-slate-800">{name}</span>
              </div>
            )}
            {phone && (
              <div className="flex justify-between">
                <span className="text-slate-500">No. WhatsApp:</span>
                <span className="font-semibold text-emerald-600">{phone}</span>
              </div>
            )}
            {orderId && (
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono text-slate-700">{orderId}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1.5 border-t border-black/5">
              <span className="text-slate-500">Status:</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                Lunas (Paid)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          {bibNumber && (
            <Link
              href={`/trailrun/peserta?no_bib=${encodeURIComponent(bibNumber)}`}
              className="w-full bg-[#0d1c32] hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-xs sm:text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base text-[#C9A227]">qr_code_2</span>
              <span>Lihat E-BIB & QR Code Peserta</span>
            </Link>
          )}

          <Link
            href="/trailrun"
            className="w-full bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-3 rounded-xl transition-colors text-xs sm:text-sm uppercase tracking-wider shadow-sm text-center"
          >
            Kembali ke Halaman Trailrun
          </Link>

          <button
            type="button"
            onClick={onReset}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
          >
            Daftarkan Peserta Lain
          </button>
        </div>

        <div className="pt-1 text-center">
          <a
            href={panitiaWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <span>Butuh bantuan panitia?</span>
            <span className="font-semibold underline">Chat CS WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
