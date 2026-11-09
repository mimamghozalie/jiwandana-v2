'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  X,
  Check,
  Calendar,
  Clock,
  Key,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AdminFlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  hideQuota?: boolean;
}

interface FlashSaleData {
  is_active: boolean;
  start_date: string;
  end_date: string;
  access_password: string;
  quota_7k: number;
  used_7k: number;
  quota_12k: number;
  used_12k: number;
}

function toWibDateTimeLocal(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  // Ambil komponen waktu dalam timezone Asia/Jakarta (+07:00)
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.format(date).replace(' ', 'T');
  return parts;
}

function fromWibDateTimeLocal(localStr: string): string {
  if (!localStr) return new Date().toISOString();
  return `${localStr}:00+07:00`;
}

export default function AdminFlashSaleModal({
  isOpen,
  onClose,
  onSaved,
  hideQuota = true,
}: AdminFlashSaleModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [isActive, setIsActive] = useState(true);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [accessPassword, setAccessPassword] = useState('FLASHSALE2026');
  const [quota7k, setQuota7k] = useState<number>(10);
  const [used7k, setUsed7k] = useState<number>(0);
  const [quota12k, setQuota12k] = useState<number>(10);
  const [used12k, setUsed12k] = useState<number>(0);

  // Fetch current config on open
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    fetch('/api/admin/trailrun/flashsale')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d: FlashSaleData = json.data;
          setIsActive(d.is_active);
          setStartDateTime(toWibDateTimeLocal(d.start_date));
          setEndDateTime(toWibDateTimeLocal(d.end_date));
          setAccessPassword(d.access_password || 'FLASHSALE2026');
          setQuota7k(d.quota_7k || 10);
          setUsed7k(d.used_7k || 0);
          setQuota12k(d.quota_12k || 10);
          setUsed12k(d.used_12k || 0);
        } else {
          setErrorMsg(json.message || 'Gagal mengambil data Flash Sale');
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Koneksi ke server gagal');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/trailrun/flashsale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          start_date: fromWibDateTimeLocal(startDateTime),
          end_date: fromWibDateTimeLocal(endDateTime),
          access_password: accessPassword.trim().toUpperCase(),
          quota_7k: quota7k,
          quota_12k: quota12k,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setSuccessMsg(result.message || 'Pengaturan Flash Sale berhasil disimpan!');
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(result.message || 'Gagal menyimpan pengaturan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const remaining7k = Math.max(0, quota7k - used7k);
  const remaining12k = Math.max(0, quota12k - used12k);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0a1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-[scaleUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 p-5 sm:p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
                  Kelola Sesi Flash Sale
                </h3>
                <p className="text-xs text-white/90">
                  Perbarui status aktif, jadwal waktu, password, dan kuota slot
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#C9A227]" />
            <span className="text-xs font-semibold">Memuat data Flash Sale...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
            {/* Alert Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. Toggle Status Aktif */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-white block">Status Flash Sale</span>
                <span className="text-[11px] text-slate-400 block">
                  {isActive
                    ? 'Flash Sale diizinkan aktif sesuai periode jadwal di bawah'
                    : 'Flash Sale dimatikan secara manual'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* 2. Jadwal Waktu (WIB) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Jadwal Waktu Sesi (WIB)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Waktu Mulai <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#C9A227] text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Waktu Selesai <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#C9A227] text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Password Akses Dinamis */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>Password Akses Flash Sale</span>
              </span>
              <input
                type="text"
                required
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value.toUpperCase())}
                placeholder="Contoh: FLASHSALE2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white uppercase font-mono font-bold tracking-wider text-xs focus:outline-none focus:border-[#C9A227]"
              />
              <span className="text-[10px] text-slate-400 block">
                Kode sandi yang wajib diinput peserta untuk mengklaim harga Flash Sale.
              </span>
            </div>

            {/* 4. Kuota Kategori 7K & 12K */}
            {!hideQuota && (
              <div className="space-y-2.5 pt-1 border-t border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Kuota Slot Flash Sale (7K & 12K)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Kuota 7K */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Kategori 7K</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold">
                        Rp 300.000
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400">
                        Batas Kuota Slot
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={quota7k}
                        onChange={(e) => setQuota7k(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono font-bold focus:outline-none focus:border-[#C9A227]"
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5">
                      <span>Terpakai: <strong className="text-white">{used7k}</strong></span>
                      <span>Sisa: <strong className={remaining7k > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{remaining7k} Slot</strong></span>
                    </div>
                  </div>

                  {/* Kuota 12K */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Kategori 12K</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold">
                        Rp 350.000
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400">
                        Batas Kuota Slot
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={quota12k}
                        onChange={(e) => setQuota12k(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono font-bold focus:outline-none focus:border-[#C9A227]"
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5">
                      <span>Terpakai: <strong className="text-white">{used12k}</strong></span>
                      <span>Sisa: <strong className={remaining12k > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{remaining12k} Slot</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

