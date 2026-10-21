'use client';

import React from 'react';
import { Users, CheckCircle2, Clock, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { MetricsData, formatCurrency } from './types';

interface TrailrunMetricsCardsProps {
  metrics: MetricsData;
}

export default function TrailrunMetricsCards({ metrics }: TrailrunMetricsCardsProps) {
  const paidPercent = metrics.total > 0 ? Math.round((metrics.paidCount / metrics.total) * 100) : 0;
  const pendingPercent = metrics.total > 0 ? Math.round((metrics.pendingCount / metrics.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Pendaftar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d1c32] to-[#070e1a] border border-white/10 p-5 shadow-lg flex flex-col justify-between group hover:border-[#C9A227]/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A227]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#C9A227]/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#C9A227]" />
            Total Pendaftar
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
            Form Masuk
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            {metrics.total}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Peserta terdaftar di sistem
          </span>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Konfirmasi:</span>
          <span className="text-white font-mono font-semibold">
            {metrics.paidCount} Lunas • {metrics.pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Card 2: Sudah Bayar (Lunas) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#072418] to-[#05140d] border border-emerald-500/30 p-5 shadow-lg flex flex-col justify-between group hover:border-emerald-400/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Sudah Lunas
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {paidPercent}% Rate
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight font-mono">
            {metrics.paidCount}
          </div>
          <span className="text-xs text-emerald-200/80 mt-0.5 block">
            Peserta berhasil diverifikasi
          </span>
        </div>

        <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-300">
          <span>Dana Tiket Lunas:</span>
          <span className="text-emerald-300 font-mono font-bold">
            {formatCurrency(metrics.totalTicketRevenue)}
          </span>
        </div>
      </div>

      {/* Card 3: Menunggu Pembayaran */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#241a07] to-[#140e05] border border-amber-500/30 p-5 shadow-lg flex flex-col justify-between group hover:border-amber-400/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Menunggu Bayar
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {pendingPercent}% Belum Bayar
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight font-mono">
            {metrics.pendingCount}
          </div>
          <span className="text-xs text-amber-200/80 mt-0.5 block truncate">
            Est. Tiket: {formatCurrency(metrics.pendingTicketRevenue)}
          </span>
        </div>

        <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-slate-300">
          <span>Total Tagihan Pending:</span>
          <span className="text-amber-300 font-mono font-bold">
            {formatCurrency(metrics.pendingRevenue)}
          </span>
        </div>
      </div>

      {/* Card 4: Total Penerimaan & Profit Bersih Admin */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#241d08] to-[#120e03] border border-[#C9A227]/40 p-5 shadow-lg flex flex-col justify-between group hover:border-[#C9A227] transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A227]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#e9c176] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#e9c176]" />
            Total Penerimaan
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227]/20 text-[#e9c176] border border-[#C9A227]/40">
            Gross
          </span>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono truncate">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Profit Admin: +{formatCurrency(metrics.totalAdminProfit)}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#C9A227]/20 flex items-center justify-between text-[11px] text-slate-300">
          <span>Fee Gateway:</span>
          <span className="font-mono text-slate-400">
            -{formatCurrency(metrics.totalGatewayFee)}
          </span>
        </div>
      </div>
    </div>
  );
}
