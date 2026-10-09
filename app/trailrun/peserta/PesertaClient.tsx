'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  QrCode,
  Printer,
  Share2,
  Copy,
  Check,
  Search,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  HeartPulse,
  User,
  CreditCard,
  CheckCircle2,
  Activity,
  Phone,
  RefreshCw,
  ExternalLink,
  Trophy,
} from 'lucide-react';
import { formatCurrency } from '@/components/trailrun/registration/types';
import { BibPreviewCard } from '@/components/trailrun/bib';

interface ParticipantData {
  id?: string;
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
  nama_komunitas?: string;
  golongan_darah?: string;
  riwayat_medis?: string;
  kontak_darurat?: string;
  kategori: string;
  ukuran_jersey?: string;
  hasil_lari?: string;
  status: string;
  created_at?: string;
  payment?: {
    order_id?: string;
    amount?: number;
    fee?: number;
    total_payment?: number;
    payment_method?: string;
    status?: string;
    completed_at?: string;
  };
}

interface ParticipantSummary {
  id: string;
  nama: string;
  no_bib: string;
  kategori?: string;
  no_hp?: string;
  status: string;
}

export default function PesertaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam =
    searchParams.get('q') ||
    searchParams.get('search') ||
    searchParams.get('no_bib') ||
    searchParams.get('bib') ||
    searchParams.get('no_hp') ||
    searchParams.get('phone') ||
    '';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [multipleResults, setMultipleResults] = useState<ParticipantSummary[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch participant by BIB or WhatsApp
  const fetchParticipant = useCallback(async (q: string) => {
    if (!q.trim()) {
      setParticipant(null);
      setMultipleResults([]);
      setErrorMsg('');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/trailrun/peserta?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();

      if (json.success && json.data) {
        setParticipant(json.data);
        setMultipleResults(json.multipleResults || []);
        setErrorMsg('');
      } else {
        setParticipant(null);
        setMultipleResults([]);
        setErrorMsg(json.message || `Peserta dengan nomor BIB atau WhatsApp "${q}" tidak ditemukan.`);
      }
    } catch {
      setParticipant(null);
      setMultipleResults([]);
      setErrorMsg('Gagal memuat data peserta. Silakan periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (queryParam) {
      setInputQuery(queryParam);
      fetchParticipant(queryParam);
    } else {
      setParticipant(null);
      setMultipleResults([]);
      setErrorMsg('');
    }
  }, [queryParam, fetchParticipant]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    router.push(`/trailrun/peserta?q=${encodeURIComponent(inputQuery.trim())}`);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrTargetUrl = participant
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://jiwandana.com'}/trailrun/peserta?no_bib=${encodeURIComponent(participant.no_bib)}`
    : currentUrl;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    qrTargetUrl
  )}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(qrTargetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    if (!participant) return;
    const hasilText =
      participant.hasil_lari && participant.hasil_lari !== '-'
        ? `• *Hasil Lari*: ${participant.hasil_lari}\n`
        : '';
    const text =
      `*E-BIB & VERIFIKASI PESERTA TRAILRUN LINTAS CANDI 2026*\n\n` +
      `• *Nama*: ${participant.nama}\n` +
      `• *No. BIB*: ${participant.no_bib}\n` +
      `• *Kategori*: ${participant.kategori}\n` +
      hasilText +
      `• *Status*: ${participant.status.toUpperCase()} ✅\n\n` +
      `Lihat e-pass & barcode resmi di:\n${qrTargetUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Helper formatting
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  const isPaid =
    participant?.status === 'paid' ||
    participant?.status === 'confirmed' ||
    participant?.payment?.status === 'completed' ||
    participant?.payment?.status === 'settled';

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-800 pb-16 pt-20 sm:pt-24 print:bg-white print:p-0 print:pt-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation & Header (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <Link
            href="/trailrun"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-[#C9A227] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Trailrun</span>
          </Link>

          {/* Search Bar for BIB or WhatsApp Verification */}
          <form onSubmit={handleSearch} className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="No. BIB atau WhatsApp (08xxx)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-black/10 rounded-xl focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-hidden text-slate-800 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Cek</span>
              )}
            </button>
          </form>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white border border-black/10 rounded-3xl p-12 text-center shadow-xs space-y-4">
            <RefreshCw className="w-8 h-8 text-[#C9A227] animate-spin mx-auto" />
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">Memeriksa Data Peserta...</h3>
              <p className="text-xs text-slate-500 mt-1">
                Mengambil data untuk pencarian: <span className="font-mono font-bold text-slate-800">{inputQuery || queryParam}</span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR / NOT FOUND STATE */}
        {!loading && errorMsg && (
          <div className="bg-white border border-rose-200/80 rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-serif font-bold text-slate-900 text-xl">Peserta Tidak Ditemukan</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{errorMsg}</p>
              <p className="text-[11px] text-slate-400">
                Pastikan nomor BIB (contoh: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">M-00001</code>) atau nomor WhatsApp yang dimasukkan sesuai dengan nomor saat mendaftar.
              </p>
            </div>

            <div className="max-w-md mx-auto pt-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Masukkan No. BIB atau WhatsApp lain..."
                  className="flex-1 px-4 py-2.5 bg-[#f8f8f8] border border-black/10 rounded-xl text-xs focus:border-[#C9A227] focus:bg-white focus:ring-1 focus:ring-[#C9A227] outline-hidden placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  Cari
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href="/trailrun/daftar"
                className="px-5 py-2.5 bg-[#0d1c32] hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                Daftar Peserta Trailrun
              </Link>
              <a
                href="https://wa.me/6282171914989?text=Halo%20Panitia,%20saya%20ingin%20menanyakan%20status%20nomor%20BIB%20saya"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white border border-black/10 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi CS WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* EMPTY STATE (NO QUERY PARAMETER PROVIDED) */}
        {!loading && !participant && !errorMsg && (
          <div className="bg-white border border-black/10 rounded-3xl p-10 sm:p-12 shadow-xs text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-[#C9A227] border border-amber-200/60 flex items-center justify-center mx-auto">
              <QrCode className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-serif font-bold text-slate-900 text-2xl">Cek E-BIB & Data Peserta</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Halaman ini digunakan untuk melihat dan mengunduh kartu E-BIB resmi, verifikasi data medis, serta jadwal lomba
                <strong> Trailrun Lintas Candi Majapahit 2026</strong>.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Masukkan Nomor BIB atau No. WhatsApp (08xxx)"
                  className="flex-1 px-4 py-3 bg-[#f8f8f8] border border-black/10 rounded-xl text-xs sm:text-sm focus:border-[#C9A227] focus:bg-white focus:ring-1 focus:ring-[#C9A227] outline-hidden placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer shrink-0"
                >
                  Cari Peserta
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            PARTICIPANT FOUND: OFFICIAL DIGITAL PASS / E-BIB CARD
        ========================================================================= */}
        {!loading && participant && (
          <div className="space-y-6">
            {/* MULTIPLE RESULTS (Jika mencari via No. WhatsApp dan terdaftar lebih dari 1 peserta) */}
            {multipleResults.length > 1 && (
              <div className="bg-white border border-[#C9A227]/40 rounded-2xl p-4 shadow-xs space-y-2.5 print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                    <span>Ditemukan {multipleResults.length} Peserta dengan No. WhatsApp Ini:</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Pilih peserta untuk menampilkan kartu BIB:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {multipleResults.map((item) => {
                    const isActive = participant.no_bib === item.no_bib;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          fetchParticipant(item.no_bib);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                          isActive
                            ? 'bg-[#C9A227] text-[#0d1c32] border-[#C9A227] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-black/10'
                        }`}
                      >
                        <span className="font-mono font-bold">{item.no_bib}</span>
                        <span>•</span>
                        <span className="font-medium">{item.nama}</span>
                        <span className="text-[10px] opacity-75 uppercase">({item.kategori || '12K'})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar (Download, Print, Share) - Hidden on Print */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-black/10 rounded-2xl p-4 shadow-xs print:hidden">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Digital Pass & Verifikasi Resmi
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Salin tautan ke clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>

                {/* <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#0d1c32] hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Cetak / PDF</span>
                </button> */}
              </div>
            </div>



            {/* 2. RUNNER VERIFICATION DOSSIER & RACE DETAILS */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-xl print:shadow-none print:border-2 print:border-black print:rounded-2xl">
              {/* Card Top Banner - Official Race Header (Clean White Theme) */}
              <div className="bg-white text-slate-900 p-6 sm:p-7 relative overflow-hidden border-b border-black/10">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#b45309] text-[10px] font-extrabold uppercase tracking-widest">
                        OFFICIAL DOSSIER
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
                        Trailrun Lintas Candi Majapahit 2026
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-wide">
                      Data Verifikasi Peserta
                    </h1>
                  </div>

                  {/* Status Badge & Hasil Lari */}
                  <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                    {participant.hasil_lari && participant.hasil_lari !== '-' && (
                      <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                        <Trophy className="w-4 h-4 text-[#C9A227]" />
                        <span>Hasil: {participant.hasil_lari}</span>
                      </div>
                    )}
                    {isPaid ? (
                      <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Terverifikasi • Lunas</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Menunggu Pembayaran</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Featured Hasil Lari Banner (if recorded) */}
                {participant.hasil_lari && participant.hasil_lari !== '-' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/50 to-white border-2 border-amber-300/80 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#e9c176] text-[#0d1c32] flex items-center justify-center shadow-md shrink-0">
                        <Trophy className="w-6 h-6 text-[#0d1c32]" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-amber-800 font-extrabold block">
                          Catatan Hasil Lari / Finisher
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {participant.hasil_lari}
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Kategori
                      </span>
                      <span className="text-sm font-extrabold text-[#0d1c32]">
                        {participant.kategori}
                      </span>
                    </div>
                  </div>
                )}

                {/* Details Section: Grid of Data Diri, Medis, & Transaksi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Block 1: Data Diri */}
                  <div className="bg-[#f8f8f8] rounded-2xl p-5 border border-black/5 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-black/10 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <User className="w-4 h-4 text-[#C9A227]" />
                      <span>Data Pelari</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Jenis Kelamin
                        </span>
                        <span className="font-semibold text-slate-800">
                          {participant.jenis_kelamin || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Ukuran Jersey
                        </span>
                        <span className="font-semibold text-[#C9A227] px-2 py-0.5 rounded bg-[#C9A227]/10 inline-block mt-0.5">
                          {participant.ukuran_jersey || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Tanggal Lahir
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatDate(participant.tanggal_lahir)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Kewarganegaraan
                        </span>
                        <span className="font-semibold text-slate-800">
                          {participant.kewarganegaraan || 'WNI'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Kota / Domisili
                        </span>
                        <span className="font-semibold text-slate-800">
                          {participant.kota ? `${participant.kota}, ${participant.provinsi || ''}` : '—'}
                        </span>
                      </div>
                      {participant.alamat && (
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                            Alamat
                          </span>
                          <span className="text-slate-600 text-[11px] leading-snug block">
                            {participant.alamat}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Block 2: Medis & Darurat */}
                  <div className="bg-[#f8f8f8] rounded-2xl p-5 border border-black/5 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-black/10 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      <span>Medis & Darurat</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Golongan Darah
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs mt-0.5">
                          <span>🩸</span>
                          <span>Golongan {participant.golongan_darah || '-'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Riwayat Penyakit / Alergi
                        </span>
                        <span className="font-medium text-slate-800 block text-[11px] leading-snug">
                          {participant.riwayat_medis || 'Tidak ada riwayat medis khusus'}
                        </span>
                      </div>

                      <div className="pt-1 border-t border-black/5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Kontak Darurat (ICE)
                        </span>
                        <span className="font-semibold text-slate-900 block mt-0.5">
                          {participant.kontak_darurat || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Block 3: Informasi Pendaftaran & Pembayaran */}
                  {/* <div className="bg-[#f8f8f8] rounded-2xl p-5 border border-black/5 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-black/10 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Status Tiket</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Status Pembayaran
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs mt-0.5 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isPaid ? 'Lunas (Paid)' : 'Menunggu Bayar'}</span>
                        </span>
                      </div>

                      {participant.payment?.order_id && (
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                            Order ID
                          </span>
                          <span className="font-mono font-semibold text-slate-800 text-[11px]">
                            {participant.payment.order_id}
                          </span>
                        </div>
                      )}

                      {participant.payment?.total_payment && (
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                            Total Bayar
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(participant.payment.total_payment)}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Metode
                        </span>
                        <span className="font-semibold text-slate-800 uppercase">
                          {participant.payment?.payment_method?.replace('_', ' ') || 'QRIS'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Waktu Registrasi
                        </span>
                        <span className="text-slate-600 text-[11px]">
                          {formatDateTime(participant.created_at)}
                        </span>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Race Day Guide: Pengambilan Race Pack & Flag Off */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-[#C9A227]" />
                    <span>Informasi Pengambilan Race Pack & Technical Meeting</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Waktu & Tanggal</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        H-1 sebelum lomba (10:00 - 18:00 WIB). Wajib hadir tepat waktu.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Lokasi Race Village</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Kawasan Cagar Budaya Candi Bajang Ratu, Trowulan, Mojokerto.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Syarat Pengambilan</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Wajib menunjukkan <strong>QR Pass ini</strong> beserta kartu identitas asli (KTP/SIM/Paspor).
                      </p>
                    </div>
                  </div>

                  {/* Mandatory Gear Warning */}
                  <div className="pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-amber-900">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong>Perlengkapan Wajib (Mandatory Gear):</strong> Hydration pack/botol air min. 500ml,
                        nomor BIB terpasang di dada, peluit darurat, & sepatu trail running.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Official Organizer Watermark */}
              <div className="bg-[#f4f4f4] px-6 py-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                <div className="text-[11px] text-slate-500">
                  Diterbitkan secara resmi oleh{' '}
                  <strong className="text-slate-800">JIWANDANA Event Organizer</strong>. Dokumen ini sah sebagai tanda
                  peserta resmi.
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  SECURE PASS • {participant.no_bib} • {participant.payment?.order_id || 'VERIFIED'}
                </div>
              </div>
            </div>

            {/* 1. THE OFFICIAL HIGH-RES E-BIB PASS (A5 300 DPI with Customizer) */}
            <BibPreviewCard
              bibNumber={participant.no_bib}
              runnerName={participant.nama}
              category={participant.kategori}
              gender={participant.jenis_kelamin}
              showCustomizer={true}
            />

            {/* Bottom Actions - Hidden on Print */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
              <Link
                href="/trailrun/daftar"
                className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 hover:border-[#C9A227] text-slate-700 hover:text-[#C9A227] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-center"
              >
                Daftarkan Peserta Lain
              </Link>

              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/6282171914989?text=${encodeURIComponent(
                    `Halo Panitia Trailrun Lintas Candi, saya ingin menanyakan perihal nomor BIB ${participant.no_bib} atas nama ${participant.nama}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Bantuan CS WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
