'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, FileSpreadsheet, Download, RefreshCw, Trash2 } from 'lucide-react';

import {
  TrailrunRow,
  MetricsData,
  ALL_COLUMNS,
  DEFAULT_VISIBLE_KEYS,
  SAMPLE_TRAILRUN_DATA,
  getRowFinancials,
  TrailrunMetricsCards,
  TrailrunFilterBar,
  TrailrunTable,
  TrailrunDetailModal,
} from '@/components/admin/trailrun';

export default function AdminTrailrunPage() {
  const [data, setData] = useState<TrailrunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_KEYS);
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'confirmed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selected row for detail modal
  const [selectedRow, setSelectedRow] = useState<TrailrunRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load saved column preferences from localStorage
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
      // ignore JSON parse error
    }
  }, []);

  // Save column preferences
  const saveColumnPreference = (cols: string[]) => {
    setVisibleColumns(cols);
    try {
      localStorage.setItem('jiwandana_trailrun_table_cols', JSON.stringify(cols));
    } catch {
      // ignore
    }
  };

  // Toggle single column
  const toggleColumn = (key: string) => {
    let next: string[];
    if (visibleColumns.includes(key)) {
      if (visibleColumns.length <= 1) return; // Keep at least 1 column
      next = visibleColumns.filter((k) => k !== key);
    } else {
      next = [...visibleColumns, key];
    }
    saveColumnPreference(next);
  };

  // Presets
  const resetToDefaultColumns = () => saveColumnPreference(DEFAULT_VISIBLE_KEYS);
  const selectAllColumns = () => saveColumnPreference(ALL_COLUMNS.map((c) => c.key));
  const selectCompactColumns = () =>
    saveColumnPreference(['no_bib', 'nama', 'kategori', 'status', 'total_payment', 'no_hp']);

  // Fetch data from Supabase
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [regRes, payRes] = await Promise.all([
        supabase.from('trailrun_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('trailrun_payments').select('*').order('created_at', { ascending: false }),
      ]);

      const registrations = regRes.data || [];
      const payments = payRes.data || [];

      if (registrations.length === 0) {
        // Fallback to sample data for display / demonstration if DB empty
        setData(SAMPLE_TRAILRUN_DATA);
      } else {
        // Map payments by registration_id
        const paymentsMap = new Map<string, any>();
        payments.forEach((p) => {
          if (p.registration_id && !paymentsMap.has(p.registration_id)) {
            paymentsMap.set(p.registration_id, p);
          }
        });

        const merged: TrailrunRow[] = registrations.map((r: any) => {
          const pay = paymentsMap.get(r.id);
          return {
            id: r.id,
            nama: r.nama,
            email: r.email,
            no_bib: r.no_bib || '-',
            no_hp: r.no_hp,
            alamat: r.alamat,
            kota: r.kota,
            provinsi: r.provinsi,
            kewarganegaraan: r.kewarganegaraan,
            tanggal_lahir: r.tanggal_lahir,
            jenis_kelamin: r.jenis_kelamin,
            nama_komunitas: r.nama_komunitas,
            golongan_darah: r.golongan_darah,
            riwayat_medis: r.riwayat_medis,
            kontak_darurat: r.kontak_darurat,
            kategori: r.kategori,
            status: r.status || (pay?.status === 'completed' ? 'paid' : 'pending'),
            created_at: r.created_at,
            payment: pay,
          };
        });

        setData(merged);
      }
    } catch (err) {
      console.warn('Error fetching trailrun registrations from Supabase, using sample fallback:', err);
      setData(SAMPLE_TRAILRUN_DATA);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Status in Supabase & local state
  const handleUpdateStatus = async (id: string, newStatus: 'paid' | 'pending' | 'confirmed') => {
    setUpdatingId(id);
    try {
      // 1. Update Supabase registrations table
      await supabase
        .from('trailrun_registrations')
        .update({ status: newStatus })
        .eq('id', id);

      // 2. If changing to paid, also update payments table if exists
      if (newStatus === 'paid') {
        await supabase
          .from('trailrun_payments')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('registration_id', id);
      } else if (newStatus === 'pending') {
        await supabase
          .from('trailrun_payments')
          .update({ status: 'pending' })
          .eq('registration_id', id);
      }

      // 3. Update local state
      setData((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                status: newStatus,
                payment: row.payment
                  ? {
                      ...row.payment,
                      status: newStatus === 'paid' ? 'completed' : 'pending',
                    }
                  : row.payment,
              }
            : row
        )
      );

      // Update selected modal row if open
      if (selectedRow?.id === id) {
        setSelectedRow((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Hapus satu pendaftar langsung dari database
  const handleDeleteRow = async (id: string, nama: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus peserta "${nama}"?\nNomor BIB akan dibebaskan dan data transaksi terkait akan dihapus.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/trailrun/peserta?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        alert(`Peserta "${nama}" berhasil dihapus.`);
        setSelectedRow(null);
        await fetchData();
      } else {
        alert(result.message || 'Gagal menghapus peserta.');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message || 'Gagal menghubungi server.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bersihkan data transaksi & pendaftaran yang belum bayar (> 1 jam 5 menit / 65 menit)
  const handleCleanupUnpaid = async () => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin membersihkan data transaksi & pendaftaran yang BELUM DIBAYAR dan sudah LEBIH DARI 1 jam 5 menit (65 menit)?\n\n' +
      'Catatan: Peserta yang sudah lunas (PAID) dan peserta yang baru mendaftar (< 65 menit) TIDAK AKAN dihapus.'
    );
    if (!confirmed) return;

    setIsCleaningUp(true);
    try {
      const res = await fetch('/api/cron/cleanup-unpaid?source=admin', {
        method: 'POST',
      });
      const result = await res.json();

      if (result.success) {
        alert(
          `Pembersihan Selesai!\n` +
          `Dihapus: ${result.deleted.payments_count} transaksi pembayaran & ${result.deleted.registrations_count} pendaftaran kadaluarsa (> 65 menit).\n` +
          (result.deleted.registrations_count === 0 ? '\n(Catatan: Belum ada data belum bayar yang usianya melebihi 65 menit.)' : '')
        );
        await fetchData();
      } else {
        alert(result.error || 'Gagal membersihkan data.');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message || 'Gagal memanggil API pembersihan.'}`);
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Distinct categories available in data
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.kategori) set.add(r.kategori);
    });
    return Array.from(set);
  }, [data]);

  // Filtered rows
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (row.status !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (row.kategori !== categoryFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          row.nama.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.no_bib.toLowerCase().includes(q) ||
          row.no_hp.toLowerCase().includes(q) ||
          (row.nama_komunitas && row.nama_komunitas.toLowerCase().includes(q)) ||
          (row.kota && row.kota.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [data, statusFilter, categoryFilter, searchQuery]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, pageSize]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  // Summary Metrics
  const metrics: MetricsData = useMemo(() => {
    const total = data.length;
    const paidRows = data.filter((r) => r.status === 'paid');
    const paidCount = paidRows.length;
    const pendingRows = data.filter((r) => r.status === 'pending' || r.status === 'confirmed');
    const pendingCount = pendingRows.length;

    // Deduplicate transaction amounts if multiple participants share the same txn_id / order_id (bulk registration)
    const seenPaidTxn = new Set<string>();
    let totalRevenue = 0;
    let totalTicketRevenue = 0;
    let totalAdminProfit = 0;
    let totalAdminFee = 0;
    let totalGatewayFee = 0;

    for (const r of paidRows) {
      const txnKey = r.payment?.txn_id || r.payment?.order_id;
      const fin = getRowFinancials(r);

      if (txnKey) {
        if (!seenPaidTxn.has(txnKey)) {
          seenPaidTxn.add(txnKey);
          totalRevenue += fin.totalPayment;
          totalTicketRevenue += fin.baseAmount;
          totalAdminProfit += fin.adminProfit;
          totalAdminFee += fin.adminFee;
          totalGatewayFee += fin.gatewayFee;
        }
      } else {
        totalRevenue += fin.totalPayment;
        totalTicketRevenue += fin.baseAmount;
        totalAdminProfit += fin.adminProfit;
        totalAdminFee += fin.adminFee;
        totalGatewayFee += fin.gatewayFee;
      }
    }

    // Calculate total unpaid / pending revenue
    const seenPendingTxn = new Set<string>();
    let pendingRevenue = 0;
    let pendingTicketRevenue = 0;
    for (const r of pendingRows) {
      const txnKey = r.payment?.txn_id || r.payment?.order_id;
      const fin = getRowFinancials(r);
      if (txnKey) {
        if (!seenPendingTxn.has(txnKey)) {
          seenPendingTxn.add(txnKey);
          pendingRevenue += fin.totalPayment;
          pendingTicketRevenue += fin.baseAmount;
        }
      } else {
        pendingRevenue += fin.totalPayment;
        pendingTicketRevenue += fin.baseAmount;
      }
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
  }, [data]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'No',
      'No. BIB',
      'Nama Peserta',
      'Kategori',
      'Status Pembayaran',
      'Harga Tiket (Rp)',
      'Biaya Admin (Rp)',
      'Biaya Tx Gateway (Rp)',
      'Profit Fee Admin (Rp)',
      'Total Bayar (Rp)',
      'Metode Bayar',
      'Email',
      'WhatsApp / HP',
      'Jenis Kelamin',
      'Tanggal Lahir',
      'Kewarganegaraan',
      'Komunitas / Klub',
      'Kota',
      'Provinsi',
      'Alamat Lengkap',
      'Golongan Darah',
      'Riwayat Medis',
      'Kontak Darurat',
      'ID Transaksi',
      'Order ID',
      'Waktu Pendaftaran',
    ];

    const dataRows = filteredData.map((row, idx) => {
      const fin = getRowFinancials(row);
      return [
        idx + 1,
        row.no_bib || '-',
        row.nama || '-',
        row.kategori || '-',
        row.status === 'paid' ? 'Lunas (Paid)' : row.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu Bayar',
        fin.baseAmount,
        fin.adminFee,
        fin.gatewayFee,
        fin.adminProfit,
        fin.totalPayment,
        row.payment?.payment_method?.toUpperCase() || '-',
        row.email || '-',
        row.no_hp || '-',
        row.jenis_kelamin || '-',
        row.tanggal_lahir || '-',
        row.kewarganegaraan || 'Indonesia',
        row.nama_komunitas || '-',
        row.kota || '-',
        row.provinsi || '-',
        row.alamat || '-',
        row.golongan_darah || '-',
        row.riwayat_medis || '-',
        row.kontak_darurat || '-',
        row.payment?.txn_id || '-',
        row.payment?.order_id || '-',
        row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-',
      ];
    });

    const worksheetData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    ws['!cols'] = [
      { wch: 6 },   // No
      { wch: 14 },  // No. BIB
      { wch: 26 },  // Nama Peserta
      { wch: 14 },  // Kategori
      { wch: 20 },  // Status Pembayaran
      { wch: 16 },  // Harga Tiket
      { wch: 16 },  // Biaya Admin
      { wch: 18 },  // Biaya Tx Gateway
      { wch: 18 },  // Profit Admin
      { wch: 18 },  // Total Bayar
      { wch: 16 },  // Metode Bayar
      { wch: 28 },  // Email
      { wch: 18 },  // WhatsApp / HP
      { wch: 14 },  // Jenis Kelamin
      { wch: 14 },  // Tanggal Lahir
      { wch: 16 },  // Kewarganegaraan
      { wch: 22 },  // Komunitas / Klub
      { wch: 16 },  // Kota
      { wch: 16 },  // Provinsi
      { wch: 32 },  // Alamat Lengkap
      { wch: 12 },  // Golongan Darah
      { wch: 24 },  // Riwayat Medis
      { wch: 20 },  // Kontak Darurat
      { wch: 22 },  // ID Transaksi
      { wch: 22 },  // Order ID
      { wch: 22 },  // Waktu Pendaftaran
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta Trailrun');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `peserta-trailrun-${dateStr}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    // Headers based on active visible columns
    const activeCols = ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key));
    const headerRow = activeCols.map((c) => `"${c.label}"`).join(',');

    const rows = filteredData.map((row) => {
      const fin = getRowFinancials(row);
      return activeCols
        .map((col) => {
          let val = '';
          switch (col.key) {
            case 'no_bib':
              val = row.no_bib;
              break;
            case 'nama':
              val = row.nama;
              break;
            case 'kategori':
              val = row.kategori;
              break;
            case 'status':
              val = row.status === 'paid' ? 'LUNAS (PAID)' : row.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu Bayar';
              break;
            case 'total_payment':
              val = fin.totalPayment > 0 ? `Rp ${fin.totalPayment.toLocaleString('id-ID')}` : '-';
              break;
            case 'base_amount':
              val = fin.baseAmount > 0 ? `Rp ${fin.baseAmount.toLocaleString('id-ID')}` : '-';
              break;
            case 'admin_profit':
              val = `Rp ${fin.adminProfit.toLocaleString('id-ID')}`;
              break;
            case 'admin_fee':
              val = `Rp ${fin.adminFee.toLocaleString('id-ID')}`;
              break;
            case 'gateway_fee':
              val = `Rp ${fin.gatewayFee.toLocaleString('id-ID')}`;
              break;
            case 'payment_method':
              val = row.payment?.payment_method?.toUpperCase() || '-';
              break;
            case 'email':
              val = row.email;
              break;
            case 'no_hp':
              val = row.no_hp;
              break;
            case 'created_at':
              val = new Date(row.created_at).toLocaleString('id-ID');
              break;
            case 'jenis_kelamin':
              val = row.jenis_kelamin || '-';
              break;
            case 'tanggal_lahir':
              val = row.tanggal_lahir || '-';
              break;
            case 'nama_komunitas':
              val = row.nama_komunitas || '-';
              break;
            case 'kota_provinsi':
              val = `${row.kota || ''}, ${row.provinsi || ''}`;
              break;
            case 'alamat':
              val = row.alamat || '-';
              break;
            case 'golongan_darah':
              val = row.golongan_darah || '-';
              break;
            case 'riwayat_medis':
              val = row.riwayat_medis || '-';
              break;
            case 'kontak_darurat':
              val = row.kontak_darurat || '-';
              break;
            case 'txn_id':
              val = row.payment?.txn_id || '-';
              break;
            case 'order_id':
              val = row.payment?.order_id || '-';
              break;
            default:
              val = '';
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
      });

    const csvContent = '\uFEFF' + [headerRow, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `peserta-trailrun-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                Pendaftar & Pembayaran Trailrun
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Kelola database peserta lomba, verifikasi status pembayaran, dan sesuaikan tampilan tabel.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={fetchData}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleCleanupUnpaid}
            disabled={isCleaningUp || isRefreshing}
            className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Bersihkan transaksi & pendaftaran yang belum dibayar (> 1 jam 5 menit)"
          >
            <Trash2 className={`w-3.5 h-3.5 ${isCleaningUp ? 'animate-spin' : ''}`} />
            <span>{isCleaningUp ? 'Membersihkan...' : 'Bersihkan Kadaluarsa'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer border border-emerald-500/30"
            title="Download file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            title="Download file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Cards */}
      <TrailrunMetricsCards metrics={metrics} />

      {/* 3. Filter Bar */}
      <TrailrunFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        availableCategories={availableCategories}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        resetToDefaultColumns={resetToDefaultColumns}
        selectAllColumns={selectAllColumns}
        selectCompactColumns={selectCompactColumns}
        showColumnFilter={showColumnFilter}
        setShowColumnFilter={setShowColumnFilter}
      />

      {/* 4. Table */}
      <TrailrunTable
        data={paginatedData}
        totalFilteredCount={filteredData.length}
        totalRawCount={data.length}
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
        onOpenColumnFilter={() => setShowColumnFilter(true)}
      />

      {/* 5. Detail Modal */}
      <TrailrunDetailModal
        selectedRow={selectedRow}
        onClose={() => setSelectedRow(null)}
        onUpdateStatus={handleUpdateStatus}
        updatingId={updatingId}
        onDeleteRow={handleDeleteRow}
        isDeleting={isDeleting}
      />
    </div>
  );
}
