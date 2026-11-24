'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Hash,
  Award,
  Shirt,
  Calendar,
  ShieldCheck,
  FileText,
  HeartPulse,
  Users,
  Activity,
  CreditCard,
  Save,
  Sparkles,
} from 'lucide-react';
import { RpcVerificationRecord } from '@/app/api/admin/trailrun/rpc/route';

interface ModalVerifikasiRpcProps {
  isOpen: boolean;
  onClose: () => void;
  participant: RpcVerificationRecord | null;
  onSave: (payload: Partial<RpcVerificationRecord>) => Promise<boolean>;
  isSaving: boolean;
}

export default function ModalVerifikasiRpc({
  isOpen,
  onClose,
  participant,
  onSave,
  isSaving,
}: ModalVerifikasiRpcProps) {
  const [mandatoryGear, setMandatoryGear] = useState(false);
  const [waiver, setWaiver] = useState(false);
  const [suratSehat, setSuratSehat] = useState(false);
  const [suratIzinOrtu, setSuratIzinOrtu] = useState(false);
  const [strava12k, setStrava12k] = useState(false);
  const [menunjukanDataDiri, setMenunjukanDataDiri] = useState(false);
  const [statusPengambilan, setStatusPengambilan] = useState<
    'belum_diambil' | 'syarat_kurang' | 'sudah_diambil_bersyarat' | 'sudah_diambil'
  >('belum_diambil');
  const [petugas, setPetugas] = useState('');
  const [catatan, setCatatan] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sinkronkan state saat participant berubah
  useEffect(() => {
    if (participant) {
      setMandatoryGear(Boolean(participant.mandatory_gear));
      setWaiver(Boolean(participant.waiver));
      setSuratSehat(Boolean(participant.surat_sehat));
      setSuratIzinOrtu(Boolean(participant.surat_izin_ortu));
      setStrava12k(Boolean(participant.strava_12k));
      setMenunjukanDataDiri(Boolean(participant.menunjukan_data_diri));
      setStatusPengambilan(participant.status_pengambilan || 'belum_diambil');
      setPetugas(participant.petugas || '');
      // Jika status sudah_diambil_bersyarat dan catatan kosong, berikan default "sudah ttd"
      const defaultCatatan =
        participant.catatan ||
        (participant.status_pengambilan === 'sudah_diambil_bersyarat' ? 'sudah ttd' : '');
      setCatatan(defaultCatatan);
      setValidationError('');
    }
  }, [participant]);

  if (!isOpen || !participant) return null;

  // Analisis kategori & usia
  const kategoriClean = (participant.kategori || '').toLowerCase();
  const is12K = kategoriClean.includes('12');

  // Cek apakah usia < 17 tahun berdasarkan tanggal_lahir
  let isUnder17 = false;
  let ageDisplay = '';
  if (participant.tanggal_lahir) {
    const birthDate = new Date(participant.tanggal_lahir);
    if (!isNaN(birthDate.getTime())) {
      const now = new Date('2026-11-28'); // Tanggal Race Day Pawitra
      let age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
      ageDisplay = `${age} Tahun`;
      if (age < 17) isUnder17 = true;
    }
  }

  // Hitung apakah seluruh syarat wajib terpenuhi
  const isAllRequirementsMet =
    mandatoryGear &&
    waiver &&
    suratSehat &&
    menunjukanDataDiri &&
    (!is12K || strava12k) &&
    (!isUnder17 || suratIzinOrtu);

  // Helper ubah status pengambilan
  const handleSelectStatus = (
    newStatus: 'belum_diambil' | 'syarat_kurang' | 'sudah_diambil_bersyarat' | 'sudah_diambil'
  ) => {
    setStatusPengambilan(newStatus);
    if (newStatus === 'sudah_diambil_bersyarat') {
      // Hanya jika status Ambil Bersyarat dan catatan masih kosong, isi default "sudah ttd"
      if (!catatan.trim()) {
        setCatatan('sudah ttd');
      }
    } else {
      // Jika beralih ke status lain dan catatan masih berisi default "sudah ttd", kosongkan
      if (catatan.trim().toLowerCase() === 'sudah ttd') {
        setCatatan('');
      }
    }
    setValidationError('');
  };

  // Tombol aksi cepat centang semua syarat yang berlaku
  const handleCheckAllApplicable = () => {
    setMandatoryGear(true);
    setWaiver(true);
    setSuratSehat(true);
    setMenunjukanDataDiri(true);
    if (is12K) setStrava12k(true);
    if (isUnder17) setSuratIzinOrtu(true);
    handleSelectStatus('sudah_diambil');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validasi: jika status 'sudah_diambil_bersyarat', catatan wajib diisi
    if (statusPengambilan === 'sudah_diambil_bersyarat' && !catatan.trim()) {
      setValidationError('Wajib mengisi kolom "Catatan / Perjanjian Syarat" jika memilih status Diserahkan dengan Syarat.');
      return;
    }

    try {
      const success = await onSave({
        id: participant.id,
        no_bib: participant.no_bib,
        mandatory_gear: mandatoryGear,
        waiver,
        surat_sehat: suratSehat,
        surat_izin_ortu: suratIzinOrtu,
        strava_12k: strava12k,
        menunjukan_data_diri: menunjukanDataDiri,
        status_pengambilan: statusPengambilan,
        petugas: petugas.trim() || undefined,
        catatan: catatan.trim() || undefined,
      });

      if (success) {
        onClose();
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Gagal menyimpan perubahan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-2xl bg-[#0a1424] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-[scaleUp_0.2s_ease-out]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-black/40 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifikasi Pengambilan Race Pack</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-sans flex items-center gap-2">
              <span>Meja Kerja RPC Peserta</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Periksa kelengkapan 6 syarat sebelum menyerahkan paket BIB dan Jersey kepada peserta.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Dossier Pelari & Ukuran Jersey */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-lg tracking-wider">
                {participant.no_bib}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-white text-base block truncate">
                  {participant.nama}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                  <span className="text-amber-300 font-semibold">
                    BIB: {participant.nama_bib || participant.nama}
                  </span>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      is12K
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {participant.kategori}
                  </span>
                  {ageDisplay && (
                    <>
                      <span>•</span>
                      <span>Usia: {ageDisplay}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Kotak Jersey Menonjol */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/40 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <Shirt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80 block">
                  Ukuran Jersey
                </span>
                <span className="text-xl font-black font-mono text-white tracking-wider">
                  {participant.ukuran_jersey && participant.ukuran_jersey !== '-'
                    ? participant.ukuran_jersey.toUpperCase()
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button: Centang Semua Syarat */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>6 Syarat Verifikasi Pengambilan:</span>
            </span>

            <button
              type="button"
              onClick={handleCheckAllApplicable}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Centang Semua Syarat Selesai</span>
            </button>
          </div>

          {/* 2. Grid 6 Checklist Syarat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. Mandatory Gear */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                mandatoryGear
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={mandatoryGear}
                onChange={(e) => setMandatoryGear(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-white text-xs block">1. Mandatory Gear</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Pemeriksaan fisik perlengkapan wajib di venue lomba.
                </span>
              </div>
            </label>

            {/* 2. Waiver */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                waiver
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={waiver}
                onChange={(e) => setWaiver(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-white text-xs block">2. Waiver</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Surat pernyataan pelepasan tanggung jawab bertandatangan.
                </span>
              </div>
            </label>

            {/* 3. Surat Sehat (Wajib) */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                suratSehat
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={suratSehat}
                onChange={(e) => setSuratSehat(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-white text-xs block">3. Surat Sehat (Wajib)</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Surat keterangan dokter/klinik fisik masih berlaku.
                </span>
              </div>
            </label>

            {/* 4. Surat Izin Ortu */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                suratIzinOrtu
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : !isUnder17
                  ? 'bg-white/[0.01] border-white/5 opacity-80'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={suratIzinOrtu}
                onChange={(e) => setSuratIzinOrtu(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs">4. Surat Izin Ortu</span>
                  {!isUnder17 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      N/A Dewasa
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Wajib untuk peserta di bawah 17 tahun / junior.
                </span>
              </div>
            </label>

            {/* 5. Khusus 12K (Strava 5k) */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                strava12k
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : !is12K
                  ? 'bg-white/[0.01] border-white/5 opacity-80'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={strava12k}
                onChange={(e) => setStrava12k(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs">5. Khusus 12K (Strava 5k)</span>
                  {!is12K && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      N/A Non-12K
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Tangkapan layar/link aktivitas lari 5K di Strava.
                </span>
              </div>
            </label>

            {/* 6. Menunjukan Data Diri */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                menunjukanDataDiri
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={menunjukanDataDiri}
                onChange={(e) => setMenunjukanDataDiri(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-white text-xs block">6. Menunjukan Data Diri</span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Kesesuaian fisik e-KTP / SIM / Paspor asli pendaftar.
                </span>
              </div>
            </label>
          </div>

          {/* 3. Status Penyerahan Paket Lomba (4 Opsi) */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Status Penyerahan Paket Race Pack
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Status 1: Belum Diambil */}
              <button
                type="button"
                onClick={() => handleSelectStatus('belum_diambil')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  statusPengambilan === 'belum_diambil'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold ring-2 ring-rose-500/30'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-bold">🔴 Belum Diambil</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Peserta belum hadir</div>
              </button>

              {/* Status 2: Syarat Kurang */}
              <button
                type="button"
                onClick={() => handleSelectStatus('syarat_kurang')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  statusPengambilan === 'syarat_kurang'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-2 ring-amber-500/30'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-bold">🟡 Syarat Kurang</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Paket belum diserahkan</div>
              </button>

              {/* Status 3: Sudah Diambil dengan Syarat */}
              <button
                type="button"
                onClick={() => handleSelectStatus('sudah_diambil_bersyarat')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  statusPengambilan === 'sudah_diambil_bersyarat'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold ring-2 ring-orange-500/30'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-bold">🟠 Ambil Bersyarat</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Ada catatan perjanjian</div>
              </button>

              {/* Status 4: Sudah Diambil Lengkap */}
              <button
                type="button"
                onClick={() => handleSelectStatus('sudah_diambil')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  statusPengambilan === 'sudah_diambil'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/30'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-bold">🟢 Sudah Diambil</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Lengkap &amp; diserahkan</div>
              </button>
            </div>
          </div>

          {/* 4. Petugas & Catatan Khusus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Nama Petugas Meja RPC
              </label>
              <input
                type="text"
                value={petugas}
                onChange={(e) => setPetugas(e.target.value)}
                placeholder="Contoh: Petugas Meja 1 (Kak Restu)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Catatan / Perjanjian Syarat</span>
                {statusPengambilan === 'sudah_diambil_bersyarat' && (
                  <span className="text-orange-400 font-bold text-[10px]">* Wajib diisi</span>
                )}
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder={
                  statusPengambilan === 'sudah_diambil_bersyarat'
                    ? 'sudah ttd'
                    : 'Catatan tambahan petugas (opsional)'
                }
                className={`w-full bg-black/40 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all ${
                  statusPengambilan === 'sudah_diambil_bersyarat' && !catatan.trim()
                    ? 'border-orange-500/70 focus:border-orange-400'
                    : 'border-white/10 focus:border-[#C9A227]'
                }`}
              />
            </div>
          </div>

          {/* Error Message */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan &amp; Konfirmasi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
