'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Printer,
  Search,
  Filter,
  Layers,
  Sparkles,
  Zap,
  Tag,
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Receipt,
  Flame,
  ArrowUpRight,
  Info,
  User,
  Building,
  Phone,
  Mail,
} from 'lucide-react';
import {
  useTrailrunData,
  TrailrunSubNav,
  AdminFlashSaleModal,
  formatCurrency,
  getRowFinancials,
  exportStatsToExcel,
  TrailrunRow,
  GroupRegistrationBatch,
} from '@/components/admin/trailrun';

/**
 * Mendeteksi sesi pendaftaran (tier) berdasarkan nominal dan tanggal registrasi
 */
function detectTier(row: TrailrunRow): string {
  const fin = getRowFinancials(row);
  const amt = fin.baseAmount || row.payment?.amount || 0;
  const is12k = (row.kategori || '').toLowerCase().includes('12');
  const is7k = (row.kategori || '').toLowerCase().includes('7');
  const cDate = new Date(row.created_at);

  if (amt === 240000 || (is12k && amt === 290000) || cDate < new Date('2026-10-11T00:00:00+07:00')) {
    return 'Early Bird';
  }
  if (amt === 300000 && is7k) {
    return 'Flash Sale';
  }
  if (amt === 350000 && is12k && (cDate.getDate() === 7 || cDate.getDate() === 8)) {
    return 'Flash Sale';
  }
  if (amt === 350000 && is7k) {
    return 'Last Call';
  }
  if (amt === 400000 && is12k) {
    return 'Last Call';
  }
  if (cDate >= new Date('2026-10-11T00:00:00+07:00') && cDate < new Date('2026-10-22T00:00:00+07:00')) {
    return 'Pre-Sale';
  }
  if (cDate >= new Date('2026-11-10T00:00:00+07:00')) {
    return 'Last Call';
  }
  return 'Regular';
}

interface EnrichedKelompokBatch extends GroupRegistrationBatch {
  categorySummary: string;
  tierName: string;
}

type UnifiedTableItem =
  | {
      type: 'individu';
      id: string;
      row: TrailrunRow;
      cleanCat: string;
      tierName: string;
      financials: ReturnType<typeof getRowFinancials>;
    }
  | {
      type: 'kelompok';
      id: string;
      batch: EnrichedKelompokBatch;
    };

