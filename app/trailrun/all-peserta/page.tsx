import { Suspense } from 'react';
import { Metadata } from 'next';
import AllPesertaClient from './AllPesertaClient';
import { RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Daftar Seluruh Peserta | Trailrun Lintas Candi Majapahit 2026',
  description:
    'Daftar lengkap peserta resmi Trailrun Lintas Candi Majapahit 2026. Periksa nomor BIB, nama lengkap, dan kategori lari.',
  openGraph: {
    title: 'Daftar Seluruh Peserta - Trailrun Lintas Candi Majapahit 2026',
    description: 'Daftar lengkap peserta resmi Trailrun Lintas Candi Majapahit 2026.',
  },
};

export default function AllPesertaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f8f8] pt-28 sm:pt-32 pb-20 flex items-center justify-center p-6 text-slate-600">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <RefreshCw className="w-5 h-5 text-[#C9A227] animate-spin" />
            <span>Memuat Daftar Peserta...</span>
          </div>
        </div>
      }
    >
      <AllPesertaClient />
    </Suspense>
  );
}
