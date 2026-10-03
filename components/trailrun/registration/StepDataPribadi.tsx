'use client';

import React from 'react';
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
}

export default function StepDataPribadi({
  formData,
  selectedCategory,
  onChange,
  onChangeCategoryStep,
  bibStatus = 'idle',
  bibMessage = '',
  onCheckBib,
}: StepDataPribadiProps) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* No. BIB (Wajib & Unique) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="no_bib" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              No. BIB <span className="text-rose-500">*</span>
            </label>
            {bibStatus === 'checking' && (
              <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                Mengecek...
              </span>
            )}
            {bibStatus === 'available' && (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Tersedia
              </span>
            )}
            {bibStatus === 'taken' && (
              <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">cancel</span>
                Sudah Digunakan
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              id="no_bib"
              name="no_bib"
              required
              value={formData.no_bib}
              onChange={onChange}
              placeholder="Contoh: 1024 (Wajib & unik)"
              className={`w-full bg-[#f8f8f8] border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 pr-18 transition-all text-sm outline-none ${
                bibStatus === 'taken'
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
                disabled={!formData.no_bib.trim() || bibStatus === 'checking'}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-black/5 hover:bg-[#C9A227] hover:text-[#0d1c32] text-slate-700 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                {bibStatus === 'checking' ? '...' : 'Cek'}
              </button>
            )}
          </div>

          {bibStatus === 'taken' ? (
            <p className="text-[11px] text-rose-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">error</span>
              {bibMessage || `Nomor BIB "${formData.no_bib}" sudah digunakan oleh peserta lain.`}
            </p>
          ) : bibStatus === 'available' ? (
            <p className="text-[11px] text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              {bibMessage || `Nomor BIB "${formData.no_bib}" tersedia dan dapat digunakan.`}
            </p>
          ) : (
            <p className="text-[10px] text-slate-400">
              Wajib diisi & unik. Tidak boleh sama dengan peserta lain.
            </p>
          )}
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
          <label htmlFor="jenis_kelamin" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Jenis Kelamin <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="jenis_kelamin"
              name="jenis_kelamin"
              required
              value={formData.jenis_kelamin}
              onChange={onChange}
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Pilih...</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
              keyboard_arrow_down
            </span>
          </div>
        </div>
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
  );
}
