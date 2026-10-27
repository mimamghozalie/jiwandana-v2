import React from 'react';
import type { Metadata } from 'next';
import PembayaranSilatClient from './PembayaranSilatClient';

export const metadata: Metadata = {
  title: 'Pembayaran Kontingen Pencak Silat DSC 2026 - JIWANDANA',
  description:
    'Selesaikan pembayaran pendaftaran kontingen dan atlet Pencak Silat DSC 2026 melalui QRIS dan Virtual Account Pakasir.',
};

export default function PembayaranSilatPage() {
  return <PembayaranSilatClient />;
}
