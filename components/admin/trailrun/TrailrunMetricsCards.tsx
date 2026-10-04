'use client';

import React from 'react';
import { Trophy, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { MetricsData, formatCurrency } from './types';

interface TrailrunMetricsCardsProps {
  metrics: MetricsData;
}

export default function TrailrunMetricsCards({ metrics }: TrailrunMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Total Pendaftar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-white/10 space-y-2 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Total Pendaftar
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{metrics.total}</div>
        </div>
        <span className="text-[11px] text-slate-500 block pt-2 border-t border-white/10">Semua formulir masuk</span>
      </div>

      {/* Card 2: Sudah Bayar (Lunas) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-emerald-500/20 space-y-2 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sudah Bayar (Lunas)
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{metrics.paidCount}</div>
        </div>
        <span className="text-[11px] text-slate-400 block pt-2 border-t border-white/10">
          {metrics.total > 0
            ? `${Math.round((metrics.paidCount / metrics.total) * 100)}% dari total pendaftar`
            : '0% dari total'}
        </span>
      </div>

      {/* Card 3: Menunggu Pembayaran */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-amber-500/30 space-y-2.5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Pembayaran
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {metrics.pendingCount} Belum Bayar
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Belum Dibayar:</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono truncate mt-0.5">
              {formatCurrency(metrics.pendingRevenue)}
            </div>
          </div>

          {/* Fee Pendaftaran Peserta (Tiket) yang belum bayar */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              <span>Fee Tiket Belum Masuk:</span>
              <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono">Tiket</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
              {formatCurrency(metrics.pendingTicketRevenue)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Peserta Menunggu:</span>
            </span>
            <strong className="text-amber-400 font-bold font-mono">
              {metrics.pendingCount} Peserta
            </strong>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Biaya Admin & Kode Gateway:</span>
            <span className="font-mono text-amber-400/90 font-medium">
              +{formatCurrency(metrics.pendingRevenue - metrics.pendingTicketRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Total Penerimaan & Profit Fee Admin */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-[#e9c176]/30 space-y-2.5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#e9c176] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Total Penerimaan
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {metrics.paidCount} Lunas
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Full Bayar:</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono truncate mt-0.5">
              {formatCurrency(metrics.totalRevenue)}
            </div>
          </div>

          {/* Fee Pendaftaran Peserta (Murni Tiket Lomba) */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#e9c176]/10 border border-[#e9c176]/30 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#e9c176] font-bold">
              <span>Fee Pendaftaran Peserta:</span>
              <span className="text-[9px] bg-[#e9c176]/20 px-1.5 py-0.2 rounded font-mono">Tiket</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-[#e9c176] font-mono">
              {formatCurrency(metrics.totalTicketRevenue)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Profit Fee Admin:</span>
            </span>
            <strong className="text-emerald-400 font-bold font-mono">
              +{formatCurrency(metrics.totalAdminProfit)}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Admin: {formatCurrency(metrics.totalAdminFee)}</span>
            <span>Tx Gateway: -{formatCurrency(metrics.totalGatewayFee)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
