import React from 'react';
import { Users, ShieldCheck, Clock, DollarSign, Trophy, UserCheck } from 'lucide-react';
import type { SilatAdminMetrics } from './types';
import { formatRupiah } from '@/components/silat/types';

interface SilatMetricsCardsProps {
  metrics: SilatAdminMetrics;
}

export default function SilatMetricsCards({ metrics }: SilatMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Atlet */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Total Atlet
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {metrics.totalAtlets}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {metrics.totalPaidAtlets} Lunas • {metrics.totalPendingAtlets} Pending
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Total Kontingen & Official */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Kontingen &amp; Official
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {metrics.totalKontingen} <span className="text-xs font-normal text-slate-400">Tim</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {metrics.totalOfficials} Official terdaftar
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Total Pendapatan Terbayar (PAID) */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400 block">
            Pembayaran Lunas
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
            {formatRupiah(metrics.totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-500/70 block mt-0.5">
            {metrics.totalPaidAtlets} atlet terkonfirmasi
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Menunggu Pembayaran (PENDING) */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400 block">
            Menunggu Bayar
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-400 mt-1">
            {formatRupiah(metrics.pendingRevenue)}
          </div>
          <span className="text-[10px] text-amber-500/70 block mt-0.5">
            {metrics.totalPendingAtlets} atlet pending
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
