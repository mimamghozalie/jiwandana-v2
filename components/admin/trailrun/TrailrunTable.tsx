'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Check,
  RotateCcw,
  Phone,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { TrailrunRow, formatCurrency, getRowFinancials } from './types';

interface TrailrunTableProps {
  data: TrailrunRow[];
  totalFilteredCount: number;
  totalRawCount: number;
  startIndex: number;
  endIndex: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  visibleColumns: string[];
  loading: boolean;
  onSelectRow: (row: TrailrunRow) => void;
  onUpdateStatus: (id: string, status: 'paid' | 'pending' | 'confirmed') => void;
  updatingId: string | null;
  onOpenColumnFilter: () => void;
}

export default function TrailrunTable({
  data,
  totalFilteredCount,
  totalRawCount,
  startIndex,
  endIndex,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  visibleColumns,
  loading,
  onSelectRow,
  onUpdateStatus,
  updatingId,
  onOpenColumnFilter,
}: TrailrunTableProps) {
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));

  return (
    <div className="bg-[#0a1424] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <th className="py-3.5 px-4 w-12 text-center">#</th>

              {visibleColumns.includes('no_bib') && <th className="py-3.5 px-4">No. BIB</th>}
              {visibleColumns.includes('nama') && <th className="py-3.5 px-4">Nama Peserta</th>}
              {visibleColumns.includes('kategori') && <th className="py-3.5 px-4">Kategori Lomba</th>}
              {visibleColumns.includes('status') && <th className="py-3.5 px-4">Status Bayar</th>}
              {visibleColumns.includes('total_payment') && <th className="py-3.5 px-4">Nominal Bayar</th>}
              {visibleColumns.includes('base_amount') && <th className="py-3.5 px-4 text-[#e9c176]">Fee Pendaftaran</th>}
              {visibleColumns.includes('admin_profit') && <th className="py-3.5 px-4 text-emerald-400">Profit Admin</th>}
              {visibleColumns.includes('admin_fee') && <th className="py-3.5 px-4">Biaya Admin</th>}
              {visibleColumns.includes('gateway_fee') && <th className="py-3.5 px-4">Tx Fee Gateway</th>}
              {visibleColumns.includes('payment_method') && <th className="py-3.5 px-4">Metode Bayar</th>}
              {visibleColumns.includes('email') && <th className="py-3.5 px-4">Email</th>}
              {visibleColumns.includes('no_hp') && <th className="py-3.5 px-4">WhatsApp / HP</th>}
              {visibleColumns.includes('created_at') && <th className="py-3.5 px-4">Waktu Daftar</th>}

              {visibleColumns.includes('jenis_kelamin') && <th className="py-3.5 px-4">Gender</th>}
              {visibleColumns.includes('tanggal_lahir') && <th className="py-3.5 px-4">Tgl Lahir</th>}
              {visibleColumns.includes('nama_komunitas') && <th className="py-3.5 px-4">Komunitas</th>}
              {visibleColumns.includes('kota_provinsi') && <th className="py-3.5 px-4">Kota / Asal</th>}
              {visibleColumns.includes('alamat') && <th className="py-3.5 px-4">Alamat</th>}
              {visibleColumns.includes('golongan_darah') && <th className="py-3.5 px-4">Gol. Darah</th>}
              {visibleColumns.includes('riwayat_medis') && <th className="py-3.5 px-4">Riwayat Medis</th>}
              {visibleColumns.includes('kontak_darurat') && <th className="py-3.5 px-4">Kontak Darurat</th>}
              {visibleColumns.includes('txn_id') && <th className="py-3.5 px-4">Txn ID</th>}
              {visibleColumns.includes('order_id') && <th className="py-3.5 px-4">Order ID</th>}

              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 font-sans">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-16 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e9c176]" />
                  <span>Memuat data pendaftar...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-16 text-center text-slate-400 space-y-2">
                  <Filter className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                  <p className="font-semibold text-slate-300">Tidak ada pendaftar yang cocok.</p>
                  <p className="text-xs text-slate-500">
                    Coba ganti filter status, kategori lomba, atau kata kunci pencarian.
                  </p>
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const isPaid = row.status === 'paid';
                const isPending = row.status === 'pending';
                const isConfirmed = row.status === 'confirmed';

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                    onClick={() => onSelectRow(row)}
                  >
                    <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                      {startIndex + index + 1}
                    </td>

                    {/* No. BIB */}
                    {visibleColumns.includes('no_bib') && (
                      <td className="py-3.5 px-4 font-bold text-[#e9c176]">
                        <span className="px-2 py-0.5 rounded bg-[#e9c176]/10 border border-[#e9c176]/30">
                          {row.no_bib || '-'}
                        </span>
                      </td>
                    )}

                    {/* Nama */}
                    {visibleColumns.includes('nama') && (
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {row.nama}
                      </td>
                    )}

                    {/* Kategori */}
                    {visibleColumns.includes('kategori') && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/10">
                          {row.kategori}
                        </span>
                      </td>
                    )}

                    {/* Status Pembayaran */}
                    {visibleColumns.includes('status') && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            LUNAS (PAID)
                          </span>
                        ) : isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            <Clock className="w-3.5 h-3.5" />
                            Dikonfirmasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5" />
                            Menunggu Bayar
                          </span>
                        )}
                      </td>
                    )}

                    {/* Nominal Bayar */}
                    {visibleColumns.includes('total_payment') && (
                      <td className="py-3.5 px-4 font-semibold text-slate-200 whitespace-nowrap">
                        {row.payment?.total_payment ? (
                          formatCurrency(row.payment.total_payment)
                        ) : row.payment?.amount ? (
                          formatCurrency(row.payment.amount)
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    )}

                    {/* Fee Pendaftaran (Tiket) */}
                    {visibleColumns.includes('base_amount') && (
                      <td className="py-3.5 px-4 font-semibold text-[#e9c176] whitespace-nowrap font-mono">
                        {formatCurrency(getRowFinancials(row).baseAmount)}
                      </td>
                    )}

                    {/* Profit Fee Admin */}
                    {visibleColumns.includes('admin_profit') && (
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                            +{formatCurrency(getRowFinancials(row).adminProfit)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            ~{formatCurrency(getRowFinancials(row).adminProfit)}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Biaya Admin */}
                    {visibleColumns.includes('admin_fee') && (
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                        {formatCurrency(getRowFinancials(row).adminFee)}
                      </td>
                    )}

                    {/* Biaya Tx Gateway */}
                    {visibleColumns.includes('gateway_fee') && (
                      <td className="py-3.5 px-4 whitespace-nowrap text-rose-300/80 font-mono text-[11px]">
                        -{formatCurrency(getRowFinancials(row).gatewayFee)}
                      </td>
                    )}

                    {/* Metode Bayar */}
                    {visibleColumns.includes('payment_method') && (
                      <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-slate-300 whitespace-nowrap">
                        {row.payment?.payment_method ? (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            {row.payment.payment_method.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    )}

                    {/* Email */}
                    {visibleColumns.includes('email') && (
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {row.email}
                      </td>
                    )}

                    {/* WhatsApp / No. HP */}
                    {visibleColumns.includes('no_hp') && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={`https://wa.me/${row.no_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:underline text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{row.no_hp}</span>
                        </a>
                      </td>
                    )}

                    {/* Waktu Daftar */}
                    {visibleColumns.includes('created_at') && (
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    )}

                    {/* Additional Columns */}
                    {visibleColumns.includes('jenis_kelamin') && (
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {row.jenis_kelamin || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('tanggal_lahir') && (
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {row.tanggal_lahir || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('nama_komunitas') && (
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {row.nama_komunitas || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('kota_provinsi') && (
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {[row.kota, row.provinsi].filter(Boolean).join(', ') || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('alamat') && (
                      <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate" title={row.alamat}>
                        {row.alamat || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('golongan_darah') && (
                      <td className="py-3.5 px-4 text-slate-300 font-bold text-center">
                        {row.golongan_darah || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('riwayat_medis') && (
                      <td
                        className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate"
                        title={row.riwayat_medis || undefined}
                      >
                        {row.riwayat_medis || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('kontak_darurat') && (
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {row.kontak_darurat || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('txn_id') && (
                      <td className="py-3.5 px-4 text-[10px] text-slate-400 whitespace-nowrap">
                        {row.payment?.txn_id || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('order_id') && (
                      <td className="py-3.5 px-4 text-[10px] text-slate-400 whitespace-nowrap">
                        {row.payment?.order_id || '-'}
                      </td>
                    )}

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div
                        className="flex items-center justify-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectRow(row)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Lihat Detail Peserta"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {row.status !== 'paid' ? (
                          <button
                            type="button"
                            disabled={updatingId === row.id}
                            onClick={() => onUpdateStatus(row.id, 'paid')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            title="Tandai Sudah Bayar (Lunas)"
                          >
                            <Check className="w-3 h-3" />
                            <span>Set Lunas</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingId === row.id}
                            onClick={() => onUpdateStatus(row.id, 'pending')}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            title="Kembalikan ke status Pending"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Batalkan</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination Controls */}
      <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs text-slate-400">
        {/* Left: Summary range & Page size */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            Menampilkan{' '}
            <strong className="text-white">
              {totalFilteredCount > 0 ? startIndex + 1 : 0} - {endIndex}
            </strong>{' '}
            dari <strong className="text-white">{totalFilteredCount}</strong> peserta
            {totalFilteredCount !== totalRawCount && (
              <span className="text-slate-500"> (difilter dari {totalRawCount} total)</span>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="text-[11px] text-slate-500">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs outline-none cursor-pointer focus:border-[#e9c176]"
            >
              <option value={10} className="bg-[#0a1424]">10 / hal</option>
              <option value={25} className="bg-[#0a1424]">25 / hal</option>
              <option value={50} className="bg-[#0a1424]">50 / hal</option>
              <option value={100} className="bg-[#0a1424]">100 / hal</option>
            </select>
          </div>
        </div>

        {/* Right: Pagination buttons & Column summary */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Current Page Indicator / Number Pills */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - safeCurrentPage) <= 1) return true;
                  return false;
                })
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="px-1 text-slate-500">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          safeCurrentPage === page
                            ? 'bg-[#e9c176] text-[#0d1c32] font-bold shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Column indicator */}
          <div className="pl-2 border-l border-white/10 hidden sm:flex items-center gap-1.5">
            <span>Kolom:</span>
            <button
              type="button"
              onClick={onOpenColumnFilter}
              className="text-[#e9c176] hover:underline font-semibold cursor-pointer"
            >
              {visibleColumns.length} aktif
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
