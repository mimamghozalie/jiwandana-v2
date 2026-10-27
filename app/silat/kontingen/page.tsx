import React from 'react';
import type { Metadata } from 'next';
import DataKontingenClient from './DataKontingenClient';

export const metadata: Metadata = {
  title: 'Data Kontingen (Official & Atlet) - Pencak Silat DSC 2026',
  description:
    'Manajemen data kontingen kejuaraan Pencak Silat DSC 2026. Entri dan verifikasi data Official dan Atlet tanding maupun seni.',
};

export default function KontingenPage() {
  return <DataKontingenClient />;
}
