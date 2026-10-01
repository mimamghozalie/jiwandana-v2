'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Trophy,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  RefreshCw,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  User,
  Activity,
  HeartPulse,
  CreditCard,
  Building,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface TrailrunRow {
  id: string;
  nama: string;
  email: string;
  no_bib: string;
  no_hp: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kewarganegaraan?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  nama_komunitas?: string | null;
  golongan_darah?: string;
  riwayat_medis?: string | null;
  kontak_darurat?: string;
  kategori: string;
  status: 'pending' | 'confirmed' | 'paid';
  created_at: string;
  payment?: {
    txn_id?: string;
    order_id?: string;
    amount?: number;
    fee?: number;
    total_payment?: number;
    payment_method?: string;
    status?: string;
    completed_at?: string;
    is_sandbox?: boolean;
  };
}

interface ColumnConfig {
  key: string;
  label: string;
  category: 'Utama' | 'Pembayaran' | 'Profil & Kontak' | 'Medis & Darurat';
  defaultVisible: boolean;
}

const ALL_COLUMNS: ColumnConfig[] = [
  { key: 'no_bib', label: 'No. BIB', category: 'Utama', defaultVisible: true },
  { key: 'nama', label: 'Nama Peserta', category: 'Utama', defaultVisible: true },
  { key: 'kategori', label: 'Kategori', category: 'Utama', defaultVisible: true },
  { key: 'status', label: 'Status Bayar', category: 'Pembayaran', defaultVisible: true },
  { key: 'total_payment', label: 'Nominal Bayar', category: 'Pembayaran', defaultVisible: true },
  { key: 'payment_method', label: 'Metode Bayar', category: 'Pembayaran', defaultVisible: true },
  { key: 'email', label: 'Email', category: 'Profil & Kontak', defaultVisible: true },
  { key: 'no_hp', label: 'WhatsApp / HP', category: 'Profil & Kontak', defaultVisible: true },
  { key: 'created_at', label: 'Waktu Daftar', category: 'Utama', defaultVisible: true },
  { key: 'jenis_kelamin', label: 'Gender', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'tanggal_lahir', label: 'Tgl Lahir', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'nama_komunitas', label: 'Komunitas / Klub', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'kota_provinsi', label: 'Kota / Asal', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'alamat', label: 'Alamat Lengkap', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'golongan_darah', label: 'Gol. Darah', category: 'Medis & Darurat', defaultVisible: false },
  { key: 'riwayat_medis', label: 'Riwayat Medis', category: 'Medis & Darurat', defaultVisible: false },
  { key: 'kontak_darurat', label: 'Kontak Darurat', category: 'Medis & Darurat', defaultVisible: false },
  { key: 'txn_id', label: 'ID Transaksi', category: 'Pembayaran', defaultVisible: false },
  { key: 'order_id', label: 'Order ID', category: 'Pembayaran', defaultVisible: false },
];

const DEFAULT_VISIBLE_KEYS = ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

