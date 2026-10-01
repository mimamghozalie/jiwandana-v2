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
    { name: 'Kelola Event', href: '/admin/events', icon: Calendar },
    { name: 'Kelola Portofolio', href: '/admin/portofolio', icon: ImageIcon },
    { name: 'Inbox Booking', href: '/admin/bookings', icon: Inbox },
    { name: 'Inbox Pesan Kontak', href: '/admin/contacts', icon: Mail },
    { name: 'Kelola Testimonial', href: '/admin/testimonials', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#070e1a] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a1424] border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#e9c176]" />
          <span className="font-serif font-bold text-[#e9c176] text-sm">
            JIWANDANA CMS
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0a1424] border-r border-white/10 p-6 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="space-y-8">
          {/* Logo Brand */}
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/logo.webp" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#e9c176]">
                JIWANDANA
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-sans block">
                Control Panel CMS
              </span>
            </div>
          </Link>

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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
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

        {/* Sidebar Bottom: Back to Website */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          >
            <span>Buka Website Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
