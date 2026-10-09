'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Check,
  RotateCcw,
  User,
  Phone,
  HeartPulse,
  MapPin,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { TrailrunRow, formatCurrency, getRowFinancials } from './types';

interface TrailrunDetailModalProps {
  selectedRow: TrailrunRow | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'paid' | 'pending' | 'confirmed') => void;
  updatingId: string | null;
  onDeleteRow?: (id: string, nama: string) => void;
  isDeleting?: boolean;
}

export function TrailrunDetailModal({
  selectedRow,
  onClose,
  onUpdateStatus,
  updatingId,
  onDeleteRow,
  isDeleting,
}: TrailrunDetailModalProps) {
  if (!selectedRow) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0a1424] border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans text-white p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#e9c176] px-2.5 py-1 rounded-full bg-[#e9c176]/10 border border-[#e9c176]/30 inline-block">
                BIB {selectedRow.no_bib || 'Belum Diatur'}
              </span>
              <span className="text-[11px] font-bold text-[#C9A227] px-2.5 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 inline-block">
                Jersey: {selectedRow.ukuran_jersey || '-'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {selectedRow.nama}
            </h3>
            <p className="text-xs text-slate-400">{selectedRow.kategori}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Quick Action Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Status Pembayaran Saat Ini
            </span>
            <div className="mt-1">
              {selectedRow.status === 'paid' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                  LUNAS (PAID)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Clock className="w-4 h-4" />
                  MENUNGGU PEMBAYARAN
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons to toggle status */}
          <div className="flex items-center gap-2">
            {selectedRow.status !== 'paid' ? (
              <button
                type="button"
                disabled={updatingId === selectedRow.id || isDeleting}
                onClick={() => onUpdateStatus(selectedRow.id, 'paid')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Set Lunas</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={updatingId === selectedRow.id || isDeleting}
                onClick={() => onUpdateStatus(selectedRow.id, 'pending')}
                className="px-4 py-2.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ubah ke Pending</span>
              </button>
            )}

            {onDeleteRow && (
              <button
                type="button"
                disabled={isDeleting || updatingId === selectedRow.id}
                onClick={() => onDeleteRow(selectedRow.id, selectedRow.nama)}
                className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Hapus pendaftar ini dari database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Hapus Pendaftar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Kontak & Bio */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
            <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#e9c176]" />
              Data Pribadi & Kontak
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-white">{selectedRow.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">WhatsApp:</span>
                <a
                  href={`https://wa.me/${selectedRow.no_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  <span>{selectedRow.no_hp}</span>
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gender:</span>
                <span className="text-white">{selectedRow.jenis_kelamin || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tgl Lahir:</span>
                <span className="text-white">{selectedRow.tanggal_lahir || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kewarganegaraan:</span>
                <span className="text-white">{selectedRow.kewarganegaraan || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Komunitas:</span>
                <span className="text-white">{selectedRow.nama_komunitas || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ukuran Jersey:</span>
                <span className="font-bold text-[#C9A227]">{selectedRow.ukuran_jersey || '-'}</span>
              </div>
            </div>
          </div>

          {/* Medis & Darurat */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
            <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              Kesehatan & Darurat
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Golongan Darah:</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">
                  {selectedRow.golongan_darah || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Kontak Darurat:</span>
                <span className="text-white font-medium block">
                  {selectedRow.kontak_darurat || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Riwayat Medis:</span>
                <span className="text-amber-200/90 block bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  {selectedRow.riwayat_medis || 'Tidak ada riwayat medis dilaporkan.'}
                </span>
              </div>
            </div>
          </div>

          {/* Alamat Domisili */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 sm:col-span-2">
            <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Alamat Lengkap
            </h4>
            <div className="text-slate-300 space-y-1">
              <p className="text-white">{selectedRow.alamat || '-'}</p>
              <p className="text-slate-400">
                {[selectedRow.kota, selectedRow.provinsi].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          {/* Rincian Transaksi */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-[#e9c176]" />
                Rincian Transaksi & Fee Payment Gateway
              </h4>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Fee Flat Rp 5.000
              </span>
            </div>

            {(() => {
              const fin = getRowFinancials(selectedRow);
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">Metode</span>
                      <span className="font-bold uppercase text-white">
                        {selectedRow.payment?.payment_method?.replace('_', ' ') || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">Harga Tiket</span>
                      <span className="font-bold text-white font-mono">
                        {formatCurrency(fin.baseAmount)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">Biaya Admin (Flat)</span>
                      <span className="font-bold text-white font-mono">
                        {formatCurrency(fin.adminFee)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">Total Bayar Peserta</span>
                      <span className="font-bold text-[#e9c176] font-mono">
                        {formatCurrency(fin.totalPayment)}
                      </span>
                    </div>
                  </div>

                  {/* Profit Breakdown Box */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                        Keuntungan Fee Admin (Profit Bersih)
                      </span>
                      <p className="text-slate-400 text-[11px]">
                        Biaya Admin ({formatCurrency(fin.adminFee)}) dikurangi Biaya Tx Gateway ({formatCurrency(fin.gatewayFee)} / 0.7% + 300)
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-lg font-black text-emerald-400 font-mono block">
                        +{formatCurrency(fin.adminProfit)}
                      </span>
                      <span className="text-[10px] text-emerald-300/80">
                        {selectedRow.status === 'paid' ? 'Sudah masuk profit lunas' : 'Estimasi profit saat lunas'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300 pt-1 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">ID Transaksi</span>
                      <span className="font-mono text-white truncate block" title={selectedRow.payment?.txn_id}>
                        {selectedRow.payment?.txn_id || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">Order ID</span>
                      <span className="font-mono text-white truncate block" title={selectedRow.payment?.order_id}>
                        {selectedRow.payment?.order_id || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 sm:col-span-1 col-span-2">
                      <span className="text-[10px] text-slate-400 uppercase block">Waktu Selesai</span>
                      <span className="text-slate-300 block">
                        {selectedRow.payment?.completed_at
                          ? new Date(selectedRow.payment.completed_at).toLocaleString('id-ID')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
