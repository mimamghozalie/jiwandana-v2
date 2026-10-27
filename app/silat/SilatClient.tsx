'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface KontingenItem {
  id: string;
  nama: string;
  sekolah: string;
  kota: string;
  pelatih: string;
  totalAtlet: number;
  tanding: number;
  seni: number;
  kategori: ('Usia Dini' | 'Pra Remaja' | 'Remaja' | 'Dewasa')[];
  status: 'Terverifikasi' | 'Menunggu Berkas' | 'Diproses';
}

const mockKontingen: KontingenItem[] = [
  {
    id: 'KTG-001',
    nama: 'Satria Diponegoro Gondang',
    sekolah: 'SMA Islam Diponegoro Gondang',
    kota: 'Mojokerto',
    pelatih: 'Bambang Prasetyo, S.Pd',
    totalAtlet: 18,
    tanding: 12,
    seni: 6,
    kategori: ['Remaja'],
    status: 'Terverifikasi',
  },
  {
    id: 'KTG-002',
    nama: 'Garuda Muda Penanggungan',
    sekolah: 'SMP Negeri 1 Trawas',
    kota: 'Mojokerto',
    pelatih: 'Siti Rahmawati',
    totalAtlet: 14,
    tanding: 10,
    seni: 4,
    kategori: ['Pra Remaja'],
    status: 'Terverifikasi',
  },
  {
    id: 'KTG-003',
    nama: 'Pendekar Majapahit Raya',
    sekolah: 'Perguruan Silat Nusantara',
    kota: 'Mojokerto',
    pelatih: 'Kusuma Wardhana',
    totalAtlet: 22,
    tanding: 15,
    seni: 7,
    kategori: ['Usia Dini', 'Pra Remaja', 'Remaja'],
    status: 'Terverifikasi',
  },
  {
    id: 'KTG-004',
    nama: 'Ksatria Singhasari',
    sekolah: 'SMP/SMA Sejahtera Malang',
    kota: 'Malang',
    pelatih: 'Agus Sudrajat',
    totalAtlet: 16,
    tanding: 11,
    seni: 5,
    kategori: ['Pra Remaja', 'Remaja'],
    status: 'Diproses',
  },
  {
    id: 'KTG-005',
    nama: 'Surabaya Cakti Utama',
    sekolah: 'Kontingen Gabungan Surabaya',
    kota: 'Surabaya',
    pelatih: 'M. Hidayatulloh',
    totalAtlet: 20,
    tanding: 14,
    seni: 6,
    kategori: ['Remaja', 'Dewasa'],
    status: 'Menunggu Berkas',
  },
  {
    id: 'KTG-006',
    nama: 'Tapak Suci Brantas',
    sekolah: 'SMP Muhammadiyah Mojokerto',
    kota: 'Mojokerto',
    pelatih: 'Dwi Cahyono',
    totalAtlet: 12,
    tanding: 8,
    seni: 4,
    kategori: ['Pra Remaja'],
    status: 'Terverifikasi',
  },
];

