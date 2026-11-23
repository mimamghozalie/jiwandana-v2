'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  Hash,
  User,
  Award,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  ArrowLeft,
  Users,
} from 'lucide-react';

interface ParticipantItem {
  nama: string;
  nama_bib: string;
  no_bib: string;
  kategori: string;
}

export default function AllPesertaClient() {
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Fetch data peserta
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/trailrun/peserta/all');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memuat data peserta.');
      }
      setParticipants(json.data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered participants berdasarkan search & kategori
  const filteredParticipants = useMemo(() => {
    let result = participants;

    // 1. Filter Kategori
    if (categoryFilter !== 'all') {
      const cat = categoryFilter.toLowerCase();
      result = result.filter((p) => (p.kategori || '').toLowerCase().includes(cat));
    }

    // 2. Search Text (Nama atau No. BIB)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.nama || '').toLowerCase().includes(q) ||
          (p.nama_bib || '').toLowerCase().includes(q) ||
          (p.no_bib || '').toLowerCase().includes(q)
      );
    }

    // 3. Urutkan berdasarkan Nama Lengkap (A-Z)
    return [...result].sort((a, b) =>
      (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' })
    );
  }, [participants, categoryFilter, searchQuery]);

  // Reset page saat filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, pageSize]);

  // Pagination calculation
  const totalItems = filteredParticipants.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = pageSize === -1 ? 0 : (safePage - 1) * pageSize;
  const paginatedData =
    pageSize === -1
      ? filteredParticipants
      : filteredParticipants.slice(startIndex, startIndex + pageSize);

  // Kategori counts untuk pill filter
  const categoryCounts = useMemo(() => {
    let count12k = 0;
    let count7k = 0;
    participants.forEach((p) => {
      const cat = (p.kategori || '').toLowerCase();
      if (cat.includes('12')) count12k++;
      if (cat.includes('7')) count7k++;
    });
    return {
      all: participants.length,
      '12k': count12k,
      '7k': count7k,
    };
  }, [participants]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-800 font-sans pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 1. TOP BREADCRUMB & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
          <div className="space-y-1">
            <Link
              href="/trailrun"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#C9A227] transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Trailrun</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
              Daftar Seluruh Peserta
            </h1>
          </div>

          {/* Badge Total Counter */}
          {/* <div className="self-start sm:self-center bg-white border border-black/10 rounded-2xl px-4 py-2.5 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#b45309] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Total Terdaftar
              </span>
              <span className="text-lg font-black text-slate-900 font-mono leading-none">
                {participants.length} Peserta
              </span>
            </div> */}
          {/* </div> */}
        </div>

        {/* 2. TOOLBAR: SEARCH & CATEGORY FILTER */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan Nama atau Nomor BIB..."
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-black/10 rounded-xl focus:bg-white focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${categoryFilter === 'all'
                  ? 'bg-[#0d1c32] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                Semua ({categoryCounts.all})
              </button>
              {/* <button
                type="button"
                onClick={() => setCategoryFilter('12k')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${categoryFilter === '12k'
                  ? 'bg-[#b45309] text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
              >
                12K ({categoryCounts['12k']})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('7k')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${categoryFilter === '7k'
                  ? 'bg-[#047857] text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                  }`}
              >
                7K ({categoryCounts['7k']})
              </button> */}
            </div>
          </div>
        </div>

        {/* 3. MOBILE SWIPE NOTICE */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5 sm:hidden">
            <MoveHorizontal className="w-3.5 h-3.5 text-[#b45309] animate-pulse" />
            <span>Tabel dapat digeser ke kanan &amp; kiri</span>
          </div>
          <div className="hidden sm:block text-slate-400">
            Menampilkan {filteredParticipants.length} dari {participants.length} peserta
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs bg-white border border-black/10 rounded-lg px-2 py-1 outline-none text-slate-700 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Semua</option>
            </select>
          </div>
        </div>

        {/* 4. THE SWIPEABLE TABLE CONTAINER (overflow-x-auto min-w-[650px]) */}
        <div className="bg-white border-2 border-black/10 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-black/10 text-slate-600 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3.5 px-4 w-14 text-center">No</th>
                  <th className="py-3.5 px-4 w-36">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#C9A227]" />
                      Nomor BIB
                    </span>
                  </th>
                  <th className="py-3.5 px-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#C9A227]" />
                      Nama Lengkap
                    </span>
                  </th>
                  <th className="py-3.5 px-4">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#C9A227]" />
                      Nama di BIB
                    </span>
                  </th>
                  <th className="py-3.5 px-4 w-32 text-center">
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#C9A227]" />
                      Kategori
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-slate-700">
                {/* LOADING STATE */}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#C9A227]" />
                        <span className="font-semibold text-slate-600 text-sm">
                          Memuat data seluruh peserta...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* ERROR STATE */}
                {!loading && errorMsg && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-rose-600">
                      <p className="font-semibold">{errorMsg}</p>
                      <button
                        type="button"
                        onClick={fetchData}
                        className="mt-2 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold"
                      >
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                )}

                {/* EMPTY STATE */}
                {!loading && !errorMsg && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700 text-sm">
                          Tidak Ada Peserta yang Cocok
                        </p>
                        <p className="text-xs text-slate-500">
                          Coba periksa kembali kata kunci pencarian atau ganti filter kategori.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* DATA ROWS */}
                {!loading &&
                  !errorMsg &&
                  paginatedData.map((item, idx) => {
                    const rowNumber = startIndex + idx + 1;
                    const is12k = (item.kategori || '').toLowerCase().includes('12');

                    return (
                      <tr
                        key={`${item.no_bib}-${idx}`}
                        className="hover:bg-slate-50/80 transition-colors font-sans"
                      >
                        {/* No Urut */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold text-[11px]">
                          {rowNumber}
                        </td>

                        {/* Nomor BIB */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[#b45309] font-mono font-bold text-xs inline-block shadow-2xs">
                            {item.no_bib}
                          </span>
                        </td>

                        {/* Nama Lengkap */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs sm:text-sm">
                          {item.nama}
                        </td>

                        {/* Nama di BIB */}
                        <td className="py-3.5 px-4 text-xs font-semibold text-[#b45309]">
                          {item.nama_bib || item.nama}
                        </td>

                        {/* Kategori */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase font-mono tracking-wider inline-block ${is12k
                              ? 'bg-amber-100/80 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                              }`}
                          >
                            {item.kategori}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* 5. TABLE FOOTER & PAGINATION */}
          {!loading && !errorMsg && filteredParticipants.length > 0 && pageSize !== -1 && (
            <div className="bg-slate-50 px-4 py-3.5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Menampilkan{' '}
                <span className="font-bold text-slate-900">
                  {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)}
                </span>{' '}
                dari <span className="font-bold text-slate-900">{totalItems}</span> peserta
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <span className="px-3 py-1 font-mono font-bold text-slate-800">
                  {safePage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
