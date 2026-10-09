'use client';

import React, { useState, useEffect } from 'react';
import { TrailrunCard } from '@/lib/types';
import { TrailrunFormData, BibStatus } from './types';

interface StepDataPribadiProps {
  formData: TrailrunFormData;
  selectedCategory?: TrailrunCard;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onChangeCategoryStep: () => void;
  bibStatus?: BibStatus;
  bibMessage?: string;
  onCheckBib?: () => void;
  onGenerateBib?: () => void;
  generatingBib?: boolean;
}

export default function StepDataPribadi({
  formData,
  selectedCategory,
  onChange,
  onChangeCategoryStep,
  bibStatus = 'idle',
  bibMessage = '',
  onCheckBib,
  onGenerateBib,
  generatingBib = false,
}: StepDataPribadiProps) {
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Close size chart popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSizeChart(false);
      }
    };
    if (showSizeChart) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSizeChart]);

  const isFemale = formData.jenis_kelamin === 'Perempuan';
  const hasGender = !!formData.jenis_kelamin;
  const genderPrefix = isFemale ? 'F-' : 'M-';
  const genderLabel = isFemale ? 'Perempuan (F-)' : formData.jenis_kelamin === 'Laki-laki' ? 'Laki-laki (M-)' : 'F-/M-';

  return (
    <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-3 pb-4 border-b border-black/5">
        <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <span className="material-symbols-outlined text-lg">person</span>
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Data Pribadi</h2>
          <p className="text-[11px] text-slate-500">Informasi identitas peserta</p>
        </div>
      </div>

      {/* Badge Info Kategori Terpilih */}
      {selectedCategory && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#C9A227] text-lg">directions_run</span>
            <div>
              <span className="text-slate-500 text-[10px] block font-semibold uppercase tracking-wider">
                Kategori Lomba Terpilih
              </span>
              <span className="font-bold text-slate-900 text-xs">
                {selectedCategory.categoryName} ({selectedCategory.distance})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onChangeCategoryStep}
            className="text-[#C9A227] hover:underline font-bold text-xs cursor-pointer"
          >
            Ubah Kategori
          </button>
        </div>
      )}

      {/* 1. Nama Lengkap & Jenis Kelamin (Diisi duluan untuk menentukan prefix BIB F- / M-) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="nama" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            required
            value={formData.nama}
            onChange={onChange}
            placeholder="Masukkan nama lengkap sesuai KTP"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="jenis_kelamin" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-amber-600 font-semibold">
              {hasGender ? `Prefix BIB: ${genderPrefix}` : 'Pilih untuk kode BIB'}
            </span>
          </div>
          <div className="relative">
            <select
              id="jenis_kelamin"
              name="jenis_kelamin"
              required
              value={formData.jenis_kelamin}
              onChange={onChange}
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer font-medium"
            >
              <option value="" disabled>Pilih Jenis Kelamin...</option>
              <option value="Laki-laki">Laki-laki (Prefix M-)</option>
              <option value="Perempuan">Perempuan (Prefix F-)</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>

      {/* 2. No. BIB & Ukuran Jersey (Berdampingan 2 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kolom Kiri: No. BIB */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <label htmlFor="no_bib" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                No. BIB <span className="text-rose-500">*</span>
              </label>
              {formData.no_bib.length > 0 && formData.no_bib.length !== 7 && (
                <span className="text-[10px] text-rose-500 font-semibold">
                  ({formData.no_bib.length}/7)
                </span>
              )}
            </div>

            {/* Tombol Generate BIB */}
            {onGenerateBib && (
              <button
                type="button"
                onClick={onGenerateBib}
                disabled={generatingBib}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d1c32] bg-[#C9A227] hover:bg-[#b08d20] px-2 py-0.5 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                title={`Generate nomor BIB otomatis format ${hasGender ? genderPrefix : 'F-/M-'} + 5 angka`}
              >
                <span className={`material-symbols-outlined text-xs ${generatingBib ? 'animate-spin' : ''}`}>
                  {generatingBib ? 'progress_activity' : 'auto_fix_high'}
                </span>
                <span>{generatingBib ? '...' : 'Auto BIB'}</span>
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              id="no_bib"
              name="no_bib"
              required
              minLength={7}
              maxLength={7}
              value={formData.no_bib}
              onChange={onChange}
              placeholder={hasGender ? `Contoh: ${genderPrefix}00001` : 'Pilih gender untuk auto BIB'}
              className={`w-full bg-[#f8f8f8] border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 pr-18 transition-all text-sm outline-none font-mono font-bold tracking-wider ${bibStatus === 'taken' || (formData.no_bib.length > 0 && formData.no_bib.length !== 7)
                ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                : bibStatus === 'available'
                  ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
                  : 'border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]'
                }`}
            />
            {onCheckBib && (
              <button
                type="button"
                onClick={onCheckBib}
                disabled={!formData.no_bib.trim() || formData.no_bib.length !== 7 || bibStatus === 'checking'}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-black/5 hover:bg-[#C9A227] hover:text-[#0d1c32] text-slate-700 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                {bibStatus === 'checking' ? '...' : 'Cek'}
              </button>
            )}
          </div>

          {/* Feedback & Status Indicators */}
          {bibStatus === 'checking' && (
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 animate-pulse">
              <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
              Mengecek ketersediaan BIB...
            </p>
          )}

          {bibStatus === 'taken' && (
            <div className="flex items-center justify-between text-[11px] text-rose-600">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error</span>
                {bibMessage || `Nomor BIB "${formData.no_bib}" sudah digunakan.`}
              </span>
              {onGenerateBib && (
                <button
                  type="button"
                  onClick={onGenerateBib}
                  className="font-bold underline hover:text-rose-800 cursor-pointer ml-1 text-xs"
                >
                  Lain
                </button>
              )}
            </div>
          )}

          {bibStatus === 'available' && (
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              {bibMessage || `Nomor BIB "${formData.no_bib}" tersedia.`}
            </p>
          )}

          {bibStatus === 'idle' && (
            <p className="text-[10px] text-slate-500">
              Format: <strong>{genderLabel} + 5 angka</strong> (7 karakter, contoh: <strong>M-00001</strong>).
            </p>
          )}
        </div>

        {/* Kolom Kanan: Ukuran Jersey */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <label htmlFor="ukuran_jersey" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Ukuran Jersey <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              {formData.ukuran_jersey === 'XXL' && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  +Rp 5.000
                </span>
              )}
              {formData.ukuran_jersey === 'XXXL' && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  +Rp 10.000
                </span>
              )}
              {formData.ukuran_jersey === 'Custom' && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  Dihitung per X
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowSizeChart(true)}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-[#C9A227]/15 hover:bg-[#C9A227]/25 text-[#92600b] hover:text-[#784d03] font-bold border border-[#C9A227]/40 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 group"
                title="Buka panduan ukuran (Size Chart)"
              >
                <span className="material-symbols-outlined text-[13px] text-[#C9A227] group-hover:scale-110 transition-transform">
                  straighten
                </span>
                <span>Size Chart</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <select
              id="ukuran_jersey"
              name="ukuran_jersey"
              required
              value={formData.ukuran_jersey || ''}
              onChange={onChange}
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer font-medium"
            >
              <option value="" disabled>Pilih Ukuran Jersey...</option>
              <option value="S">S (Small) — Standar</option>
              <option value="M">M (Medium) — Standar</option>
              <option value="L">L (Large) — Standar</option>
              <option value="XL">XL (Extra Large) — Standar</option>
              <option value="XXL">XXL (+Rp 5.000)</option>
              <option value="XXXL">XXXL (+Rp 10.000)</option>
              <option value="Custom">Custom (Ukuran Khusus)</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
              keyboard_arrow_down
            </span>
          </div>

          {/* Input Tambahan Jika Memilih Custom */}
          {formData.ukuran_jersey === 'Custom' && (
            <div className="pt-1 space-y-1 animate-[fadeIn_0.3s_ease-out]">
              <input
                type="text"
                id="custom_jersey"
                name="custom_jersey"
                required
                value={formData.custom_jersey || ''}
                onChange={onChange}
                placeholder="Tuliskan ukuran custom (contoh: 4XL / 5XL / LD 125cm)"
                className="w-full bg-[#f8f8f8] border border-amber-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 transition-all text-xs outline-none font-medium"
              />
              <p className="text-[10px] text-amber-700">
                * Di atas XL dikenakan tambahan Rp 5.000 per X (contoh 4XL: +Rp 15.000).
              </p>
            </div>
          )}

          {formData.ukuran_jersey && formData.ukuran_jersey !== 'Custom' && (
            <p className="text-[10px] text-slate-500 flex items-center justify-between flex-wrap gap-1">
              <span>
                {['XXL', 'XXXL'].includes(formData.ukuran_jersey)
                  ? `Ukuran ${formData.ukuran_jersey} dikenakan penyesuaian biaya bahan (+Rp ${formData.ukuran_jersey === 'XXL' ? '5.000' : '10.000'}).`
                  : 'Ukuran standar S, M, L, XL sudah termasuk dalam biaya pendaftaran.'}
              </span>
              <button
                type="button"
                onClick={() => setShowSizeChart(true)}
                className="text-[#92600b] hover:underline font-semibold cursor-pointer"
              >
                Lihat size chart →
              </button>
            </p>
          )}

          {!formData.ukuran_jersey && (
            <p className="text-[10px] text-slate-500 flex items-center justify-between flex-wrap gap-1">
              <span>Pilih ukuran jersey (di atas XL dikenakan +Rp 5.000 per penambahan 'X').</span>
              <button
                type="button"
                onClick={() => setShowSizeChart(true)}
                className="text-[#92600b] hover:underline font-semibold cursor-pointer"
              >
                Lihat size chart →
              </button>
            </p>
          )}
        </div>
      </div>


      {/* 3. Kontak: Email & No. HP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={onChange}
            placeholder="email@example.com"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="no_hp" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            No. Telepon / WhatsApp <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            id="no_hp"
            name="no_hp"
            required
            value={formData.no_hp}
            onChange={onChange}
            placeholder="08xxxxxxxxxx"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* 4. Tanggal Lahir & Komunitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="tanggal_lahir" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Tanggal Lahir <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            id="tanggal_lahir"
            name="tanggal_lahir"
            required
            value={formData.tanggal_lahir}
            onChange={onChange}
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="nama_komunitas" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nama Komunitas / Club
          </label>
          <input
            type="text"
            id="nama_komunitas"
            name="nama_komunitas"
            value={formData.nama_komunitas}
            onChange={onChange}
            placeholder="Opsional — nama running club / komunitas"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Modal Popup Size Chart Jersey */}
      {showSizeChart && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setShowSizeChart(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden relative animate-[scaleUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/10 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#92600b]">
                  <span className="material-symbols-outlined text-lg">straighten</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif">
                    Size Chart Jersey
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Body: Gambar Jersey & Info */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center bg-white space-y-4">
              <div className="relative w-full rounded-2xl overflow-hidden border border-black/10 shadow-sm bg-slate-50 flex items-center justify-center">
                <img
                  src="/trailrun_jersey.jpeg"
                  alt="Size Chart Jersey Trailrun Lintas Candi"
                  className="w-full h-auto max-h-[60vh] object-contain block"
                  loading="eager"
                />
              </div>

              {/* <div className="w-full p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-slate-700 text-[11px] space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-sm shrink-0 mt-0.5">info</span>
                  <div className="space-y-0.5">
                    <p>
                      <strong>Ukuran Standar:</strong> S, M, L, XL sudah termasuk dalam biaya pendaftaran (tanpa biaya tambahan).
                    </p>
                    <p className="text-slate-600">
                      <strong>Ukuran Ekstra:</strong> XXL (+Rp 5.000) dan XXXL (+Rp 10.000), di atas XL dikenakan +Rp 5.000 per penambahan 'X'.
                    </p>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-black/10 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                Toleransi jahitan: ±1-2 cm
              </span>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="px-5 py-2 bg-[#0d1c32] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
