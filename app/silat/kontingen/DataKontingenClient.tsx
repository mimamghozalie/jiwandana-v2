'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { OfficialItem, AtletItem } from '@/components/silat/types';
import SilatDualBackground from '@/components/silat/SilatDualBackground';
import SilatSponsorPillar from '@/components/silat/SilatSponsorPillar';
import OfficialTable from '@/components/silat/kontingen/OfficialTable';
import AtletTable from '@/components/silat/kontingen/AtletTable';
import ModalAddOfficial from '@/components/silat/kontingen/ModalAddOfficial';
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

export default function DataKontingenClient() {
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

  // State Lists
  const [officials, setOfficials] = useState<OfficialItem[]>([]);
  const [atlets, setAtlets] = useState<AtletItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Profile Dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal Visibility & Editing States
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<OfficialItem | null>(null);

  const [isAtletModalOpen, setIsAtletModalOpen] = useState(false);
  const [editingAtlet, setEditingAtlet] = useState<AtletItem | null>(null);

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

  // 1. Fetch Cloud Data saat User Login
  const fetchCloudData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/silat/kontingen/data', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setOfficials(data.officials || []);
        setAtlets(data.atlets || []);
        // Update local cache
        localStorage.setItem('silat_officials', JSON.stringify(data.officials || []));
        localStorage.setItem('silat_atlets', JSON.stringify(data.atlets || []));
      }
    } catch (err) {
      console.error('Failed to fetch cloud kontingen data:', err);
    } finally {
      setIsSyncing(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCloudData();
    } else {
      // Jika belum login, pastikan data kosong dan bersihkan cache lokal lama
      setOfficials([]);
      setAtlets([]);
      try {
        localStorage.removeItem('silat_officials');
        localStorage.removeItem('silat_atlets');
      } catch {}
      setIsLoaded(true);
    }
  }, [isAuthenticated, fetchCloudData]);

  // Handler Tambah/Edit & Hapus Official
  const handleOpenAddOfficial = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setEditingOfficial(null);
    setIsOfficialModalOpen(true);
  };

  const handleOpenEditOfficial = (item: OfficialItem) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setEditingOfficial(item);
    setIsOfficialModalOpen(true);
  };

  const handleSaveOfficial = async (data: Omit<OfficialItem, 'id'>, id?: string) => {
    setIsOfficialModalOpen(false);
    setEditingOfficial(null);

    if (isAuthenticated) {
      setIsSyncing(true);
      try {
        if (id && !id.startsWith('OFF-')) {
          // Update ke Cloud
          const res = await fetch('/api/silat/kontingen/official', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...data }),
          });
          const resData = await res.json();
          if (res.ok && resData.official) {
            setOfficials((prev) =>
              prev.map((item) => (item.id === id ? resData.official : item))
            );
          }
        } else {
          // Tambah baru ke Cloud
          const res = await fetch('/api/silat/kontingen/official', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const resData = await res.json();
          if (res.ok && resData.official) {
            setOfficials((prev) => [...prev, resData.official]);
          }
        }
      } catch (e) {
        console.error('Error saving official to cloud:', e);
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Mode Offline LocalStorage
      if (id) {
        setOfficials((prev) =>
          prev.map((item) => (item.id === id ? { ...data, id } : item))
        );
      } else {
        const newOfficial: OfficialItem = {
          id: `OFF-${Date.now()}-${String(officials.length + 1).padStart(2, '0')}`,
          ...data,
        };
        setOfficials((prev) => [...prev, newOfficial]);
      }
    }
  };

  const handleDeleteOfficial = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus official ini?')) return;

    if (isAuthenticated && !id.startsWith('OFF-')) {
      setIsSyncing(true);
      try {
        await fetch(`/api/silat/kontingen/official?id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Error deleting official on cloud:', e);
      } finally {
        setIsSyncing(false);
      }
    }

    setOfficials((prev) => prev.filter((item) => item.id !== id));
  };

  // Handler Tambah/Edit & Hapus Atlet
  const handleOpenAddAtlet = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setEditingAtlet(null);
    setIsAtletModalOpen(true);
  };

  const handleOpenEditAtlet = (item: AtletItem) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setEditingAtlet(item);
    setIsAtletModalOpen(true);
  };

  const handleSaveAtlet = async (data: Omit<AtletItem, 'id'>, id?: string) => {
    setIsAtletModalOpen(false);
    setEditingAtlet(null);

    if (isAuthenticated) {
      setIsSyncing(true);
      try {
        if (id && !id.startsWith('ATL-')) {
          // Update ke Cloud
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
          // Tambah baru ke Cloud
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
      // Mode Offline LocalStorage
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

  const handleDeleteAtlet = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data atlet ini?')) return;

    if (isAuthenticated && !id.startsWith('ATL-')) {
      setIsSyncing(true);
      try {
        await fetch(`/api/silat/kontingen/atlet?id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Error deleting atlet on cloud:', e);
      } finally {
        setIsSyncing(false);
      }
    }

    setAtlets((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="relative min-h-screen text-slate-900 selection:bg-[#00e5ff]/30 selection:text-slate-950 font-sans">
      {/* FLOATING TOP NAVIGATION HEADER */}
      <header className="fixed top-3 right-3 sm:top-4 sm:right-6 z-40" ref={dropdownRef}>
        {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="group px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-950/85 hover:bg-slate-900 text-white rounded-2xl border border-cyan-400/40 shadow-[0_4px_20px_rgba(0,180,216,0.3)] backdrop-blur-md transition-all flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
              MASUK AKUN KONTINGEN
            </span>
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-950/85 hover:bg-slate-900 text-white rounded-2xl border border-amber-400/50 shadow-[0_4px_20px_rgba(251,191,36,0.2)] backdrop-blur-md transition-all flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <span>Kontingen Aktif</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs font-black truncate max-w-[140px] text-white">
                  {user?.namaKontingen || 'Kontingen Silat'}
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 border border-cyan-500/30 rounded-2xl shadow-2xl backdrop-blur-xl p-2 space-y-1 text-slate-200 z-50 animate-[fadeIn_0.15s_ease-out]">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">
                    {user?.kota ? `KOTA ${user.kota.toUpperCase()}` : 'KONTINGEN'}
                  </p>
                  <p className="text-sm font-black text-white truncate">
                    {user?.namaKontingen}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>

                <Link
                  href="/silat/daftar/pembayaran"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-xl transition text-slate-200 hover:text-emerald-300"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Lanjutkan Pembayaran</span>
                </Link>

                <div className="border-t border-white/10 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 1. DUAL RESPONSIVE BACKGROUND */}
      <SilatDualBackground />

      {/* 2. MAIN CONTENT AREA */}
      <main className="relative z-10 pt-24 sm:pt-28 md:pt-36 lg:pt-40 pb-16 px-3 sm:px-6 max-w-7xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-2rem)]">
        {/* MIDDLE SECTION */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start my-auto">
          {/* PILAR KIRI: SPONSORSHIP PINK PASTEL */}
          <SilatSponsorPillar variant="pink" />

          {/* AREA TENGAH: WATERMARK 9 PESILAT DI BELAKANG DUA TABEL */}
          <div className="md:col-span-8 relative flex flex-col items-center justify-center w-full space-y-6 sm:space-y-8">
            {/* Watermark 9 Pesilat */}
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

            {/* STATUS CLOUD / BANNER AUTH */}
            {!isAuthenticated ? (
              <div className="w-full relative z-10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-950/80 border-2 border-cyan-400/40 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm sm:text-base">
                      Masuk dengan Akun Kontingen Anda
                    </h4>
                    <p className="text-xs text-slate-300">
                      Simpan data atlet &amp; official langsung ke Database Cloud agar tidak hilang dan bisa diakses dari HP.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-md shadow-cyan-500/30 transition-all cursor-pointer shrink-0"
                >
                  MASUK / DAFTAR
                </button>
              </div>
            ) : (
              <div className="w-full relative z-10 px-4 py-3 rounded-2xl bg-slate-950/75 border border-emerald-400/40 shadow-md backdrop-blur-md flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 text-xs text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300">Akun Terhubung:</span>
                  <strong className="text-cyan-300 font-bold">{user?.namaKontingen}</strong>
                  {user?.asalSekolah && (
                    <span className="text-slate-400 hidden sm:inline">({user.asalSekolah})</span>
                  )}
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

            {/* TABEL 1: DATA OFFICIAL */}
            <OfficialTable
              officials={officials}
              onOpenModal={handleOpenAddOfficial}
              onEdit={handleOpenEditOfficial}
              onDelete={handleDeleteOfficial}
              isLoading={isAuthLoading || (isAuthenticated && !isLoaded) || isSyncing}
            />

            {/* TABEL 2: DATA ATLET */}
            <AtletTable
              atlets={atlets}
              onOpenModal={handleOpenAddAtlet}
              onEdit={handleOpenEditAtlet}
              onDelete={handleDeleteAtlet}
              isLoading={isAuthLoading || (isAuthenticated && !isLoaded) || isSyncing}
            />

            {/* BOTTOM SECTION: TOMBOL LINK KE PAGE PEMBAYARAN */}
            <div className="w-full flex flex-col items-center justify-center sm:mt-8 space-y-3 relative z-10">
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-md">
                <Link
                  href="/silat/daftar/pembayaran"
                  className="flex-1 py-3.5 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-[#00d2ff] via-[#00b4d8] to-[#0099ff] hover:from-[#00c5ee] hover:to-[#0088ee] text-white font-black text-base sm:text-xl tracking-wider uppercase rounded-2xl shadow-xl shadow-cyan-500/30 border-2 border-white transform hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none flex items-center justify-center gap-2"
                >
                  <span>LANJUT KE PEMBAYARAN</span>
                  <CreditCard className="w-5 h-5" />
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

      {/* 4. MODAL AUTENTIKASI KONTINGEN */}
      <ModalAuthKontingen
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
        onSuccess={() => fetchCloudData()}
      />
    </div>
  );
}
