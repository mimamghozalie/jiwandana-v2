import React, { Suspense } from 'react';
import DaftarTrailrunClient from './DaftarTrailrunClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Trailrun Lintas Candi Majapahit - JIWANDANA',
  description:
    'Formulir pendaftaran peserta Trailrun Lintas Candi Majapahit. Isi data diri, pilih kategori lomba (3K, 7K, 12K), dan daftarkan diri Anda sekarang.',
  keywords: [
    'daftar trailrun',
    'pendaftaran trail run',
    'trailrun majapahit',
    'trail run mojokerto',
    'daftar lomba lari',
    'jiwandana trailrun registration',
  ],
  openGraph: {
    title: 'Daftar Trailrun Lintas Candi Majapahit - JIWANDANA',
    description:
      'Daftarkan diri Anda untuk Trailrun Lintas Candi Majapahit. Pilih kategori 3K, 7K, atau 12K.',
    images: ['/assets/jiwandana_trailrun_1.jpeg'],
  },
};

export default function DaftarTrailrunPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#C9A227] animate-spin">
              progress_activity
            </span>
            <span className="text-sm text-slate-500 font-medium">Memuat formulir...</span>
          </div>
        </div>
      }
    >
      <DaftarTrailrunClient />
    </Suspense>
  );
}
