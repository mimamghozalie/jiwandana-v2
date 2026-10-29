'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { AtletItem } from '@/components/silat/types';
import SilatDualBackground from '@/components/silat/SilatDualBackground';
import SilatSponsorPillar from '@/components/silat/SilatSponsorPillar';
import AtletTable from '@/components/silat/kontingen/AtletTable';
import ModalAddAtlet from '@/components/silat/kontingen/ModalAddAtlet';
import { useSilatAuth } from '@/components/silat/auth/useSilatAuth';
import ModalAuthKontingen from '@/components/silat/auth/ModalAuthKontingen';
import {
  User,
  ShieldCheck,
  ChevronDown,
  LogOut,
  CreditCard,
  Cloud,
  CloudCheck,
  Loader2,
} from 'lucide-react';

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
  // Auth Hook
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    logout,
  } = useSilatAuth();

  const [atlets, setAtlets] = useState<AtletItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtlet, setEditingAtlet] = useState<AtletItem | null>(null);

  // Profile Dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Kategori yang dihandle halaman ini (Dikelompokkan sesuai 11 Kategori Resmi)
  const allowedCategories =
    type === 'tanding'
      ? ['Tanding - Pemasalan', 'Tanding - Prestasi', 'Silat Bebas']
      : [
        'Jurus Baku Tunggal - Pemasalan',
        'Jurus Baku Tunggal - Prestasi',
        'Jurus Bebas - Pemasalan',
        'Jurus Bebas - Prestasi',
        'Silat Festival - Perorangan',
        'Silat Festival - Berpasangan',
        'Silat Festival - Berkelompok 3',
        'Silat Festival - Berkelompok 5',
      ];
  const defaultCategory = allowedCategories[0];

  // Fetch Cloud Data saat User Login
  const fetchCloudData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/silat/kontingen/data', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAtlets(data.atlets || []);
        localStorage.setItem('silat_atlets', JSON.stringify(data.atlets || []));
      }
    } catch (err) {
      console.error('Failed to fetch cloud silat data:', err);
    } finally {
      setIsSyncing(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCloudData();
    } else {
      setAtlets([]);
      try {
        localStorage.removeItem('silat_atlets');
      } catch {}
      setIsLoaded(true);
    }
  }, [isAuthenticated, fetchCloudData]);

  // Handler Tambah/Edit Atlet
  const handleOpenAddAtlet = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setEditingAtlet(null);
    setIsModalOpen(true);
  };

  const handleOpenEditAtlet = (item: AtletItem) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setEditingAtlet(item);
    setIsModalOpen(true);
  };

  const handleSaveAtlet = async (data: Omit<AtletItem, 'id'>, id?: string) => {
    setIsModalOpen(false);
    setEditingAtlet(null);

    if (isAuthenticated) {
      setIsSyncing(true);
      try {
        if (id && !id.startsWith('ATL-')) {
          const res = await fetch('/api/silat/kontingen/atlet', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...data }),
          });
          const resData = await res.json();
          if (res.ok && resData.atlet) {
            setAtlets((prev) =>
              prev.map((item) => (item.id === id ? resData.atlet : item))
            );
          }
        } else {
          const res = await fetch('/api/silat/kontingen/atlet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const resData = await res.json();
          if (res.ok && resData.atlet) {
            setAtlets((prev) => [...prev, resData.atlet]);
          }
        }
      } catch (e) {
        console.error('Error saving atlet to cloud:', e);
      } finally {
        setIsSyncing(false);
      }
    } else {
      if (id) {
        setAtlets((prev) =>
          prev.map((item) => (item.id === id ? { ...data, id } : item))
        );
      } else {
        const newAtlet: AtletItem = {
          id: `ATL-${Date.now()}-${String(atlets.length + 1).padStart(2, '0')}`,
          ...data,
        };
        setAtlets((prev) => [...prev, newAtlet]);
      }
    }
  };

  // Handler Hapus Atlet
  const handleDeleteAtlet = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus atlet ini?')) return;

    if (isAuthenticated && !id.startsWith('ATL-')) {
      setIsSyncing(true);
      try {
        await fetch(`/api/silat/kontingen/atlet?id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Error deleting atlet from cloud:', e);
      } finally {
        setIsSyncing(false);
      }
    }

    setAtlets((prev) => prev.filter((item) => item.id !== id));
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

            {/* STATUS CLOUD / BANNER AUTH */}
            {!isAuthenticated ? (
              <div className="w-full relative z-10 p-4 rounded-2xl bg-slate-950/80 border-2 border-cyan-400/40 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xs sm:text-sm">
                      Masuk dengan Akun Kontingen Anda
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Simpan data atlet langsung ke Database Cloud.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                >
                  MASUK / DAFTAR
                </button>
              </div>
            ) : (
              <div className="w-full relative z-10 px-4 py-2.5 rounded-2xl bg-slate-950/75 border border-emerald-400/40 shadow-md backdrop-blur-md flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300">Kontingen:</span>
                  <strong className="text-cyan-300 font-bold">{user?.namaKontingen}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>Sinkronisasi...</span>
                    </>
                  ) : (
                    <>
                      <CloudCheck className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Tersimpan di Cloud</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TABEL DATA ATLET KATEGORI SPESIFIK */}
            <AtletTable
              atlets={atlets}
              title={`DATA ATLET`}
              defaultCategory="Semua"
              allowedCategories={allowedCategories}
              hideCategoryFilter={false}
              onOpenModal={handleOpenAddAtlet}
              onEdit={handleOpenEditAtlet}
              onDelete={handleDeleteAtlet}
              isLoading={isAuthLoading || (isAuthenticated && !isLoaded) || isSyncing}
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

      {/* MODAL AUTH LOGIN / REGISTER */}
      <ModalAuthKontingen
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={closeAuthModal}
        onSuccess={() => {
          closeAuthModal();
          fetchCloudData();
        }}
      />
    </div>
  );
}
