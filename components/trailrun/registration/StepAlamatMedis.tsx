'use client';

import React from 'react';
import { TrailrunCard } from '@/lib/types';
import { TrailrunFormData, PROVINSI_LIST } from './types';

interface StepAlamatMedisProps {
  formData: TrailrunFormData;
  selectedCategory?: TrailrunCard;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSelectGolonganDarah: (gd: 'A' | 'B' | 'AB' | 'O') => void;
}

export default function StepAlamatMedis({
  formData,
  selectedCategory,
  onChange,
  onSelectGolonganDarah,
}: StepAlamatMedisProps) {
  return (
    <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-3 pb-4 border-b border-black/5">
        <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <span className="material-symbols-outlined text-lg">location_on</span>
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Alamat & Data Medis</h2>
          <p className="text-[11px] text-slate-500">Informasi domisili dan kesehatan</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="alamat" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Alamat Lengkap <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="alamat"
          name="alamat"
          required
          rows={2}
          value={formData.alamat}
          onChange={onChange}
          placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
          className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="kota" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Kota / Kabupaten <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="kota"
            name="kota"
            required
            value={formData.kota}
            onChange={onChange}
            placeholder="Contoh: Mojokerto"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="provinsi" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Provinsi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="provinsi"
              name="provinsi"
              required
              value={formData.provinsi}
              onChange={onChange}
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Pilih provinsi...</option>
              {PROVINSI_LIST.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="kewarganegaraan" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Kewarganegaraan <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="kewarganegaraan"
          name="kewarganegaraan"
          required
          value={formData.kewarganegaraan}
          onChange={onChange}
          placeholder="Contoh: Indonesia"
          className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Golongan Darah <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            {(['A', 'B', 'AB', 'O'] as const).map((gd) => (
              <button
                key={gd}
                type="button"
                onClick={() => onSelectGolonganDarah(gd)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  formData.golongan_darah === gd
                    ? 'bg-[#C9A227] text-[#0d1c32] border-[#C9A227] shadow-md'
                    : 'bg-[#f8f8f8] text-slate-600 border-black/10 hover:border-[#C9A227]/50'
                }`}
              >
                {gd}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="kontak_darurat" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Kontak Darurat <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="kontak_darurat"
            name="kontak_darurat"
            required
            value={formData.kontak_darurat}
            onChange={onChange}
            placeholder="Nama & No. HP keluarga/kerabat"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="riwayat_medis" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Riwayat Medis
        </label>
        <textarea
          id="riwayat_medis"
          name="riwayat_medis"
          rows={3}
          value={formData.riwayat_medis}
          onChange={onChange}
          placeholder="Opsional — riwayat penyakit, alergi obat, atau kondisi medis lain yang perlu diketahui panitia"
          className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none resize-none"
        />
        <p className="text-[10px] text-slate-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">info</span>
          Data medis dijaga kerahasiaannya dan hanya digunakan oleh tim medis event.
        </p>
      </div>

      {/* Review Data Summary */}
      <div className="bg-[#f8f8f8] rounded-xl border border-black/10 p-5 space-y-4 text-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
          <span className="material-symbols-outlined text-sm">fact_check</span>
          Ringkasan Pendaftaran
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <SummaryField
            label="Kategori Lomba"
            value={selectedCategory ? `${selectedCategory.categoryName} (${selectedCategory.distance})` : formData.kategori || '-'}
          />
          <SummaryField label="No. BIB" value={formData.no_bib || '-'} />
          <SummaryField label="Nama" value={formData.nama || '-'} />
          <SummaryField label="Email" value={formData.email || '-'} />
          <SummaryField label="No. HP" value={formData.no_hp || '-'} />
          <SummaryField label="Tanggal Lahir" value={formData.tanggal_lahir || '-'} />
          <SummaryField label="Jenis Kelamin" value={formData.jenis_kelamin || '-'} />
          <SummaryField label="Kota" value={`${formData.kota || '-'}, ${formData.provinsi || '-'}`} />
          <SummaryField label="Gol. Darah" value={formData.golongan_darah || '-'} />
          <SummaryField label="Kontak Darurat" value={formData.kontak_darurat || '-'} />
          {formData.nama_komunitas && <SummaryField label="Komunitas" value={formData.nama_komunitas} />}
        </div>
      </div>
    </div>

  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">{label}</span>
      <span className="text-slate-900 font-semibold text-xs sm:text-sm">{value || '—'}</span>
    </div>
  );
}
