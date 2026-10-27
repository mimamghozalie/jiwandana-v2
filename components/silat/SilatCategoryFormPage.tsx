'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AtletItem } from '@/components/silat/types';
import SilatDualBackground from '@/components/silat/SilatDualBackground';
import SilatSponsorPillar from '@/components/silat/SilatSponsorPillar';
import AtletTable from '@/components/silat/kontingen/AtletTable';
import ModalAddAtlet from '@/components/silat/kontingen/ModalAddAtlet';

interface SilatCategoryFormPageProps {
  type: 'tanding' | 'jurus';
  title: string;
  athleteImage: string;
}

export default function SilatCategoryFormPage({
  type,
  title,
  athleteImage,
}: SilatCategoryFormPageProps) {
  const [atlets, setAtlets] = useState<AtletItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtlet, setEditingAtlet] = useState<AtletItem | null>(null);

  // Kategori yang dihandle halaman ini (Dikelompokkan sesuai Hub Pendaftaran)
  const allowedCategories =
    type === 'tanding' ? ['Tanding', 'Silat Bebas'] : ['Tunggal Ganda Regu', 'Silat Festival'];
  const defaultCategory = allowedCategories[0];

  // Load data atlet dari localStorage
  useEffect(() => {
    try {
      const atletsRaw = localStorage.getItem('silat_atlets');
      if (atletsRaw) {
        setAtlets(JSON.parse(atletsRaw));
      }
    } catch (e) {
      console.error('Error loading silat_atlets from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Simpan kembali ke localStorage jika ada penambahan atau penghapusan atlet
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('silat_atlets', JSON.stringify(atlets));
    } catch (e) {
      console.error('Error saving silat_atlets to localStorage:', e);
    }
  }, [atlets, isLoaded]);

  // Handler Tambah/Edit Atlet
  const handleOpenAddAtlet = () => {
    setEditingAtlet(null);
    setIsModalOpen(true);
  };

  const handleOpenEditAtlet = (item: AtletItem) => {
    setEditingAtlet(item);
    setIsModalOpen(true);
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
    setIsModalOpen(false);
    setEditingAtlet(null);
  };

  // Handler Hapus Atlet
  const handleDeleteAtlet = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus atlet ini?')) {
      setAtlets((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 selection:bg-[#00e5ff]/30 selection:text-slate-950 font-sans">
      {/* 1. DUAL RESPONSIVE BACKGROUND */}
      <SilatDualBackground />

      {/* 2. MAIN CONTENT AREA */}
      <main className="relative z-10 pt-24 sm:pt-28 md:pt-36 lg:pt-40 pb-16 px-3 sm:px-6 max-w-7xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-2rem)]">
        
        {/* TOP: BADGE JUDUL BESAR */}
        <div className="w-full text-center mb-4 sm:mb-6">
          <div className="inline-block py-3 sm:py-3.5 px-6 sm:px-12 bg-gradient-to-r from-[#00d2ff] via-[#00b4d8] to-[#0099ff] text-white font-black text-sm sm:text-lg md:text-xl tracking-wider uppercase rounded-2xl shadow-lg shadow-cyan-500/25 border-2 border-white">
            {title}
          </div>
        </div>

        {/* MIDDLE SECTION:
            [ PILAR SPONSOR KIRI ] - [ WATERMARK ATLET + TABEL PESERTA ] - [ PILAR SPONSOR KANAN ] */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start my-auto">
          {/* PILAR KIRI: SPONSORSHIP PINK PASTEL */}
          <SilatSponsorPillar variant="pink" height="h-[480px] lg:h-[540px]" />

          {/* AREA TENGAH: WATERMARK ATLET DI BELAKANG TABEL + TABEL PESERTA SESUAI KONTINGEN */}
          <div className="md:col-span-8 relative flex flex-col items-center justify-center w-full space-y-6">
            
            {/* Watermark Atlet (fight.png untuk Tanding, tgr_festival.png untuk Jurus) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <div className="relative w-full max-w-[520px] h-[400px] opacity-30 sm:opacity-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={athleteImage}
                  alt={title}
                  className="w-full h-full object-contain filter contrast-110"
                />
              </div>
            </div>

            {/* TABEL DATA ATLET KATEGORI SPESIFIK */}
            <AtletTable
              atlets={atlets}
              title={`DATA ATLET (${allowedCategories.join(' & ').toUpperCase()})`}
              defaultCategory="Semua"
              allowedCategories={allowedCategories}
              hideCategoryFilter={false}
              onOpenModal={handleOpenAddAtlet}
              onEdit={handleOpenEditAtlet}
              onDelete={handleDeleteAtlet}
            />
          </div>

          {/* PILAR KANAN: SPONSORSHIP CYAN/TOSCA PASTEL */}
          <SilatSponsorPillar variant="tosca" height="h-[480px] lg:h-[540px]" />
        </div>

        {/* BOTTOM SECTION: 2 TOMBOL BESAR OKE & KELOLA KONTINGEN / KEMBALI */}
        <div className="w-full flex flex-col items-center justify-center mt-6 sm:mt-8 space-y-3">
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-md">
            {/* 1. TOMBOL OKE (HIJAU SOLID) - Kembali ke Hub Pendaftaran */}
            <Link
              href="/silat/daftar"
              className="flex-1 py-3.5 sm:py-4 px-6 sm:px-10 bg-gradient-to-r from-[#00e676] to-[#00c853] hover:from-[#00d46d] hover:to-[#00b34a] text-white font-black text-xl sm:text-2xl tracking-widest uppercase rounded-2xl shadow-xl shadow-emerald-500/30 border-2 border-white transform hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none block"
            >
              OKE
            </Link>

            {/* 2. TOMBOL DATA KONTINGEN (CYAN) */}
            <Link
              href="/silat/kontingen"
              className="flex-1 py-3.5 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#009ec3] hover:to-[#00669e] text-white font-black text-base sm:text-lg tracking-wider uppercase rounded-2xl shadow-xl shadow-cyan-500/30 border-2 border-white transform hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none flex items-center justify-center"
            >
              KONTINGEN
            </Link>
          </div>

          {/* Navigasi Kembali ke Hub Pendaftaran */}
          <div className="pt-2">
            <Link
              href="/silat/daftar"
              className="text-xs font-semibold text-slate-500 hover:text-[#0088cc] transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Kembali ke Pilihan Kategori Silat</span>
            </Link>
          </div>
        </div>

      </main>

      {/* MODAL DIALOG FORM TAMBAH / EDIT ATLET */}
      <ModalAddAtlet
        isOpen={isModalOpen}
        defaultCategory={defaultCategory}
        allowedCategories={allowedCategories}
        initialData={editingAtlet}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAtlet(null);
        }}
        onSave={handleSaveAtlet}
      />
    </div>
  );
}
