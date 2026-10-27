import React from 'react';
import { X, Check, RotateCcw, Trash2, ExternalLink, User, Phone, Mail, FileText, Image as ImageIcon } from 'lucide-react';
import type { SilatAtletRow } from './types';
import { formatRupiah, getSilatCategoryPrice } from '@/components/silat/types';

interface SilatDetailModalProps {
  atlet: SilatAtletRow | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: 'paid' | 'pending') => void;
  onDeleteRow: (id: string, nama: string) => void;
  updatingId: string | null;
}

export default function SilatDetailModal({
  atlet,
  onClose,
  onUpdateStatus,
  onDeleteRow,
  updatingId,
}: SilatDetailModalProps) {
  if (!atlet) return null;

  const isPaid = atlet.status === 'paid';
  const price = getSilatCategoryPrice(atlet.kategori_lomba);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-[#0a1424] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-white text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {atlet.foto_url ? (
              <img
                src={atlet.foto_url}
                alt={atlet.nama}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-bold text-lg">
                {atlet.nama.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00b4d8] block">
                BIODATA ATLET PENCAK SILAT
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {atlet.nama}
              </h3>
              <span className="text-[11px] text-slate-400">
                {atlet.asal_sekolah} • {atlet.kota || 'Mojokerto'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pembayaran Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status Pembayaran</span>
            <div className="mt-1">
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Check className="w-3.5 h-3.5" /> LUNAS (PAID)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  MENUNGGU PEMBAYARAN
                </span>
              )}
            </div>
          </div>

          {/* Toggle Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={updatingId === atlet.id}
              onClick={() => onUpdateStatus(atlet.id, isPaid ? 'pending' : 'paid')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPaid
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {isPaid ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isPaid ? 'Ubah ke Pending' : 'Set Lunas'}</span>
            </button>
          </div>
        </div>

        {/* Informasi Kategori Lomba & Biaya */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Kategori &amp; Kelas Lomba
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-bold text-[#38bdf8]">{atlet.kategori_lomba}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kelas / Seni:</span>
                <span className="font-semibold text-white">{atlet.kategori_kelas_seni || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenjang:</span>
                <span className="text-white">{atlet.tingkat_pendidikan}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5">
                <span className="text-slate-500">Tarif Pendaftaran:</span>
                <span className="font-bold text-emerald-400 font-mono">{formatRupiah(price)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Fisik &amp; Biodata
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">NIK:</span>
                <span className="font-mono text-white font-bold">{atlet.nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Lahir:</span>
                <span className="text-white">{atlet.tanggal_lahir} ({atlet.umur || '-'} Thn)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tinggi / Berat:</span>
                <span className="font-mono text-white">{atlet.tinggi || '-'} cm / {atlet.berat || '-'} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gender:</span>
                <span className="text-white">{atlet.jenis_kelamin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kontak BPJS & Dokumen Terlampir */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Kelengkapan Dokumen &amp; Kontak BPJS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block mb-0.5">No. HP Atlet / Ortu:</span>
              <a
                href={`https://wa.me/${(atlet.no_hp || '').replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{atlet.no_hp || '-'}</span>
              </a>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Email Atlet / Ortu:</span>
              <span className="text-white font-mono">{atlet.email || '-'}</span>
            </div>
          </div>

          {/* Tautan Berkas Foto & KK */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-3">
            {atlet.foto_url && (
              <a
                href={atlet.foto_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Lihat Pas Foto</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {atlet.kk_url && (
              <a
                href={atlet.kk_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat Berkas KK</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDeleteRow(atlet.id, atlet.nama);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Atlet</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
