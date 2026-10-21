'use client';

import React, { useState } from 'react';
import {
  Users,
  Building,
  User,
  Phone,
  Mail,
  Tag,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Eye,
  Ticket,
  CircleDollarSign,
  ShieldCheck,
} from 'lucide-react';
import { TrailrunRow, formatCurrency } from './types';
import { GroupRegistrationBatch, exportKelompokToExcel } from './trailrunExport';

interface KelompokBatchTableProps {
  batches: GroupRegistrationBatch[];
  loading: boolean;
  onSelectParticipant?: (row: TrailrunRow) => void;
  onCancelBatch?: (
    orderId: string,
    groupName: string,
    participantCount: number,
    registrationIds?: string[],
    picPhone?: string
  ) => void;
}

export default function KelompokBatchTable({
  batches,
  loading,
  onSelectParticipant,
  onCancelBatch,
}: KelompokBatchTableProps) {
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterDiscount, setFilterDiscount] = useState<'all' | 'discount' | 'normal'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    if (filterPayment === 'paid' && !b.isFullyPaid) return false;
    if (filterPayment === 'pending' && b.isFullyPaid) return false;

    if (filterDiscount === 'discount' && !b.hasDiscount) return false;
    if (filterDiscount === 'normal' && b.hasDiscount) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        b.namaKomunitas.toLowerCase().includes(q) ||
        b.picName.toLowerCase().includes(q) ||
        b.picPhone.toLowerCase().includes(q) ||
        b.picEmail.toLowerCase().includes(q) ||
        b.orderId.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // 1. Total Fee Ticket (Nilai tiket murni)
  const totalPaidTicketFee = batches
    .filter((b) => b.isFullyPaid)
    .reduce((acc, b) => acc + (b.finalTicketTotal || 0), 0);
  const totalPendingTicketFee = batches
    .filter((b) => !b.isFullyPaid)
    .reduce((acc, b) => acc + (b.finalTicketTotal || 0), 0);

  // 2. Total Dana Masuk (Total bayar yang sudah lunas ditransfer)
  const totalDanaMasuk = batches
    .filter((b) => b.isFullyPaid)
    .reduce((acc, b) => acc + (b.totalPayment || 0), 0);
  const totalPendingDana = batches
    .filter((b) => !b.isFullyPaid)
    .reduce((acc, b) => acc + (b.totalPayment || 0), 0);

  // 3. Total Discount (Potongan harga promo kelompok)
  const totalDiscounts = batches.reduce((acc, b) => acc + (b.discountAmount || 0), 0);
  const totalPaidDiscounts = batches
    .filter((b) => b.isFullyPaid)
    .reduce((acc, b) => acc + (b.discountAmount || 0), 0);

  // 4. Total Biaya Admin (Fee Admin Rp 3.000 / orang)
  const totalPaidAdminFee = batches
    .filter((b) => b.isFullyPaid)
    .reduce((acc, b) => acc + (b.adminFeeTotal || (b.totalParticipants * 3000)), 0);
  const totalPendingAdminFee = batches
    .filter((b) => !b.isFullyPaid)
    .reduce((acc, b) => acc + (b.adminFeeTotal || (b.totalParticipants * 3000)), 0);

  // Peserta & Transaksi
  const totalParticipants = batches.reduce((acc, b) => acc + b.totalParticipants, 0);
  const paidParticipants = batches
    .filter((b) => b.isFullyPaid)
    .reduce((acc, b) => acc + b.totalParticipants, 0);
  const pendingParticipants = totalParticipants - paidParticipants;
  const paidBatchesCount = batches.filter((b) => b.isFullyPaid).length;

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Summary Metrics Cards (Total Fee Ticket, Total Dana Masuk, Total Discount, Total Biaya Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fee Ticket */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0e213b] to-[#0a1526] border border-sky-500/30 shadow-lg">
          <div className="flex items-center justify-between text-sky-300 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-sky-400" />
              Total Fee Tiket
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {paidParticipants} Tiket Lunas
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">
            {formatCurrency(totalPaidTicketFee)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pending: {formatCurrency(totalPendingTicketFee)} ({pendingParticipants} tiket)
          </span>
        </div>

        {/* Total Dana Masuk */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#072418] to-[#05140d] border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Total Dana Masuk
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {paidBatchesCount} Transaksi Lunas
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-300 font-mono">
            {formatCurrency(totalDanaMasuk)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pending: {formatCurrency(totalPendingDana)} ({batches.length - paidBatchesCount} transaksi)
          </span>
        </div>

        {/* Total Discount */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#251b08] to-[#120d04] border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Total Diskon
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Promo 10 Org
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#e9c176] font-mono">
            {formatCurrency(totalDiscounts)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Terealisasi: {formatCurrency(totalPaidDiscounts)} (Lunas)
          </span>
        </div>

        {/* Total Biaya Admin */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1b1231] to-[#0e091c] border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Total Biaya Admin
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Rp 3.000 / Org
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-300 font-mono">
            {formatCurrency(totalPaidAdminFee)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pending: {formatCurrency(totalPendingAdminFee)}
          </span>
        </div>
      </div>

      {/* 2. Control Bar: Search & Quick Filters */}
      <div className="p-3.5 rounded-2xl bg-[#0a1424] border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari PIC, WhatsApp, komunitas, Order ID..."
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-400"
            />
          </div>

          {/* Filter Status Bayar */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterPayment('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterPayment === 'all' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({batches.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPayment('paid')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterPayment === 'paid' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lunas ({paidBatchesCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterPayment('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterPayment === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({batches.length - paidBatchesCount})
            </button>
          </div>

          {/* Filter Diskon */}
          <select
            value={filterDiscount}
            onChange={(e) => setFilterDiscount(e.target.value as any)}
            className="bg-black/40 border border-white/10 text-xs text-amber-300 font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0a1424] text-white">Semua Diskon</option>
            <option value="discount" className="bg-[#0a1424] text-amber-300">🏷️ Hanya Yang Dapat Diskon</option>
            <option value="normal" className="bg-[#0a1424] text-slate-300">Tanpa Diskon</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => exportKelompokToExcel(filteredBatches)}
          disabled={filteredBatches.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-emerald-500/30 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Rekap (.xlsx)</span>
        </button>
      </div>

      {/* 3. Main Batches Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0a1424]/90 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-[#0d1c32] to-[#070e1a] text-slate-300 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama PIC</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Diskon</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <span>Memuat data pendaftaran kelompok...</span>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">Tidak ada pendaftaran kelompok yang cocok.</p>
                    <p className="text-xs text-slate-500">
                      Ganti kata kunci pencarian atau sesuaikan filter status pembayaran.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch, index) => {
                  const isExpanded = expandedOrderId === batch.orderId;

                  return (
                    <React.Fragment key={batch.orderId}>
                      <tr
                        className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                          isExpanded ? 'bg-white/[0.04]' : ''
                        }`}
                        onClick={() => setExpandedOrderId(isExpanded ? null : batch.orderId)}
                      >
                        <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        {/* Nama PIC & Rincian Transaksi */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#e9c176] shrink-0" />
                            <span className="text-sm">{batch.picName || 'PIC Belum Tercatat'}</span>
                            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              {batch.totalParticipants} Peserta
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                            <span className="font-mono text-[10px] text-slate-400">
                              Order: <strong className="text-sky-300 font-semibold">{batch.orderId}</strong>
                            </span>
                            {batch.picPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                {batch.picPhone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4">
                          {batch.isFullyPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              LUNAS (PAID)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Clock className="w-3.5 h-3.5" />
                              MENUNGGU BAYAR
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Total: <strong className="text-white">{formatCurrency(batch.totalPayment)}</strong> ({batch.paymentMethod || 'QRIS'})
                          </div>
                        </td>

                        {/* Diskon (Hanya muncul jika ada discount) */}
                        <td className="py-3.5 px-4">
                          {batch.hasDiscount && batch.discountAmount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                              <Tag className="w-3 h-3" />
                              Diskon {formatCurrency(batch.discountAmount)}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </td>

                        {/* Aksi Button */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedOrderId(isExpanded ? null : batch.orderId);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer border border-white/10"
                            >
                              <span>{isExpanded ? 'Tutup' : `Lihat ${batch.totalParticipants} Org`}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {!batch.isFullyPaid && onCancelBatch && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const regIds = batch.participants.map((p) => p.id);
                                  onCancelBatch(
                                    batch.orderId,
                                    batch.namaKomunitas,
                                    batch.totalParticipants,
                                    regIds,
                                    batch.picPhone
                                  );
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                title="Batalkan transaksi ini dan hapus data peserta yang belum bayar"
                              >
                                <span>Batalkan</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Detail Nested: Peserta dalam Transaksi Batch ini */}
                      {isExpanded && (
                        <tr className="bg-black/40">
                          <td colSpan={9} className="p-4 sm:p-5">
                            <div className="rounded-xl border border-white/10 bg-[#070e1a] p-4 space-y-3">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                                <div>
                                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4 text-sky-400" />
                                    Daftar Anggota Transaksi: {batch.orderId}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Komunitas: <strong className="text-white">{batch.namaKomunitas}</strong> • PIC: <strong className="text-white">{batch.picName}</strong> ({batch.picPhone || '-'})
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="text-[11px] text-slate-400">
                                    Subtotal Tiket: {formatCurrency(batch.rawTicketTotal)} {batch.hasDiscount && `(Diskon -${formatCurrency(batch.discountAmount)})`}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                                {batch.participants.map((p, pIdx) => (
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
                                    <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">
                                      WA: {p.no_hp || '-'}
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
