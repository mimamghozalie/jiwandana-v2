'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Tentang Kami', href: '/tentang' },
    // { name: 'Layanan', href: '/layanan' },
    { name: 'Portofolio', href: '/portofolio' },
    // { name: 'Informasi Event', href: '/informasi-event' },
    { name: 'Dokumentasi', href: '/dokumentasi' },
    // { name: 'Testimonial', href: '/testimonial' },
    { name: 'Kontak', href: '/kontak' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Hide Navbar on the root portal page and all admin CMS pages
  if (pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-0 w-full bg-[#f8f8f8]/90 backdrop-blur-md border-b border-black/10 z-50 transition-all duration-300 h-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 flex justify-between items-center h-full">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/logo.webp"
            alt="JIWANDANA Event Organizer Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <span className="text-xl font-bold font-serif text-slate-800">
            JIWANDANA
            <span className="hidden sm:inline text-slate-600 font-sans text-sm ml-2">Event Organizer</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-wider transition-colors duration-300 ${isActive(link.href)
                ? 'text-[#C9A227] font-semibold'
                : 'text-slate-600 hover:text-[#C9A227]'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/booking-event"
            className="bg-[#C9A227] text-[#0d1c32] px-6 py-2.5 rounded-xl font-sans text-sm uppercase tracking-widest hover:bg-[#b08d20] transition-all duration-300 font-semibold shadow-md text-center"
          >
            Pesan Acara
          </Link>
        </div>

        {/* Hamburger Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-slate-700 hover:text-[#C9A227] focus:outline-none transition-colors"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>

      {/* Mobile Menu Overlay matching booking-event.html */}
      <div
        className={`fixed inset-0 bg-[#f8f8f8]/98 backdrop-blur-xl z-[100] transform transition-transform duration-300 flex flex-col items-center justify-center space-y-7 lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-slate-700 hover:text-[#C9A227] transition-colors duration-300 focus:outline-none"
          aria-label="Tutup Menu"
        >
          <span className="material-symbols-outlined text-4xl">close</span>
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className={`text-2xl font-serif transition-colors duration-300 ${isActive(link.href)
              ? 'text-[#C9A227] font-semibold'
              : 'text-slate-800 hover:text-[#C9A227]'
              }`}
          >
            {link.name}
          </Link>
        ))}

        <Link
          href="/booking-event"
          onClick={() => setIsOpen(false)}
          className="bg-[#C9A227] text-[#0d1c32] px-8 py-3.5 rounded-xl font-sans text-sm uppercase tracking-widest mt-4 font-semibold hover:bg-[#b08d20] transition-all duration-300 shadow-md transform hover:scale-105"
        >
          Pesan Acara
        </Link>
      </div>
    </header>
  );
}
