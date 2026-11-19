'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  CreditCard,
  Hash,
  User,
  Filter,
  RefreshCw,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import {
  useTrailrunData,
  TrailrunSubNav,
  AdminFlashSaleModal,
  ModalEditBpjsItra,
  TrailrunRow,
} from '@/components/admin/trailrun';

function BpjsPageContent() {
  const { data, loading, isRefreshing, fetchData, handleCleanupUnpaid, isCleaningUp } = useTrailrunData();
  const searchParams = useSearchParams();

  // Flash sale modal state for SubNav
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);

  // Quick BIB lookup state
  const [bibQuery, setBibQuery] = useState('');
  const [selectedBibMatch, setSelectedBibMatch] = useState<TrailrunRow | null>(null);

  // Modal edit BPJS & ITRA state
  const [editingParticipant, setEditingParticipant] = useState<TrailrunRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Table Filters
  const [tableSearch, setTableSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bpjsStatusFilter, setBpjsStatusFilter] = useState<'all' | 'lengkap' | 'kurang'>('all');
  const [itraFilter, setItraFilter] = useState<'all' | 'ada' | 'kosong'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Hitung jumlah kelompok & individu untuk TrailrunSubNav
  const { individuCount, kelompokBatchCount, totalKelompokPeserta } = useMemo(() => {
    let ind = 0;
    let kel = 0;
    const batchSet = new Set<string>();

    data.forEach((r) => {
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
  }, [data]);

  // Baca URL query param (?bib=... atau ?q=...) jika dibuka langsung dari halaman lain
  useEffect(() => {
    const bibParam = searchParams.get('bib') || searchParams.get('no_bib') || searchParams.get('q');
    if (bibParam) {
      setBibQuery(bibParam);
    }
  }, [searchParams]);

  // Sinkronkan pencarian Quick BIB
  useEffect(() => {
    const q = bibQuery.trim().toLowerCase();
    if (!q) {
      setSelectedBibMatch(null);
      return;
    }

    const found = data.find((r) => {
      const b = (r.no_bib || '').toLowerCase();
      const n = (r.nama || '').toLowerCase();
      return b === q || b.includes(q) || n.includes(q);
    });

    setSelectedBibMatch(found || null);
  }, [bibQuery, data]);

  // KPI Ringkasan Kelengkapan Data BPJS & ITRA
  const metrics = useMemo(() => {
    const total = data.length;
    let lengkapCount = 0; // NIK 16 digit & KK terisi
    let kurangCount = 0;
    let hasItraCount = 0;

    data.forEach((r) => {
      const nik = (r.nik || '').replace(/[^\d]/g, '');
      const kk = (r.kk || '').trim();
      const itra = (r.id_itra || '').trim();

      const isNikValid = nik.length === 16;
      const isKkFilled = kk !== '' && kk !== '-';
      const isItraFilled = itra !== '' && itra !== '-';

      if (isNikValid && isKkFilled) {
        lengkapCount += 1;
      } else {
        kurangCount += 1;
      }

      if (isItraFilled) {
        hasItraCount += 1;
      }
    });

    return { total, lengkapCount, kurangCount, hasItraCount };
  }, [data]);

  // Filter Data untuk Tabel
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      // 1. Search text
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const bib = (r.no_bib || '').toLowerCase();
        const nama = (r.nama || '').toLowerCase();
        const nik = (r.nik || '').toLowerCase();
        const kk = (r.kk || '').toLowerCase();
        const itra = (r.id_itra || '').toLowerCase();
        const match =
          bib.includes(q) ||
          nama.includes(q) ||
          nik.includes(q) ||
          kk.includes(q) ||
          itra.includes(q);
        if (!match) return false;
      }

      // 2. Kategori filter
      if (categoryFilter !== 'all') {
        const cat = (r.kategori || '').toLowerCase();
        if (!cat.includes(categoryFilter.toLowerCase())) return false;
      }

      // 3. Status BPJS filter (Lengkap: NIK 16 digit & KK terisi)
      const nikClean = (r.nik || '').replace(/[^\d]/g, '');
      const kkClean = (r.kk || '').trim();
      const isNikValid = nikClean.length === 16;
      const isKkFilled = kkClean !== '' && kkClean !== '-';
      const isLengkap = isNikValid && isKkFilled;

      if (bpjsStatusFilter === 'lengkap' && !isLengkap) return false;
      if (bpjsStatusFilter === 'kurang' && isLengkap) return false;

      // 4. ITRA filter
      const itraClean = (r.id_itra || '').trim();
      const hasItra = itraClean !== '' && itraClean !== '-';

      if (itraFilter === 'ada' && !hasItra) return false;
      if (itraFilter === 'kosong' && hasItra) return false;

      return true;
    });
  }, [data, tableSearch, categoryFilter, bpjsStatusFilter, itraFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Handler simpan modal update BPJS & ITRA
  const handleSaveBpjsItra = async (payload: {
    id: string;
    nama: string;
    no_bib: string;
    nik: string;
    kk: string;
    id_itra: string;
  }) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/trailrun/update-bpjs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan data ke server.');
      }

      // Tampilkan toast
      setToastMessage({
        type: 'success',
        text: json.message || 'Data BPJS & ITRA berhasil diperbarui.',
      });

      // Update state data lokal tanpa perlu reload keseluruhan
      await fetchData();

      // Update match kartu quick lookup jika yang diedit adalah yang sedang ditampilkan
      if (selectedBibMatch && selectedBibMatch.id === payload.id) {
        setSelectedBibMatch((prev) =>
          prev
            ? {
                ...prev,
                nama: payload.nama,
                no_bib: payload.no_bib,
                nik: payload.nik,
                kk: payload.kk,
                id_itra: payload.id_itra,
              }
            : null
        );
      }

      setTimeout(() => setToastMessage(null), 5000);
      return true;
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan sistem saat menyimpan.',
      });
      setTimeout(() => setToastMessage(null), 5000);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Header & SubNav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pusat Data Asuransi &amp; ITRA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans flex items-center gap-3">
            <span>Pengecekan BPJS &amp; ITRA Peserta</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Verifikasi kelengkapan identitas NIK dan No. KK untuk kepesertaan asuransi BPJS Ketenagakerjaan serta pencatatan ID ITRA pelari.
          </p>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <TrailrunSubNav
        individuCount={individuCount}
        kelompokBatchCount={kelompokBatchCount}
        totalKelompokPeserta={totalKelompokPeserta}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
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

      {/* 2. Pengecekan Cepat Berdasarkan No. BIB (Quick Lookup Box) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12233c] via-[#0d1c32] to-[#07101c] border-2 border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-white flex items-center gap-2.5">
              <Search className="w-5 h-5 text-amber-400" />
              <span>Cek Cepat Peserta Berdasarkan Nomor BIB</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ketik nomor BIB (contoh: <strong className="text-amber-300 font-mono">M-00080</strong> atau nama pelari) untuk melihat data NIK, KK, dan ITRA seketika.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <div className="relative w-full">
            <Hash className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={bibQuery}
              onChange={(e) => setBibQuery(e.target.value)}
              placeholder="Ketik Nomor BIB (contoh: M-00080 atau OKIE AWAKE)..."
              className="w-full pl-11 pr-10 py-3.5 bg-black/60 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl text-white text-sm font-mono font-bold placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            {bibQuery && (
              <button
                type="button"
                onClick={() => setBibQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Kartu Hasil Quick Lookup */}
        {bibQuery.trim() !== '' && (
          <div className="relative z-10 animate-[fadeIn_0.25s_ease-out]">
            {selectedBibMatch ? (
              <div className="rounded-2xl bg-black/50 border border-amber-500/40 p-5 sm:p-6 space-y-5 shadow-xl">
                {/* Header Kartu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 font-mono font-extrabold text-amber-300 text-sm sm:text-base tracking-wider">
                      {selectedBibMatch.no_bib || 'BIB -'}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                        {selectedBibMatch.nama}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                        <span className="px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                          {selectedBibMatch.kategori || '12K'}
                        </span>
                        <span>•</span>
                        <span>{selectedBibMatch.email}</span>
                        {selectedBibMatch.no_hp && (
                          <>
                            <span>•</span>
                            <span>{selectedBibMatch.no_hp}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingParticipant(selectedBibMatch)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-auto shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Data (Modal)</span>
                  </button>
                </div>

                {/* Grid 4 Kolom Verifikasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Field 1: Nama Lengkap */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Nama Lengkap
                    </span>
                    <div className="text-sm font-bold text-white truncate">
                      {selectedBibMatch.nama}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Gender: {selectedBibMatch.jenis_kelamin || '-'}
                    </span>
                  </div>

                  {/* Field 2: NIK */}
                  {(() => {
                    const rawNik = (selectedBibMatch.nik || '').replace(/[^\d]/g, '');
                    const isValid = rawNik.length === 16;
                    return (
                      <div
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          isValid
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-rose-500/10 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-emerald-400" />
                            NIK (KTP)
                          </span>
                          {isValid ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                              16 Digit ✓
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                              {rawNik.length === 0 ? 'Belum Diisi' : `${rawNik.length} Digit`}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-mono font-bold text-white tracking-wider">
                          {selectedBibMatch.nik || '-'}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {isValid ? 'Siap klaim BPJS' : 'Wajib 16 digit untuk asuransi'}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Field 3: No. KK */}
                  {(() => {
                    const rawKk = (selectedBibMatch.kk || '').trim();
                    const isFilled = rawKk !== '' && rawKk !== '-';
                    return (
                      <div
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          isFilled
                            ? 'bg-sky-500/10 border-sky-500/30'
                            : 'bg-amber-500/10 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-sky-400" />
                            No. KK
                          </span>
                          {isFilled ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                              Terisi ✓
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                              Belum Ada
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-mono font-bold text-white tracking-wider">
                          {selectedBibMatch.kk || '-'}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Nomor Kartu Keluarga
                        </span>
                      </div>
                    );
                  })()}

                  {/* Field 4: ID ITRA */}
                  {(() => {
                    const itra = (selectedBibMatch.id_itra || '').trim();
                    const hasItra = itra !== '' && itra !== '-';
                    return (
                      <div
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          hasItra
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white/[0.03] border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            ID ITRA
                          </span>
                          {hasItra ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                              Terdaftar ✓
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-mono">
                              Belum Ada
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-mono font-bold text-white">
                          {selectedBibMatch.id_itra || '-'}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          International Trail Running Assc.
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white font-sans">
                  Nomor BIB "{bibQuery}" Tidak Ditemukan
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Pastikan format nomor BIB benar (contoh: M-00080 atau kata kunci nama peserta).
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. KPI Cards: Statistik Kelengkapan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <div className="p-5 rounded-2xl bg-[#0a1424] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Total Peserta Terdaftar
            </span>
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {metrics.total} <span className="text-xs font-normal text-slate-400">Org</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Semua peserta terkonfirmasi &amp; lunas
          </span>
        </div>

        {/* NIK & KK Lengkap */}
        <div className="p-5 rounded-2xl bg-[#0a1424] border border-emerald-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              NIK &amp; KK Lengkap
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics.lengkapCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({metrics.total > 0 ? Math.round((metrics.lengkapCount / metrics.total) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-emerald-300/80 block">
            Identitas siap didaftarkan ke asuransi
          </span>
        </div>

        {/* NIK/KK Belum Lengkap */}
        <div className="p-5 rounded-2xl bg-[#0a1424] border border-rose-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-rose-400">
              Belum Lengkap / Kurang
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
            {metrics.kurangCount}{' '}
            <span className="text-xs font-normal text-slate-400">Org</span>
          </div>
          <span className="text-[11px] text-rose-300/80 block">
            Perlu dihubungi untuk konfirmasi NIK/KK
          </span>
        </div>

        {/* ID ITRA Terisi */}
        <div className="p-5 rounded-2xl bg-[#0a1424] border border-purple-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-400">
              Terdaftar ID ITRA
            </span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
            {metrics.hasItraCount}{' '}
            <span className="text-xs font-normal text-slate-400">Org</span>
          </div>
          <span className="text-[11px] text-purple-200/80 block">
            Poin index pelari siap dilaporkan ke ITRA
          </span>
        </div>
      </div>

      {/* 4. Toolbar & Filter Tabel */}
      <div className="p-5 rounded-2xl bg-[#0a1424] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box Tabel */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, no BIB, NIK, atau KK di tabel..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] rounded-xl text-white text-xs outline-none transition-all placeholder-slate-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Kategori */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none cursor-pointer focus:border-[#C9A227]"
            >
              <option value="all">Semua Kategori</option>
              <option value="12k">Kategori 12K</option>
              <option value="7k">Kategori 7K</option>
              <option value="3k">Kategori 3K</option>
            </select>

            {/* Filter Status BPJS */}
            <select
              value={bpjsStatusFilter}
              onChange={(e) => {
                setBpjsStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none cursor-pointer focus:border-[#C9A227]"
            >
              <option value="all">Semua Status BPJS</option>
              <option value="lengkap">✓ NIK &amp; KK Lengkap</option>
              <option value="kurang">⚠️ NIK / KK Belum Lengkap</option>
            </select>

            {/* Filter ITRA */}
            <select
              value={itraFilter}
              onChange={(e) => {
                setItraFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none cursor-pointer focus:border-[#C9A227]"
            >
              <option value="all">Semua Status ITRA</option>
              <option value="ada">✓ Ada ID ITRA</option>
              <option value="kosong">Belum Ada ITRA</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
          <span>
            Menampilkan <strong className="text-white">{filteredData.length}</strong> peserta dari total {data.length}
          </span>
          {(tableSearch || categoryFilter !== 'all' || bpjsStatusFilter !== 'all' || itraFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setTableSearch('');
                setCategoryFilter('all');
                setBpjsStatusFilter('all');
                setItraFilter('all');
                setCurrentPage(1);
              }}
              className="text-[#C9A227] hover:underline cursor-pointer text-xs"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* 5. Tabel Utama Data Peserta BPJS & ITRA */}
      <div className="rounded-2xl bg-[#0a1424] border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/60 border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-3">No. BIB</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-3">Kategori</th>
                <th className="py-3.5 px-4">NIK (KTP)</th>
                <th className="py-3.5 px-4">Nomor KK</th>
                <th className="py-3.5 px-3">ID ITRA</th>
                <th className="py-3.5 px-3 text-center">Status BPJS</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#C9A227]" />
                      <span>Memuat data peserta BPJS &amp; ITRA...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data peserta yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const globalIdx = startIndex + idx + 1;
                  const rawNik = (row.nik || '').replace(/[^\d]/g, '');
                  const isNikValid = rawNik.length === 16;
                  const rawKk = (row.kk || '').trim();
                  const isKkFilled = rawKk !== '' && rawKk !== '-';
                  const isBpjsReady = isNikValid && isKkFilled;
                  const itra = (row.id_itra || '').trim();
                  const hasItra = itra !== '' && itra !== '-';

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-white/[0.03] transition-colors group font-sans"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      {/* No. BIB */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono font-bold text-white text-[11px]">
                          {row.no_bib || '-'}
                        </span>
                      </td>

                      {/* Nama Lengkap */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{row.nama}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {row.jenis_kelamin || '-'} • {row.no_hp || row.email}
                          </span>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            (row.kategori || '').toLowerCase().includes('12')
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {row.kategori || '12K'}
                        </span>
                      </td>

                      {/* NIK */}
                      <td className="py-3.5 px-4 font-mono">
                        {isNikValid ? (
                          <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[11px]">
                            <span>{row.nik}</span>
                            <span className="text-[9px] text-emerald-400/80">✓</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                            <span>{row.nik || '-'}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                              {rawNik.length === 0 ? 'Kosong' : `${rawNik.length} Dig`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* No. KK */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {isKkFilled ? (
                          <span className="text-slate-200">{row.kk}</span>
                        ) : (
                          <span className="text-amber-400/80 italic text-[10px]">Belum Diisi</span>
                        )}
                      </td>

                      {/* ID ITRA */}
                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        {hasItra ? (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                            {row.id_itra}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Status BPJS */}
                      <td className="py-3.5 px-3 text-center">
                        {isBpjsReady ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lengkap</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Kurang Data</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi: Edit Modal */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingParticipant(row)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
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
              className="px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-white text-xs outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2">
              Halaman <strong className="text-white">{safePage}</strong> dari {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono text-white text-xs">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Edit BPJS & ITRA */}
      <ModalEditBpjsItra
        isOpen={Boolean(editingParticipant)}
        participant={editingParticipant}
        onClose={() => setEditingParticipant(null)}
        onSave={handleSaveBpjsItra}
        isSaving={isSaving}
      />

      {/* Modal Flash Sale */}
      {showFlashSaleModal && (
        <AdminFlashSaleModal
          isOpen={showFlashSaleModal}
          onClose={() => setShowFlashSaleModal(false)}
        />
      )}
    </div>
  );
}

export default function AdminTrailrunBpjsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#C9A227]" />
            <span>Memuat halaman BPJS &amp; ITRA...</span>
          </div>
        </div>
      }
    >
      <BpjsPageContent />
    </Suspense>
  );
}
