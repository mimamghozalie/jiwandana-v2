import React, { useState, useEffect } from 'react';
import type { AtletItem } from '../types';
import {
  KELAS_SENI_OPTIONS,
  TINGKAT_PENDIDIKAN_OPTIONS,
  KATEGORI_LOMBA_OPTIONS,
  calculateAgeFromBirthDate,
  getSilatCategoryPrice,
  formatRupiah,
  getKelasSeniOptions,
} from '../types';
import { uploadSilatDocument } from '@/lib/silatStorage';

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
  defaultCategory = 'Tanding - Pemasalan',
  initialData,
  allowedCategories,
}: ModalAddAtletProps) {
  const getInitialState = (): Omit<AtletItem, 'id'> => {
    const defaultKelas = getKelasSeniOptions(defaultCategory)[0] || 'A';
    return {
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
      kategoriKelasSeni: defaultKelas,
      noHp: '',
      email: '',
      fotoUrl: '',
      kkUrl: '',
    };
  };

  const [form, setForm] = useState<Omit<AtletItem, 'id'>>(getInitialState());
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingKk, setUploadingKk] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setErrorMsg('');
    if (initialData) {
      const currentCategory = initialData.kategoriLomba || defaultCategory;
      const validKelasOptions = getKelasSeniOptions(currentCategory);
      const currentKelas =
        initialData.kategoriKelasSeni && validKelasOptions.includes(initialData.kategoriKelasSeni)
          ? initialData.kategoriKelasSeni
          : validKelasOptions[0] || 'A';

      setForm({
        nama: initialData.nama || '',
        asalSekolah: initialData.asalSekolah || '',
        nik: initialData.nik || '',
        tanggalLahir: initialData.tanggalLahir || '',
        umur: initialData.umur ?? '',
        tinggi: initialData.tinggi ?? '',
        berat: initialData.berat ?? '',
        kota: initialData.kota || 'Mojokerto',
        jenisKelamin: initialData.jenisKelamin || 'Laki-Laki',
        tingkatPendidikan: initialData.tingkatPendidikan || 'Remaja / SMA',
        kategoriLomba: currentCategory,
        kategoriKelasSeni: currentKelas,
        noHp: initialData.noHp || '',
        email: initialData.email || '',
        fotoUrl: initialData.fotoUrl || '',
        kkUrl: initialData.kkUrl || '',
      });
    } else {
      setForm(getInitialState());
    }
  }, [initialData, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Cek Proses Upload Sedang Berjalan
    if (uploadingFoto || uploadingKk) {
      setErrorMsg('Mohon tunggu hingga proses upload pas foto dan berkas KK selesai.');
      return;
    }

    // 2. Validasi Kolom Teks Wajib
    if (!form.nama.trim() || !form.nik.trim() || !form.asalSekolah.trim()) {
      setErrorMsg('Nama lengkap, Asal Sekolah, dan NIK Atlet wajib diisi!');
      return;
    }

    // 3. Validasi Wajib Upload Pas Foto Resmi
    if (!form.fotoUrl || !form.fotoUrl.trim()) {
      setErrorMsg('Pas Foto resmi atlet wajib diunggah sebelum data dapat disimpan.');
      return;
    }

    // 4. Validasi Wajib Upload Berkas KK / KIA / Akta
    if (!form.kkUrl || !form.kkUrl.trim()) {
      setErrorMsg('Berkas Kartu Keluarga (KK) / KIA / Akta Kelahiran atlet wajib diunggah sebelum data dapat disimpan.');
      return;
    }

    onSave(form, initialData?.id);
    setForm(getInitialState());
  };

  const isEdit = !!initialData;
  const isDocumentsComplete = Boolean(form.fotoUrl && form.kkUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
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

        {/* Banner Alert Pesan Error Validasi */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]">
            <span className="text-base shrink-0">⚠️</span>
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                NAMA LENGKAP ATLET <span className="text-rose-500">*</span>
              </label>
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
              <label className="block text-slate-700 font-bold mb-1">
                ASAL SEKOLAH / KONTINGEN <span className="text-rose-500">*</span>
              </label>
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
              <label className="block text-slate-700 font-bold mb-1">
                NIK KK / KTP / KIA <span className="text-rose-500">*</span>
              </label>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">KATEGORI LOMBA</label>
                <span className="text-[11px] font-extrabold text-[#0088cc]">
                  {formatRupiah(getSilatCategoryPrice(form.kategoriLomba))}
                </span>
              </div>
              <select
                value={form.kategoriLomba}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  const availableOptions = getKelasSeniOptions(newCategory);
                  const autoSelectedKelas = availableOptions.includes(form.kategoriKelasSeni)
                    ? form.kategoriKelasSeni
                    : availableOptions[0] || '';
                  setForm({
                    ...form,
                    kategoriLomba: newCategory,
                    kategoriKelasSeni: autoSelectedKelas,
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
              >
                {(allowedCategories || KATEGORI_LOMBA_OPTIONS).map((kat) => (
                  <option key={kat} value={kat}>
                    {kat} — {formatRupiah(getSilatCategoryPrice(kat))}
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
                {getKelasSeniOptions(form.kategoriLomba).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-extrabold text-[#ff007f] uppercase tracking-wider block">
              DATA KONTAK (UNTUK KELENGKAPAN BPJS)
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

          {/* DOKUMEN WAJIB: UPLOAD PAS FOTO & KK ATLET */}
          <div className="p-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
                DOKUMEN WAJIB ATLET (FOTO &amp; KK / KIA / AKTA)
              </span>
              {!isDocumentsComplete ? (
                <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                  ⚠️ WAJIB DIUNGGAH KEDUANYA
                </span>
              ) : (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  ✓ DOKUMEN LENGKAP
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Upload Pas Foto */}
              <div
                className={`p-3 rounded-xl border-2 transition-all ${
                  form.fotoUrl
                    ? 'bg-emerald-50/60 border-emerald-400'
                    : 'bg-white border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-800 font-bold text-[11px]">
                    PAS FOTO RESMI (3X4 / 4X6) <span className="text-rose-600">*</span>
                  </label>
                  {form.fotoUrl ? (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Terunggah
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      Wajib Diunggah
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setErrorMsg('');
                    setUploadingFoto(true);
                    const res = await uploadSilatDocument(file, 'foto', form.nama || 'atlet');
                    setUploadingFoto(false);
                    if (res.url) {
                      setForm((prev) => ({ ...prev, fotoUrl: res.url }));
                    } else {
                      setErrorMsg(res.error || 'Gagal mengunggah pas foto.');
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00b4d8] file:text-white hover:file:bg-[#0096c7] cursor-pointer"
                />
                {uploadingFoto && (
                  <p className="text-[10px] text-blue-600 font-bold animate-pulse mt-1">
                    Sedang mengunggah pas foto...
                  </p>
                )}
                {form.fotoUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.fotoUrl}
                      alt="Pas Foto Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                    />
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Pas Foto siap disimpan
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Upload KK / KIA */}
              <div
                className={`p-3 rounded-xl border-2 transition-all ${
                  form.kkUrl
                    ? 'bg-emerald-50/60 border-emerald-400'
                    : 'bg-white border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-800 font-bold text-[11px]">
                    BERKAS KK / KIA / AKTA <span className="text-rose-600">*</span>
                  </label>
                  {form.kkUrl ? (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Terunggah
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      Wajib Diunggah
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setErrorMsg('');
                    setUploadingKk(true);
                    const res = await uploadSilatDocument(file, 'kk', form.nama || 'atlet_kk');
                    setUploadingKk(false);
                    if (res.url) {
                      setForm((prev) => ({ ...prev, kkUrl: res.url }));
                    } else {
                      setErrorMsg(res.error || 'Gagal mengunggah berkas KK.');
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ff007f] file:text-white hover:file:bg-[#d6006c] cursor-pointer"
                />
                {uploadingKk && (
                  <p className="text-[10px] text-pink-600 font-bold animate-pulse mt-1">
                    Sedang mengunggah berkas KK...
                  </p>
                )}
                {form.kkUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.kkUrl}
                      alt="Berkas KK Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                    />
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Berkas KK siap disimpan
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Warning Notice jika dokumen belum lengkap */}
          {!isDocumentsComplete && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <span>
                <strong>Perhatian:</strong> Pas Foto Resmi dan Berkas KK wajib diunggah. Tombol simpan tidak dapat memproses jika salah satu berkas belum terunggah.
              </span>
            </div>
          )}

          {/* Footer Tombol Aksi */}
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
              disabled={uploadingFoto || uploadingKk}
              className={`py-2.5 px-6 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                !isDocumentsComplete || uploadingFoto || uploadingKk
                  ? 'bg-slate-400 hover:bg-slate-500 opacity-90'
                  : 'bg-gradient-to-r from-[#ff007f] to-[#d6006c] hover:from-[#ff1a8c] hover:to-[#e60074] shadow-pink-500/25 active:scale-95'
              }`}
            >
              <span>{isEdit ? 'Perbarui Data Atlet' : 'Simpan Data Atlet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
