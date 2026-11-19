'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, AlertCircle, RefreshCw, User, CreditCard, Hash, Award } from 'lucide-react';
import { TrailrunRow } from '../types';

interface ModalEditBpjsItraProps {
  isOpen: boolean;
  participant: TrailrunRow | null;
  onClose: () => void;
  onSave: (payload: {
    id: string;
    nama: string;
    nama_bib: string;
    no_bib: string;
    nik: string;
    kk: string;
    id_itra: string;
  }) => Promise<boolean | void>;
  isSaving?: boolean;
}

export default function ModalEditBpjsItra({
  isOpen,
  participant,
  onClose,
  onSave,
  isSaving = false,
}: ModalEditBpjsItraProps) {
  const [nama, setNama] = useState('');
  const [namaBib, setNamaBib] = useState('');
  const [noBib, setNoBib] = useState('');
  const [nik, setNik] = useState('');
  const [kk, setKk] = useState('');
  const [idItra, setIdItra] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (participant) {
      setNama(participant.nama || '');
      setNamaBib(participant.nama_bib || participant.nama || '');
      setNoBib(participant.no_bib === '-' ? '' : (participant.no_bib || ''));
      setNik(participant.nik === '-' ? '' : (participant.nik || ''));
      setKk(participant.kk === '-' ? '' : (participant.kk || ''));
      setIdItra(participant.id_itra === '-' ? '' : (participant.id_itra || ''));
      setErrorMsg('');
    }
  }, [participant]);

  if (!isOpen || !participant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanNik = nik.trim();
    const cleanKk = kk.trim();

    // Validasi format angka NIK jika diisi
    if (cleanNik && !/^\d{16}$/.test(cleanNik)) {
      if (cleanNik.length !== 16) {
        setErrorMsg('NIK harus berjumlah 16 digit angka (sesuai KTP).');
        return;
      }
    }

    // Validasi format angka KK jika diisi
    if (cleanKk && !/^\d{16}$/.test(cleanKk)) {
      if (cleanKk.length !== 16) {
        setErrorMsg('Nomor KK harus berjumlah 16 digit angka.');
        return;
      }
    }

    try {
      const res = await onSave({
        id: participant.id,
        nama: nama.trim() || participant.nama,
        nama_bib: namaBib.trim() || nama.trim() || participant.nama,
        no_bib: noBib.trim().toUpperCase() || participant.no_bib,
        nik: cleanNik || '-',
        kk: cleanKk || '-',
        id_itra: idItra.trim() || '-',
      });

      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan data.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0a1424] rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-[scaleUp_0.25s_ease-out] text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1c32] via-[#12233c] to-[#182944] p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-sans text-white flex items-center gap-2">
                <span>Update Data BPJS &amp; ITRA</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Lengkapi NIK, Nomor KK, dan ID ITRA pelari
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Ringkas Peserta */}
        <div className="px-6 py-3.5 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#f1cd56] font-mono font-bold">
              {participant.no_bib || 'BIB -'}
            </span>
            <span className="font-bold text-white truncate max-w-[200px]">
              {participant.nama}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {participant.kategori || '12K'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Lengkap (KTP)</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama lengkap peserta"
                required
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] rounded-xl text-white text-xs placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Nama di BIB */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Nama di BIB (Cetak Dada)</span>
              </label>
              <input
                type="text"
                value={namaBib}
                onChange={(e) => setNamaBib(e.target.value)}
                placeholder="Nama yang dicetak pada BIB"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-amber-400/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-white text-xs placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* No. BIB */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Nomor BIB</span>
              </label>
              <input
                type="text"
                value={noBib}
                onChange={(e) => setNoBib(e.target.value)}
                placeholder="Contoh: M-00080"
                required
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] rounded-xl text-white text-xs font-mono font-bold uppercase placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* ID ITRA */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>ID ITRA</span>
              </label>
              <input
                type="text"
                value={idItra}
                onChange={(e) => setIdItra(e.target.value)}
                placeholder="Contoh: 1829381 (Kosongkan jika belum)"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 rounded-xl text-white text-xs font-mono placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* NIK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>NIK (KTP / Passport)</span>
              </label>
              <span className={`text-[10px] font-mono ${nik.trim().length === 16 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {nik.trim().length}/16 Digit
              </span>
            </div>
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/[^\d]/g, '').slice(0, 16))}
              placeholder="Masukkan 16 digit NIK"
              maxLength={16}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl text-white text-xs font-mono tracking-wider placeholder-slate-500 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400">
              Diperlukan untuk pendaftaran asuransi BPJS Ketenagakerjaan resmi event.
            </p>
          </div>

          {/* No. KK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                <span>Nomor Kartu Keluarga (KK)</span>
              </label>
              <span className={`text-[10px] font-mono ${kk.trim().length === 16 ? 'text-sky-400' : 'text-slate-400'}`}>
                {kk.trim().length}/16 Digit
              </span>
            </div>
            <input
              type="text"
              value={kk}
              onChange={(e) => setKk(e.target.value.replace(/[^\d]/g, '').slice(0, 16))}
              placeholder="Masukkan 16 digit Nomor Kartu Keluarga"
              maxLength={16}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 rounded-xl text-white text-xs font-mono tracking-wider placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#C9A227] hover:from-amber-400 hover:to-[#e1b935] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Data BPJS &amp; ITRA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
