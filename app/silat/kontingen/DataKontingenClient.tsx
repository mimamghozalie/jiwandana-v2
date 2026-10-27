'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { OfficialItem, AtletItem } from '@/components/silat/types';
import SilatDualBackground from '@/components/silat/SilatDualBackground';
import SilatSponsorPillar from '@/components/silat/SilatSponsorPillar';
import OfficialTable from '@/components/silat/kontingen/OfficialTable';
import AtletTable from '@/components/silat/kontingen/AtletTable';
import ModalAddOfficial from '@/components/silat/kontingen/ModalAddOfficial';
import ModalAddAtlet from '@/components/silat/kontingen/ModalAddAtlet';

export default function DataKontingenClient() {
  // State Lists
  const [officials, setOfficials] = useState<OfficialItem[]>([]);
  const [atlets, setAtlets] = useState<AtletItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal Visibility States
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [isAtletModalOpen, setIsAtletModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedOfficials = localStorage.getItem('silat_officials');
      if (savedOfficials) {
        setOfficials(JSON.parse(savedOfficials));
      }
      const savedAtlets = localStorage.getItem('silat_atlets');
      if (savedAtlets) {
        setAtlets(JSON.parse(savedAtlets));
      }
    } catch (e) {
      console.error('Failed to load silat data from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('silat_officials', JSON.stringify(officials));
    } catch (e) {
      console.error('Failed to save officials to localStorage:', e);
    }
  }, [officials, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('silat_atlets', JSON.stringify(atlets));
    } catch (e) {
      console.error('Failed to save atlets to localStorage:', e);
    }
  }, [atlets, isLoaded]);

  // Handler Tambah & Hapus Official
  const handleSaveOfficial = (data: Omit<OfficialItem, 'id'>) => {
    const newOfficial: OfficialItem = {
      id: `OFF-${Date.now()}-${String(officials.length + 1).padStart(2, '0')}`,
      ...data,
    };
    setOfficials((prev) => [...prev, newOfficial]);
    setIsOfficialModalOpen(false);
  };

  const handleDeleteOfficial = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus official ini?')) {
      setOfficials((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Handler Tambah & Hapus Atlet
  const handleSaveAtlet = (data: Omit<AtletItem, 'id'>) => {
    const newAtlet: AtletItem = {
      id: `ATL-${Date.now()}-${String(atlets.length + 1).padStart(2, '0')}`,
      ...data,
    };
    setAtlets((prev) => [...prev, newAtlet]);
    setIsAtletModalOpen(false);
  };

  const handleDeleteAtlet = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data atlet ini?')) {
      setAtlets((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 selection:bg-[#00e5ff]/30 selection:text-slate-950 font-sans">
      {/* 1. DUAL RESPONSIVE BACKGROUND */}
      <SilatDualBackground />

      {/* 2. MAIN CONTENT AREA */}
      <main className="relative z-10 pt-24 sm:pt-28 md:pt-36 lg:pt-40 pb-16 px-3 sm:px-6 max-w-7xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-2rem)]">
        {/* MIDDLE SECTION:
            [ PILAR SPONSOR KIRI ] - [ WATERMARK 9 ATLET + 2 TABEL ] - [ PILAR SPONSOR KANAN ] */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start my-auto">
          {/* PILAR KIRI: SPONSORSHIP PINK PASTEL */}
          <SilatSponsorPillar variant="pink" />

          {/* AREA TENGAH: WATERMARK 9 PESILAT DI BELAKANG DUA TABEL */}
          <div className="md:col-span-8 relative flex flex-col items-center justify-center w-full space-y-8">
            {/* Watermark 9 Pesilat management_atlit.png */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <div className="relative w-full max-w-[560px] h-[460px] opacity-35 sm:opacity-45">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/silat/management_atlit.png"
                  alt="Pesilat Kontingen Watermark"
                  className="w-full h-full object-contain filter contrast-110"
                />
              </div>
            </div>

            {/* TABEL 1: DATA OFFICIAL */}
            <OfficialTable
              officials={officials}
              onOpenModal={() => setIsOfficialModalOpen(true)}
              onDelete={handleDeleteOfficial}
            />

            {/* TABEL 2: DATA ATLET */}
            <AtletTable
              atlets={atlets}
              onOpenModal={() => setIsAtletModalOpen(true)}
              onDelete={handleDeleteAtlet}
            />
          </div>

          {/* PILAR KANAN: SPONSORSHIP CYAN/TOSCA PASTEL */}
          <SilatSponsorPillar variant="tosca" />
        </div>

        {/* BOTTOM SECTION: NAVIGASI KEMBALI */}
        <div className="w-full flex items-center justify-center mt-6">
          <Link
            href="/silat"
            className="text-xs font-semibold text-slate-500 hover:text-[#0088cc] transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Beranda Silat</span>
          </Link>
        </div>
      </main>

      {/* 3. MODALS FORM TAMBAH DATA */}
      <ModalAddOfficial
        isOpen={isOfficialModalOpen}
        onClose={() => setIsOfficialModalOpen(false)}
        onSave={handleSaveOfficial}
      />

      <ModalAddAtlet
        isOpen={isAtletModalOpen}
        onClose={() => setIsAtletModalOpen(false)}
        onSave={handleSaveAtlet}
      />
    </div>
  );
}
