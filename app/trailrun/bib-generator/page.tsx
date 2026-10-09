import { Suspense } from 'react';
import { Metadata } from 'next';
import BibGeneratorClient from './BibGeneratorClient';

export const metadata: Metadata = {
  title: 'Generator Nomor BIB Resmi - PATAS Trailrun 12K',
  description: 'Aplikasi generate, kustomisasi nomor BIB, nama pelari, dan download kartu BIB resolusi tinggi siap cetak.',
};

export default function BibGeneratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1017] flex items-center justify-center text-white">Memuat Generator BIB...</div>}>
      <BibGeneratorClient />
    </Suspense>
  );
}

