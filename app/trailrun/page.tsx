import React from 'react';
import TrailrunClient from './TrailrunClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trailrun Lintas Candi Majapahit - JIWANDANA Event Organizer',
  description:
    'Kompetisi lari lintas alam bersejarah menyusuri situs purbakala Majapahit. Dapatkan informasi kategori 5K, 10K, 21K, harga tiket, fasilitas, peta rute, dan profil elevasi.',
  keywords: [
    'trail run',
    'trailrun mojokerto',
    'lari lintas candi',
    'trail run majapahit',
    'jiwandana trail run',
    'tiket trail run',
    'rute dan elevasi trail run',
  ],
  openGraph: {
    title: 'Trailrun Lintas Candi Majapahit - JIWANDANA',
    description:
      'Tantang diri Anda melintasi rute alam dan cagar budaya Majapahit. Kategori 5K, 10K, & 21K dengan standar race management profesional.',
    images: ['/assets/jiwandana_trailrun_1.jpeg'],
  },
};

export default function TrailrunPage() {
  return <TrailrunClient />;
}
