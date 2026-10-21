'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Filter, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { ALL_COLUMNS, DEFAULT_VISIBLE_KEYS } from './types';

interface TrailrunFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: 'all' | 'paid' | 'pending' | 'confirmed';
  setStatusFilter: (val: 'all' | 'paid' | 'pending' | 'confirmed') => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  genderFilter: 'all' | 'laki-laki' | 'perempuan';
  setGenderFilter: (val: 'all' | 'laki-laki' | 'perempuan') => void;
  groupFilter?: 'all' | 'group' | 'individual' | 'discount';
  setGroupFilter?: (val: 'all' | 'group' | 'individual' | 'discount') => void;
  counts: { all: number; paid: number; pending: number; group: number; discount?: number; totalDiscountAmount?: number };
  availableCategories: string[];
  visibleColumns: string[];
  toggleColumn: (key: string) => void;
  resetToDefaultColumns: () => void;
  selectAllColumns: () => void;
  selectCompactColumns: () => void;
  showColumnFilter: boolean;
  setShowColumnFilter: (val: boolean) => void;
}

export default function TrailrunFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  genderFilter,
  setGenderFilter,
  groupFilter = 'all',
  setGroupFilter,
  counts,
  availableCategories,
  visibleColumns,
  toggleColumn,
  resetToDefaultColumns,
  selectAllColumns,
  selectCompactColumns,
  showColumnFilter,
  setShowColumnFilter,
}: TrailrunFilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0d1c32] to-[#0a1424] border border-white/10 space-y-3.5 shadow-lg">
      {/* Quick Status Tabs Strip */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/5 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('all');
            if (setGroupFilter) setGroupFilter('all');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            statusFilter === 'all' && groupFilter === 'all'
              ? 'bg-[#C9A227] text-[#0d1c32] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Semua Peserta</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              statusFilter === 'all' && groupFilter === 'all' ? 'bg-[#0d1c32]/20 text-[#0d1c32]' : 'bg-white/10 text-slate-300'
            }`}
          >
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('paid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            statusFilter === 'paid'
              ? 'bg-emerald-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Sudah Lunas</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              statusFilter === 'paid' ? 'bg-black/20 text-white' : 'bg-white/10 text-emerald-400'
            }`}
          >
            {counts.paid}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Menunggu Pembayaran</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              statusFilter === 'pending' ? 'bg-black/20 text-slate-950' : 'bg-white/10 text-amber-400'
            }`}
          >
            {counts.pending}
          </span>
        </button>

        {/* Tab Jalur Kelompok / Kolektif (Navigasi ke Tab Kelompok) */}
        <Link
          href="/admin/trailrun/kelompok"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border text-sky-300 border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 hover:text-white"
          title="Buka data peserta pendaftaran kelompok / rombongan"
        >
          <span>👥 Jalur Kelompok</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-200">
            {counts.group}
          </span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, BIB, email, WhatsApp, kota..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Column Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Group / Individual Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 text-xs font-medium">Jalur:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter?.(e.target.value as any)}
              className="bg-transparent text-white font-medium text-xs outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-[#0a1424]">Semua Jalur</option>
              <option value="discount" className="bg-[#0a1424]">🏷️ Promo Diskon ({counts.discount})</option>
              <option value="group" className="bg-[#0a1424]">👥 Kelompok ({counts.group})</option>
              <option value="individual" className="bg-[#0a1424]">👤 Individu ({counts.all - counts.group})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 text-xs font-medium">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-[#e9c176] font-bold text-xs outline-none cursor-pointer pr-2 max-w-[140px] truncate"
            >
              <option value="all" className="bg-[#0a1424] text-white">Semua Kategori</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a1424] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 text-xs font-medium">Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer pr-2 font-medium"
            >
              <option value="all" className="bg-[#0a1424]">Semua (M & F)</option>
              <option value="laki-laki" className="bg-[#0a1424]">Laki-laki (M-)</option>
              <option value="perempuan" className="bg-[#0a1424]">Perempuan (F-)</option>
            </select>
          </div>

          {/* Column Customizer Toggle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                showColumnFilter || visibleColumns.length !== DEFAULT_VISIBLE_KEYS.length
                  ? 'bg-[#C9A227] text-[#0d1c32] border-[#C9A227] font-bold shadow-md'
                  : 'bg-black/30 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                Filter Kolom ({visibleColumns.length}/{ALL_COLUMNS.length})
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showColumnFilter ? 'rotate-180' : ''}`} />
            </button>

            {/* Column Filter Dropdown Popover */}
            {showColumnFilter && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 bg-[#0a1424] border border-white/20 rounded-2xl shadow-2xl z-50 space-y-4 font-sans backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#e9c176]">
                      Pilih Kolom Tabel
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Centang bagian kolom yang ingin Anda tampilkan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowColumnFilter(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset Shortcuts */}
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAllColumns}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={resetToDefaultColumns}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={selectCompactColumns}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                  >
                    Ringkas
                  </button>
                </div>

                {/* Column List with checkboxes grouped */}
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1 text-xs divide-y divide-white/5">
                  {(['Utama', 'Pembayaran', 'Data Kelompok', 'Profil & Kontak', 'Medis & Darurat'] as const).map(
                    (categoryName) => {
                      const colsInCategory = ALL_COLUMNS.filter((c) => c.category === categoryName);
                      if (colsInCategory.length === 0) return null;

                      return (
                        <div key={categoryName} className="pt-2 first:pt-0 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                            {categoryName}
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {colsInCategory.map((col) => {
                              const isChecked = visibleColumns.includes(col.key);
                              return (
                                <label
                                  key={col.key}
                                  className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors text-xs select-none ${
                                    isChecked
                                      ? 'bg-white/10 text-white font-medium'
                                      : 'hover:bg-white/5 text-slate-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleColumn(col.key)}
                                    className="rounded border-white/20 text-[#e9c176] focus:ring-[#e9c176] bg-transparent cursor-pointer"
                                  />
                                  <span className="truncate">{col.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-slate-400">
                  <span>
                    {visibleColumns.length} dari {ALL_COLUMNS.length} kolom aktif
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowColumnFilter(false)}
                    className="px-3 py-1 bg-[#e9c176] text-[#0d1c32] font-bold rounded-lg hover:bg-[#d8b065] transition-all cursor-pointer"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
