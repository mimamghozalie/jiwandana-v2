import React, { useState, useEffect } from 'react';
import type { OfficialItem } from '../types';
import { JABATAN_OFFICIAL_OPTIONS } from '../types';
import { uploadSilatDocument } from '@/lib/silatStorage';

interface ModalAddOfficialProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<OfficialItem, 'id'>, id?: string) => void;
  initialData?: OfficialItem | null;
}

const emptyFormState: Omit<OfficialItem, 'id'> = {
  nama: '',
  jabatan: 'Pelatih Kepala',
  nik: '',
  tanggalLahir: '',
  kota: 'Mojokerto',
  jenisKelamin: 'Laki-Laki',
  noHp: '',
  email: '',
  fotoUrl: '',
  kkUrl: '',
};

export default function ModalAddOfficial({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ModalAddOfficialProps) {
  const [form, setForm] = useState<Omit<OfficialItem, 'id'>>(emptyFormState);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingKk, setUploadingKk] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        nama: initialData.nama,
        jabatan: initialData.jabatan,
        nik: initialData.nik,
        tanggalLahir: initialData.tanggalLahir,
        kota: initialData.kota,
        jenisKelamin: initialData.jenisKelamin,
        noHp: initialData.noHp,
        email: initialData.email,
        fotoUrl: initialData.fotoUrl || '',
        kkUrl: initialData.kkUrl || '',
      });
    } else {
      setForm(emptyFormState);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.nik) {
      alert('Nama dan NIK Official wajib diisi!');
      return;
    }
    onSave(form, initialData?.id);
    setForm(emptyFormState);
  };

  const isEdit = !!initialData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff007f]" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider">
              {isEdit ? 'EDIT DATA OFFICIAL' : 'TAMBAH DATA OFFICIAL'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">NAMA OFFICIAL *</label>
            <input
              type="text"
              required
              placeholder="Nama lengkap beserta gelar (jika ada)"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">JABATAN *</label>
              <select
                value={form.jabatan}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              >
                {JABATAN_OFFICIAL_OPTIONS.map((jab) => (
                  <option key={jab} value={jab}>
                    {jab}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">NIK KK / KTP *</label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="16 digit angka NIK"
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">TANGGAL LAHIR</label>
              <input
                type="date"
                value={form.tanggalLahir}
                onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">KOTA / KABUPATEN</label>
              <input
                type="text"
                placeholder="Mojokerto"
                value={form.kota}
                onChange={(e) => setForm({ ...form, kota: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">JENIS KELAMIN</label>
              <select
                value={form.jenisKelamin}
                onChange={(e) =>
                  setForm({ ...form, jenisKelamin: e.target.value as 'Laki-Laki' | 'Perempuan' })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-extrabold text-[#ff007f] uppercase tracking-wider block">
              WAJIB DIISI UNTUK KELENGKAPAN BPJS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NO. HP (BPJS)</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#ff007f] font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">EMAIL (BPJS)</label>
                <input
                  type="email"
                  placeholder="official@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#ff007f] text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* DOKUMEN: UPLOAD PAS FOTO & KK */}
          <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-2xl space-y-3">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
              DOKUMEN OFFICIAL (PAS FOTO &amp; KARTU KELUARGA / KTP)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Upload Pas Foto */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold text-[11px]">
                  PAS FOTO RESMI (3X4 / 4X6)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingFoto(true);
                    const res = await uploadSilatDocument(file, 'foto', form.nama || 'official');
                    setUploadingFoto(false);
                    if (res.url) setForm((prev) => ({ ...prev, fotoUrl: res.url }));
                    else alert(res.error || 'Gagal mengunggah pas foto.');
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00b4d8] file:text-white hover:file:bg-[#0096c7] cursor-pointer"
                />
                {uploadingFoto && <p className="text-[10px] text-blue-600 font-bold animate-pulse">Mengunggah foto...</p>}
                {form.fotoUrl && (
                  <div className="mt-1 flex items-center gap-2">
                    <img src={form.fotoUrl} alt="Foto Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Foto Terunggah</span>
                  </div>
                )}
              </div>

              {/* 2. Upload KK / KTP */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold text-[11px]">
                  BERKAS KTP / KARTU KELUARGA
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingKk(true);
                    const res = await uploadSilatDocument(file, 'kk', form.nama || 'official_kk');
                    setUploadingKk(false);
                    if (res.url) setForm((prev) => ({ ...prev, kkUrl: res.url }));
                    else alert(res.error || 'Gagal mengunggah berkas KK.');
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ff007f] file:text-white hover:file:bg-[#d6006c] cursor-pointer"
                />
                {uploadingKk && <p className="text-[10px] text-pink-600 font-bold animate-pulse">Mengunggah KK...</p>}
                {form.kkUrl && (
                  <div className="mt-1 flex items-center gap-2">
                    <img src={form.kkUrl} alt="KK Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                    <span className="text-[10px] text-emerald-600 font-bold">✓ KK Terunggah</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#009ec3] hover:to-[#00669e] text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isEdit ? 'Perbarui Data Official' : 'Simpan Official'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
