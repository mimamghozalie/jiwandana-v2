'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Shirt,
  Hash,
  User,
  Award,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface ParticipantData {
  id: string;
  nama: string;
  nama_bib?: string | null;
  no_bib: string;
  kategori: string;
  ukuran_jersey?: string | null;
}

export default function CekRpcClient() {
  const searchParams = useSearchParams();
  const bibParam =
    searchParams.get('no_bib') ||
    searchParams.get('bib') ||
    searchParams.get('q') ||
    '';

  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(bibParam));
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!bibParam || !bibParam.trim()) {
      setLoading(false);
      setErrorMsg('Parameter nomor BIB tidak ditemukan pada URL. Contoh: ?no_bib=M-00069');
      return;
    }

    const fetchParticipant = async () => {
      setLoading(true);
      setErrorMsg('');
      setParticipant(null);

      try {
        const res = await fetch(`/api/trailrun/peserta?no_bib=${encodeURIComponent(bibParam.trim())}`);
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(
            json.message || `Peserta dengan nomor BIB "${bibParam.trim()}" tidak ditemukan.`
          );
        }

        setParticipant(json.data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memuat data verifikasi pengambilan race pack.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [bibParam]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-800 font-sans pt-28 sm:pt-32 pb-20 px-4 sm:px-6 flex flex-col justify-start items-center">
      <div className="w-full max-w-lg mx-auto">
        {/* 1. LOADING STATE */}
        {loading && (
          <div className="bg-white border border-black/10 rounded-3xl p-10 text-center shadow-lg space-y-4">
            <RefreshCw className="w-8 h-8 text-[#C9A227] animate-spin mx-auto" />
            <div className="text-base font-bold text-slate-900 font-sans">
              Memverifikasi Data Race Pack...
            </div>
            <p className="text-xs text-slate-500 font-mono">Nomor BIB: {bibParam}</p>
          </div>
        )}

        {/* 2. ERROR / NOT FOUND STATE */}
        {!loading && errorMsg && (
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
                Data Tidak Ditemukan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {errorMsg}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-100">
              Pastikan membuka tautan dengan parameter <code className="text-[#b45309] font-bold">?no_bib=NOMOR_BIB</code>
            </p>
          </div>
        )}

        {/* 3. PARTICIPANT FOUND: CLEAN LIGHT THEME RPC PASS */}
        {!loading && participant && (
          <div className="bg-white border-2 border-black/10 rounded-3xl overflow-hidden shadow-xl animate-[fadeIn_0.3s_ease-out]">
            {/* Top Gold Stripe */}
            <div className="h-2.5 bg-gradient-to-r from-[#C9A227] via-[#ffd56b] to-[#C9A227] w-full" />

            {/* Header Badge & Title */}
            <div className="p-6 sm:p-7 border-b border-black/5 text-center space-y-2 bg-[#fcfcfc]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#b45309] text-[10px] font-extrabold tracking-widest uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#b45309]" />
                <span>RACE PACK COLLECTION PASS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Pengambilan Paket Lomba
              </h1>
              <p className="text-xs text-slate-500">
                Trailrun Lintas Candi Majapahit 2026
              </p>
            </div>

            {/* 5 Field Utama Penyerahan Race Pack */}
            <div className="p-6 sm:p-8 space-y-5 font-sans divide-y divide-black/5">
              {/* Field 1 & 2: Nomor BIB & Kategori */}
              <div className="grid grid-cols-2 gap-3.5 pb-2">
                {/* Nomor BIB */}
                <div className="bg-slate-50 border border-black/10 rounded-2xl p-4 text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Nomor BIB</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-[#b45309]">
                    {participant.no_bib}
                  </div>
                </div>

                {/* Kategori */}
                <div className="bg-slate-50 border border-black/10 rounded-2xl p-4 text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Kategori</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-slate-900">
                    {participant.kategori || '12K'}
                  </div>
                </div>
              </div>

              {/* Field 3: Nama Lengkap */}
              <div className="pt-4 space-y-1">
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Nama Lengkap</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {participant.nama}
                </div>
              </div>

              {/* Field 4: Nama di BIB */}
              <div className="pt-4 space-y-1">
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Nama di BIB</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-[#b45309] tracking-tight">
                  {participant.nama_bib || participant.nama}
                </div>
              </div>

              {/* Field 5: Ukuran Jersey (Disorot Khusus untuk Petugas Meja RPC) */}
              <div className="pt-4">
                <div className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="text-xs uppercase font-black tracking-widest text-amber-900 flex items-center gap-2">
                      <Shirt className="w-4.5 h-4.5 text-amber-600" />
                      <span>Ukuran Jersey</span>
                    </div>
                    <span className="text-xs text-amber-800/80">
                      Sesuai pilihan saat pendaftaran
                    </span>
                  </div>
                  <div className="bg-[#0d1c32] text-[#ffd56b] border border-[#C9A227] px-6 py-2.5 rounded-xl text-center shadow-md">
                    <span className="text-2xl sm:text-3xl font-black font-mono">
                      {participant.ukuran_jersey && participant.ukuran_jersey !== '-'
                        ? participant.ukuran_jersey.toUpperCase()
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer: Petunjuk Penyerahan */}
            <div className="bg-slate-50 px-6 py-4 border-t border-black/5 text-center text-xs text-slate-500 font-sans">
              Tunjukkan halaman ini kepada panitia di meja pengambilan Race Pack.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
