import React, { useState, useEffect } from 'react';
import type { AtletItem } from '../types';
import {
  KELAS_SENI_OPTIONS,
  TINGKAT_PENDIDIKAN_OPTIONS,
  KATEGORI_LOMBA_OPTIONS,
  calculateAgeFromBirthDate,
} from '../types';

interface ModalAddAtletProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AtletItem, 'id'>, id?: string) => void;
  defaultCategory?: string;
  initialData?: AtletItem | null;
  allowedCategories?: string[];
}

export default function ModalAddAtlet({
  isOpen,
  onClose,
  onSave,
  defaultCategory = 'Tanding',
  initialData,
  allowedCategories,
}: ModalAddAtletProps) {
  const getInitialState = (): Omit<AtletItem, 'id'> => ({
    nama: '',
    asalSekolah: '',
    nik: '',
    tanggalLahir: '',
    umur: '',
    tinggi: '',
    berat: '',
    kota: 'Mojokerto',
    jenisKelamin: 'Laki-Laki',
    tingkatPendidikan: 'Remaja / SMA',
    kategoriLomba: defaultCategory,
    kategoriKelasSeni: KELAS_SENI_OPTIONS[0],
    noHp: '',
    email: '',
  });

  const [form, setForm] = useState<Omit<AtletItem, 'id'>>(getInitialState());

  useEffect(() => {
    if (initialData) {
      setForm({
        nama: initialData.nama,
        asalSekolah: initialData.asalSekolah,
        nik: initialData.nik,
        tanggalLahir: initialData.tanggalLahir,
        umur: initialData.umur,
        tinggi: initialData.tinggi,
        berat: initialData.berat,
        kota: initialData.kota,
        jenisKelamin: initialData.jenisKelamin,
        tingkatPendidikan: initialData.tingkatPendidikan,
        kategoriLomba: initialData.kategoriLomba,
        kategoriKelasSeni: initialData.kategoriKelasSeni,
        noHp: initialData.noHp,
        email: initialData.email,
      });
    } else {
      setForm(getInitialState());
    }
  }, [initialData, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.nik) {
      alert('Nama dan NIK Atlet wajib diisi!');
      return;
    }
    onSave(form, initialData?.id);
    setForm(getInitialState());
  };

  const isEdit = !!initialData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00b4d8]" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider">
              {isEdit ? 'EDIT DATA ATLET' : 'TAMBAH DATA ATLET'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">NAMA LENGKAP ATLET *</label>
              <input
                type="text"
                required
                placeholder="Nama atlet sesuai KK/KTP/KIA"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">ASAL SEKOLAH / KONTINGEN *</label>
              <input
                type="text"
                required
                placeholder="Contoh: SMA Negeri 1 Bangsal"
                value={form.asalSekolah}
                onChange={(e) => setForm({ ...form, asalSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">NIK KK / KTP / KIA *</label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="16 digit angka"
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">TANGGAL LAHIR *</label>
              <input
                type="date"
                value={form.tanggalLahir}
                onChange={(e) => {
                  const tgl = e.target.value;
                  const calculatedAge = calculateAgeFromBirthDate(tgl);
                  setForm({ ...form, tanggalLahir: tgl, umur: calculatedAge });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">UMUR (TAHUN)</label>
                <span className="text-[10px] font-bold text-[#00b4d8] bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                  OTOMATIS
                </span>
              </div>
              <input
                type="number"
                readOnly
                placeholder="Otomatis dari tgl lahir"
                value={form.umur}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">TINGGI (CM)</label>
              <input
                type="number"
                placeholder="165"
                value={form.tinggi}
                onChange={(e) => setForm({ ...form, tinggi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">BERAT (KG)</label>
              <input
                type="number"
                placeholder="50"
                value={form.berat}
                onChange={(e) => setForm({ ...form, berat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">KOTA / KAB</label>
              <input
                type="text"
                placeholder="Mojokerto"
                value={form.kota}
                onChange={(e) => setForm({ ...form, kota: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">GENDER</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">TINGKAT PENDIDIKAN</label>
              <select
                value={form.tingkatPendidikan}
                onChange={(e) => setForm({ ...form, tingkatPendidikan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              >
                {TINGKAT_PENDIDIKAN_OPTIONS.map((tingkat) => (
                  <option key={tingkat} value={tingkat}>
                    {tingkat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">KATEGORI LOMBA</label>
              <select
                value={form.kategoriLomba}
                onChange={(e) => setForm({ ...form, kategoriLomba: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              >
                {(allowedCategories || KATEGORI_LOMBA_OPTIONS).map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">KELAS / NOMOR SENI</label>
              <select
                value={form.kategoriKelasSeni}
                onChange={(e) => setForm({ ...form, kategoriKelasSeni: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              >
                {KELAS_SENI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-extrabold text-[#ff007f] uppercase tracking-wider block">
              WAJIB DIISI UNTUK KELENGKAPAN BPJS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NO. HP ATLET / ORTU</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#ff007f] font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">EMAIL ATLET / ORTU</label>
                <input
                  type="email"
                  placeholder="atlet@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#ff007f] text-slate-900"
                />
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
              className="py-2.5 px-6 bg-gradient-to-r from-[#ff007f] to-[#d6006c] hover:from-[#ff1a8c] hover:to-[#e60074] text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isEdit ? 'Perbarui Data Atlet' : 'Simpan Data Atlet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
