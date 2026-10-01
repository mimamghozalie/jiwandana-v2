import React from 'react';
import type { Metadata } from 'next';
import InformasiEventView from '@/components/InformasiEventView';
import { getEvents } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Informasi Event - JIWANDANA Event Organizer',
  description:
    'Informasi lengkap jadwal event terdekat, acara mendatang, serta daftar kategori perlombaan dan festival yang dikelola oleh JIWANDANA Event Organizer.',
};

export const revalidate = 0;

export default async function InformasiEventPage() {
  const events = await getEvents();
  return <InformasiEventView initialEvents={events} />;
}

