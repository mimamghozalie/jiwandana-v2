'use client';

import React from 'react';
import { CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import {
  useSilatAdminData,
  SilatMetricsCards,
  SilatSubNav,
} from '@/components/admin/silat';
import { formatRupiah } from '@/components/silat/types';

export default function AdminSilatPembayaranPage() {
  const {
    atlets,
    kontingen,
    payments,
    metrics,
    loading,
    isRefreshing,
    fetchData,
  } = useSilatAdminData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
            <CreditCard className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Transaksi Pembayaran Silat (Pakasir)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Monitoring transaksi otomatis QRIS dan Virtual Account Bank dari payment gateway Pakasir.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SubNav Tabs */}
      <SilatSubNav
        totalAtlets={atlets.length}
        totalKontingen={kontingen.length}
        totalPayments={payments.length}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* 3. Metrics Cards */}
      <SilatMetricsCards metrics={metrics} />

      {/* 4. Tabel Transaksi Pembayaran */}
      <div className="w-full bg-[#0a1424] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[840px] border-collapse">
            <thead>
              <tr className="bg-white/[0.04] text-slate-400 text-[10px] uppercase tracking-wider font-extrabold border-b border-white/10">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Order ID &amp; Txn ID</th>
                <th className="py-3 px-4">Kontingen &amp; PIC</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-center">Jumlah Atlet</th>
                <th className="py-3 px-4">Total Bayar</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Waktu Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Memuat data transaksi pembayaran...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Belum ada transaksi pembayaran yang tercatat di sistem.
                  </td>
                </tr>
              ) : (
                payments.map((p, idx) => {
                  const isCompleted = p.status === 'completed';
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono">
                        <span className="block font-bold text-white">{p.order_id}</span>
                        <span className="text-[10px] text-slate-400">Txn: {p.txn_id || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{p.kontingen_name || '-'}</span>
                        <span className="text-[10px] text-slate-400">
                          {p.pic_name || '-'} ({p.pic_phone || '-'})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">
                          {p.payment_method.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {p.total_atlet || 0}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-xs">
                        {formatRupiah(p.total_payment || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {p.status ? p.status.toUpperCase() : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {p.created_at ? new Date(p.created_at).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
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
