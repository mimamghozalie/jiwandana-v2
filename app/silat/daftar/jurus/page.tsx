import React from 'react';
import type { Metadata } from 'next';
import SilatCategoryFormPage from '@/components/silat/SilatCategoryFormPage';

export const metadata: Metadata = {
  title: 'Pendaftaran Kategori Jurus & Festival - DSC 2026',
  description:
    'Formulir pendaftaran atlet kategori Jurus & Festival (Seni Tunggal, Ganda, Regu) Kejuaraan Pencak Silat DSC 2026 Se-Jawa Timur.',
};

export default function DaftarJurusPage() {
  return (
    <SilatCategoryFormPage
      type="jurus"
      title="KATEGORI JURUS & FESTIVAL"
      athleteImage="/assets/silat/tgr_festival.png"
    />
  );
}
