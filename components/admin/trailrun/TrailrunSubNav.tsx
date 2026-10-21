'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, RefreshCw, Trash2, Printer } from 'lucide-react';

interface TrailrunSubNavProps {
  individuCount: number;
  kelompokBatchCount: number;
  totalKelompokPeserta: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onCleanup?: () => void;
  isCleaningUp?: boolean;
}

export default function TrailrunSubNav({
  individuCount,
  kelompokBatchCount,
  totalKelompokPeserta,
  onRefresh,
  isRefreshing,
  onCleanup,
  isCleaningUp,
}: TrailrunSubNavProps) {
  const pathname = usePathname();
  const isIndividu = pathname.includes('/trailrun/individu') || pathname === '/admin/trailrun';
  const isKelompok = pathname.includes('/trailrun/kelompok');

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
      {/* Tab Switcher: Individu vs Kelompok */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/40 border border-white/10">
        <Link
          href="/admin/trailrun/individu"
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            isIndividu
              ? 'bg-[#C9A227] text-[#0d1c32] shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Peserta Pribadi</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isIndividu ? 'bg-black/20 text-[#0d1c32]' : 'bg-white/10 text-slate-300'
            }`}
          >
            {individuCount}
          </span>
        </Link>

        <Link
          href="/admin/trailrun/kelompok"
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            isKelompok
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Peserta Kelompok</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isKelompok ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-300'
            }`}
          >
            {kelompokBatchCount} Transaksi ({totalKelompokPeserta} Org)
          </span>
        </Link>
      </div>

      {/* Action Buttons: Refresh, Cleanup, Generator BIB */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>
        )}

        {onCleanup && (
          <button
            type="button"
            onClick={onCleanup}
            disabled={isCleaningUp || isRefreshing}
            className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Bersihkan transaksi yang belum dibayar (> 65 menit)"
          >
            <Trash2 className={`w-3.5 h-3.5 ${isCleaningUp ? 'animate-spin' : ''}`} />
            <span>{isCleaningUp ? 'Membersihkan...' : 'Bersihkan Kadaluarsa'}</span>
          </button>
        )}

        <Link
          href="/trailrun/bib-generator"
          className="px-4 py-2.5 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          title="Buka Halaman Generator & Download Kartu BIB"
        >
          <Printer className="w-4 h-4 text-[#0d1c32]" />
          <span>Generator BIB</span>
        </Link>
      </div>
    </div>
  );
}