// Fallback sample data if Supabase tables have no rows yet
const SAMPLE_TRAILRUN_DATA: TrailrunRow[] = [
  {
    id: 'sample-1',
    nama: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    no_bib: '7K-0142',
    no_hp: '081234567890',
    alamat: 'Jl. Hayam Wuruk No. 45',
    kota: 'Mojokerto',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '1992-05-14',
    jenis_kelamin: 'Laki-laki',
    nama_komunitas: 'Mojokerto Runners Club',
    golongan_darah: 'O',
    riwayat_medis: 'Tidak ada',
    kontak_darurat: 'Siti Rahayu (Istri) - 081298765432',
    kategori: '7K Junior Pawitra',
    status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    payment: {
      txn_id: 'TXN-7K-001',
      order_id: 'ORD-TR-7K-0142',
      amount: 270000,
      fee: 2500,
      total_payment: 272500,
      payment_method: 'qris',
      status: 'completed',
      completed_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      is_sandbox: false,
    },
  },
  {
    id: 'sample-2',
    nama: 'Aditya Pratama',
    email: 'aditya.p@example.com',
    no_bib: '3K-0089',
    no_hp: '082198765432',
    alamat: 'Perum Gatsu Asri Blok C-12',
    kota: 'Surabaya',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '1996-11-20',
    jenis_kelamin: 'Laki-laki',
    nama_komunitas: 'Suroboyo Trail Run',
    golongan_darah: 'A',
    riwayat_medis: 'Asma ringan (terkontrol)',
    kontak_darurat: 'Bambang (Kakak) - 082111223344',
    kategori: '3K Hallo Pawitra',
    status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    payment: {
      txn_id: 'TXN-3K-002',
      order_id: 'ORD-TR-3K-0089',
      amount: 280000,
      fee: 4000,
      total_payment: 284000,
      payment_method: 'bri_va',
      status: 'completed',
      completed_at: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      is_sandbox: false,
    },
  },
  {
    id: 'sample-3',
    nama: 'Dewi Lestari',
    email: 'dewi.lestari@example.com',
    no_bib: '7K-0205',
    no_hp: '085712345678',
    alamat: 'Jl. Pahlawan No. 18',
    kota: 'Malang',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '1998-08-09',
    jenis_kelamin: 'Perempuan',
    nama_komunitas: 'Malang Trail Squad',
    golongan_darah: 'B',
    riwayat_medis: 'Tidak ada',
    kontak_darurat: 'Dr. Agus (Ayah) - 085799887766',
    kategori: '7K Junior Pawitra',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    payment: {
      txn_id: 'TXN-7K-003',
      order_id: 'ORD-TR-7K-0205',
      amount: 270000,
      fee: 2500,
      total_payment: 272500,
      payment_method: 'qris',
      status: 'pending',
      is_sandbox: false,
    },
  },
  {
    id: 'sample-4',
    nama: 'Rizky Nugraha',
    email: 'rizky.nugraha@example.com',
    no_bib: '3K-0012',
    no_hp: '081344556677',
    alamat: 'Jl. Kusuma Bangsa No. 03',
    kota: 'Sidoarjo',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '2000-01-25',
    jenis_kelamin: 'Laki-laki',
    nama_komunitas: null,
    golongan_darah: 'AB',
    riwayat_medis: 'Pernah cedera lutut tahun 2024',
    kontak_darurat: 'Hj. Endang (Ibu) - 081333221100',
    kategori: '3K Hallo Pawitra',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    payment: {
      txn_id: 'TXN-3K-004',
      order_id: 'ORD-TR-3K-0012',
      amount: 280000,
      fee: 4000,
      total_payment: 284000,
      payment_method: 'mandiri_va',
      status: 'pending',
      is_sandbox: false,
    },
  },
];

