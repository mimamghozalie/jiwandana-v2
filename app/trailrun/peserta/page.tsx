import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import PesertaClient from './PesertaClient';

export const metadata: Metadata = {
  title: 'Detail & Verifikasi Peserta Trailrun Lintas Candi - JIWANDANA',
  description:
    'Halaman verifikasi resmi nomor BIB, identitas pelari, dan e-pass QR Code peserta Trailrun Lintas Candi 2026.',
  keywords: [
    'peserta trailrun',
    'verifikasi bib trailrun',
    'qr code peserta',
    'e-bib trailrun lintas candi',
    'jiwandana trail run',
  ],
  openGraph: {
    title: 'Detail & Verifikasi Peserta Trailrun Lintas Candi - JIWANDANA',
    description: 'Verifikasi resmi nomor BIB dan data peserta Trailrun Lintas Candi 2026.',
    images: ['/assets/jiwandana_trailrun_1.jpeg'],
  },
};

export default function PesertaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center pt-24 pb-16 px-4">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#C9A227] animate-spin">
              progress_activity
            </span>
            <span className="text-sm text-slate-500 font-medium">Memuat data peserta...</span>
          </div>
        </div>
      }
    >
      <PesertaClient />
    </Suspense>
  );
}
