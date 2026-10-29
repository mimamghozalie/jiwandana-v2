'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, FileSpreadsheet, Phone, ExternalLink, Mail, UserCheck, Shield } from 'lucide-react';
import {
  useSilatAdminData,
  SilatMetricsCards,
  SilatSubNav,
  exportSilatOfficialsToExcel,
} from '@/components/admin/silat';

export default function AdminSilatKontingenPage() {
  const {
    atlets,
    officials,
    kontingen,
    payments,
    metrics,
    loading,
    isRefreshing,
    fetchData,
  } = useSilatAdminData();

  const [activeTab, setActiveTab] = useState<'kontingen' | 'officials'>('kontingen');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Data Kontingen &amp; Official Silat
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Kelola data akun kontingen, peserta atlet per kontingen, dan official pendamping.
            </p>
          </div>
        </div>

        {activeTab === 'officials' && (
          <button
            type="button"
            onClick={() => exportSilatOfficialsToExcel(officials)}
            disabled={officials.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Download file Excel Official (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Export Official (.xlsx)</span>
          </button>
        )}
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

      {/* 4. Switch Tab Kontingen vs Officials */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('kontingen')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'kontingen'
              ? 'bg-[#00b4d8] text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Daftar Akun Kontingen ({kontingen.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('officials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'officials'
              ? 'bg-[#00b4d8] text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Daftar Official &amp; Pelatih ({officials.length})
        </button>
      </div>

      {/* 5. TABEL KONTINGEN */}
      {activeTab === 'kontingen' && (
        <div className="w-full bg-[#0a1424] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[860px] border-collapse">
              <thead>
                <tr className="bg-white/[0.04] text-slate-400 text-[10px] uppercase tracking-wider font-extrabold border-b border-white/10">
                  <th className="py-3 px-4 text-center w-12">No</th>
                  <th className="py-3 px-4">Kontingen &amp; Akun Login</th>
                  <th className="py-3 px-4">Asal Sekolah</th>
                  <th className="py-3 px-4 text-center">Jumlah Atlet</th>
                  <th className="py-3 px-4">PIC &amp; Kontak</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {kontingen.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      Belum ada data kontingen yang tersimpan.
                    </td>
                  </tr>
                ) : (
                  kontingen.map((k, idx) => (
                    <tr key={k.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{k.nama_kontingen}</span>
                          {k.account_email ? (
                            <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono mt-0.5">
                              <Mail className="w-3 h-3" />
                              {k.account_email}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Akun belum terhubung</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{k.asal_sekolah || '-'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#00b4d8]/15 text-[#38bdf8] border border-[#00b4d8]/30">
                          {k.total_atlets || 0} Atlet
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-medium">{k.pic_name || '-'}</span>
                          {k.pic_phone ? (
                            <a
                              href={`https://wa.me/${k.pic_phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px] mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{k.pic_phone}</span>
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            k.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {k.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin/silat/atlet?kontingen_id=${k.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Lihat Atlet ({k.total_atlets || 0})</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TABEL OFFICIALS */}
      {activeTab === 'officials' && (
        <div className="w-full bg-[#0a1424] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-white/[0.04] text-slate-400 text-[10px] uppercase tracking-wider font-extrabold border-b border-white/10">
                  <th className="py-3 px-4 text-center w-12">No</th>
                  <th className="py-3 px-4">Nama Official &amp; Foto</th>
                  <th className="py-3 px-4">Kontingen</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Dokumen KK/KTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {officials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      Belum ada data official / pelatih yang tersimpan.
                    </td>
                  </tr>
                ) : (
                  officials.map((off, idx) => (
                    <tr key={off.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          {off.foto_url ? (
                            <img
                              src={off.foto_url}
                              alt={off.nama}
                              className="w-8 h-8 rounded-full object-cover border border-white/20"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-bold text-xs">
                              {off.nama.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="block">{off.nama}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {off.jenis_kelamin} • {off.kota || 'Mojokerto'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{off.kontingen_name || '-'}</span>
                          {off.account_email && (
                            <span className="text-[10px] text-cyan-400 font-mono">{off.account_email}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                          {off.jabatan}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{off.nik}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{off.no_hp || '-'}</td>
                      <td className="py-3 px-4">
                        {off.kk_url ? (
                          <a
                            href={off.kk_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-400 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <span>Lihat KK/KTP</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
