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

  // Modal Visibility & Editing States
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<OfficialItem | null>(null);

  const [isAtletModalOpen, setIsAtletModalOpen] = useState(false);
  const [editingAtlet, setEditingAtlet] = useState<AtletItem | null>(null);

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

  // Handler Tambah/Edit & Hapus Official
  const handleOpenAddOfficial = () => {
    setEditingOfficial(null);
    setIsOfficialModalOpen(true);
  };

  const handleOpenEditOfficial = (item: OfficialItem) => {
    setEditingOfficial(item);
    setIsOfficialModalOpen(true);
  };

  const handleSaveOfficial = (data: Omit<OfficialItem, 'id'>, id?: string) => {
    if (id) {
      // Mode Edit
      setOfficials((prev) =>
        prev.map((item) => (item.id === id ? { ...data, id } : item))
      );
    } else {
      // Mode Tambah Baru
      const newOfficial: OfficialItem = {
        id: `OFF-${Date.now()}-${String(officials.length + 1).padStart(2, '0')}`,
        ...data,
      };
      setOfficials((prev) => [...prev, newOfficial]);
    }
    setIsOfficialModalOpen(false);
    setEditingOfficial(null);
  };

  const handleDeleteOfficial = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus official ini?')) {
      setOfficials((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Handler Tambah/Edit & Hapus Atlet
  const handleOpenAddAtlet = () => {
    setEditingAtlet(null);
    setIsAtletModalOpen(true);
  };

  const handleOpenEditAtlet = (item: AtletItem) => {
    setEditingAtlet(item);
    setIsAtletModalOpen(true);
  };

  const handleSaveAtlet = (data: Omit<AtletItem, 'id'>, id?: string) => {
    if (id) {
      // Mode Edit
      setAtlets((prev) =>
        prev.map((item) => (item.id === id ? { ...data, id } : item))
      );
    } else {
      // Mode Tambah Baru
      const newAtlet: AtletItem = {
        id: `ATL-${Date.now()}-${String(atlets.length + 1).padStart(2, '0')}`,
        ...data,
      };
      setAtlets((prev) => [...prev, newAtlet]);
    }
    setIsAtletModalOpen(false);
    setEditingAtlet(null);
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
              onOpenModal={handleOpenAddOfficial}
              onEdit={handleOpenEditOfficial}
              onDelete={handleDeleteOfficial}
            />

            {/* TABEL 2: DATA ATLET */}
            <AtletTable
              atlets={atlets}
              onOpenModal={handleOpenAddAtlet}
              onEdit={handleOpenEditAtlet}
              onDelete={handleDeleteAtlet}
            />

            {/* BOTTOM SECTION: TOMBOL LINK KE PAGE DAFTAR & NAVIGASI KEMBALI */}
            <div className="w-full flex flex-col items-center justify-center sm:mt-8 space-y-3">
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-md">
                {/* Tombol Utama: KE HALAMAN PENDAFTARAN */}
                <Link
                  href="/silat/daftar"
                  className="flex-1 py-3.5 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-[#00d2ff] via-[#00b4d8] to-[#0099ff] hover:from-[#00c5ee] hover:to-[#0088ee] text-white font-black text-base sm:text-xl tracking-wider uppercase rounded-2xl shadow-xl shadow-cyan-500/30 border-2 border-white transform hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none flex items-center justify-center gap-2"
                >
                  <span>PENDAFTARAN</span>
                  <span className="material-symbols-outlined text-lg sm:text-xl">arrow_forward</span>
                </Link>
              </div>

            </div>
          </div>

          {/* PILAR KANAN: SPONSORSHIP CYAN/TOSCA PASTEL */}
          <SilatSponsorPillar variant="tosca" />
        </div>


      </main>

      {/* 3. MODALS FORM TAMBAH / EDIT DATA */}
      <ModalAddOfficial
        isOpen={isOfficialModalOpen}
        initialData={editingOfficial}
        onClose={() => {
          setIsOfficialModalOpen(false);
          setEditingOfficial(null);
        }}
        onSave={handleSaveOfficial}
      />

      <ModalAddAtlet
        isOpen={isAtletModalOpen}
        initialData={editingAtlet}
        onClose={() => {
          setIsAtletModalOpen(false);
          setEditingAtlet(null);
        }}
        onSave={handleSaveAtlet}
      />
    </div>
  );
}
