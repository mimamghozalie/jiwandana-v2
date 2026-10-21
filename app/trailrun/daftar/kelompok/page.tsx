import React, { Suspense } from 'react';
import KelompokClient from './KelompokClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pendaftaran Kolektif / Rombongan Komunitas Trailrun - JIWANDANA',
  description:
    'Formulir pendaftaran rombongan komunitas (5 - 20 peserta) Trailrun Lintas Candi Majapahit via file Excel. Tarif Pre-Sale terkunci dan diskon otomatis Rp 320.000 / 10 peserta.',
  keywords: [
    'daftar kelompok trailrun',
    'pendaftaran kolektif trail run',
    'trailrun komunitas',
    'trail run rombongan',
    'jiwandana trailrun bulk registration',
  ],
  openGraph: {
    title: 'Pendaftaran Kolektif Trailrun Lintas Candi Majapahit - JIWANDANA',
    description:
      'Daftarkan komunitas / rombongan Anda untuk Trailrun Lintas Candi Majapahit via file Excel (5-20 orang).',
    images: ['/assets/jiwandana_trailrun_1.jpeg'],
  },
};

export default function DaftarKelompokPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#C9A227] animate-spin">
              progress_activity
            </span>
            <span className="text-sm text-slate-500 font-medium">Memuat formulir kolektif...</span>
          </div>
        </div>
      }
    >
      <KelompokClient />
    </Suspense>
  );
}
