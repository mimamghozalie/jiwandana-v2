import React from 'react';
import type { Metadata } from 'next';
import DaftarSilatHubClient from './DaftarSilatHubClient';

export const metadata: Metadata = {
  title: 'Pendaftaran Kejuaraan Pencak Silat DSC 2026 - JIWANDANA',
  description:
    'Pilih Kategori Tanding & Silat Bebas atau Kategori Jurus & Festival. Daftarkan atlet kontingen dan selesaikan pembayaran.',
  keywords: [
    'pendaftaran pencak silat',
    'kategori tanding silat',
    'kategori jurus festival silat',
    'silat bebas',
    'dsc 2026',
    'jiwandana silat',
  ],
  openGraph: {
    title: 'Pendaftaran Pencak Silat DSC 2026 - JIWANDANA',
    description: 'Pilih kategori pertandingan atlet kontingen Anda sekarang!',
    images: ['/assets/silat/fight.png'],
  },
};

export default function DaftarSilatPage() {
  return <DaftarSilatHubClient />;
}
