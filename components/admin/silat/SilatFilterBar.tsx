import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { KATEGORI_LOMBA_OPTIONS, TINGKAT_PENDIDIKAN_OPTIONS } from '@/components/silat/types';
import type { SilatKontingenRow } from './types';

interface SilatFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'paid' | 'pending';
  onStatusChange: (status: 'all' | 'paid' | 'pending') => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  educationFilter: string;
  onEducationChange: (edu: string) => void;
  genderFilter: 'all' | 'Laki-Laki' | 'Perempuan';
  onGenderChange: (g: 'all' | 'Laki-Laki' | 'Perempuan') => void;
  kontingenFilter?: string;
  onKontingenChange?: (id: string) => void;
  kontingenList?: SilatKontingenRow[];
  onReset: () => void;
}

export default function SilatFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  educationFilter,
  onEducationChange,
  genderFilter,
  onGenderChange,
  kontingenFilter = 'all',
  onKontingenChange,
  kontingenList = [],
  onReset,
}: SilatFilterBarProps) {
  const isFiltered =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    educationFilter !== 'all' ||
    genderFilter !== 'all' ||
    kontingenFilter !== 'all';

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Bar */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama atlet, asal sekolah, NIK, order ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00b4d8] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Akun / Kontingen */}
        {onKontingenChange && (
          <div className="md:col-span-3">
            <select
              value={kontingenFilter}
              onChange={(e) => onKontingenChange(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#00b4d8] transition-all cursor-pointer font-medium"
            >
              <option value="all" className="bg-[#0a1424] text-white">
                Semua Kontingen ({kontingenList.length})
              </option>
              {kontingenList.map((k) => (
                <option key={k.id} value={k.id} className="bg-[#0a1424] text-white">
                  {k.nama_kontingen} {k.account_email ? `(${k.account_email})` : ''} [{k.total_atlets || 0} atlet]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 11 Kategori Filter */}
        <div className={onKontingenChange ? 'md:col-span-3' : 'md:col-span-3'}>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#00b4d8] transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#0a1424] text-white">Semua Kategori (11 Kategori)</option>
            {KATEGORI_LOMBA_OPTIONS.map((k) => (
              <option key={k} value={k} className="bg-[#0a1424] text-white">
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Status Bayar Filter */}
        <div className={onKontingenChange ? 'md:col-span-2' : 'md:col-span-2'}>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#00b4d8] transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#0a1424] text-white">Semua Status</option>
            <option value="paid" className="bg-[#0a1424] text-emerald-400">Lunas (Paid)</option>
            <option value="pending" className="bg-[#0a1424] text-amber-400">Pending</option>
          </select>
        </div>
      </div>

      {/* Row 2: Secondary Filters (Tingkat Pendidikan, Gender, Reset) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tingkat Pendidikan Filter */}
          <select
            value={educationFilter}
            onChange={(e) => onEducationChange(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#00b4d8] transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#0a1424] text-white">Semua Usia / Jenjang</option>
            {TINGKAT_PENDIDIKAN_OPTIONS.map((tingkat) => (
              <option key={tingkat} value={tingkat} className="bg-[#0a1424] text-white">
                {tingkat}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => onGenderChange('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                genderFilter === 'all'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Gender
            </button>
            <button
              type="button"
              onClick={() => onGenderChange('Laki-Laki')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                genderFilter === 'Laki-Laki'
                  ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Putra
            </button>
            <button
              type="button"
              onClick={() => onGenderChange('Perempuan')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                genderFilter === 'Perempuan'
                  ? 'bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Putri
            </button>
          </div>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-rose-500/10"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
