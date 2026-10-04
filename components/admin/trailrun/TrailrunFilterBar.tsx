'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { ALL_COLUMNS, DEFAULT_VISIBLE_KEYS } from './types';

interface TrailrunFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: 'all' | 'paid' | 'pending' | 'confirmed';
  setStatusFilter: (val: 'all' | 'paid' | 'pending' | 'confirmed') => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
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
    <div className="p-4 rounded-2xl bg-[#0a1424] border border-white/10 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, BIB, email, WhatsApp, kota..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#e9c176] focus:ring-1 focus:ring-[#e9c176] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
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
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-[#0a1424]">Semua Status</option>
              <option value="paid" className="bg-[#0a1424]">✓ Sudah Bayar (Lunas)</option>
              <option value="pending" className="bg-[#0a1424]">⏳ Menunggu Bayar</option>
              <option value="confirmed" className="bg-[#0a1424]">📌 Dikonfirmasi</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 text-xs">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer pr-2 max-w-[140px] truncate"
            >
              <option value="all" className="bg-[#0a1424]">Semua Kategori</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a1424]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Column Customizer Toggle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                showColumnFilter || visibleColumns.length !== DEFAULT_VISIBLE_KEYS.length
                  ? 'bg-[#e9c176] text-[#0d1c32] border-[#e9c176] font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
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
                  {(['Utama', 'Pembayaran', 'Profil & Kontak', 'Medis & Darurat'] as const).map(
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