export default function AdminTrailrunPage() {
  const [data, setData] = useState<TrailrunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const metrics = useMemo(() => {
    const total = data.length;
    const paidRows = data.filter((r) => r.status === 'paid');
    const paidCount = paidRows.length;
    const pendingCount = data.filter((r) => r.status === 'pending' || r.status === 'confirmed').length;

    const totalRevenue = paidRows.reduce((acc, r) => {
      const val = r.payment?.total_payment || r.payment?.amount || 0;
      return acc + val;
    }, 0);

    return { total, paidCount, pendingCount, totalRevenue };
  }, [data]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    // Headers based on active visible columns
    const activeCols = ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key));
    const headerRow = activeCols.map((c) => `"${c.label}"`).join(',');

    const rows = filteredData.map((row) => {
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
              val = row.payment?.total_payment
                ? `Rp ${row.payment.total_payment.toLocaleString('id-ID')}`
                : '-';
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

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
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
        <div className="flex items-center gap-2.5 self-start md:self-auto">
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
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            title="Download file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-white/10 space-y-1.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Total Pendaftar
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-white">{metrics.total}</div>
          <span className="text-[11px] text-slate-500 block">Semua formulir masuk</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-emerald-500/20 space-y-1.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sudah Bayar (Lunas)
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{metrics.paidCount}</div>
          <span className="text-[11px] text-slate-500 block">
            {metrics.total > 0
              ? `${Math.round((metrics.paidCount / metrics.total) * 100)}% dari total pendaftar`
              : '0%'}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-amber-500/20 space-y-1.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Pembayaran
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">{metrics.pendingCount}</div>
          <span className="text-[11px] text-slate-500 block">Pending / Belum bayar</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1424] border border-[#e9c176]/20 space-y-1.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-[#e9c176] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Total Penerimaan
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#e9c176] truncate">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 block">Dari pendaftar lunas</span>
        </div>
      </div>

      {/* 3. Filter Bar & Column Customizer Button */}
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

      {/* 4. Table Container */}
      <div className="bg-[#0a1424] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">#</th>

                {visibleColumns.includes('no_bib') && <th className="py-3.5 px-4">No. BIB</th>}
                {visibleColumns.includes('nama') && <th className="py-3.5 px-4">Nama Peserta</th>}
                {visibleColumns.includes('kategori') && <th className="py-3.5 px-4">Kategori Lomba</th>}
                {visibleColumns.includes('status') && <th className="py-3.5 px-4">Status Bayar</th>}
                {visibleColumns.includes('total_payment') && <th className="py-3.5 px-4">Nominal Bayar</th>}
                {visibleColumns.includes('payment_method') && <th className="py-3.5 px-4">Metode Bayar</th>}
                {visibleColumns.includes('email') && <th className="py-3.5 px-4">Email</th>}
                {visibleColumns.includes('no_hp') && <th className="py-3.5 px-4">WhatsApp / HP</th>}
                {visibleColumns.includes('created_at') && <th className="py-3.5 px-4">Waktu Daftar</th>}

                {visibleColumns.includes('jenis_kelamin') && <th className="py-3.5 px-4">Gender</th>}
                {visibleColumns.includes('tanggal_lahir') && <th className="py-3.5 px-4">Tgl Lahir</th>}
                {visibleColumns.includes('nama_komunitas') && <th className="py-3.5 px-4">Komunitas</th>}
                {visibleColumns.includes('kota_provinsi') && <th className="py-3.5 px-4">Kota / Asal</th>}
                {visibleColumns.includes('alamat') && <th className="py-3.5 px-4">Alamat</th>}
                {visibleColumns.includes('golongan_darah') && <th className="py-3.5 px-4">Gol. Darah</th>}
                {visibleColumns.includes('riwayat_medis') && <th className="py-3.5 px-4">Riwayat Medis</th>}
                {visibleColumns.includes('kontak_darurat') && <th className="py-3.5 px-4">Kontak Darurat</th>}
                {visibleColumns.includes('txn_id') && <th className="py-3.5 px-4">Txn ID</th>}
                {visibleColumns.includes('order_id') && <th className="py-3.5 px-4">Order ID</th>}

                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e9c176]" />
                    <span>Memuat data pendaftar...</span>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-16 text-center text-slate-400 space-y-2">
                    <Filter className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">Tidak ada pendaftar yang cocok.</p>
                    <p className="text-xs text-slate-500">
                      Coba ganti filter status, kategori lomba, atau kata kunci pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const isPaid = row.status === 'paid';
                  const isPending = row.status === 'pending';
                  const isConfirmed = row.status === 'confirmed';

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      onClick={() => setSelectedRow(row)}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                        {startIndex + index + 1}
                      </td>

                      {/* No. BIB */}
                      {visibleColumns.includes('no_bib') && (
                        <td className="py-3.5 px-4 font-bold text-[#e9c176]">
                          <span className="px-2 py-0.5 rounded bg-[#e9c176]/10 border border-[#e9c176]/30">
                            {row.no_bib || '-'}
                          </span>
                        </td>
                      )}

                      {/* Nama */}
                      {visibleColumns.includes('nama') && (
                        <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                          {row.nama}
                        </td>
                      )}

                      {/* Kategori */}
                      {visibleColumns.includes('kategori') && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/10">
                            {row.kategori}
                          </span>
                        </td>
                      )}

                      {/* Status Pembayaran */}
                      {visibleColumns.includes('status') && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              LUNAS (PAID)
                            </span>
                          ) : isConfirmed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              <Clock className="w-3.5 h-3.5" />
                              Dikonfirmasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3.5 h-3.5" />
                              Menunggu Bayar
                            </span>
                          )}
                        </td>
                      )}

                      {/* Nominal Bayar */}
                      {visibleColumns.includes('total_payment') && (
                        <td className="py-3.5 px-4 font-semibold text-slate-200 whitespace-nowrap">
                          {row.payment?.total_payment ? (
                            formatCurrency(row.payment.total_payment)
                          ) : row.payment?.amount ? (
                            formatCurrency(row.payment.amount)
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      )}

                      {/* Metode Bayar */}
                      {visibleColumns.includes('payment_method') && (
                        <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-slate-300 whitespace-nowrap">
                          {row.payment?.payment_method ? (
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                              {row.payment.payment_method.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      )}

                      {/* Email */}
                      {visibleColumns.includes('email') && (
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {row.email}
                        </td>
                      )}

                      {/* WhatsApp / No. HP */}
                      {visibleColumns.includes('no_hp') && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <a
                            href={`https://wa.me/${row.no_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:underline text-[11px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{row.no_hp}</span>
                          </a>
                        </td>
                      )}

                      {/* Waktu Daftar */}
                      {visibleColumns.includes('created_at') && (
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(row.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      )}

                      {/* Additional Columns */}
                      {visibleColumns.includes('jenis_kelamin') && (
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {row.jenis_kelamin || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('tanggal_lahir') && (
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {row.tanggal_lahir || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('nama_komunitas') && (
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {row.nama_komunitas || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('kota_provinsi') && (
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {[row.kota, row.provinsi].filter(Boolean).join(', ') || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('alamat') && (
                        <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate" title={row.alamat}>
                          {row.alamat || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('golongan_darah') && (
                        <td className="py-3.5 px-4 text-slate-300 font-bold text-center">
                          {row.golongan_darah || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('riwayat_medis') && (
                        <td
                          className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate"
                          title={row.riwayat_medis || undefined}
                        >
                          {row.riwayat_medis || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('kontak_darurat') && (
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {row.kontak_darurat || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('txn_id') && (
                        <td className="py-3.5 px-4 text-[10px] text-slate-400 whitespace-nowrap">
                          {row.payment?.txn_id || '-'}
                        </td>
                      )}
                      {visibleColumns.includes('order_id') && (
                        <td className="py-3.5 px-4 text-[10px] text-slate-400 whitespace-nowrap">
                          {row.payment?.order_id || '-'}
                        </td>
                      )}

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div
                          className="flex items-center justify-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedRow(row)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Lihat Detail Peserta"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {row.status !== 'paid' ? (
                            <button
                              type="button"
                              disabled={updatingId === row.id}
                              onClick={() => handleUpdateStatus(row.id, 'paid')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="Tandai Sudah Bayar (Lunas)"
                            >
                              <Check className="w-3 h-3" />
                              <span>Set Lunas</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={updatingId === row.id}
                              onClick={() => handleUpdateStatus(row.id, 'pending')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="Kembalikan ke status Pending"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Batalkan</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Controls */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs text-slate-400">
          {/* Left: Summary range & Page size */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              Menampilkan{' '}
              <strong className="text-white">
                {filteredData.length > 0 ? startIndex + 1 : 0} - {endIndex}
              </strong>{' '}
              dari <strong className="text-white">{filteredData.length}</strong> peserta
              {filteredData.length !== data.length && (
                <span className="text-slate-500"> (difilter dari {data.length} total)</span>
              )}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <span className="text-[11px] text-slate-500">Baris:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs outline-none cursor-pointer focus:border-[#e9c176]"
              >
                <option value={10} className="bg-[#0a1424]">10 / hal</option>
                <option value={25} className="bg-[#0a1424]">25 / hal</option>
                <option value={50} className="bg-[#0a1424]">50 / hal</option>
                <option value={100} className="bg-[#0a1424]">100 / hal</option>
              </select>
            </div>
          </div>

          {/* Right: Pagination buttons & Column summary */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Current Page Indicator / Number Pills */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - safeCurrentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-slate-500">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            safeCurrentPage === page
                              ? 'bg-[#e9c176] text-[#0d1c32] font-bold shadow-sm'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Column indicator */}
            <div className="pl-2 border-l border-white/10 hidden sm:flex items-center gap-1.5">
              <span>Kolom:</span>
              <button
                type="button"
                onClick={() => setShowColumnFilter(true)}
                className="text-[#e9c176] hover:underline font-semibold cursor-pointer"
              >
                {visibleColumns.length} aktif
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Detail Modal Popup */}
      {selectedRow && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-[#0a1424] border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans text-white p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#e9c176] px-2.5 py-1 rounded-full bg-[#e9c176]/10 border border-[#e9c176]/30 inline-block mb-1.5">
                  BIB {selectedRow.no_bib || 'Belum Diatur'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedRow.nama}
                </h3>
                <p className="text-xs text-slate-400">{selectedRow.kategori}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Quick Action Banner */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Status Pembayaran Saat Ini
                </span>
                <div className="mt-1">
                  {selectedRow.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-4 h-4" />
                      LUNAS (PAID)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Clock className="w-4 h-4" />
                      MENUNGGU PEMBAYARAN
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons to toggle status */}
              <div className="flex items-center gap-2">
                {selectedRow.status !== 'paid' ? (
                  <button
                    type="button"
                    disabled={updatingId === selectedRow.id}
                    onClick={() => handleUpdateStatus(selectedRow.id, 'paid')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Set Lunas</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={updatingId === selectedRow.id}
                    onClick={() => handleUpdateStatus(selectedRow.id, 'pending')}
                    className="px-4 py-2.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ubah ke Pending</span>
                  </button>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Kontak & Bio */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-[#e9c176]" />
                  Data Pribadi & Kontak
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-white">{selectedRow.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${selectedRow.no_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{selectedRow.no_hp}</span>
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender:</span>
                    <span className="text-white">{selectedRow.jenis_kelamin || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tgl Lahir:</span>
                    <span className="text-white">{selectedRow.tanggal_lahir || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kewarganegaraan:</span>
                    <span className="text-white">{selectedRow.kewarganegaraan || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Komunitas:</span>
                    <span className="text-white">{selectedRow.nama_komunitas || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Medis & Darurat */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  Kesehatan & Darurat
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Golongan Darah:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">
                      {selectedRow.golongan_darah || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Kontak Darurat:</span>
                    <span className="text-white font-medium block">
                      {selectedRow.kontak_darurat || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Riwayat Medis:</span>
                    <span className="text-amber-200/90 block bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      {selectedRow.riwayat_medis || 'Tidak ada riwayat medis dilaporkan.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alamat Domisili */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 sm:col-span-2">
                <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  Alamat Lengkap
                </h4>
                <div className="text-slate-300 space-y-1">
                  <p className="text-white">{selectedRow.alamat || '-'}</p>
                  <p className="text-slate-400">
                    {[selectedRow.kota, selectedRow.provinsi].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {/* Rincian Transaksi */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 sm:col-span-2">
                <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-[#e9c176]" />
                  Rincian Transaksi Payment Gateway
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Metode</span>
                    <span className="font-bold uppercase text-white">
                      {selectedRow.payment?.payment_method?.replace('_', ' ') || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Total Bayar</span>
                    <span className="font-bold text-[#e9c176]">
                      {selectedRow.payment?.total_payment
                        ? formatCurrency(selectedRow.payment.total_payment)
                        : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Txn ID</span>
                    <span className="text-[11px] text-white truncate block" title={selectedRow.payment?.txn_id}>
                      {selectedRow.payment?.txn_id || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Waktu Selesai</span>
                    <span className="text-[11px] text-slate-300 block">
                      {selectedRow.payment?.completed_at
                        ? new Date(selectedRow.payment.completed_at).toLocaleTimeString('id-ID')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
