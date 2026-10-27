import React from 'react';
import type { Metadata } from 'next';
import SilatCategoryFormPage from '@/components/silat/SilatCategoryFormPage';

export const metadata: Metadata = {
  title: 'Pendaftaran Kategori Tanding & Silat Bebas - DSC 2026',
  description:
    'Formulir pendaftaran atlet kategori Tanding & Silat Bebas Kejuaraan Pencak Silat DSC 2026 Se-Jawa Timur.',
};

export default function DaftarTandingPage() {
  return (
    <SilatCategoryFormPage
      type="tanding"
      title="KATEGORI TANDING & SILAT BEBAS"
      athleteImage="/assets/silat/fight.png"
    />
  );
}
