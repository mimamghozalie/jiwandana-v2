'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, FileSpreadsheet, Download, RefreshCw, Trash2, Printer } from 'lucide-react';

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
  EditHasilLariModal,
  CommunityDiscountTable,
} from '@/components/admin/trailrun';

export default function AdminTrailrunPage() {
  const [data, setData] = useState<TrailrunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab Tampilan Utama: 'participants' (Tabel Peserta Lengkap) atau 'discount' (Tabel Rekap Diskon Komunitas)
  const [activeTab, setActiveTab] = useState<'participants' | 'discount'>('participants');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_KEYS);
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'confirmed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'laki-laki' | 'perempuan'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | 'group' | 'individual' | 'discount'>('all');

  // Selected row for detail modal
  const [selectedRow, setSelectedRow] = useState<TrailrunRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Hasil Lari edit modal
  const [editingHasilLariRow, setEditingHasilLariRow] = useState<TrailrunRow | null>(null);
  const [isSavingHasilLari, setIsSavingHasilLari] = useState(false);

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
          // Pastikan kolom NIK dan KK otomatis masuk jika belum ada di cache browser
          const hasNik = parsed.includes('nik');
          const hasKk = parsed.includes('kk');
          const finalCols = hasNik && hasKk ? parsed : [...parsed, 'nik', 'kk'];
          setVisibleColumns(finalCols);
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
    saveColumnPreference(['no_bib', 'nama', 'nik', 'kk', 'kategori', 'status', 'total_payment', 'no_hp']);

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
            nik: r.nik || '-',
            kk: r.kk || '-',
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
            ukuran_jersey: r.ukuran_jersey || '-',
            hasil_lari: r.hasil_lari || '-',
            status: r.status || (pay?.status === 'completed' ? 'paid' : 'pending'),
            created_at: r.created_at,
            payment: pay,
            pic_name: r.pic_name || pay?.pic_name || null,
            pic_phone: r.pic_phone || pay?.pic_phone || null,
            pic_email: r.pic_email || pay?.pic_email || null,
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

  // Update Hasil Lari Peserta
  const handleSaveHasilLari = async (id: string, newHasil: string) => {
    setIsSavingHasilLari(true);
    try {
      const res = await fetch('/api/admin/trailrun/update-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hasil_lari: newHasil }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || 'Gagal menyimpan hasil lari');
      }

      // 1. Update data state
      setData((prev) =>
        prev.map((row) => (row.id === id ? { ...row, hasil_lari: newHasil } : row))
      );

      // 2. Update selected modal row if open
      if (selectedRow?.id === id) {
        setSelectedRow((prev) => (prev ? { ...prev, hasil_lari: newHasil } : null));
      }

      setEditingHasilLariRow(null);
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message || 'Gagal menyimpan hasil lari'}`);
    } finally {
      setIsSavingHasilLari(false);
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

  // Hitung jumlah pendaftar per order_id / transaksi kelompok untuk mendeteksi rombongan 10 orang (Promo Diskon)
  const bulkOrderStats = useMemo(() => {
    // Map order_id -> participants
    const orderParticipantsMap: Record<string, TrailrunRow[]> = {};
    // Map community -> participants (jika order_id tidak ada atau peserta didaftarkan dengan nama komunitas)
    const communityParticipantsMap: Record<string, TrailrunRow[]> = {};

    data.forEach((r) => {
      const orderId = r.payment?.order_id || r.payment?.txn_id;
      if (orderId) {
        if (!orderParticipantsMap[orderId]) {
          orderParticipantsMap[orderId] = [];
        }
        orderParticipantsMap[orderId].push(r);
      } else if (r.nama_komunitas && r.nama_komunitas.trim() !== '') {
        const commKey = `COMM-${r.nama_komunitas.trim().toLowerCase()}`;
        if (!communityParticipantsMap[commKey]) {
          communityParticipantsMap[commKey] = [];
        }
        communityParticipantsMap[commKey].push(r);
      }
    });

    const discountOrderIds = new Set<string>();
    let discountEligibleParticipantsCount = 0;
    let totalDiscountAmount = 0;
    let totalPaidDiscountAmount = 0;
    const discountGroups: any[] = [];

    // Gabungkan grup berbasis orderId dan fallback grup berbasis nama_komunitas
    const allGroupsToEvaluate = [
      ...Object.entries(orderParticipantsMap),
      ...Object.entries(communityParticipantsMap),
    ];

    allGroupsToEvaluate.forEach(([groupKey, participants]) => {
      const count = participants.length;
      const isBulkOrder = groupKey.startsWith('TR-BULK') || participants.some((p) => p.payment?.order_id?.startsWith('TR-BULK'));
      
      // Kriteria diskon:
      // 1. Tepat 10 orang atau kelipatan 10 orang
      // 2. ATAU transaksi berawalan TR-BULK (pendaftaran kolektif kelompok)
      // 3. ATAU jika minimal ada 10 orang dalam satu komunitas
      const isEligible = count >= 10 || isBulkOrder;

      if (isEligible) {
        discountOrderIds.add(groupKey);
        participants.forEach((p) => {
          if (p.payment?.order_id) discountOrderIds.add(p.payment.order_id);
          if (p.payment?.txn_id) discountOrderIds.add(p.payment.txn_id);
        });

        // Hitung pengali diskon (setiap 10 orang dapat 320.000, minimal 1x diskon jika bulk order)
        const discountMultiplier = Math.max(1, Math.floor(count / 10));
        const groupDiscount = discountMultiplier * 320000;

        discountEligibleParticipantsCount += count;
        totalDiscountAmount += groupDiscount;

        const first = participants[0];
        const paidCount = participants.filter((p) => p.status === 'paid').length;
        const pendingCount = count - paidCount;
        const isFullyPaid = paidCount > 0 && paidCount === count;

        if (isFullyPaid) {
          totalPaidDiscountAmount += groupDiscount;
        }

        // Hitung nominal harga tiket normal
        let rawTicketTotal = 0;
        participants.forEach((p) => {
          const is12k = (p.kategori || '').toLowerCase().includes('12');
          rawTicketTotal += is12k ? 320000 : 270000;
        });

        const finalTicketTotal = Math.max(0, rawTicketTotal - groupDiscount);
        const adminFeeTotal = count * 3000; // Rp 3.000 / orang
        const totalPayment = finalTicketTotal + adminFeeTotal;

        discountGroups.push({
          orderId: first.payment?.order_id || groupKey,
          namaKomunitas: first.nama_komunitas || (groupKey.startsWith('TR-BULK') ? 'Komunitas Kolektif' : 'Komunitas Lari'),
          picName: first.pic_name || first.payment?.pic_name || first.nama,
          picPhone: first.pic_phone || first.payment?.pic_phone || first.no_hp,
          picEmail: first.pic_email || first.payment?.pic_email || first.email,
          totalParticipants: count,
          paidParticipants: paidCount,
          pendingParticipants: pendingCount,
          isFullyPaid,
          rawTicketTotal,
          discountAmount: groupDiscount,
          finalTicketTotal,
          adminFeeTotal,
          totalPayment: first.payment?.total_payment || totalPayment,
          paymentMethod: first.payment?.payment_method?.toUpperCase() || 'QRIS',
          paymentStatus: isFullyPaid ? 'paid' : 'pending',
          participants,
          createdAt: first.created_at,
        });
      }
    });

    return {
      discountOrderIds,
      discountEligibleParticipantsCount,
      totalDiscountAmount,
      totalPaidDiscountAmount,
      totalDiscountGroups: discountGroups.length,
      discountGroups,
    };
  }, [data]);

  // Filter counts
  const filterCounts = useMemo(() => {
    const all = data.length;
    const paid = data.filter((r) => r.status === 'paid').length;
    const pending = data.filter((r) => r.status === 'pending' || r.status === 'confirmed').length;
    const group = data.filter(
      (r) =>
        r.payment?.order_id?.startsWith('TR-BULK') ||
        (r.nama_komunitas && r.nama_komunitas.trim() !== '')
    ).length;
    const discount = data.filter((r) => {
      const orderId = r.payment?.order_id || r.payment?.txn_id;
      return orderId ? bulkOrderStats.discountOrderIds.has(orderId) : false;
    }).length;

    return {
      all,
      paid,
      pending,
      group,
      discount,
      totalDiscountAmount: bulkOrderStats.totalDiscountAmount,
    };
  }, [data, bulkOrderStats]);

  // Filtered rows
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const orderId = row.payment?.order_id || row.payment?.txn_id;
      const isDiscountEligible = orderId ? bulkOrderStats.discountOrderIds.has(orderId) : false;

      // Status filter
      if (statusFilter !== 'all') {
        if (row.status !== statusFilter) return false;
      }

      // Group / Jalur filter
      if (groupFilter !== 'all') {
        const isGroup =
          Boolean(row.payment?.order_id?.startsWith('TR-BULK')) ||
          Boolean(row.nama_komunitas && row.nama_komunitas.trim() !== '');

        if (groupFilter === 'discount') {
          if (!isDiscountEligible) return false;
        } else if (groupFilter === 'group') {
          if (!isGroup) return false;
        } else if (groupFilter === 'individual') {
          if (isGroup) return false;
        }
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

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          row.nama.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.no_bib.toLowerCase().includes(q) ||
          row.no_hp.toLowerCase().includes(q) ||
          (row.nik && row.nik.toLowerCase().includes(q)) ||
          (row.kk && row.kk.toLowerCase().includes(q)) ||
          (row.nama_komunitas && row.nama_komunitas.toLowerCase().includes(q)) ||
          (row.pic_name && row.pic_name.toLowerCase().includes(q)) ||
          (row.pic_phone && row.pic_phone.toLowerCase().includes(q)) ||
          (row.pic_email && row.pic_email.toLowerCase().includes(q)) ||
          (row.kota && row.kota.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [data, statusFilter, groupFilter, categoryFilter, genderFilter, searchQuery, bulkOrderStats]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, groupFilter, categoryFilter, genderFilter, pageSize]);

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
      'Ukuran Jersey',
      'Hasil Lari',
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
      'NIK',
      'No. KK',
      'Tanggal Lahir',
      'Kewarganegaraan',
      'Komunitas / Klub',
      'Nama PIC Kelompok',
      'No WA PIC Kelompok',
      'Email PIC Kelompok',
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
        row.ukuran_jersey || '-',
        row.hasil_lari || '-',
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
        row.nik || '-',
        row.kk || '-',
        row.tanggal_lahir || '-',
        row.kewarganegaraan || 'Indonesia',
        row.nama_komunitas || '-',
        row.pic_name || row.payment?.pic_name || '-',
        row.pic_phone || row.payment?.pic_phone || '-',
        row.pic_email || row.payment?.pic_email || '-',
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
      { wch: 14 },  // Ukuran Jersey
      { wch: 18 },  // Hasil Lari
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
      { wch: 20 },  // NIK
      { wch: 20 },  // No. KK
      { wch: 14 },  // Tanggal Lahir
      { wch: 16 },  // Kewarganegaraan
      { wch: 22 },  // Komunitas / Klub
      { wch: 22 },  // Nama PIC Kelompok
      { wch: 18 },  // No WA PIC Kelompok
      { wch: 26 },  // Email PIC Kelompok
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
            case 'ukuran_jersey':
              val = row.ukuran_jersey || '-';
              break;
            case 'hasil_lari':
              val = row.hasil_lari || '-';
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
            case 'nik':
              val = row.nik || '-';
              break;
            case 'kk':
              val = row.kk || '-';
              break;
            case 'tanggal_lahir':
              val = row.tanggal_lahir || '-';
              break;
            case 'nama_komunitas':
              val = row.nama_komunitas || '-';
              break;
            case 'pic_name':
              val = row.pic_name || row.payment?.pic_name || '-';
              break;
            case 'pic_phone':
              val = row.pic_phone || row.payment?.pic_phone || '-';
              break;
            case 'pic_email':
              val = row.pic_email || row.payment?.pic_email || '-';
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

          <Link
            href="/trailrun/bib-generator"
            className="px-4 py-2.5 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            title="Buka Halaman Generator & Download Kartu BIB"
          >
            <Printer className="w-4 h-4 text-[#0d1c32]" />
            <span>Generator BIB</span>
          </Link>

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

      {/* 2.1 Tab Switcher: Semua Peserta vs Rekap Diskon Komunitas */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('participants')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer border ${
            activeTab === 'participants'
              ? 'bg-[#C9A227] text-[#0d1c32] border-[#C9A227] shadow-md'
              : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Daftar Peserta Trailrun</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-current">
            {data.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discount')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer border ${
            activeTab === 'discount'
              ? 'bg-gradient-to-r from-amber-500 to-[#C9A227] text-slate-950 border-amber-300 shadow-lg'
              : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20'
          }`}
        >
          <span>🏷️ Tabel Rekap Diskon Komunitas</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-current">
            {bulkOrderStats.totalDiscountGroups} Kelompok
          </span>
        </button>
      </div>

      {activeTab === 'discount' ? (
        /* Tabel Khusus Rekap Diskon Komunitas */
        <CommunityDiscountTable
          groups={bulkOrderStats.discountGroups}
          totalDiscountAmount={bulkOrderStats.totalDiscountAmount}
          totalPaidDiscountAmount={bulkOrderStats.totalPaidDiscountAmount}
          onSelectParticipant={(row) => setSelectedRow(row)}
        />
      ) : (
        <>
          {/* 3. Filter Bar */}
          <TrailrunFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            groupFilter={groupFilter}
            setGroupFilter={setGroupFilter}
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

      {/* 3.1 Banner Ringkasan Tab Diskon Komunitas */}
      {groupFilter === 'discount' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#C9A227]/10 to-transparent border border-[#C9A227]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#e9c176] shrink-0 text-lg">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Komunitas Penerima Promo Diskon 10 Orang
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227] text-slate-950 font-mono">
                  Potongan Rp 320.000 / Kelompok
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Menampilkan pendaftar dari komunitas/rombongan 10 orang yang berhak mendapatkan promo potongan setara 1 tiket 12K gratis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Nilai Diskon
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#e9c176] font-mono">
                {bulkOrderStats.totalDiscountAmount > 0
                  ? `Rp ${bulkOrderStats.totalDiscountAmount.toLocaleString('id-ID')}`
                  : 'Rp 0'}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Kelompok
              </span>
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                {bulkOrderStats.totalDiscountGroups} <span className="text-xs font-normal text-slate-400">Grup ({bulkOrderStats.discountEligibleParticipantsCount} Org)</span>
              </span>
            </div>
          </div>
        </div>
      )}

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
        onEditHasilLari={(row) => setEditingHasilLariRow(row)}
        onOpenColumnFilter={() => setShowColumnFilter(true)}
        discountOrderIds={bulkOrderStats.discountOrderIds}
      />
      </>
      )}

      {/* 5. Detail Modal */}
      <TrailrunDetailModal
        selectedRow={selectedRow}
        onClose={() => setSelectedRow(null)}
        onUpdateStatus={handleUpdateStatus}
        updatingId={updatingId}
        onDeleteRow={handleDeleteRow}
        isDeleting={isDeleting}
        onEditHasilLari={(row) => setEditingHasilLariRow(row)}
      />

      {/* 6. Edit Hasil Lari Modal */}
      <EditHasilLariModal
        isOpen={Boolean(editingHasilLariRow)}
        participant={editingHasilLariRow}
        onClose={() => setEditingHasilLariRow(null)}
        onSave={handleSaveHasilLari}
        isSaving={isSavingHasilLari}
      />
    </div>
  );
}
