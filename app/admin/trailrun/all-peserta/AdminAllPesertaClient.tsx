'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Hash,
  User,
  RefreshCw,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shirt,
  ShieldCheck,
  FileText,
  HeartPulse,
  Users,
  Activity,
  CreditCard,
  Clock,
  Sparkles,
  Check,
  Filter,
} from 'lucide-react';
import {
  useTrailrunData,
  TrailrunSubNav,
  AdminFlashSaleModal,
  ModalVerifikasiRpc,
} from '@/components/admin/trailrun';
import { RpcVerificationRecord } from '@/app/api/admin/trailrun/rpc/route';

export default function AdminAllPesertaClient() {
  // Global trailrun data untuk SubNav (counter individu, kelompok, cleanup, flash sale)
  const {
    data: allRegistrations,
    fetchData: refreshOverviewData,
    isRefreshing: isOverviewRefreshing,
    handleCleanupUnpaid,
    isCleaningUp,
  } = useTrailrunData();

  const searchParams = useSearchParams();

  // State flash sale modal
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);

  // State data RPC
  const [rpcList, setRpcList] = useState<RpcVerificationRecord[]>([]);
  const [loadingRpc, setLoadingRpc] = useState(true);
  const [isRefreshingRpc, setIsRefreshingRpc] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick BIB scanner / lookup
  const [quickBibQuery, setQuickBibQuery] = useState('');

  // Modal Verifikasi state
  const [selectedForVerification, setSelectedForVerification] = useState<RpcVerificationRecord | null>(null);
  const [isSavingVerification, setIsSavingVerification] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter Table
  const [tableSearch, setTableSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jerseyFilter, setJerseyFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Hitung jumlah kelompok & individu untuk TrailrunSubNav
  const { individuCount, kelompokBatchCount, totalKelompokPeserta } = useMemo(() => {
    let ind = 0;
    let kel = 0;
    const batchSet = new Set<string>();

    allRegistrations.forEach((r) => {
      const isKel =
        r.registration_type === 'bulk' ||
        Boolean(r.pic_name && r.pic_name.trim() !== '') ||
        Boolean(r.payment?.order_id?.startsWith('TR-BULK'));

      if (isKel) {
        kel += 1;
        batchSet.add(r.payment?.order_id || r.order_id || r.id);
      } else {
        ind += 1;
      }
    });

    return {
      individuCount: ind,
      kelompokBatchCount: batchSet.size,
      totalKelompokPeserta: kel,
    };
  }, [allRegistrations]);

  // Fetch data verifikasi RPC dari API
  const fetchRpcData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingRpc(true);
    else setIsRefreshingRpc(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/trailrun/rpc');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memuat data verifikasi RPC.');
      }
      setRpcList(json.data || []);
    } catch (err: any) {
      console.error('[AdminAllPesertaClient] Fetch error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat mengambil data RPC.');
    } finally {
      setLoadingRpc(false);
      setIsRefreshingRpc(false);
    }
  }, []);

  useEffect(() => {
    fetchRpcData();
  }, [fetchRpcData]);

  // Handle URL query (?bib=...) jika diarahkan dari halaman lain atau scan QR
  useEffect(() => {
    const bibParam = searchParams.get('bib') || searchParams.get('no_bib') || searchParams.get('q');
    if (bibParam) {
      setQuickBibQuery(bibParam);
    }
  }, [searchParams]);

  // Pencarian Quick Lookup berdasarkan BIB atau Nama
  const quickLookupMatch = useMemo(() => {
    const q = quickBibQuery.trim().toLowerCase();
    if (!q) return null;

    return (
      rpcList.find((r) => {
        const bib = (r.no_bib || '').toLowerCase();
        const nama = (r.nama || '').toLowerCase();
        const namaBib = (r.nama_bib || '').toLowerCase();
        return bib === q || bib.includes(q) || nama.includes(q) || namaBib.includes(q);
      }) || null
    );
  }, [quickBibQuery, rpcList]);

  // KPI Ringkasan Status RPC
  const metrics = useMemo(() => {
    const total = rpcList.length;
    let belumDiambil = 0;
    let syaratKurang = 0;
    let sudahBersyarat = 0;
    let sudahLengkap = 0;

    rpcList.forEach((r) => {
      switch (r.status_pengambilan) {
        case 'sudah_diambil':
          sudahLengkap += 1;
          break;
        case 'sudah_diambil_bersyarat':
          sudahBersyarat += 1;
          break;
        case 'syarat_kurang':
          syaratKurang += 1;
          break;
        case 'belum_diambil':
        default:
          belumDiambil += 1;
          break;
      }
    });

    return { total, belumDiambil, syaratKurang, sudahBersyarat, sudahLengkap };
  }, [rpcList]);

  // List ukuran jersey unik untuk filter
  const jerseyOptions = useMemo(() => {
    const set = new Set<string>();
    rpcList.forEach((r) => {
      if (r.ukuran_jersey && r.ukuran_jersey !== '—') {
        set.add(r.ukuran_jersey.toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [rpcList]);

  // Filter Data untuk Tabel
  const filteredData = useMemo(() => {
    return rpcList.filter((r) => {
      // 1. Text Search (BIB, Nama, Nama BIB, Petugas, Catatan)
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const bib = (r.no_bib || '').toLowerCase();
        const nama = (r.nama || '').toLowerCase();
        const namaBib = (r.nama_bib || '').toLowerCase();
        const petugas = (r.petugas || '').toLowerCase();
        const catatan = (r.catatan || '').toLowerCase();
        const match =
          bib.includes(q) ||
          nama.includes(q) ||
          namaBib.includes(q) ||
          petugas.includes(q) ||
          catatan.includes(q);
        if (!match) return false;
      }

      // 2. Kategori Filter
      if (categoryFilter !== 'all') {
        const cat = (r.kategori || '').toLowerCase();
        if (!cat.includes(categoryFilter.toLowerCase())) return false;
      }

      // 3. Status RPC Filter
      if (statusFilter !== 'all') {
        if (r.status_pengambilan !== statusFilter) return false;
      }

      // 4. Jersey Filter
      if (jerseyFilter !== 'all') {
        if ((r.ukuran_jersey || '').toUpperCase() !== jerseyFilter.toUpperCase()) {
          return false;
        }
      }

      return true;
    });
  }, [rpcList, tableSearch, categoryFilter, statusFilter, jerseyFilter]);

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, categoryFilter, statusFilter, jerseyFilter, pageSize]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = pageSize === -1 ? 0 : (safePage - 1) * pageSize;
  const paginatedData =
    pageSize === -1 ? filteredData : filteredData.slice(startIndex, startIndex + pageSize);

  // Handler simpan modal verifikasi RPC
  const handleSaveVerification = async (payload: Partial<RpcVerificationRecord>) => {
    setIsSavingVerification(true);
    try {
      const res = await fetch('/api/admin/trailrun/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan data verifikasi RPC.');
      }

      // Optimistic update state lokal
      setRpcList((prev) =>
        prev.map((r) =>
          r.no_bib === payload.no_bib || r.id === payload.id
            ? { ...r, ...payload, ...json.data }
            : r
        )
      );

      // Jika quick lookup cocok, update juga objeknya
      if (quickLookupMatch && (quickLookupMatch.no_bib === payload.no_bib || quickLookupMatch.id === payload.id)) {
        // Akan otomatis ter-update karena quickLookupMatch derived dari rpcList
      }

      setToastMessage({
        type: 'success',
        text: `Verifikasi BIB ${payload.no_bib} berhasil disimpan! Status: ${
          payload.status_pengambilan?.replace(/_/g, ' ') || 'Tersimpan'
        }`,
      });

      setTimeout(() => setToastMessage(null), 5000);
      return true;
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan sistem saat menyimpan verifikasi.',
      });
      setTimeout(() => setToastMessage(null), 5000);
      throw err;
    } finally {
      setIsSavingVerification(false);
    }
  };

  // Helper render status badge
  const renderStatusBadge = (status: string, waktu?: string | null) => {
    switch (status) {
      case 'sudah_diambil':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-sans shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Sudah Diambil</span>
            </span>
            {waktu && (
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pl-1">
                <Clock className="w-2.5 h-2.5 text-slate-500" />
                {new Date(waktu).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        );
      case 'sudah_diambil_bersyarat':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 font-sans shadow-xs">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              <span>Diambil Bersyarat</span>
            </span>
            {waktu && (
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pl-1">
                <Clock className="w-2.5 h-2.5 text-slate-500" />
                {new Date(waktu).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        );
      case 'syarat_kurang':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans shadow-xs">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Syarat Belum Lengkap</span>
          </span>
        );
      case 'belum_diambil':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 font-sans shadow-xs">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>Belum Diambil</span>
          </span>
        );
    }
  };

  // Helper render mini-checklist icon untuk tabel
  const renderCheckItem = (label: string, isPassed: boolean, isNotApplicable = false) => {
    if (isNotApplicable) {
      return (
        <span
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-500 border border-white/5"
          title={`${label}: Tidak Berlaku (N/A)`}
        >
          -
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold transition-all shadow-xs ${
          isPassed
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}
        title={`${label}: ${isPassed ? 'Terpenuhi ✓' : 'Belum Lengkap ✗'}`}
      >
        {isPassed ? <Check className="w-3 h-3" /> : '✗'}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Header & SubNav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Meja Pengambilan Race Pack (RPC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans flex items-center gap-3">
            <span>Verifikasi Pengambilan Data Race (Semua Peserta)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Verifikasi fisik 6 syarat pengambilan race pack di venue lomba (Mandatory Gear, Waiver, Surat Sehat, Surat Izin Ortu, Strava 5K, dan Identitas KTP) beserta ukuran jersey dan penyerahan BIB.
          </p>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <TrailrunSubNav
        individuCount={individuCount}
        kelompokBatchCount={kelompokBatchCount}
        totalKelompokPeserta={totalKelompokPeserta}
        onRefresh={() => {
          refreshOverviewData();
          fetchRpcData(true);
        }}
        isRefreshing={isOverviewRefreshing || isRefreshingRpc}
        onCleanup={handleCleanupUnpaid}
        isCleaningUp={isCleaningUp}
        onOpenFlashSale={() => setShowFlashSaleModal(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-[fadeIn_0.2s_ease-out] shadow-xl ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Pengecekan Cepat / Barcode Scanner di Meja Antrean (Quick Lookup Box) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#132742] via-[#0d1c32] to-[#08121f] border-2 border-emerald-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-white flex items-center gap-2.5">
              <Search className="w-5 h-5 text-emerald-400" />
              <span>Scan / Cari Nomor BIB Meja Verifikasi</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ketik atau scan nomor BIB peserta (contoh: <strong className="text-emerald-300 font-mono">M-00080</strong> atau nama pelari) untuk verifikasi instan di meja pengambilan.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <div className="relative w-full">
            <Hash className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickBibQuery}
              onChange={(e) => setQuickBibQuery(e.target.value)}
              placeholder="Scan Barcode / Ketik Nomor BIB atau Nama Peserta..."
              className="w-full pl-11 pr-10 py-3.5 bg-black/60 border border-white/15 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-2xl text-white text-sm font-mono font-bold placeholder-slate-500 outline-none transition-all shadow-inner"
              autoFocus
            />
            {quickBibQuery && (
              <button
                type="button"
                onClick={() => setQuickBibQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Hasil Quick Lookup Highlight */}
        {quickBibQuery.trim() !== '' && (
          <div className="relative z-10 animate-[fadeIn_0.25s_ease-out]">
            {quickLookupMatch ? (
              <div className="rounded-2xl bg-black/50 border border-emerald-500/40 p-5 sm:p-6 space-y-5 shadow-xl">
                {/* Header Kartu Quick Lookup */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 font-mono font-black text-emerald-300 text-base sm:text-xl tracking-wider shadow-inner">
                      {quickLookupMatch.no_bib || 'BIB -'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                          {quickLookupMatch.nama}
                        </h3>
                        {quickLookupMatch.nama_bib && quickLookupMatch.nama_bib !== quickLookupMatch.nama && (
                          <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                            BIB: {quickLookupMatch.nama_bib}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                          {quickLookupMatch.kategori || '12K'}
                        </span>
                        <span>•</span>
                        {/* Jersey Pill Besar */}
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#f5d77f] font-mono font-bold text-xs inline-flex items-center gap-1 shadow-xs">
                          <Shirt className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Ukuran: {quickLookupMatch.ukuran_jersey || '—'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
                    {renderStatusBadge(
                      quickLookupMatch.status_pengambilan,
                      quickLookupMatch.waktu_pengambilan
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedForVerification(quickLookupMatch)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Verifikasi &amp; Serahkan Paket</span>
                    </button>
                  </div>
                </div>

                {/* 6 Syarat Quick Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* 1. Mandatory Gear */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
                      Mandatory
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Gear</span>
                      {renderCheckItem('Mandatory Gear', quickLookupMatch.mandatory_gear)}
                    </div>
                  </div>

                  {/* 2. Waiver */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate flex items-center gap-1">
                      <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                      Waiver
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Formulir</span>
                      {renderCheckItem('Waiver', quickLookupMatch.waiver)}
                    </div>
                  </div>

                  {/* 3. Surat Sehat (wajib) */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate flex items-center gap-1">
                      <HeartPulse className="w-3 h-3 text-rose-400 shrink-0" />
                      Surat Sehat
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Wajib</span>
                      {renderCheckItem('Surat Sehat (Wajib)', quickLookupMatch.surat_sehat)}
                    </div>
                  </div>

                  {/* 4. Surat Izin Ortu */}
                  {(() => {
                    let isUnder17 = false;
                    if (quickLookupMatch.tanggal_lahir) {
                      const b = new Date(quickLookupMatch.tanggal_lahir);
                      if (!isNaN(b.getTime())) {
                        const raceDate = new Date('2026-11-28');
                        let age = raceDate.getFullYear() - b.getFullYear();
                        const m = raceDate.getMonth() - b.getMonth();
                        if (m < 0 || (m === 0 && raceDate.getDate() < b.getDate())) age--;
                        if (age < 17) isUnder17 = true;
                      }
                    }
                    return (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-400 shrink-0" />
                          Izin Ortu
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            {isUnder17 ? '< 17 Th' : 'Dewasa'}
                          </span>
                          {renderCheckItem('Surat Izin Ortu', quickLookupMatch.surat_izin_ortu, !isUnder17)}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 5. Strava 5K (Khusus 12K) */}
                  {(() => {
                    const is12k = (quickLookupMatch.kategori || '').toLowerCase().includes('12');
                    return (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate flex items-center gap-1">
                          <Activity className="w-3 h-3 text-orange-400 shrink-0" />
                          Strava 5K
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            {is12k ? 'Wajib 12K' : 'Non-12K'}
                          </span>
                          {renderCheckItem('Strava 5K (Khusus 12K)', quickLookupMatch.strava_12k, !is12k)}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 6. Menunjukkan Data Diri (KTP) */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-400 shrink-0" />
                      Data Diri
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">KTP/Asli</span>
                      {renderCheckItem('Menunjukkan Data Diri', quickLookupMatch.menunjukan_data_diri)}
                    </div>
                  </div>
                </div>

                {/* Catatan Petugas jika ada */}
                {quickLookupMatch.catatan && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Catatan Petugas ({quickLookupMatch.petugas || 'Admin'}):</strong> {quickLookupMatch.catatan}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white font-sans">
                  Nomor BIB "{quickBibQuery}" Tidak Ditemukan
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Pastikan format nomor BIB benar (contoh: M-00080 atau kata kunci nama lengkap peserta).
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. KPI Cards: Statistik Pengambilan RPC */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Peserta */}
        <div className="p-4 rounded-2xl bg-[#0a1424] border border-white/10 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Total Peserta BIB
            </span>
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {metrics.total} <span className="text-xs font-normal text-slate-400">Org</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Peserta resmi ber-BIB
          </span>
        </div>

        {/* Belum Diambil */}
        <div className="p-4 rounded-2xl bg-[#0a1424] border border-rose-500/30 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-rose-400">
              Belum Diambil
            </span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {metrics.belumDiambil}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({metrics.total > 0 ? Math.round((metrics.belumDiambil / metrics.total) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[10px] text-rose-300/80 block truncate">
            Menunggu di meja RPC
          </span>
        </div>

        {/* Syarat Belum Lengkap */}
        <div className="p-4 rounded-2xl bg-[#0a1424] border border-amber-500/30 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
              Syarat Kurang
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {metrics.syaratKurang}{' '}
            <span className="text-xs font-normal text-slate-400">Org</span>
          </div>
          <span className="text-[10px] text-amber-300/80 block truncate">
            Berkas belum lengkap
          </span>
        </div>

        {/* Diambil Bersyarat */}
        <div className="p-4 rounded-2xl bg-[#0a1424] border border-orange-500/30 shadow-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-orange-400">
              Diambil Bersyarat
            </span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-orange-400 font-mono">
            {metrics.sudahBersyarat}{' '}
            <span className="text-xs font-normal text-slate-400">Org</span>
          </div>
          <span className="text-[10px] text-orange-300/80 block truncate">
            Dengan catatan khusus
          </span>
        </div>

        {/* Sudah Diambil (Lengkap) */}
        <div className="p-4 rounded-2xl bg-[#0a1424] border border-emerald-500/30 shadow-xl space-y-1.5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              Sudah Diambil
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {metrics.sudahLengkap}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({metrics.total > 0 ? Math.round((metrics.sudahLengkap / metrics.total) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[10px] text-emerald-300/80 block truncate">
            Paket race pack diserahkan
          </span>
        </div>
      </div>

      {/* 4. Toolbar & Filter Tabel */}
      <div className="p-5 rounded-2xl bg-[#0a1424] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Cari Peserta (Nama, BIB, Petugas, Catatan)..."
              className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl text-white text-xs placeholder-slate-500 outline-none transition-all"
            />
            {tableSearch && (
              <button
                type="button"
                onClick={() => setTableSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Kategori */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 focus:border-[#C9A227] outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="12k">12K</option>
              <option value="7k">7K</option>
            </select>

            {/* Filter Status RPC */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 focus:border-[#C9A227] outline-none cursor-pointer"
            >
              <option value="all">Semua Status RPC</option>
              <option value="belum_diambil">🔴 Belum Diambil</option>
              <option value="syarat_kurang">🟡 Syarat Kurang</option>
              <option value="sudah_diambil_bersyarat">🟠 Diambil Bersyarat</option>
              <option value="sudah_diambil">🟢 Sudah Diambil</option>
            </select>

            {/* Filter Ukuran Jersey */}
            <select
              value={jerseyFilter}
              onChange={(e) => setJerseyFilter(e.target.value)}
              className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 focus:border-[#C9A227] outline-none cursor-pointer"
            >
              <option value="all">Semua Ukuran Jersey</option>
              {jerseyOptions.map((sz) => (
                <option key={sz} value={sz}>
                  Jersey: {sz}
                </option>
              ))}
            </select>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 focus:border-[#C9A227] outline-none cursor-pointer"
            >
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
              <option value={-1}>Tampilkan Semua</option>
            </select>

            {/* Tombol Refresh */}
            <button
              type="button"
              onClick={() => fetchRpcData(true)}
              disabled={isRefreshingRpc || loadingRpc}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Data RPC"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingRpc ? 'animate-spin text-[#C9A227]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Counter Info & Keterangan Singkat 6 Syarat */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-white/5 pt-3">
          <div>
            Menampilkan <strong className="text-white font-mono">{filteredData.length}</strong> dari{' '}
            <strong className="text-white font-mono">{rpcList.length}</strong> peserta terdaftar
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Indikator 6 Syarat:</span>
            <span>MG = Mandatory Gear</span>
            <span>•</span>
            <span>WV = Waiver</span>
            <span>•</span>
            <span>SS = Surat Sehat (Wajib)</span>
            <span>•</span>
            <span>IO = Izin Ortu (&lt;17 Th)</span>
            <span>•</span>
            <span>ST = Strava 5K (12K)</span>
            <span>•</span>
            <span>ID = KTP Asli</span>
          </div>
        </div>
      </div>

      {/* 5. Tabel Peserta & Verifikasi RPC */}
      <div className="rounded-2xl bg-[#0a1424] border border-white/10 shadow-xl overflow-hidden">
        {loadingRpc ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#C9A227] animate-spin mx-auto" />
            <p className="text-sm font-semibold">Memuat Data Verifikasi RPC...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-12 text-center text-rose-400 space-y-3">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <p className="text-sm font-semibold">{errorMsg}</p>
            <button
              type="button"
              onClick={() => fetchRpcData()}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <ClipboardCheck className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white font-sans">Tidak Ada Data Peserta</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Tidak ada data peserta yang cocok dengan kriteria filter atau pencarian saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-3 text-center w-12">No</th>
                  <th className="py-3.5 px-3">No. BIB</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Nama Lengkap &amp; Nama BIB</th>
                  <th className="py-3.5 px-3">Kategori</th>
                  <th className="py-3.5 px-3 text-center min-w-[120px]">
                    <span className="inline-flex items-center gap-1 text-[#f5d77f]">
                      <Shirt className="w-3.5 h-3.5" />
                      Ukuran Jersey
                    </span>
                  </th>
                  <th className="py-3.5 px-3 text-center min-w-[210px]">
                    <span>6 Syarat Verifikasi</span>
                    <div className="grid grid-cols-6 gap-1 text-[9px] text-slate-500 font-mono mt-1 font-normal">
                      <span>MG</span>
                      <span>WV</span>
                      <span>SS</span>
                      <span>IO</span>
                      <span>ST</span>
                      <span>ID</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 min-w-[170px]">Status Pengambilan</th>
                  <th className="py-3.5 px-3 min-w-[140px]">Petugas &amp; Catatan</th>
                  <th className="py-3.5 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedData.map((row, idx) => {
                  const absoluteIndex = startIndex + idx + 1;

                  // Perhitungan usia & kategori untuk syarat
                  const kategoriClean = (row.kategori || '').toLowerCase();
                  const is12K = kategoriClean.includes('12');

                  let isUnder17 = false;
                  if (row.tanggal_lahir) {
                    const b = new Date(row.tanggal_lahir);
                    if (!isNaN(b.getTime())) {
                      const raceDate = new Date('2026-11-28');
                      let age = raceDate.getFullYear() - b.getFullYear();
                      const m = raceDate.getMonth() - b.getMonth();
                      if (m < 0 || (m === 0 && raceDate.getDate() < b.getDate())) age--;
                      if (age < 17) isUnder17 = true;
                    }
                  }

                  return (
                    <tr
                      key={row.id || row.no_bib}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                        {absoluteIndex}
                      </td>

                      {/* No. BIB */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-mono font-bold text-white text-xs tracking-wider shadow-xs group-hover:border-emerald-500/40">
                          {row.no_bib || '—'}
                        </span>
                      </td>

                      {/* Nama Lengkap & Nama BIB */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs tracking-tight">
                          {row.nama}
                        </div>
                        {row.nama_bib && row.nama_bib !== row.nama ? (
                          <div className="text-[11px] text-amber-300 font-medium font-mono truncate">
                            BIB: {row.nama_bib}
                          </div>
                        ) : null}
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            is12K
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {row.kategori || '12K'}
                        </span>
                      </td>

                      {/* Ukuran Jersey (Sangat Menonjol) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#f5d77f] font-mono font-black text-xs shadow-sm">
                          <Shirt className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>{row.ukuran_jersey || '—'}</span>
                        </span>
                      </td>

                      {/* 6 Syarat Pemeriksaan Mini Badges */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="grid grid-cols-6 gap-1 max-w-[190px] mx-auto">
                          {/* 1. MG */}
                          {renderCheckItem('Mandatory Gear', row.mandatory_gear)}
                          {/* 2. WV */}
                          {renderCheckItem('Waiver', row.waiver)}
                          {/* 3. SS (wajib) */}
                          {renderCheckItem('Surat Sehat (Wajib)', row.surat_sehat)}
                          {/* 4. IO */}
                          {renderCheckItem('Izin Ortu (<17 Th)', row.surat_izin_ortu, !isUnder17)}
                          {/* 5. ST */}
                          {renderCheckItem('Strava 5K (Khusus 12K)', row.strava_12k, !is12K)}
                          {/* 6. ID */}
                          {renderCheckItem('Menunjukkan Data Diri', row.menunjukan_data_diri)}
                        </div>
                      </td>

                      {/* Status Pengambilan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(row.status_pengambilan, row.waktu_pengambilan)}
                      </td>

                      {/* Petugas & Catatan */}
                      <td className="py-3.5 px-3">
                        <div className="text-[11px] font-semibold text-slate-300">
                          {row.petugas ? `Petugas: ${row.petugas}` : <span className="text-slate-500">—</span>}
                        </div>
                        {row.catatan && (
                          <div
                            className="text-[10px] text-amber-300/90 truncate max-w-[180px] mt-0.5"
                            title={row.catatan}
                          >
                            {row.catatan}
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedForVerification(row)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer border border-emerald-500/40"
                            title="Buka Formulir Verifikasi RPC"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Verifikasi</span>
                          </button>

                          <a
                            href={`/trailrun/tiket?q=${encodeURIComponent(row.no_bib)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 inline-flex items-center justify-center cursor-pointer"
                            title="Buka Halaman Tiket / E-BIB"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Halaman <strong className="text-white font-mono">{safePage}</strong> dari{' '}
              <strong className="text-white font-mono">{totalPages}</strong> ({totalItems} Peserta)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <span className="font-mono text-xs px-2 text-slate-400">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. Modal Verifikasi RPC */}
      <ModalVerifikasiRpc
        isOpen={Boolean(selectedForVerification)}
        onClose={() => setSelectedForVerification(null)}
        participant={selectedForVerification}
        onSave={handleSaveVerification}
        isSaving={isSavingVerification}
      />

      {/* 8. Admin Flash Sale Modal */}
      <AdminFlashSaleModal
        isOpen={showFlashSaleModal}
        onClose={() => setShowFlashSaleModal(false)}
      />
    </div>
  );
}
