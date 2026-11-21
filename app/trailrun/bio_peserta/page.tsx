import { Suspense } from 'react';
import { Metadata } from 'next';
import BioPesertaClient from './BioPesertaClient';
import { RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Biodata Medis & Emergency RS',
  description: 'Clean page biodata medis, triase darurat, dan informasi NIK/KK untuk Rumah Sakit & Tim Medis IGD.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BioPesertaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <RefreshCw className="w-5 h-5 text-rose-600 animate-spin" />
            <span>Memuat Rekam Medis Peserta...</span>
          </div>
        </div>
      }
    >
      <BioPesertaClient />
    </Suspense>
  );
}