export default function SilatClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKota, setFilterKota] = useState('Semua');
  const [selectedJuknisModal, setSelectedJuknisModal] = useState(false);
  const [selectedBaganModal, setSelectedBaganModal] = useState(false);
  const [selectedJuaraModal, setSelectedJuaraModal] = useState(false);
  const [selectedDokumentasiModal, setSelectedDokumentasiModal] = useState(false);

  // Filter kontingen
  const filteredKontingen = mockKontingen.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pelatih.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kota.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKota = filterKota === 'Semua' || item.kota === filterKota;
    return matchSearch && matchKota;
  });

  const totalPesilat = mockKontingen.reduce((acc, curr) => acc + curr.totalAtlet, 0);

  const scrollToKontingen = () => {
    const el = document.getElementById('data-kontingen-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 selection:bg-[#00e5ff]/30 selection:text-slate-950 font-sans">
      {/* =========================================================================
          1. DUAL RESPONSIVE BACKGROUND (Phone Portrait vs PC Landscape)
      ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
        {/* Background Mobile / Phone (Portrait): aktif < md */}
        <div className="block md:hidden relative w-full h-full">
          <Image
            src="/assets/silat/bg_silat_phone.png"
            alt="Background Kejuaraan Pencak Silat Mobile"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>

        {/* Background PC / Desktop (Landscape): aktif >= md */}
        <div className="hidden md:block relative w-full h-full">
          <Image
            src="/assets/silat/bg_silat_pc.png"
            alt="Background Kejuaraan Pencak Silat Desktop"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* =========================================================================
          2. MAIN CONTENT AREA
          Safe Top Padding untuk memberi ruang pada 5 logo instansi di header background
      ========================================================================= */}
      <main className="relative z-10 pt-24 sm:pt-32 md:pt-36 lg:pt-40 pb-20 px-3 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-12">

        {/* =======================================================================
            HERO PORTAL SESUAI WIREFRAME
            Kiri: JUKNIS + KONTINGEN + 4 Medsos (WA, TT, IG, YT)
            Tengah: Atlet management_atlit.png + Badge "DATA KONTINGEN"
            Kanan: 4 Tombol Kapsul (DAFTAR, BAGAN, JUARA, DOKUMENTASI)
        ======================================================================= */}
        <section className="relative w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* SAYAP KIRI (DESKTOP: col-span-3, MOBILE: Order 2) */}
            <div className="order-2 md:order-1 md:col-span-3 flex flex-col items-center md:items-end gap-3.5 sm:gap-4">

              {/* Tombol Utama: JUKNIS (Buka di Tab Baru) */}
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-[220px] py-3.5 sm:py-4 px-6 bg-gradient-to-r from-[#0099ff] to-[#00b4d8] hover:from-[#0088ee] hover:to-[#009ec3] text-white font-black text-xl sm:text-2xl tracking-wider rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 active:scale-95 transition-all text-center border-2 border-white/60 cursor-pointer block"
              >
                JUKNIS
              </a>

              {/* Tombol KONTINGEN (Tepat di bawah JUKNIS) */}
              <button
                type="button"
                onClick={scrollToKontingen}
                className="w-full max-w-[220px] py-3 sm:py-3.5 px-6 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#00a0c2] hover:to-[#00669e] text-white font-extrabold text-base sm:text-lg tracking-wider rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all text-center border-2 border-white/60 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>MERCHANDISE</span>
              </button>

              {/* 4 Tombol Bulat Medsos Magenta dengan Icon Resmi (Centered) */}
              <div className="w-full max-w-[220px] flex justify-center pt-1">
                <div className="grid grid-cols-4 sm:grid-cols-2 gap-2.5 sm:gap-3 place-items-center">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20JIWANDANA,%20saya%20ingin%20informasi%20Kejuaraan%20Silat%20DSC%202026"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff007f] to-[#d6006c] hover:from-[#ff1a8c] hover:to-[#e60074] text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all border-2 border-white"
                    title="WhatsApp Official"
                    aria-label="WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.707 1.916.81 2.049c.098.133 1.39 2.132 3.38 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                    </svg>
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@jiwandana.event.organizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff007f] to-[#d6006c] hover:from-[#ff1a8c] hover:to-[#e60074] text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all border-2 border-white"
                    title="TikTok Jiwandana"
                    aria-label="TikTok"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/jiwandana.event.organizer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff007f] to-[#d6006c] hover:from-[#ff1a8c] hover:to-[#e60074] text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all border-2 border-white"
                    title="Instagram Resmi"
                    aria-label="Instagram"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@jiwandanaeventorganizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff007f] to-[#d6006c] hover:from-[#ff1a8c] hover:to-[#e60074] text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all border-2 border-white"
                    title="YouTube Jiwandana"
                    aria-label="YouTube"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.05-.075 1.958l-.008.104-.022.26-.01.104c-.048.52-.119 1.023-.22 1.402a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A30 30 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* PUSAT HERO: ILUSTRASI 9 ATLET PESILAT + BADGE (DESKTOP: col-span-6, MOBILE: Order 1) */}
            <div className="order-1 md:order-2 md:col-span-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-full max-w-[460px] sm:max-w-[520px] transition-transform duration-500 hover:scale-[1.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/silat/management_atlit.png"
                  alt="Pesilat Kontingen DSC 2026"
                  className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,102,204,0.3)] filter contrast-105"
                  loading="eager"
                />

                {/* BADGE MELENGKUNG: DATA KONTINGEN */}
                <div className="relative -mt-4 sm:-mt-6 mx-auto w-[92%] sm:w-[85%] z-20">
                  <div
                    onClick={scrollToKontingen}
                    className="py-3 sm:py-4 px-6 bg-gradient-to-r from-[#00d2ff] via-[#00b4d8] to-[#0099ff] text-white font-black text-lg sm:text-2xl md:text-3xl tracking-widest uppercase rounded-2xl sm:rounded-3xl shadow-xl shadow-cyan-500/40 border-2 sm:border-4 border-white transform hover:scale-105 transition-all text-center cursor-pointer select-none"
                  >
                    DATA KONTINGEN
                  </div>
                </div>
              </div>
            </div>

            {/* SAYAP KANAN (DESKTOP: col-span-3, MOBILE: Order 3): 4 TOMBOL KAPSUL */}
            <div className="order-3 md:order-3 md:col-span-3 flex flex-col items-center md:items-start gap-3 sm:gap-3.5">

              {/* 1. DAFTAR (Cyan) */}
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20JIWANDANA,%20saya%20ingin%20mendaftarkan%20kontingen%20Kejuaraan%20Silat%20DSC%202026"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-[220px] py-3 sm:py-3.5 px-6 bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] hover:from-[#00d0e6] hover:to-[#009ec3] text-white font-black text-sm sm:text-base tracking-widest rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all text-center border-2 border-white/70 cursor-pointer block"
              >
                DAFTAR
              </a>

              {/* 2. BAGAN (Biru Cerah) */}
              <button
                type="button"
                onClick={() => setSelectedBaganModal(true)}
                className="w-full max-w-[220px] py-3 sm:py-3.5 px-6 bg-gradient-to-r from-[#0088ee] to-[#0066cc] hover:from-[#0077dd] hover:to-[#0055bb] text-white font-black text-sm sm:text-base tracking-widest rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all text-center border-2 border-white/70 cursor-pointer"
              >
                BAGAN
              </button>

              {/* 3. JUARA (Emas / Kuning) */}
              <button
                type="button"
                onClick={() => setSelectedJuaraModal(true)}
                className="w-full max-w-[220px] py-3 sm:py-3.5 px-6 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#fca311] hover:to-[#f07100] text-white font-black text-sm sm:text-base tracking-widest rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all text-center border-2 border-white/70 cursor-pointer"
              >
                JUARA
              </button>

              {/* 4. DOKUMENTASI (Magenta) */}
              <button
                type="button"
                onClick={() => setSelectedDokumentasiModal(true)}
                className="w-full max-w-[220px] py-3 sm:py-3.5 px-6 bg-gradient-to-r from-[#e01e79] to-[#d6006c] hover:from-[#d1196f] hover:to-[#c20061] text-white font-black text-sm sm:text-base tracking-widest rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all text-center border-2 border-white/70 cursor-pointer"
              >
                DOKUMENTASI
              </button>

            </div>

          </div>
        </section>

        {/* =======================================================================
            3. SPONSORSHIP SUPPORT & MEDIA PARTNER (Box Melengkung Pink Pastel)
        ======================================================================= */}
        <section className="w-full">
          <div className="bg-[#f7a6c9]/80 backdrop-blur-md border-2 border-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md text-center space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
              SPONSORSHIP SUPPORT &amp; MEDIA PARTNER
            </h3>

            {/* Logo Slot Placeholder yang Bersih & Rapi */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-1">

            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          MODALS INTERAKTIF (JUKNIS, BAGAN, JUARA, DOKUMENTASI)
      ========================================================================= */}

      {/* 1. MODAL JUKNIS */}
      {selectedJuknisModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedJuknisModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066cc] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Petunjuk Teknis (Juknis)</h3>
                  <p className="text-xs text-slate-500">Kejuaraan Pencak Silat DSC 2026</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJuknisModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <strong className="text-slate-900 block font-bold">1. Peraturan Pertandingan</strong>
                <p>Mengacu pada Peraturan Pertandingan Hasil Musyawarah Nasional IPSI Tahun 2022/2024.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <strong className="text-slate-900 block font-bold">2. Kategori Pertandingan</strong>
                <p>Usia Dini (SD), Pra-Remaja (SMP), Remaja (SMA/SMK), dan Dewasa / Umum.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <strong className="text-slate-900 block font-bold">3. Sistem Penilaian</strong>
                <p>Digital Scoring system resmi IPSI dengan layar monitor transparansi di setiap gelanggang.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin,%20mohon%20file%20PDF%20Juknis%20Lengkap%20Silat%20DSC%202026"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-[#0066cc] hover:bg-[#0055bb] text-white rounded-xl font-bold text-xs uppercase tracking-wider text-center shadow-md transition-all"
              >
                Unduh PDF Juknis (WA)
              </a>
              <button
                type="button"
                onClick={() => setSelectedJuknisModal(false)}
                className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL BAGAN */}
      {selectedBaganModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedBaganModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066cc] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">account_tree</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Bagan Pertandingan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Bagan tanding dan jadwal gelanggang akan dipublikasikan secara langsung setelah sesi <strong>Technical Meeting</strong> selesai.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-800 font-medium">
              Pantau informasi pengundian bagan melalui grup WhatsApp official kontingen.
            </div>
            <button
              type="button"
              onClick={() => setSelectedBaganModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}

      {/* 3. MODAL JUARA */}
      {selectedJuaraModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedJuaraModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">emoji_events</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Klasemen &amp; Juara Umum</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Rekapitulasi perolehan medali Emas, Perak, Perunggu dan Juara Umum Kontingen akan di-update secara live saat babak final berlangsung.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedJuaraModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL DOKUMENTASI */}
      {selectedDokumentasiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedDokumentasiModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#ff007f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">photo_camera</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Galeri &amp; Dokumentasi</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Dokumentasi foto aksi laga pesilat dan rekaman video pertandingan akan diunggah pada kanal resmi YouTube &amp; Google Drive panitia.
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://youtube.com/@jiwandanaeventorganizer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                Buka YouTube
              </a>
              <button
                type="button"
                onClick={() => setSelectedDokumentasiModal(false)}
                className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
