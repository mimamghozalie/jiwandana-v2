'use client';

import React from 'react';
import { TrailrunCard } from '@/lib/types';
import { TrailrunFormData } from './types';

interface StepDataPribadiProps {
  formData: TrailrunFormData;
  selectedCategory?: TrailrunCard;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onChangeCategoryStep: () => void;
}

export default function StepDataPribadi({
  formData,
  selectedCategory,
  onChange,
  onChangeCategoryStep,
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
        <div className="space-y-1.5">
          <label htmlFor="no_bib" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            No. BIB
          </label>
          <input
            type="text"
            id="no_bib"
            name="no_bib"
            value={formData.no_bib}
            onChange={onChange}
            placeholder="Opsional / dari panitia"
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
