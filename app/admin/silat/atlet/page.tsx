'use client';

import React, { useState, useMemo, useDeferredValue } from 'react';
import { Trophy, FileSpreadsheet } from 'lucide-react';
import {
  useSilatAdminData,
  SilatMetricsCards,
  SilatSubNav,
  SilatFilterBar,
  SilatAtletTable,
  SilatDetailModal,
  exportSilatAtletsToExcel,
  SilatAtletRow,
} from '@/components/admin/silat';

export default function AdminSilatAtletPage() {
  const {
    atlets,
    kontingen,
    payments,
    metrics,
    loading,
    isRefreshing,
    updatingId,
    fetchData,
    handleUpdateAtletStatus,
    handleDeleteAtlet,
  } = useSilatAdminData();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Laki-Laki' | 'Perempuan'>('all');

  // Selected row for detail modal
  const [selectedRow, setSelectedRow] = useState<SilatAtletRow | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Filtered Data
  const filteredData = useMemo(() => {
    return atlets.filter((row) => {
      // 1. Search Query
      if (deferredSearch.trim() !== '') {
        const q = deferredSearch.toLowerCase().trim();
        const matchName = row.nama.toLowerCase().includes(q);
        const matchSchool = (row.asal_sekolah || '').toLowerCase().includes(q);
        const matchNik = (row.nik || '').includes(q);
        const matchOrder = (row.order_id || '').toLowerCase().includes(q);
        if (!matchName && !matchSchool && !matchNik && !matchOrder) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;

      // 3. Category Filter (11 Kategori)
      if (categoryFilter !== 'all' && row.kategori_lomba !== categoryFilter) return false;

      // 4. Education Filter
      if (educationFilter !== 'all' && row.tingkat_pendidikan !== educationFilter) return false;

      // 5. Gender Filter
      if (genderFilter !== 'all' && row.jenis_kelamin !== genderFilter) return false;

      return true;
    });
  }, [atlets, deferredSearch, statusFilter, categoryFilter, educationFilter, genderFilter]);

  // Paginated Data
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setEducationFilter('all');
    setGenderFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#0077b6] text-white flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Data Atlet Pencak Silat DSC 2026
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Kelola data pesilat (11 Kategori), verifikasi kelengkapan pas foto &amp; KK, serta kontrol status pembayaran.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => exportSilatAtletsToExcel(filteredData)}
            disabled={filteredData.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Download file Excel (.xlsx) untuk bagan pertandingan"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <SilatSubNav
        totalAtlets={atlets.length}
        totalKontingen={kontingen.length}
        totalPayments={payments.length}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* 3. Metrics Cards */}
      <SilatMetricsCards metrics={metrics} />

      {/* 4. Filter Bar */}
      <SilatFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(c) => {
          setCategoryFilter(c);
          setCurrentPage(1);
        }}
        educationFilter={educationFilter}
        onEducationChange={(e) => {
          setEducationFilter(e);
          setCurrentPage(1);
        }}
        genderFilter={genderFilter}
        onGenderChange={(g) => {
          setGenderFilter(g);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* 5. Tabel Data Atlet */}
      <SilatAtletTable
        data={paginatedData}
        loading={loading}
        updatingId={updatingId}
        onSelectRow={(row) => setSelectedRow(row)}
        onUpdateStatus={handleUpdateAtletStatus}
        onDeleteRow={handleDeleteAtlet}
        startIndex={(currentPage - 1) * pageSize}
      />

      {/* 6. Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-2">
          <div>
            Menampilkan <span className="font-bold text-white">{(currentPage - 1) * pageSize + 1}</span> -{' '}
            <span className="font-bold text-white">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{' '}
            dari <span className="font-bold text-white">{filteredData.length}</span> atlet
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-mono text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* 7. Modal Detail Atlet */}
      <SilatDetailModal
        atlet={selectedRow}
        onClose={() => setSelectedRow(null)}
        onUpdateStatus={(id, st) => {
          handleUpdateAtletStatus(id, st);
          if (selectedRow) setSelectedRow({ ...selectedRow, status: st });
        }}
        onDeleteRow={handleDeleteAtlet}
        updatingId={updatingId}
      />
    </div>
  );
}
