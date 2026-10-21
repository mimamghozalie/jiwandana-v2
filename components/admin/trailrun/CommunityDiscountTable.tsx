'use client';

import React, { useState } from 'react';
import { Tag, CheckCircle2, Clock, Users, Building, Phone, Mail, ChevronDown, ChevronUp, Search, Download } from 'lucide-react';
import { TrailrunRow, formatCurrency, getRowFinancials } from './types';
import * as XLSX from 'xlsx';

export interface CommunityDiscountGroup {
  orderId: string;
  namaKomunitas: string;
  picName: string;
  picPhone: string;
  picEmail: string;
  totalParticipants: number;
  paidParticipants: number;
  pendingParticipants: number;
  isFullyPaid: boolean;
  rawTicketTotal: number;
  discountAmount: number; // Rp 320.000 jika 10 pax
  finalTicketTotal: number;
  adminFeeTotal: number;
  totalPayment: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  participants: TrailrunRow[];
  createdAt: string;
}

interface CommunityDiscountTableProps {
  groups: CommunityDiscountGroup[];
  totalDiscountAmount: number;
  totalPaidDiscountAmount: number;
  onSelectParticipant?: (row: TrailrunRow) => void;
}

export default function CommunityDiscountTable({
  groups,
  totalDiscountAmount,
  totalPaidDiscountAmount,
  onSelectParticipant,
}: CommunityDiscountTableProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'pending'>('all');

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    if (filterPayment === 'paid' && !g.isFullyPaid) return false;
    if (filterPayment === 'pending' && g.isFullyPaid) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        g.namaKomunitas.toLowerCase().includes(q) ||
        g.picName.toLowerCase().includes(q) ||
        g.picPhone.toLowerCase().includes(q) ||
        g.orderId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Export recap to Excel
  const handleExportRecapExcel = () => {
    if (groups.length === 0) return;

    const headers = [
      'No',
      'Order ID',
      'Nama Komunitas / Klub',
      'Nama PIC',
      'No. WhatsApp PIC',
      'Email PIC',
      'Jumlah Peserta',
      'Status Pembayaran',
      'Subtotal Tiket Normal',
      'Potongan Diskon (Promo 10 Org)',
      'Subtotal Tiket Setelah Diskon',
      'Total Biaya Admin',
      'Total Yang Dibayar',
      'Metode Bayar',
      'Waktu Pendaftaran',
    ];

    const dataRows = filteredGroups.map((g, idx) => [
      idx + 1,
      g.orderId,
      g.namaKomunitas,
      g.picName || '-',
      g.picPhone || '-',
      g.picEmail || '-',
      g.totalParticipants,
      g.isFullyPaid ? 'LUNAS (PAID)' : 'MENUNGGU BAYAR',
      g.rawTicketTotal,
      g.discountAmount,
      g.finalTicketTotal,
      g.adminFeeTotal,
      g.totalPayment,
      g.paymentMethod || '-',
      g.createdAt ? new Date(g.createdAt).toLocaleString('id-ID') : '-',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 26 },
      { wch: 22 },
      { wch: 18 },
      { wch: 24 },
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
      { wch: 26 },
      { wch: 26 },
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Diskon Komunitas');
    XLSX.writeFile(wb, `rekap-diskon-komunitas-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalPaidGroups = groups.filter((g) => g.isFullyPaid).length;
  const totalPendingGroups = groups.length - totalPaidGroups;

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Summary Metric Cards for Discount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Diskon Keseluruhan */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0d1c32] to-[#0a1424] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Total Diskon (Semua)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-slate-300">
              {groups.length} Komunitas
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#e9c176] font-mono">
            {formatCurrency(totalDiscountAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Potongan Rp 320.000 / rombongan 10 org
          </span>
        </div>

        {/* Card 2: Diskon Komunitas Sudah Lunas */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#072418] to-[#05140d] border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Diskon Lunas (Terealisasi)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              {totalPaidGroups} Sukses
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-300 font-mono">
            {formatCurrency(totalPaidDiscountAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total diskon dari transaksi yang sudah dibayar
          </span>
        </div>

        {/* Card 3: Diskon Menunggu Pembayaran */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#2a1b07] to-[#140e04] border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Diskon Belum Lunas
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300">
              {totalPendingGroups} Pending
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-300 font-mono">
            {formatCurrency(totalDiscountAmount - totalPaidDiscountAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Potensi diskon yang belum diselesaikan
          </span>
        </div>

        {/* Card 4: Total Peserta Rombongan */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0b1e36] to-[#071322] border border-sky-500/30 shadow-lg">
          <div className="flex items-center justify-between text-sky-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Peserta Rombongan
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 border border-sky-500/40 text-sky-300">
              10 Pax / Grup
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">
            {groups.reduce((acc, g) => acc + g.totalParticipants, 0)}{' '}
            <span className="text-xs font-normal text-slate-400">Orang</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Tergabung dalam program promo komunitas
          </span>
        </div>
      </div>

      {/* 2. Control & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0a1424] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama komunitas, PIC, order ID..."
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#C9A227]"
            />
          </div>

          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterPayment('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterPayment === 'all' ? 'bg-[#C9A227] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({groups.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPayment('paid')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterPayment === 'paid' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lunas ({totalPaidGroups})
            </button>
            <button
              type="button"
              onClick={() => setFilterPayment('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterPayment === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({totalPendingGroups})
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportRecapExcel}
          disabled={filteredGroups.length === 0}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-emerald-500/30 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Rekap (.xlsx)</span>
        </button>
      </div>

      {/* 3. Table of Communities */}
      <div className="rounded-2xl border border-white/10 bg-[#0a1424]/90 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-[#0d1c32] to-[#070e1a] text-slate-300 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Komunitas / Klub</th>
                <th className="py-3.5 px-4">Kontak PIC</th>
                <th className="py-3.5 px-4 text-center">Peserta</th>
                <th className="py-3.5 px-4">Status Bayar</th>
                <th className="py-3.5 px-4 text-right">Harga Normal</th>
                <th className="py-3.5 px-4 text-right text-amber-300">Potongan Diskon</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">Total Dibayar</th>
                <th className="py-3.5 px-4 text-center">Aksi / Detail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 space-y-2">
                    <Tag className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">Belum ada komunitas yang memenuhi kriteria diskon.</p>
                    <p className="text-xs text-slate-500">
                      Diskon promo berlaku untuk rombongan pendaftaran 10 orang (order TR-BULK).
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, index) => {
                  const isExpanded = expandedOrderId === group.orderId;

                  return (
                    <React.Fragment key={group.orderId}>
                      <tr
                        className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                          isExpanded ? 'bg-white/[0.04]' : ''
                        }`}
                        onClick={() => setExpandedOrderId(isExpanded ? null : group.orderId)}
                      >
                        <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        {/* Komunitas */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-[#e9c176] shrink-0" />
                            <span>{group.namaKomunitas || 'Komunitas Tanpa Nama'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {group.orderId}
                          </span>
                        </td>

                        {/* PIC */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">
                            {group.picName || '-'}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {group.picPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                {group.picPhone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Peserta */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full font-mono font-bold text-xs bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            {group.totalParticipants} Orang
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {group.isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" />
                              LUNAS (PAID)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Clock className="w-3 h-3" />
                              MENUNGGU BAYAR
                            </span>
                          )}
                        </td>

                        {/* Harga Normal */}
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          {formatCurrency(group.rawTicketTotal)}
                        </td>

                        {/* Diskon */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-300">
                          - {formatCurrency(group.discountAmount)}
                        </td>

                        {/* Total Dibayar */}
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400">
                          {formatCurrency(group.totalPayment)}
                        </td>

                        {/* Expand / Collapse Button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedOrderId(isExpanded ? null : group.orderId);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer border border-white/10"
                          >
                            <span>{isExpanded ? 'Tutup' : 'Lihat 10 Org'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Detail Nested: 10 Peserta dalam kelompok ini */}
                      {isExpanded && (
                        <tr className="bg-black/40">
                          <td colSpan={9} className="p-4 sm:p-5">
                            <div className="rounded-xl border border-white/10 bg-[#070e1a] p-4 space-y-3">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-[#e9c176]" />
                                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                    Daftar 10 Anggota: {group.namaKomunitas}
                                  </h4>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  PIC: <strong className="text-white">{group.picName}</strong> ({group.picPhone || '-'})
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                                {group.participants.map((p, pIdx) => (
                                  <div
                                    key={p.id}
                                    onClick={() => onSelectParticipant && onSelectParticipant(p)}
                                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#C9A227]/50 hover:bg-white/[0.05] transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                                        #{pIdx + 1}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#e9c176]/10 text-[#e9c176]">
                                        {p.no_bib || '-'}
                                      </span>
                                    </div>
                                    <div className="font-semibold text-white text-xs mt-1 truncate group-hover:text-[#e9c176]">
                                      {p.nama}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                      {p.kategori} • Jersey: {p.ukuran_jersey || '-'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
