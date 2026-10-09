'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, Clock, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { TrailrunRow } from './types';

interface EditHasilLariModalProps {
  isOpen: boolean;
  participant: TrailrunRow | null;
  onClose: () => void;
  onSave: (id: string, newHasil: string) => Promise<boolean | void>;
  isSaving?: boolean;
}

const QUICK_PRESETS = [
  'Finisher',
  'Podium 1 🥇',
  'Podium 2 🥈',
  'Podium 3 🥉',
  'Top 10 🎖️',
  'DNF (Did Not Finish)',
  'DNS (Did Not Start)',
  '-',
];

export default function EditHasilLariModal({
  isOpen,
  participant,
  onClose,
  onSave,
  isSaving = false,
}: EditHasilLariModalProps) {
  const [hasilLari, setHasilLari] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (participant) {
      setHasilLari(participant.hasil_lari === '-' ? '' : (participant.hasil_lari || ''));
      setErrorMsg('');
    }
  }, [participant]);

  if (!isOpen || !participant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await onSave(participant.id, hasilLari.trim() || '-');
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan hasil lari.');
    }
  };

  const handleSelectPreset = (preset: string) => {
    if (preset === '-') {
      setHasilLari('');
    } else {
      setHasilLari(preset);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0a1424] rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-[scaleUp_0.25s_ease-out] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1c32] to-[#162744] p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                Ubah Hasil Lari
              </h3>
              <p className="text-[11px] text-slate-400">
                Update status finish atau catatan waktu peserta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Participant Identity Summary */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Nama Peserta
            </span>
            <span className="font-bold text-white text-sm">{participant.nama}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              No. BIB & Kategori
            </span>
            <span className="font-mono font-bold text-[#e9c176]">
              {participant.no_bib} • {participant.kategori}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Hasil Lari / Catatan Waktu:</span>
              <span className="text-[10px] text-slate-400 font-mono">Format bebas / Waktu</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={hasilLari}
                onChange={(e) => setHasilLari(e.target.value)}
                placeholder="Contoh: 01:25:40 atau Finisher"
                autoFocus
                className="w-full bg-white/5 border border-white/15 focus:border-[#e9c176] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-500 outline-none"
              />
              <Clock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pilihan Cepat (Preset):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer font-medium active:scale-95"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e9c176] to-[#C9A227] hover:from-[#d8b065] hover:to-[#b08d20] text-[#0d1c32] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Simpan Hasil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
