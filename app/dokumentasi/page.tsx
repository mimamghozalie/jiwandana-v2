import React from 'react';
import DokumentasiClient from './DokumentasiClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dokumentasi - JIWANDANA Event Organizer',
  description:
    'Dokumentasi visual serta rekaman kesuksesan event-event prestisius yang telah kami kelola secara profesional.',
  keywords: ['dokumentasi event', 'galeri eo', 'foto event organizer', 'video sinematik event', 'JIWANDANA'],
};

export default function DokumentasiPage() {
  return <DokumentasiClient />;
}
