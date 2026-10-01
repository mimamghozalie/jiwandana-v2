import React from 'react';
import type { Metadata } from 'next';
import InformasiEventView from '@/components/InformasiEventView';

export const metadata: Metadata = {
  title: 'Informasi Event - JIWANDANA Event Organizer',
  description:
    'Informasi lengkap jadwal event terdekat, acara mendatang, serta daftar kategori perlombaan dan festival yang dikelola oleh JIWANDANA Event Organizer.',
};

export default function InformasiEventPage() {
  return <InformasiEventView />;
}
