'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [splashGreeting, setSplashGreeting] = useState('Selamat Datang');
  const [splashLogoVisible, setSplashLogoVisible] = useState(false);
  const [splashSubVisible, setSplashSubVisible] = useState(false);
  const [splashFading, setSplashFading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Splash Screen Logic matching index.html
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    if (!getCookie('splash_shown')) {
      setShowSplash(true);
      document.body.classList.add('overflow-hidden');

      // Sequential greeting text cycle
      const greetings = ['Selamat Datang', 'Sugeng Rawuh', 'Welcome to'];
      const timerGreet1 = setTimeout(() => {
        setSplashGreeting(greetings[1]);
      }, 1300);

      const timerGreet2 = setTimeout(() => {
        setSplashGreeting(greetings[2]);
      }, 2400);

      // Logo container animation
      const timerLogo = setTimeout(() => {
        setSplashLogoVisible(true);
      }, 800);

      // Subtitle animation
      const timerSub = setTimeout(() => {
        setSplashSubVisible(true);
      }, 2800);

      // Fade out splash screen
      const timerFade = setTimeout(() => {
        setSplashFading(true);
        document.body.classList.remove('overflow-hidden');
        document.cookie = 'splash_shown=true; path=/; max-age=86400';
      }, 4500);

      // Remove splash completely
      const timerHide = setTimeout(() => {
        setShowSplash(false);
      }, 5500);

      return () => {
        clearTimeout(timerGreet1);
        clearTimeout(timerGreet2);
        clearTimeout(timerLogo);
        clearTimeout(timerSub);
        clearTimeout(timerFade);
        clearTimeout(timerHide);
        document.body.classList.remove('overflow-hidden');
      };
    }
  }, []);

  return (
    <div className="bg-[#f8f8f8] text-slate-800 font-sans selection:bg-[#C9A227] selection:text-[#0d1c32] min-h-screen">
      {/* Splash Screen */}
      {showSplash && (
        <div
          id="splash-screen"
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d1c32] text-white transition-opacity duration-1000 ease-in-out ${
            splashFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="text-center space-y-8 px-6 max-w-lg">
            <p
              id="splash-greet"
              className="text-lg md:text-xl font-light tracking-widest text-[#C9A227] uppercase transition-opacity duration-300"
            >
              {splashGreeting}
            </p>
            <div
              id="splash-logo-container"
              className={`w-64 h-64 mx-auto transform transition-all duration-1000 flex items-center justify-center ${
                splashLogoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <Image
                src="/logo.webp"
                alt="JIWANDANA Logo"
                width={256}
                height={256}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
            <p
              id="splash-sub"
              className={`text-[10px] tracking-[0.4em] text-slate-500 uppercase transition-all duration-700 ${
                splashSubVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              &copy;2026 Jiwandana
            </p>
          </div>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full bg-[#f8f8f8]/90 backdrop-blur-md border-b border-black/10 z-50 transition-all duration-300 h-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 flex justify-between items-center h-full">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/logo.webp"
              alt="JIWANDANA Event Organizer Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#C9A227]">
              JIWANDANA Event Organizer
            </span>
          </Link>

          {/* Hamburger Icon */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-slate-700 hover:text-[#C9A227] focus:outline-none"
            aria-label="Buka Menu"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>

          <Link
            href="/booking-event"
            className="hidden md:block bg-[#C9A227] text-[#0d1c32] px-6 py-2.5 rounded-xl font-sans text-sm uppercase tracking-widest hover:bg-[#b08d20] transition-all duration-300 font-semibold shadow-md text-center"
          >
            Pesan Acara
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          id="mobile-menu"
          className={`fixed inset-0 bg-[#f8f8f8]/98 backdrop-blur-xl z-[100] transform transition-transform duration-300 flex flex-col items-center justify-center space-y-8 md:hidden ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <button
            id="close-menu-btn"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-slate-700 hover:text-[#C9A227] transition-colors duration-300 focus:outline-none"
            aria-label="Tutup Menu"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>

          <div className="flex flex-col items-center space-y-6 text-lg font-serif">
            <Link
              href="/tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 hover:text-[#C9A227] transition-colors"
            >
              Tentang kami
            </Link>
            <Link
              href="/portofolio"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 hover:text-[#C9A227] transition-colors"
            >
              Portofolio
            </Link>
            <Link
              href="/dokumentasi"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 hover:text-[#C9A227] transition-colors"
            >
              Dokumentasi
            </Link>
            <Link
              href="/testimonial"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 hover:text-[#C9A227] transition-colors"
            >
              Testimonial
            </Link>
          </div>

          <Link
            href="/booking-event"
            onClick={() => setMobileMenuOpen(false)}
            className="bg-[#C9A227] text-[#0d1c32] px-8 py-3.5 rounded-xl font-sans text-sm uppercase tracking-widest mt-8 font-semibold hover:bg-[#b08d20] transition-all duration-300 shadow-md transform hover:scale-105"
          >
            Pesan Acara
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 min-h-[90vh] bg-[#f8f8f8] text-slate-800 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-6 py-8 flex flex-col justify-between min-h-[75vh] space-y-12">
          {/* TOP NAV BUTTONS (Tentang Kami, Portofolio, Dokumentasi, Testimonial) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <Link
              href="/tentang"
              className="flex items-center justify-center px-6 py-4 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/50 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-center shadow-sm hover:shadow group"
            >
              <span className="font-medium tracking-wide text-slate-700 group-hover:text-[#C9A227] transition-colors">
                Tentang kami
              </span>
            </Link>
            <Link
              href="/portofolio"
              className="flex items-center justify-center px-6 py-4 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/50 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-center shadow-sm hover:shadow group"
            >
              <span className="font-medium tracking-wide text-slate-700 group-hover:text-[#C9A227] transition-colors">
                Portofolio
              </span>
            </Link>
            <Link
              href="/dokumentasi"
              className="flex items-center justify-center px-6 py-4 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/50 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-center shadow-sm hover:shadow group"
            >
              <span className="font-medium tracking-wide text-slate-700 group-hover:text-[#C9A227] transition-colors">
                Dokumentasi
              </span>
            </Link>
            <Link
              href="/testimonial"
              className="flex items-center justify-center px-6 py-4 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/50 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-center shadow-sm hover:shadow group"
            >
              <span className="font-medium tracking-wide text-slate-700 group-hover:text-[#C9A227] transition-colors">
                Testimonial
              </span>
            </Link>
          </div>

          {/* CENTRAL HUB CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Card #1: Booking Event */}
            <Link
              href="/booking-event"
              className="relative overflow-hidden group bg-white hover:bg-[#fffdf9] border-2 border-[#C9A227]/30 hover:border-[#C9A227] rounded-2xl p-8 flex flex-col justify-between min-h-[220px] transition-all duration-500 transform hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(201,162,39,0.18)]"
            >
              {/* #1 Tag */}
              <span className="absolute top-4 left-6 text-sm font-bold text-[#C9A227]/60 group-hover:text-[#C9A227] tracking-wider transition-colors">
                #1
              </span>
              <div className="mt-8 flex flex-col items-center justify-center flex-grow text-center">
                <span className="material-symbols-outlined text-[#C9A227] text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  calendar_month
                </span>
                <h3 className="text-2xl font-bold font-serif tracking-wide uppercase text-slate-900 group-hover:text-[#C9A227] transition-colors">
                  booking event
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Pesan dan rencanakan konsep acara prestisius Anda secara instan
                </p>
              </div>
            </Link>

            {/* Card #2: Informasi Event */}
            <Link
              href="/informasi-event"
              className="relative overflow-hidden group bg-white hover:bg-[#fffdf9] border border-black/10 hover:border-[#C9A227]/70 rounded-2xl p-8 flex flex-col justify-between min-h-[220px] transition-all duration-500 transform hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(201,162,39,0.15)]"
            >
              {/* #2 Tag */}
              <span className="absolute top-4 left-6 text-sm font-bold text-slate-400 group-hover:text-[#C9A227]/70 tracking-wider transition-colors">
                #2
              </span>
              <div className="mt-8 flex flex-col items-center justify-center flex-grow text-center">
                <span className="material-symbols-outlined text-[#C9A227] text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  news
                </span>
                <h3 className="text-2xl font-bold font-serif tracking-wide uppercase text-slate-900 group-hover:text-[#C9A227] transition-colors">
                  informasi event
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Dapatkan info detail paket event, vendor, dan detail layanan
                </p>
              </div>
            </Link>
          </div>

          {/* BOTTOM SOCIALS & HELP */}
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-6 pt-6 border-t border-black/10">
            {/* Social media icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/jiwandana.event.organizer/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-3 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/40 rounded-xl transition-all duration-300 text-slate-700 hover:text-[#C9A227] shadow-sm"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@jiwandana.event.organizer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-3 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/40 rounded-xl transition-all duration-300 text-slate-700 hover:text-[#C9A227] shadow-sm"
                aria-label="TikTok"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@jiwandanaeventorganizer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-3 bg-white hover:bg-[#C9A227]/10 border border-black/10 hover:border-[#C9A227]/40 rounded-xl transition-all duration-300 text-slate-700 hover:text-[#C9A227] shadow-sm"
                aria-label="YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.05-.075 1.958l-.008.104-.022.26-.01.104c-.048.52-.119 1.023-.22 1.402a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A30 30 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
                </svg>
              </a>
            </div>

            {/* Help Button & Contact Info */}
            <div className="flex flex-col items-center sm:items-end gap-2.5">
              <Link
                href="/kontak"
                className="flex items-center gap-2 px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <span className="material-symbols-outlined text-md">help_outline</span>
                <span className="text-sm tracking-wider uppercase font-bold">help</span>
              </Link>
              <div className="flex flex-col items-center sm:items-end text-xs text-slate-500 gap-1.5 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">RESTU</span>
                  <a
                    href="https://wa.me/6282171914989"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C9A227] transition-colors hover:underline"
                  >
                    +62 821-7191-4989
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">PUTRA</span>
                  <a
                    href="https://wa.me/6285804333939"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C9A227] transition-colors hover:underline"
                  >
                    +62 858-0433-3939
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
