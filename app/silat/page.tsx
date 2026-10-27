import React from 'react';
import type { Metadata } from 'next';
import SilatClient from './SilatClient';

export const metadata: Metadata = {
  title: 'Kejuaraan Pencak Silat DSC 2026 - JIWANDANA x IPSI x SMA Islam Diponegoro',
  description:
    'Kejuaraan Pencak Silat bergengsi tingkat pelajar dan umum se-Jawa Timur. Kolaborasi resmi IPSI, KONI, SMA Islam Diponegoro Gondang, dan JIWANDANA Event Organizer.',
  keywords: [
    'kejuaraan pencak silat',
    'pencak silat mojokerto',
    'silat jawa timur',
    'diponegoro sport competition',
    'dsc 2026',
    'ipsi',
    'koni',
    'jiwandana silat',
    'pendaftaran silat',
    'kejuaraan silat pelajar',
  ],
  openGraph: {
    title: 'Kejuaraan Pencak Silat DSC 2026 - JIWANDANA x IPSI',
    description:
      'Ajang prestasi beladiri warisan nusantara tingkat pelajar dan umum. Daftar sekarang dan raih medali kehormatan!',
    images: ['/assets/silat/bg_silat_pc.png'],
  },
};

export default function SilatPage() {
  return <SilatClient />;
}
