'use client';

import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { Trophy, FileSpreadsheet, Download } from 'lucide-react';

import {
  TrailrunRow,
  MetricsData,
  ALL_COLUMNS,
  DEFAULT_VISIBLE_KEYS,
  getRowFinancials,
  useTrailrunData,
  exportIndividuToExcel,
  exportToCSV,
  TrailrunMetricsCards,
  TrailrunFilterBar,
  TrailrunTable,
  TrailrunDetailModal,
  EditHasilLariModal,
  TrailrunSubNav,
} from '@/components/admin/trailrun';

export default function PesertaIndividuPage() {
  const {
    data,
    loading,
    isRefreshing,
    isCleaningUp,
    isDeleting,
    updatingId,
    fetchData,
    handleUpdateStatus,
    handleSaveHasilLari,
    handleDeleteRow,
    handleCleanupUnpaid,
  } = useTrailrunData();

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_KEYS);
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'confirmed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'laki-laki' | 'perempuan'>('all');

  // Selected row for detail modal
  const [selectedRow, setSelectedRow] = useState<TrailrunRow | null>(null);

  // Hasil Lari edit modal
  const [editingHasilLariRow, setEditingHasilLariRow] = useState<TrailrunRow | null>(null);
  const [isSavingHasilLari, setIsSavingHasilLari] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pisahkan data peserta pribadi vs kelompok (Kelompok = ada data PIC)
  const { individuData, kelompokBatchesCount, totalKelompokPeserta } = useMemo(() => {
    const individu: TrailrunRow[] = [];
    const kelompokOrderMap = new Set<string>();
    let kelompokPeserta = 0;

    data.forEach((r) => {
      // Kelompok jika registration_type === 'bulk', ada data PIC, atau berelasi dengan order TR-BULK
      const isKelompok = Boolean(
        r.registration_type === 'bulk' ||
        (r.pic_name && r.pic_name.trim() !== '') ||
        (r.pic_phone && r.pic_phone.trim() !== '') ||
        (r.payment?.pic_name && r.payment.pic_name.trim() !== '') ||
        (r.payment?.pic_phone && r.payment.pic_phone.trim() !== '') ||
        (r.payment?.order_id && r.payment.order_id.startsWith('TR-BULK'))
      );

      if (isKelompok) {
        kelompokPeserta += 1;
        const oId = r.payment?.order_id || r.payment?.txn_id || r.id;
        kelompokOrderMap.add(oId);
      } else {
        // Peserta murni individu
        individu.push(r);
      }
    });

    return {
      individuData: individu,
      kelompokBatchesCount: kelompokOrderMap.size,
      totalKelompokPeserta: kelompokPeserta,
    };
  }, [data]);

  // Load saved column preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jiwandana_trailrun_table_cols');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVisibleColumns(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveColumnPreference = (cols: string[]) => {
    setVisibleColumns(cols);
    try {
      localStorage.setItem('jiwandana_trailrun_table_cols', JSON.stringify(cols));
    } catch {
      // ignore
    }
  };

  const toggleColumn = (key: string) => {
    let next: string[];
    if (visibleColumns.includes(key)) {
      if (visibleColumns.length <= 1) return;
      next = visibleColumns.filter((k) => k !== key);
    } else {
      next = [...visibleColumns, key];
    }
    saveColumnPreference(next);
  };

  const resetToDefaultColumns = () => saveColumnPreference(DEFAULT_VISIBLE_KEYS);
  const selectAllColumns = () => saveColumnPreference(ALL_COLUMNS.map((c) => c.key));
  const selectCompactColumns = () =>
    saveColumnPreference(['no_bib', 'nama', 'nik', 'kk', 'kategori', 'status', 'total_payment', 'no_hp']);

  // Distinct categories available in individu data
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    individuData.forEach((r) => {
      if (r.kategori) set.add(r.kategori);
    });
    return Array.from(set);
  }, [individuData]);

  // Counts for filter bar
  const filterCounts = useMemo(() => {
    const all = individuData.length;
    const paid = individuData.filter((r) => r.status === 'paid').length;
    const pending = all - paid; // Seluruh peserta yang belum lunas (pending/menunggu pembayaran)
    return {
      all,
      paid,
      pending,
      group: totalKelompokPeserta,
    };
  }, [individuData, totalKelompokPeserta]);

  // Filtered individu rows
  const filteredData = useMemo(() => {
    return individuData.filter((row) => {
      // Status filter
      if (statusFilter === 'paid') {
        if (row.status !== 'paid') return false;
      } else if (statusFilter === 'pending') {
        // Menunggu pembayaran: seluruh peserta yang belum lunas
        if (row.status === 'paid') return false;
      } else if (statusFilter !== 'all') {
        if (row.status !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (row.kategori !== categoryFilter) return false;
      }

      // Gender filter
      if (genderFilter !== 'all') {
        const g = (row.jenis_kelamin || '').toLowerCase();
        if (genderFilter === 'laki-laki' && !g.includes('laki') && !g.includes('pria') && !row.no_bib?.startsWith('M-')) {
          return false;
        }
        if (genderFilter === 'perempuan' && !g.includes('perempuan') && !g.includes('wanita') && !row.no_bib?.startsWith('F-')) {
          return false;
        }
      }

      // Search query (using deferred value for 60fps typing)
      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase();
        const match =
          row.nama.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.no_bib.toLowerCase().includes(q) ||
          row.no_hp.toLowerCase().includes(q) ||
          (row.nik && row.nik.toLowerCase().includes(q)) ||
          (row.kk && row.kk.toLowerCase().includes(q)) ||
          (row.kota && row.kota.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [individuData, statusFilter, categoryFilter, genderFilter, deferredSearch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, statusFilter, categoryFilter, genderFilter, pageSize]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  // Metrics for individu
  const metrics: MetricsData = useMemo(() => {
    const total = individuData.length;
    const paidRows = individuData.filter((r) => r.status === 'paid');
    const paidCount = paidRows.length;
    const pendingRows = individuData.filter((r) => r.status === 'pending' || r.status === 'confirmed');
    const pendingCount = pendingRows.length;

    let totalRevenue = 0;
    let totalTicketRevenue = 0;
    let totalAdminProfit = 0;
    let totalAdminFee = 0;
    let totalGatewayFee = 0;

    for (const r of paidRows) {
      const fin = getRowFinancials(r);
      totalRevenue += fin.totalPayment;
      totalTicketRevenue += fin.baseAmount;
      totalAdminProfit += fin.adminProfit;
      totalAdminFee += fin.adminFee;
      totalGatewayFee += fin.gatewayFee;
    }

    let pendingRevenue = 0;
    let pendingTicketRevenue = 0;
    for (const r of pendingRows) {
      const fin = getRowFinancials(r);
      pendingRevenue += fin.totalPayment;
      pendingTicketRevenue += fin.baseAmount;
    }

    return {
      total,
      paidCount,
      pendingCount,
      totalRevenue,
      totalTicketRevenue,
      pendingRevenue,
      pendingTicketRevenue,
      totalAdminProfit,
      totalAdminFee,
      totalGatewayFee,
    };
  }, [individuData]);

  const onSaveHasil = async (id: string, hasil: string) => {
    setIsSavingHasilLari(true);
    try {
      await handleSaveHasilLari(id, hasil);
      if (selectedRow?.id === id) {
        setSelectedRow((prev) => (prev ? { ...prev, hasil_lari: hasil } : null));
      }
      setEditingHasilLariRow(null);
    } finally {
      setIsSavingHasilLari(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e9c176]/15 border border-[#e9c176]/30 flex items-center justify-center text-[#e9c176]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Peserta Pribadi (Individu)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Kelola pendaftar tunggal/perorangan, verifikasi status pembayaran, dan sesuaikan nomor BIB.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => exportIndividuToExcel(filteredData)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer border border-emerald-500/30"
            title="Download file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(filteredData, visibleColumns, ALL_COLUMNS, 'peserta-individu-trailrun.csv')}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            title="Download file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <TrailrunSubNav
        individuCount={individuData.length}
        kelompokBatchCount={kelompokBatchesCount}
        totalKelompokPeserta={totalKelompokPeserta}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        onCleanup={handleCleanupUnpaid}
        isCleaningUp={isCleaningUp}
      />

      {/* 3. Metrics Cards (Individu) */}
      <TrailrunMetricsCards metrics={metrics} />

      {/* 4. Filter Bar */}
      <TrailrunFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        groupFilter="individual"
        setGroupFilter={() => {}}
        counts={filterCounts}
        availableCategories={availableCategories}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        resetToDefaultColumns={resetToDefaultColumns}
        selectAllColumns={selectAllColumns}
        selectCompactColumns={selectCompactColumns}
        showColumnFilter={showColumnFilter}
        setShowColumnFilter={setShowColumnFilter}
      />

      {/* 5. Main Table */}
      <TrailrunTable
        data={paginatedData}
        totalFilteredCount={filteredData.length}
        totalRawCount={individuData.length}
        startIndex={startIndex}
        endIndex={endIndex}
        currentPage={safeCurrentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        loading={loading}
        onSelectRow={(row) => setSelectedRow(row)}
        onUpdateStatus={handleUpdateStatus}
        updatingId={updatingId}
        onEditHasilLari={(row) => setEditingHasilLariRow(row)}
        onOpenColumnFilter={() => setShowColumnFilter(true)}
      />

      {/* 6. Detail Modal */}
      <TrailrunDetailModal
        selectedRow={selectedRow}
        onClose={() => setSelectedRow(null)}
        onUpdateStatus={handleUpdateStatus}
        updatingId={updatingId}
        onDeleteRow={handleDeleteRow}
        isDeleting={isDeleting}
        onEditHasilLari={(row) => setEditingHasilLariRow(row)}
      />

      {/* 7. Edit Hasil Lari Modal */}
      <EditHasilLariModal
        isOpen={Boolean(editingHasilLariRow)}
        participant={editingHasilLariRow}
        onClose={() => setEditingHasilLariRow(null)}
        onSave={onSaveHasil}
        isSaving={isSavingHasilLari}
      />
    </div>
  );
}
