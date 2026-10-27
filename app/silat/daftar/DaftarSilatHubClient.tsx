'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function DaftarSilatHubClient() {
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
          2. MAIN CONTENT HUB PENDAFTARAN SESUAI WIREFRAME
      ========================================================================= */}
      <main className="relative z-10 pt-24 sm:pt-28 md:pt-36 lg:pt-40 pb-16 px-3 sm:px-6 max-w-7xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-2rem)]">

        {/* TOP: TOMBOL CEK ATLET (Magenta / Hot Pink) */}
        <div className="w-full text-center mb-4 sm:mb-6">
          <Link
            href="/silat/kontingen"
            className="inline-block py-2.5 sm:py-3.5 px-8 sm:px-12 bg-transparent hover:bg-pink-50/50 text-[#ff007f] hover:text-[#d6006c] font-black text-2xl sm:text-3xl md:text-4xl tracking-widest uppercase transition-all transform hover:scale-105 active:scale-95 cursor-pointer drop-shadow-sm select-none"
          >
            CEK ATLET
          </Link>
        </div>

        {/* MIDDLE SECTION: 4 KOLOM
            [ PILAR SPONSOR KIRI ] - [ KARTU TANDING ] - [ KARTU JURUS ] - [ PILAR SPONSOR KANAN ] */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center my-auto">

          {/* PILAR KIRI: SPONSORSHIP PINK PASTEL */}
          <div className="hidden md:flex md:col-span-2 h-[340px] lg:h-[380px] bg-[#f8a5c2]/80 backdrop-blur-md border-2 border-white/80 rounded-3xl p-4 flex-col items-center justify-between text-center shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
              KOLABORASI
            </span>
            <span className="text-xs lg:text-sm font-black uppercase tracking-[0.25em] text-[#0088cc] drop-shadow-xs rotate-[-90deg] whitespace-nowrap">
              SPONSORSHIP
            </span>
            <a
              href="https://wa.me/6285804333939?text=Halo%20Admin%20JIWANDANA,%20kami%20tertarik%20menjadi%20Sponsor%20Kejuaraan%20Silat%20DSC%202026"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 bg-white/90 hover:bg-white text-[#0088cc] hover:text-[#0066aa] font-black text-[11px] uppercase tracking-wider rounded-xl shadow-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
              title="Hubungi Admin untuk Sponsorship"
            >
              <span>HUB</span>
              <span className="text-[10px]">💬</span>
            </a>
          </div>

          {/* KARTU KIRI: KATEGORI TANDING & SILAT BEBAS */}
          <div className="md:col-span-4 flex flex-col items-center group">
            <Link
              href="/silat/daftar/tanding"
              className="w-full flex flex-col items-center cursor-pointer"
            >
              {/* Gambar Atlet Tanding (fight.png) */}
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-60 sm:h-72 transition-transform duration-300 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/silat/fight.png"
                  alt="Kategori Tanding & Silat Bebas"
                  className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
                />
              </div>

              {/* Tombol Box Cyan di Bawah Atlet */}
              <div className="w-full max-w-[320px] -mt-2 sm:-mt-4 py-3 sm:py-3.5 px-4 bg-gradient-to-r from-[#00d2ff] to-[#00b4d8] hover:from-[#00c0eb] hover:to-[#00a0c2] text-white font-black text-xs sm:text-sm tracking-wider uppercase text-center rounded-2xl shadow-lg shadow-cyan-500/30 border-2 border-white transition-all transform group-hover:scale-105 active:scale-95">
                KATEGORI TANDING &amp; SILAT BEBAS
              </div>
            </Link>
          </div>

          {/* KARTU KANAN: KATEGORI JURUS & FESTIVAL */}
          <div className="md:col-span-4 flex flex-col items-center group">
            <Link
              href="/silat/daftar/jurus"
              className="w-full flex flex-col items-center cursor-pointer"
            >
              {/* Gambar Atlet Jurus (tgr_festival.png) */}
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-60 sm:h-72 transition-transform duration-300 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/silat/tgr_festival.png"
                  alt="Kategori Jurus & Festival"
                  className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
                />
              </div>

              {/* Tombol Box Cyan di Bawah Atlet */}
              <div className="w-full max-w-[320px] -mt-2 sm:-mt-4 py-3 sm:py-3.5 px-4 bg-gradient-to-r from-[#00d2ff] to-[#00b4d8] hover:from-[#00c0eb] hover:to-[#00a0c2] text-white font-black text-xs sm:text-sm tracking-wider uppercase text-center rounded-2xl shadow-lg shadow-cyan-500/30 border-2 border-white transition-all transform group-hover:scale-105 active:scale-95">
                KATEGORI JURUS &amp; FESTIVAL
              </div>
            </Link>
          </div>

          {/* PILAR KANAN: MEDIA PARTNER CYAN/TOSCA PASTEL */}
          <div className="hidden md:flex md:col-span-2 h-[340px] lg:h-[380px] bg-[#81ecec]/80 backdrop-blur-md border-2 border-white/80 rounded-3xl p-4 flex-col items-center justify-between text-center shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
              KOLABORASI
            </span>
            <span className="text-xs lg:text-sm font-black uppercase tracking-[0.25em] text-[#ff007f] drop-shadow-xs rotate-[90deg] whitespace-nowrap">
              MEDIA PARTNER
            </span>
            <a
              href="https://wa.me/6285804333939?text=Halo%20Admin%20JIWANDANA,%20kami%20ingin%20bekerja%20sama%20sebagai%20Media%20Partner%20Kejuaraan%20Silat%20DSC%202026"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 bg-white/90 hover:bg-white text-[#ff007f] hover:text-[#d6006c] font-black text-[11px] uppercase tracking-wider rounded-xl shadow-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
              title="Hubungi Admin untuk Media Partner"
            >
              <span>HUB</span>
              <span className="text-[10px]">💬</span>
            </a>
          </div>

        </div>

        {/* BOTTOM SECTION: TOMBOL PEMBAYARAN HIJAU DENGAN PANAH CYAN */}
        <div className="w-full flex flex-col items-center justify-center mt-6 sm:mt-8 space-y-2">
          <div className="flex items-center gap-3 sm:gap-4">

            {/* Tombol Hijau: PEMBAYARAN */}
            <Link
              href="/silat/daftar/pembayaran"
              className="py-3 sm:py-4 px-8 sm:px-14 bg-gradient-to-r from-[#00e676] to-[#00c853] hover:from-[#00d46d] hover:to-[#00b34a] text-white font-black text-xl sm:text-2xl md:text-3xl tracking-widest uppercase rounded-2xl shadow-xl shadow-emerald-500/30 border-2 sm:border-3 border-white transform hover:scale-105 active:scale-95 transition-all text-center cursor-pointer select-none"
            >
              PEMBAYARAN
            </Link>
          </div>

          {/* Teks Peringatan Merah */}
          <p className="text-xs sm:text-sm font-extrabold text-[#ff1744] tracking-wide text-center drop-shadow-xs pt-1">
            Pastikan semua atlet sudah terdaftar dengan benar
          </p>

          {/* Navigasi Kembali ke Homepage Silat */}
          <div className="pt-2">
            <Link
              href="/silat"
              className="text-xs font-semibold text-slate-500 hover:text-[#0088cc] transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Kembali ke Beranda Silat</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