export default function AdminTrailrunStatsPage() {
  const { data, loading, isRefreshing, fetchData } = useTrailrunData();
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);

  // View Mode: 'grouped' (Kelompok digabung per PIC) vs 'flat' (Semua anggota satu per satu)
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  // Expanded Batch IDs in Grouped view
  const [expandedBatchIds, setExpandedBatchIds] = useState<Set<string>>(new Set());

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'amount_desc' | 'amount_asc' | 'name_asc'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const toggleExpandBatch = (batchId: string) => {
    setExpandedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  // 1. Grouping Kelompok Berdasarkan Order / PIC
  const kelompokBatches: EnrichedKelompokBatch[] = useMemo(() => {
    const bulkRows = data.filter((r) => r.registration_type === 'bulk');
    if (bulkRows.length === 0) return [];

    const orderBatchMap: Record<string, TrailrunRow[]> = {};
    const fallbackBatchMap: Record<string, TrailrunRow[]> = {};

    bulkRows.forEach((r) => {
      const orderId = r.order_id || r.payment?.order_id;
      if (orderId) {
        if (!orderBatchMap[orderId]) orderBatchMap[orderId] = [];
        orderBatchMap[orderId].push(r);
      } else {
        const cKey = (r.pic_phone || r.nama_komunitas || 'KELOMPOK-LAIN').trim();
        if (!fallbackBatchMap[cKey]) fallbackBatchMap[cKey] = [];
        fallbackBatchMap[cKey].push(r);
      }
    });

    Object.entries(fallbackBatchMap).forEach(([key, rows]) => {
      orderBatchMap[key] = rows;
    });

    const result: EnrichedKelompokBatch[] = [];

    Object.entries(orderBatchMap).forEach(([orderIdKey, participants]) => {
      const count = participants.length;
      const first = participants[0];
      const paidCount = participants.filter((p) => p.status === 'paid').length;
      const pendingCount = count - paidCount;
      const isFullyPaid = paidCount > 0 && paidCount === count;

      // Logika Diskon Promo 10 Orang per Pendaftaran Rombongan:
      // Setiap kelipatan 10 orang mendapatkan diskon Rp 320.000
      const hasDiscount = count >= 10;
      const discountMultiplier = Math.floor(count / 10);
      const discountAmount = hasDiscount ? discountMultiplier * 320000 : 0;

      // Hitung subtotal harga normal tiket
      let rawTicketTotal = 0;
      let count12k = 0;
      let count7k = 0;
      let count3k = 0;

      participants.forEach((p) => {
        const is12k = (p.kategori || '').toLowerCase().includes('12');
        const is7k = (p.kategori || '').toLowerCase().includes('7');
        if (is12k) {
          count12k += 1;
          rawTicketTotal += 320000;
        } else if (is7k) {
          count7k += 1;
          rawTicketTotal += 270000;
        } else {
          count3k += 1;
          rawTicketTotal += 280000;
        }
      });

      const calculatedTicketTotal = Math.max(0, rawTicketTotal - discountAmount);
      const finalTicketTotal = first.payment?.amount ?? calculatedTicketTotal;
      const adminFeeTotal = first.payment?.admin_fee ?? (first.payment?.fee ?? count * 3000);
      const totalPayment =
        first.payment?.total_payment != null && (first.payment.total_payment > 0 || finalTicketTotal === 0)
          ? first.payment.total_payment
          : finalTicketTotal + adminFeeTotal;

      const catParts: string[] = [];
      if (count12k > 0) catParts.push(`${count12k}x 12K`);
      if (count7k > 0) catParts.push(`${count7k}x 7K`);
      if (count3k > 0) catParts.push(`${count3k}x 3K`);
      const categorySummary = catParts.join(', ') || `${count} Peserta`;

      const picName = first.pic_name || first.payment?.pic_name || first.nama;
      const picPhone = first.pic_phone || first.payment?.pic_phone || first.no_hp;
      const picEmail = first.pic_email || first.payment?.pic_email || first.email;

      result.push({
        orderId: first.payment?.order_id || orderIdKey,
        namaKomunitas: first.nama_komunitas || 'Komunitas Lari',
        picName,
        picPhone,
        picEmail,
        totalParticipants: count,
        paidParticipants: paidCount,
        pendingParticipants: pendingCount,
        isFullyPaid,
        rawTicketTotal,
        discountAmount,
        hasDiscount,
        finalTicketTotal,
        adminFeeTotal,
        totalPayment,
        paymentMethod: first.payment?.payment_method?.toUpperCase() || 'QRIS',
        paymentStatus: isFullyPaid ? 'paid' : 'pending',
        participants,
        createdAt: first.created_at,
        categorySummary,
        tierName: detectTier(first),
      });
    });

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data]);

  // 2. Perhitungan Statistik Finansial Komprehensif
  const stats = useMemo(() => {
    const totalParticipants = data.length;
    const paidRows = data.filter((r) => r.status === 'paid');
    const pendingRows = data.filter((r) => r.status === 'pending' || r.status === 'confirmed');

    const paidParticipants = paidRows.length;
    const pendingParticipants = pendingRows.length;

    let totalTicketRevenue = 0;
    let totalGrossRevenue = 0;
    let totalAdminFee = 0;
    let totalGatewayFee = 0;
    let totalAdminProfit = 0;
    let totalJerseySurcharge = 0;
    let pendingTicketRevenue = 0;

    // Breakdown per kategori lomba
    const categoryBreakdown: Record<
      string,
      { count: number; paidCount: number; ticketRevenue: number; grossRevenue: number }
    > = {
      '12K': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
      '7K': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
      '3K': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
    };

    // Breakdown per sesi pendaftaran
    const sessionBreakdown: Record<
      string,
      { count: number; paidCount: number; ticketRevenue: number; grossRevenue: number }
    > = {
      'Early Bird': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
      'Pre-Sale': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
      Regular: { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
      'Flash Sale': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
      'Last Call': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
    };

    // Breakdown per tipe registrasi
    const typeBreakdown: Record<
      string,
      { count: number; paidCount: number; ticketRevenue: number; grossRevenue: number }
    > = {
      Individu: { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
      'Kelompok (per PIC)': { count: 0, paidCount: 0, ticketRevenue: 0, grossRevenue: 0 },
    };

    // Surcharge Jersey dihitung dari SEMUA peserta
    data.forEach((row) => {
      const jersey = (row.ukuran_jersey || '').toUpperCase();
      if (jersey.includes('XXL') || jersey.includes('2XL')) totalJerseySurcharge += 5000;
      else if (jersey.includes('3XL') || jersey.includes('XXXL')) totalJerseySurcharge += 10000;
      else if (jersey.includes('4XL') || jersey.includes('XXXXL')) totalJerseySurcharge += 15000;
    });

    // A. Akumulasi Pendaftar Individu (Bukan Bulk)
    const individuRows = data.filter((r) => r.registration_type !== 'bulk');
    individuRows.forEach((row) => {
      const fin = getRowFinancials(row);
      const isPaid = row.status === 'paid';
      const tierName = detectTier(row);
      const cleanCat = (row.kategori || '').toLowerCase().includes('12')
        ? '12K'
        : (row.kategori || '').toLowerCase().includes('7')
        ? '7K'
        : '3K';

      if (isPaid) {
        totalTicketRevenue += fin.baseAmount;
        totalGrossRevenue += fin.totalPayment;
        totalAdminFee += fin.adminFee;
        totalGatewayFee += fin.gatewayFee;
        totalAdminProfit += fin.adminProfit;
      } else {
        pendingTicketRevenue += fin.baseAmount;
      }

      // Kategori
      if (categoryBreakdown[cleanCat]) {
        categoryBreakdown[cleanCat].count += 1;
        if (isPaid) {
          categoryBreakdown[cleanCat].paidCount += 1;
          categoryBreakdown[cleanCat].ticketRevenue += fin.baseAmount;
          categoryBreakdown[cleanCat].grossRevenue += fin.totalPayment;
        }
      }

      // Sesi
      if (sessionBreakdown[tierName]) {
        sessionBreakdown[tierName].count += 1;
        if (isPaid) {
          sessionBreakdown[tierName].paidCount += 1;
          sessionBreakdown[tierName].ticketRevenue += fin.baseAmount;
          sessionBreakdown[tierName].grossRevenue += fin.totalPayment;
        }
      }

      // Tipe Individu
      typeBreakdown['Individu'].count += 1;
      if (isPaid) {
        typeBreakdown['Individu'].paidCount += 1;
        typeBreakdown['Individu'].ticketRevenue += fin.baseAmount;
        typeBreakdown['Individu'].grossRevenue += fin.totalPayment;
      }
    });

    // B. Akumulasi Pendaftar Kelompok (Dihitung 1x per Order Rombongan PIC)
    kelompokBatches.forEach((batch) => {
      const isPaid = batch.isFullyPaid;
      const count = batch.totalParticipants;

      // Gateway fee & admin profit per batch
      const first = batch.participants[0];
      const batchGatewayFee =
        first?.payment?.gateway_fee ??
        (batch.totalPayment > 0 ? Math.round(batch.totalPayment * 0.007 + 300) : 0);
      const batchAdminProfit =
        first?.payment?.admin_profit ??
        Math.max(0, batch.adminFeeTotal - batchGatewayFee);

      if (isPaid) {
        totalTicketRevenue += batch.finalTicketTotal;
        totalGrossRevenue += batch.totalPayment;
        totalAdminFee += batch.adminFeeTotal;
        totalGatewayFee += batchGatewayFee;
        totalAdminProfit += batchAdminProfit;
      } else {
        pendingTicketRevenue += batch.finalTicketTotal;
      }

      // Tipe Kelompok
      typeBreakdown['Kelompok (per PIC)'].count += count;
      if (isPaid) {
        typeBreakdown['Kelompok (per PIC)'].paidCount += batch.paidParticipants;
        typeBreakdown['Kelompok (per PIC)'].ticketRevenue += batch.finalTicketTotal;
        typeBreakdown['Kelompok (per PIC)'].grossRevenue += batch.totalPayment;
      }

      // Sesi (Kelompok menggunakan tierName batch)
      const batchTier = batch.tierName || 'Regular';
      if (sessionBreakdown[batchTier]) {
        sessionBreakdown[batchTier].count += count;
        if (isPaid) {
          sessionBreakdown[batchTier].paidCount += batch.paidParticipants;
          sessionBreakdown[batchTier].ticketRevenue += batch.finalTicketTotal;
          sessionBreakdown[batchTier].grossRevenue += batch.totalPayment;
        }
      }

      // Kategori untuk anggota rombongan:
      let b12kRaw = 0;
      let b7kRaw = 0;
      let b3kRaw = 0;
      let b12kCount = 0;
      let b7kCount = 0;
      let b3kCount = 0;

      batch.participants.forEach((p) => {
        const cat = (p.kategori || '').toLowerCase();
        if (cat.includes('12')) {
          b12kCount += 1;
          b12kRaw += 320000;
        } else if (cat.includes('7')) {
          b7kCount += 1;
          b7kRaw += 270000;
        } else {
          b3kCount += 1;
          b3kRaw += 280000;
        }
      });

      const totalRaw = b12kRaw + b7kRaw + b3kRaw;

      // Alokasikan nilai tiket dan gross batch secara adil ke masing-masing kategori
      const b12kTicket =
        totalRaw > 0 ? Math.round((b12kRaw / totalRaw) * batch.finalTicketTotal) : 0;
      const b7kTicket =
        totalRaw > 0 ? Math.round((b7kRaw / totalRaw) * batch.finalTicketTotal) : 0;
      const b3kTicket = Math.max(0, batch.finalTicketTotal - b12kTicket - b7kTicket);

      const b12kGross =
        totalRaw > 0 ? Math.round((b12kRaw / totalRaw) * batch.totalPayment) : 0;
      const b7kGross =
        totalRaw > 0 ? Math.round((b7kRaw / totalRaw) * batch.totalPayment) : 0;
      const b3kGross = Math.max(0, batch.totalPayment - b12kGross - b7kGross);

      categoryBreakdown['12K'].count += b12kCount;
      categoryBreakdown['7K'].count += b7kCount;
      categoryBreakdown['3K'].count += b3kCount;

      if (isPaid) {
        categoryBreakdown['12K'].paidCount += b12kCount;
        categoryBreakdown['12K'].ticketRevenue += b12kTicket;
        categoryBreakdown['12K'].grossRevenue += b12kGross;

        categoryBreakdown['7K'].paidCount += b7kCount;
        categoryBreakdown['7K'].ticketRevenue += b7kTicket;
        categoryBreakdown['7K'].grossRevenue += b7kGross;

        categoryBreakdown['3K'].paidCount += b3kCount;
        categoryBreakdown['3K'].ticketRevenue += b3kTicket;
        categoryBreakdown['3K'].grossRevenue += b3kGross;
      }
    });

    return {
      totalParticipants,
      paidParticipants,
      pendingParticipants,
      totalTicketRevenue,
      totalGrossRevenue,
      totalAdminFee,
      totalGatewayFee,
      totalAdminProfit,
      totalJerseySurcharge,
      pendingTicketRevenue,
      categoryBreakdown,
      sessionBreakdown,
      typeBreakdown,
    };
  }, [data, kelompokBatches]);

  // Kelompok batch count & total peserta kelompok untuk SubNav
  const { individuCount, kelompokBatchCount, totalKelompokPeserta } = useMemo(() => {
    let indCount = 0;
    let kelCount = 0;

    data.forEach((r) => {
      if (r.registration_type === 'bulk') {
        kelCount += 1;
      } else {
        indCount += 1;
      }
    });

    return {
      individuCount: indCount,
      kelompokBatchCount: kelompokBatches.length,
      totalKelompokPeserta: kelCount,
    };
  }, [data, kelompokBatches]);

  // 3. Membangun List Terpadu: Individu (per orang) + Kelompok (Grouped by PIC)
  const unifiedGroupedItems: UnifiedTableItem[] = useMemo(() => {
    const items: UnifiedTableItem[] = [];

    // Tambahkan semua peserta individu
    data
      .filter((r) => r.registration_type !== 'bulk')
      .forEach((r) => {
        const fin = getRowFinancials(r);
        const tierName = detectTier(r);
        const cleanCat = (r.kategori || '').toLowerCase().includes('12')
          ? '12K'
          : (r.kategori || '').toLowerCase().includes('7')
          ? '7K'
          : '3K';

        items.push({
          type: 'individu',
          id: r.id,
          row: r,
          cleanCat,
          tierName,
          financials: fin,
        });
      });

    // Tambahkan kelompok yang sudah di-group per PIC
    kelompokBatches.forEach((b) => {
      items.push({
        type: 'kelompok',
        id: b.orderId,
        batch: b,
      });
    });

    return items;
  }, [data, kelompokBatches]);

  // 4. Filtering & Sorting List Terpadu
  const filteredUnifiedItems = useMemo(() => {
    let result = unifiedGroupedItems;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (item.type === 'individu') {
          return (
            item.row.nama.toLowerCase().includes(q) ||
            item.row.no_bib.toLowerCase().includes(q) ||
            item.row.email.toLowerCase().includes(q) ||
            (item.row.order_id && item.row.order_id.toLowerCase().includes(q)) ||
            (item.row.nama_komunitas && item.row.nama_komunitas.toLowerCase().includes(q))
          );
        } else {
          // Kelompok match jika nama PIC, komunitas, orderId, email, atau ada anggota yang match
          const matchBatch =
            item.batch.picName.toLowerCase().includes(q) ||
            item.batch.namaKomunitas.toLowerCase().includes(q) ||
            item.batch.orderId.toLowerCase().includes(q) ||
            item.batch.picEmail.toLowerCase().includes(q) ||
            item.batch.picPhone.toLowerCase().includes(q);
          if (matchBatch) return true;

          return item.batch.participants.some(
            (m) => m.nama.toLowerCase().includes(q) || m.no_bib.toLowerCase().includes(q)
          );
        }
      });
    }

    // Filter Kategori
    if (filterCategory !== 'all') {
      result = result.filter((item) => {
        if (item.type === 'individu') return item.cleanCat === filterCategory;
        return item.batch.participants.some((m) =>
          (m.kategori || '').toLowerCase().includes(filterCategory.toLowerCase())
        );
      });
    }

    // Filter Tipe
    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType);
    }

    // Filter Sesi
    if (filterSession !== 'all') {
      result = result.filter((item) => {
        if (item.type === 'individu') return item.tierName === filterSession;
        return item.batch.tierName === filterSession;
      });
    }

    // Filter Status
    if (filterStatus !== 'all') {
      result = result.filter((item) => {
        if (item.type === 'individu') return item.row.status === filterStatus;
        return item.batch.paymentStatus === filterStatus;
      });
    }

    // Sorting
    return result.sort((a, b) => {
      const amtA = a.type === 'individu' ? a.financials.baseAmount : a.batch.finalTicketTotal;
      const amtB = b.type === 'individu' ? b.financials.baseAmount : b.batch.finalTicketTotal;
      const timeA = new Date(a.type === 'individu' ? a.row.created_at : a.batch.createdAt).getTime();
      const timeB = new Date(b.type === 'individu' ? b.row.created_at : b.batch.createdAt).getTime();
      const nameA = a.type === 'individu' ? a.row.nama : a.batch.picName;
      const nameB = b.type === 'individu' ? b.row.nama : b.batch.picName;

      if (sortBy === 'amount_desc') return amtB - amtA;
      if (sortBy === 'amount_asc') return amtA - amtB;
      if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
      // Newest
      return timeB - timeA;
    });
  }, [unifiedGroupedItems, searchQuery, filterCategory, filterType, filterSession, filterStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredUnifiedItems.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedItems = filteredUnifiedItems.slice(startIndex, startIndex + pageSize);

  // Handle Export Excel
  const handleExport = () => {
    exportStatsToExcel(data, {
      totalParticipants: stats.totalParticipants,
      paidParticipants: stats.paidParticipants,
      pendingParticipants: stats.pendingParticipants,
      totalTicketRevenue: stats.totalTicketRevenue,
      totalGrossRevenue: stats.totalGrossRevenue,
      totalAdminFee: stats.totalAdminFee,
      totalGatewayFee: stats.totalGatewayFee,
      totalAdminProfit: stats.totalAdminProfit,
      categoryBreakdown: {
        '12K': {
          count: stats.categoryBreakdown['12K'].count,
          ticketRevenue: stats.categoryBreakdown['12K'].ticketRevenue,
        },
        '7K': {
          count: stats.categoryBreakdown['7K'].count,
          ticketRevenue: stats.categoryBreakdown['7K'].ticketRevenue,
        },
        '3K': {
          count: stats.categoryBreakdown['3K'].count,
          ticketRevenue: stats.categoryBreakdown['3K'].ticketRevenue,
        },
      },
      sessionBreakdown: {
        'Early Bird': {
          count: stats.sessionBreakdown['Early Bird'].count,
          ticketRevenue: stats.sessionBreakdown['Early Bird'].ticketRevenue,
        },
        'Pre-Sale': {
          count: stats.sessionBreakdown['Pre-Sale'].count,
          ticketRevenue: stats.sessionBreakdown['Pre-Sale'].ticketRevenue,
        },
        Regular: {
          count: stats.sessionBreakdown['Regular'].count,
          ticketRevenue: stats.sessionBreakdown['Regular'].ticketRevenue,
        },
        'Flash Sale': {
          count: stats.sessionBreakdown['Flash Sale'].count,
          ticketRevenue: stats.sessionBreakdown['Flash Sale'].ticketRevenue,
        },
        'Last Call': {
          count: stats.sessionBreakdown['Last Call'].count,
          ticketRevenue: stats.sessionBreakdown['Last Call'].ticketRevenue,
        },
      },
      typeBreakdown: {
        Individu: {
          count: stats.typeBreakdown['Individu'].count,
          ticketRevenue: stats.typeBreakdown['Individu'].ticketRevenue,
        },
        'Kelompok (per PIC)': {
          count: stats.typeBreakdown['Kelompok (per PIC)'].count,
          ticketRevenue: stats.typeBreakdown['Kelompok (per PIC)'].ticketRevenue,
        },
      },
      groupBatches: kelompokBatches,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Panel Keuangan & Fee Tiket Trail Run</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif flex items-center gap-3">
            <span>Statistik & Total Fee Tiket</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono font-semibold">
              Kelompok per PIC
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Rekapitulasi lengkap akumulasi penerimaan tiket lomba, biaya admin gateway, profit fee, serta pengelompokan pendaftar rombongan per PIC.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchData}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Ringkasan</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Laporan Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. SubNav Tabs Switcher */}
      <TrailrunSubNav
        individuCount={individuCount}
        kelompokBatchCount={kelompokBatchCount}
        totalKelompokPeserta={totalKelompokPeserta}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        onOpenFlashSale={() => setShowFlashSaleModal(true)}
      />

      {/* 3. Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Penerimaan Tiket Dasar */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d2a1f] to-[#071610] border border-emerald-500/30 p-5 shadow-xl flex flex-col justify-between group hover:border-emerald-400/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              Total Pendapatan Tiket
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Net Fee
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
              {formatCurrency(stats.totalTicketRevenue)}
            </div>
            <span className="text-xs text-emerald-200/80 mt-1 block">
              Dari {stats.paidParticipants} peserta lunas ({Math.round((stats.paidParticipants / (stats.totalParticipants || 1)) * 100)}% Lunas)
            </span>
          </div>

          <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-300">
            <span>Rata-rata / Tiket:</span>
            <span className="text-emerald-300 font-mono font-bold">
              {formatCurrency(stats.paidParticipants > 0 ? Math.round(stats.totalTicketRevenue / stats.paidParticipants) : 0)}
            </span>
          </div>
        </div>

        {/* Card 2: Total Gross Pembayaran Masuk */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#182032] to-[#0c121e] border border-sky-500/30 p-5 shadow-xl flex flex-col justify-between group hover:border-sky-400/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-sky-400" />
              Total Gross Masuk Gateway
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
              Gross Payment
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-300 tracking-tight font-mono">
              {formatCurrency(stats.totalGrossRevenue)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Termasuk admin fee &amp; kode unik transaksi
            </span>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tagihan Pending:</span>
            <span className="text-amber-400 font-mono font-semibold">
              {formatCurrency(stats.pendingTicketRevenue)} ({stats.pendingParticipants} Org)
            </span>
          </div>
        </div>

        {/* Card 3: Akumulasi Fee Admin & Profit Bersih */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2b200b] to-[#161004] border border-[#C9A227]/40 p-5 shadow-xl flex flex-col justify-between group hover:border-[#C9A227] transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#C9A227]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#C9A227] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Profit Fee Admin
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227]/20 text-amber-300 border border-[#C9A227]/40 font-mono">
              Net Profit
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#f1cd56] tracking-tight font-mono">
              {formatCurrency(stats.totalAdminProfit)}
            </div>
            <span className="text-xs text-amber-200/80 mt-1 block">
              Fee Masuk: {formatCurrency(stats.totalAdminFee)} • MDR: -{formatCurrency(stats.totalGatewayFee)}
            </span>
          </div>

          <div className="pt-3 border-t border-[#C9A227]/20 flex items-center justify-between text-[11px] text-slate-300">
            <span>Efisiensi Margin:</span>
            <span className="text-amber-300 font-mono font-bold">
              {stats.totalAdminFee > 0 ? Math.round((stats.totalAdminProfit / stats.totalAdminFee) * 100) : 0}% Bersih
            </span>
          </div>
        </div>

        {/* Card 4: Surcharge Jersey & Partisipasi */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1f122e] to-[#100719] border border-purple-500/30 p-5 shadow-xl flex flex-col justify-between group hover:border-purple-400/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Total Peserta Terdaftar
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              {stats.totalParticipants} Terverifikasi
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 tracking-tight font-mono">
              {stats.totalParticipants} <span className="text-base text-slate-400 font-normal">Orang</span>
            </div>
            <span className="text-xs text-purple-200/80 mt-1 block">
              {individuCount} Peserta Pribadi • {kelompokBatches.length} Rombongan PIC ({totalKelompokPeserta} Org)
            </span>
          </div>

          <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-300">
            <span>Surcharge Jersey (&gt;XL):</span>
            <span className="text-purple-300 font-mono font-bold">
              +{formatCurrency(stats.totalJerseySurcharge)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Three Detail Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown 1: Kategori Lomba (12K, 7K, 3K) */}
        <div className="p-5 rounded-2xl bg-[#0a1424] border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Penerimaan per Kategori Lomba</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono uppercase">3 Kategori</span>
          </div>

          <div className="space-y-3.5">
            {/* 12K */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-white block">12K Senior Pawitra</span>
                  <span className="text-[11px] text-slate-400">
                    {stats.categoryBreakdown['12K'].count} Peserta (
                    {Math.round((stats.categoryBreakdown['12K'].count / (stats.totalParticipants || 1)) * 100)}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono block">
                    {formatCurrency(stats.categoryBreakdown['12K'].ticketRevenue)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    AOV:{' '}
                    {formatCurrency(
                      stats.categoryBreakdown['12K'].paidCount > 0
                        ? Math.round(
                            stats.categoryBreakdown['12K'].ticketRevenue / stats.categoryBreakdown['12K'].paidCount
                          )
                        : 0
                    )}
                  </span>
                </div>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (stats.categoryBreakdown['12K'].count / (stats.totalParticipants || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* 7K */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-white block">7K Junior Pawitra</span>
                  <span className="text-[11px] text-slate-400">
                    {stats.categoryBreakdown['7K'].count} Peserta (
                    {Math.round((stats.categoryBreakdown['7K'].count / (stats.totalParticipants || 1)) * 100)}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-amber-400 font-mono block">
                    {formatCurrency(stats.categoryBreakdown['7K'].ticketRevenue)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    AOV:{' '}
                    {formatCurrency(
                      stats.categoryBreakdown['7K'].paidCount > 0
                        ? Math.round(
                            stats.categoryBreakdown['7K'].ticketRevenue / stats.categoryBreakdown['7K'].paidCount
                          )
                        : 0
                    )}
                  </span>
                </div>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (stats.categoryBreakdown['7K'].count / (stats.totalParticipants || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* 3K */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white block">3K Hallo Pawitra</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                      Closed
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {stats.categoryBreakdown['3K'].count} Peserta (Sold Out)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-rose-400 font-mono block">
                    {formatCurrency(stats.categoryBreakdown['3K'].ticketRevenue)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Early/Presale</span>
                </div>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (stats.categoryBreakdown['3K'].count / (stats.totalParticipants || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown 2: Sesi Pendaftaran (Pricing Tiers) */}
        <div className="p-5 rounded-2xl bg-[#0a1424] border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A227]" />
              <span>Pendapatan per Sesi Pendaftaran</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono uppercase">Tahapan Tarif</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(stats.sessionBreakdown).map(([sessionName, dataObj]) => {
              const isFlash = sessionName === 'Flash Sale';
              const isLastCall = sessionName === 'Last Call';
              const percent = Math.round((dataObj.count / (stats.totalParticipants || 1)) * 100);

              return (
                <div
                  key={sessionName}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isFlash
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isLastCall
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{sessionName}</span>
                      {isFlash && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-extrabold flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> Promo
                        </span>
                      )}
                      {isLastCall && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-extrabold">
                          +20k
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dataObj.count} Peserta ({percent}%)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold font-mono text-white block">
                      {formatCurrency(dataObj.ticketRevenue)}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {dataObj.paidCount} Transaksi Lunas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown 3: Rekap Rombongan Kelompok PIC */}
        <div className="p-5 rounded-2xl bg-[#0a1424] border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Daftar Rombongan Kelompok (per PIC)</span>
            </h3>
            <span className="text-[10px] text-sky-300 font-mono font-bold bg-sky-500/20 px-2 py-0.5 rounded-full">
              {kelompokBatches.length} Rombongan
            </span>
          </div>

          <div className="space-y-3">
            {kelompokBatches.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/5 text-center text-slate-400 text-xs">
                Belum ada transaksi kelompok / rombongan.
              </div>
            ) : (
              kelompokBatches.map((b) => (
                <div
                  key={b.orderId}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/30 to-blue-950/20 border border-sky-500/20 space-y-2 hover:border-sky-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-white uppercase">{b.namaKomunitas}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                          {b.totalParticipants} Org
                        </span>
                        {b.hasDiscount && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            Diskon 10 Org
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-300 block mt-0.5">
                        PIC: <strong className="text-white">{b.picName}</strong> ({b.picPhone || '-'})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Kategori: {b.categorySummary}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 font-mono block">
                        {formatCurrency(b.finalTicketTotal)}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        Total Bayar: {formatCurrency(b.totalPayment)}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 inline-flex items-center gap-0.5 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Lunas
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Total Summary Rombongan */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Total Peserta Rombongan:</span>
              <span className="font-mono text-white font-bold">
                {totalKelompokPeserta} Org ({formatCurrency(stats.typeBreakdown['Kelompok (per PIC)'].ticketRevenue)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0a1424] border border-white/10 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama peserta / PIC, no. BIB, order ID, email, atau komunitas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227] transition-all"
            />
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tipe */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C9A227] cursor-pointer"
            >
              <option value="all">Semua Tipe (Individu + Kelompok)</option>
              <option value="individu">Hanya Individu (Pribadi)</option>
              <option value="kelompok">Hanya Kelompok (per PIC)</option>
            </select>

            {/* Filter Kategori */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C9A227] cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="12K">12K Senior</option>
              <option value="7K">7K Junior</option>
              <option value="3K">3K Hallo (Closed)</option>
            </select>

            {/* Filter Sesi */}
            <select
              value={filterSession}
              onChange={(e) => {
                setFilterSession(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C9A227] cursor-pointer"
            >
              <option value="all">Semua Sesi</option>
              <option value="Early Bird">Early Bird</option>
              <option value="Pre-Sale">Pre-Sale</option>
              <option value="Regular">Regular</option>
              <option value="Flash Sale">Flash Sale</option>
              <option value="Last Call">Last Call</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C9A227] cursor-pointer font-medium"
            >
              <option value="newest">Waktu: Terbaru</option>
              <option value="amount_desc">Harga Tiket: Tertinggi</option>
              <option value="amount_asc">Harga Tiket: Terendah</option>
              <option value="name_asc">Nama PIC / Peserta: A - Z</option>
            </select>
          </div>
        </div>

        {/* Counter Results & View Mode Badge */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan <strong className="text-white">{filteredUnifiedItems.length}</strong> entri transaksi (
              <strong className="text-white">{stats.totalParticipants}</strong> total peserta)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold text-[10px] border border-sky-500/30">
              Kelompok Dikelompokkan per PIC
            </span>
          </div>

          <span className="font-mono text-emerald-400 font-semibold">
            Subtotal Tiket Terpilih:{' '}
            {formatCurrency(
              filteredUnifiedItems.reduce((acc, curr) => {
                if (curr.type === 'individu') {
                  return acc + (curr.row.status === 'paid' ? curr.financials.baseAmount : 0);
                } else {
                  return acc + (curr.batch.isFullyPaid ? curr.batch.finalTicketTotal : 0);
                }
              }, 0)
            )}
          </span>
        </div>
      </div>

      {/* 6. Detail Transactions & Ticket Fee Table (Grouped by PIC for Kelompok) */}
      <div className="rounded-2xl bg-[#0a1424] border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/60 border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Peserta / PIC Rombongan</th>
                <th className="py-3.5 px-3">Kategori</th>
                <th className="py-3.5 px-3 text-center">Tipe Registrasi</th>
                <th className="py-3.5 px-3">Sesi Tarif</th>
                <th className="py-3.5 px-4 text-right">Fee Tiket Bersih</th>
                <th className="py-3.5 px-3 text-right">Fee Admin</th>
                <th className="py-3.5 px-4 text-right">Total Bayar</th>
                <th className="py-3.5 px-3 text-center">Metode</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi / Anggota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#C9A227]" />
                      <span>Memuat data fee tiket peserta...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ada data transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const globalIdx = startIndex + idx + 1;

                  if (item.type === 'individu') {
                    const row = item.row;
                    const fin = item.financials;
                    const isPaid = row.status === 'paid';

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-white/[0.03] transition-colors group font-sans"
                      >
                        {/* No */}
                        <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                          {globalIdx}
                        </td>

                        {/* Nama Peserta Pribadi */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono font-bold text-white text-[11px]">
                              {row.no_bib || '-'}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{row.nama}</span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {row.email} {row.no_hp ? `• ${row.no_hp}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              item.cleanCat === '12K'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : item.cleanCat === '7K'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {item.cleanCat}
                          </span>
                        </td>

                        {/* Tipe Registrasi */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300 whitespace-nowrap">
                            Pribadi
                          </span>
                        </td>

                        {/* Sesi Tarif */}
                        <td className="py-3 px-3">
                          <span
                            className={`text-[11px] font-semibold ${
                              item.tierName === 'Flash Sale'
                                ? 'text-rose-400 font-bold'
                                : item.tierName === 'Last Call'
                                ? 'text-amber-400 font-bold'
                                : item.tierName === 'Early Bird'
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {item.tierName}
                          </span>
                        </td>

                        {/* Fee Tiket Dasar */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(fin.baseAmount)}
                          </span>
                        </td>

                        {/* Fee Admin */}
                        <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                          +{formatCurrency(fin.adminFee)}
                        </td>

                        {/* Total Bayar */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-extrabold text-white">
                            {formatCurrency(fin.totalPayment)}
                          </span>
                        </td>

                        {/* Metode Bayar */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono font-bold text-slate-300 uppercase border border-white/5">
                            {row.payment?.payment_method || 'QRIS'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {isPaid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Lunas</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* Aksi / Info */}
                        <td className="py-3 px-4 text-center text-slate-500 text-[11px] font-mono">
                          1 Peserta
                        </td>
                      </tr>
                    );
                  } else {
                    // Kelompok Grouped by PIC Row
                    const b = item.batch;
                    const isExpanded = expandedBatchIds.has(b.orderId);

                    return (
                      <React.Fragment key={b.orderId}>
                        <tr className="bg-sky-950/20 hover:bg-sky-900/25 transition-colors border-l-4 border-l-sky-500 font-sans">
                          {/* No */}
                          <td className="py-3 px-4 text-center text-sky-400 font-mono font-bold text-[11px]">
                            {globalIdx}
                          </td>

                          {/* Nama Komunitas & PIC */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-white text-xs uppercase">
                                    {b.namaKomunitas}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                                    {b.totalParticipants} Peserta
                                  </span>
                                </div>
                                <span className="text-[10px] text-sky-200/80 block mt-0.5">
                                  PIC: <strong className="text-white">{b.picName}</strong> &bull; {b.picPhone}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Kategori Breakdown */}
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-mono font-bold text-sky-300 block">
                              {b.categorySummary}
                            </span>
                          </td>

                          {/* Tipe Registrasi */}
                          <td className="py-3 px-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 inline-flex items-center gap-1">
                              <Building className="w-2.5 h-2.5" />
                              <span>Kelompok PIC</span>
                            </span>
                          </td>

                          {/* Sesi Tarif */}
                          <td className="py-3 px-3">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {b.tierName}
                            </span>
                          </td>

                          {/* Fee Tiket Bersih Kelompok */}
                          <td className="py-3 px-4 text-right">
                            <div className="leading-tight">
                              <span className="font-mono font-extrabold text-emerald-400 text-xs block">
                                {formatCurrency(b.finalTicketTotal)}
                              </span>
                              {b.hasDiscount && (
                                <span className="text-[9px] text-amber-400 font-mono block">
                                  Diskon: -{formatCurrency(b.discountAmount)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Fee Admin */}
                          <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                            +{formatCurrency(b.adminFeeTotal)}
                          </td>

                          {/* Total Bayar Kelompok */}
                          <td className="py-3 px-4 text-right">
                            <span className="font-mono font-extrabold text-sky-300 text-xs">
                              {formatCurrency(b.totalPayment)}
                            </span>
                          </td>

                          {/* Metode Bayar */}
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono font-bold text-slate-300 uppercase border border-white/5">
                              {b.paymentMethod}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            {b.isFullyPaid ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Lunas</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>

                          {/* Tombol Expand Anggota */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleExpandBatch(b.orderId)}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <span>{isExpanded ? 'Tutup' : 'Lihat Anggota'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Nested Sub-Table: Menampilkan Peserta dalam Kelompok PIC */}
                        {isExpanded && (
                          <tr className="bg-black/50 border-b border-sky-500/20">
                            <td colSpan={11} className="p-4 pl-12">
                              <div className="rounded-xl border border-white/10 bg-[#070e18] p-3 space-y-3 shadow-inner">
                                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>
                                      Rincian {b.participants.length} Peserta Rombongan ({b.namaKomunitas}) &bull; PIC: {b.picName}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Order ID: {b.orderId}
                                  </span>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-[11px]">
                                    <thead>
                                      <tr className="text-slate-400 uppercase font-bold border-b border-white/5">
                                        <th className="py-1.5 px-3 w-8">#</th>
                                        <th className="py-1.5 px-3">No. BIB</th>
                                        <th className="py-1.5 px-3">Nama Anggota</th>
                                        <th className="py-1.5 px-3">Kategori</th>
                                        <th className="py-1.5 px-3">Ukuran Jersey</th>
                                        <th className="py-1.5 px-3">Email &amp; HP</th>
                                        <th className="py-1.5 px-3 text-right">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                      {b.participants.map((member, mIdx) => (
                                        <tr key={member.id} className="hover:bg-white/[0.02]">
                                          <td className="py-2 px-3 text-slate-500 font-mono">{mIdx + 1}</td>
                                          <td className="py-2 px-3 font-mono font-bold text-white">
                                            {member.no_bib || '-'}
                                          </td>
                                          <td className="py-2 px-3 font-semibold text-white">{member.nama}</td>
                                          <td className="py-2 px-3">
                                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-200 font-mono font-bold text-[10px]">
                                              {member.kategori}
                                            </span>
                                          </td>
                                          <td className="py-2 px-3 text-slate-400 font-mono">
                                            {member.ukuran_jersey || '-'}
                                          </td>
                                          <td className="py-2 px-3 text-slate-400">
                                            {member.email} {member.no_hp ? `• ${member.no_hp}` : ''}
                                          </td>
                                          <td className="py-2 px-3 text-right">
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px]">
                                              Lunas
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              • Halaman <strong className="text-white">{safeCurrentPage}</strong> dari{' '}
              <strong className="text-white">{totalPages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. Flash Sale Configuration Modal */}
      <AdminFlashSaleModal
        isOpen={showFlashSaleModal}
        onClose={() => setShowFlashSaleModal(false)}
        onSaved={fetchData}
        hideQuota={true}
      />
    </div>
  );
}
