import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { KATEGORI_LOMBA_OPTIONS, TINGKAT_PENDIDIKAN_OPTIONS } from '@/components/silat/types';

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
  onReset,
}: SilatFilterBarProps) {
  const isFiltered =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    educationFilter !== 'all' ||
    genderFilter !== 'all';

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Bar */}
        <div className="md:col-span-5 relative">
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

        {/* 11 Kategori Filter */}
        <div className="md:col-span-3">
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
        <div className="md:col-span-2">
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

        {/* Tingkat Pendidikan Filter */}
        <div className="md:col-span-2 flex items-center gap-2">
          <select
            value={educationFilter}
            onChange={(e) => onEducationChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#00b4d8] transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#0a1424] text-white">Semua Usia / Jenjang</option>
            {TINGKAT_PENDIDIKAN_OPTIONS.map((tingkat) => (
              <option key={tingkat} value={tingkat} className="bg-[#0a1424] text-white">
                {tingkat}
              </option>
            ))}
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold shrink-0 cursor-pointer"
              title="Reset Filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
