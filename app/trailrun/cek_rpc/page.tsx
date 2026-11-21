import { Suspense } from 'react';
import { Metadata } from 'next';
import CekRpcClient from './CekRpcClient';
import { RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cek Race Pack Collection',
  description: 'Verifikasi data penyerahan paket lomba (BIB & Jersey).',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CekRpcPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-[#f8f8f8] pt-28 sm:pt-32 pb-16 flex items-center justify-center p-6 text-slate-600">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <RefreshCw className="w-5 h-5 text-[#C9A227] animate-spin" />
            <span>Memverifikasi Race Pack...</span>
          </div>
        </div>
      }
    >
      <CekRpcClient />
    </Suspense>
  );
}
