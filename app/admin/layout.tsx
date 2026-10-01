'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Inbox,
  Mail,
  Star,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Trophy,
  ChevronRight,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Ringkasan CMS', href: '/admin', icon: LayoutDashboard },
    { name: 'Peserta Trailrun', href: '/admin/trailrun', icon: Trophy },
    { name: 'Kelola Event', href: '/admin/events', icon: Calendar },
    { name: 'Kelola Portofolio', href: '/admin/portofolio', icon: ImageIcon },
    { name: 'Inbox Booking', href: '/admin/bookings', icon: Inbox },
    { name: 'Inbox Pesan Kontak', href: '/admin/contacts', icon: Mail },
    { name: 'Kelola Testimonial', href: '/admin/testimonials', icon: Star },
  ];

  // Get active menu item name
  const currentMenuItem = menuItems.find((item) => item.href === pathname) || {
    name: pathname.includes('/trailrun')
      ? 'Peserta Trailrun'
      : pathname.includes('/events')
      ? 'Kelola Event'
      : pathname.includes('/portofolio')
      ? 'Kelola Portofolio'
      : pathname.includes('/bookings')
      ? 'Inbox Booking'
      : pathname.includes('/contacts')
      ? 'Inbox Pesan Kontak'
      : pathname.includes('/testimonials')
      ? 'Kelola Testimonial'
      : 'Control Panel',
  };

  // Bypass admin shell for the standalone login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1a] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-[#0a1424] border-r border-white/10 p-6 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image src="/logo.webp" alt="Logo" fill className="object-contain" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide text-[#e9c176]">
                  JIWANDANA
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                  Control Panel CMS
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#e9c176] text-[#0d1c32] shadow-md font-bold'
                      : 'text-slate-400 hover:text-[#e9c176] hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Back to Website & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          >
            <span>Buka Website Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <span>Keluar (Logout)</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area with Top Navbar & Dedicated Admin Footer */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Admin Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#070e1a]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 md:hidden"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">CMS</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <span className="font-semibold text-white">{currentMenuItem.name}</span>
            </div>
          </div>

          {/* Right Header Status & Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Online</span>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
              title="Pratinjau Website Publik"
            >
              <span>Pratinjau Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 transition-all cursor-pointer"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Dedicated Admin Footer */}
        <footer className="mt-auto border-t border-white/10 px-4 sm:px-8 py-5 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#0a1424]/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#e9c176]" />
            <span>© 2026 JIWANDANA CMS Control Panel • Dilindungi Enkripsi & Akses Administrator</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Supabase Connected
            </span>
            <span>v2.4.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
