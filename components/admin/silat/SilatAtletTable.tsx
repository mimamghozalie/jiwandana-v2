import React from 'react';
import { Check, RotateCcw, Trash2, Eye, FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import type { SilatAtletRow } from './types';
import { formatRupiah, getSilatCategoryPrice } from '@/components/silat/types';

interface SilatAtletTableProps {
  data: SilatAtletRow[];
  loading: boolean;
  updatingId: string | null;
  onSelectRow: (row: SilatAtletRow) => void;
  onUpdateStatus: (id: string, newStatus: 'paid' | 'pending') => void;
  onDeleteRow: (id: string, nama: string) => void;
  startIndex?: number;
}

export default function SilatAtletTable({
  data,
  loading,
  updatingId,
  onSelectRow,
  onUpdateStatus,
  onDeleteRow,
  startIndex = 0,
}: SilatAtletTableProps) {
  return (
    <div className="w-full bg-[#0a1424] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[960px] border-collapse">
          <thead>
            <tr className="bg-white/[0.04] text-slate-400 text-[10px] uppercase tracking-wider font-extrabold border-b border-white/10">
              <th className="py-3 px-4 text-center w-12">No</th>
              <th className="py-3 px-4">Nama Lengkap &amp; Foto</th>
              <th className="py-3 px-4">Asal Sekolah / Kontingen</th>
              <th className="py-3 px-4">Kategori Lomba (11 Kat)</th>
              <th className="py-3 px-4">Kelas / Nomor</th>
              <th className="py-3 px-4 text-center">TB / BB</th>
              <th className="py-3 px-4">Dokumen</th>
              <th className="py-3 px-4">Biaya</th>
              <th className="py-3 px-4 text-center">Status Bayar</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#00b4d8] border-r-transparent mb-2" />
                  <p className="font-semibold text-slate-300">Memuat data atlet silat...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-slate-400 italic">
                  Tidak ada data atlet yang sesuai filter.
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const isPaid = row.status === 'paid';
                const price = getSilatCategoryPrice(row.kategori_lomba);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => onSelectRow(row)}
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                      {startIndex + index + 1}
                    </td>

                    {/* Foto & Nama */}
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {row.foto_url ? (
                          <img
                            src={row.foto_url}
                            alt={row.nama}
                            className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-bold text-xs">
                            {row.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="block text-white font-bold">{row.nama}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            NIK: {row.nik} • {row.jenis_kelamin}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Asal Sekolah / Kontingen */}
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <span className="block font-semibold">{row.asal_sekolah}</span>
                      <span className="text-[10px] text-slate-400">
                        {row.tingkat_pendidikan || 'Umum'} • {row.kota || 'Mojokerto'}
                      </span>
                    </td>

                    {/* Kategori Lomba */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00b4d8]/15 text-[#38bdf8] border border-[#00b4d8]/30">
                        {row.kategori_lomba}
                      </span>
                    </td>

                    {/* Kelas / Nomor Seni */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {row.kategori_kelas_seni || '-'}
                    </td>

                    {/* TB / BB */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                      {row.tinggi || '-'}cm / {row.berat || '-'}kg
                    </td>

                    {/* Dokumen: Foto & KK Link */}
                    <td
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        {row.foto_url ? (
                          <a
                            href={row.foto_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] flex items-center gap-1"
                            title="Buka Pas Foto"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Foto</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-600">-</span>
                        )}
                        {row.kk_url ? (
                          <a
                            href={row.kk_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] flex items-center gap-1"
                            title="Buka Berkas KK / Akta"
                          >
                            <FileText className="w-3 h-3" />
                            <span>KK</span>
                          </a>
                        ) : null}
                      </div>
                    </td>

                    {/* Biaya */}
                    <td className="py-3.5 px-4 text-slate-300 font-bold font-mono text-[11px] whitespace-nowrap">
                      {formatRupiah(price)}
                    </td>

                    {/* Status Bayar */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isPaid ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          LUNAS
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td
                      className="py-3.5 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Toggle Status Button */}
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          onClick={() => onUpdateStatus(row.id, isPaid ? 'pending' : 'paid')}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isPaid
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                          title={isPaid ? 'Ubah ke Pending' : 'Set Lunas'}
                        >
                          {isPaid ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>

                        {/* View Detail Button */}
                        <button
                          type="button"
                          onClick={() => onSelectRow(row)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition-all cursor-pointer"
                          title="Lihat Detail Atlet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onDeleteRow(row.id, row.nama)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all cursor-pointer"
                          title="Hapus Atlet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
