'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RegistrationModeTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isKelompok = pathname.includes('/kelompok') || pathname.endsWith('/kelompok');
  const dist = searchParams.get('dist');
  const distQuery = dist ? `?dist=${encodeURIComponent(dist)}` : '';

  return (
    <div className="flex items-center justify-center p-1 rounded-2xl bg-white border border-black/10 shadow-xs mb-6 max-w-xl mx-auto">
      <Link
        href={`/trailrun/daftar/individu${distQuery}`}
        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
          !isKelompok
            ? 'bg-[#C9A227] text-[#0d1c32] shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <span className="material-symbols-outlined text-sm">person</span>
        <span>Individu</span>
      </Link>
      <Link
        href={`/trailrun/daftar/kelompok${distQuery}`}
        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
          isKelompok
            ? 'bg-[#C9A227] text-[#0d1c32] shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <span className="material-symbols-outlined text-sm">groups</span>
        <span>Kolektif / Grup (Min. 5)</span>
      </Link>
    </div>
  );
}
