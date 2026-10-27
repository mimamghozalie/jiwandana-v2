import React, { useState } from 'react';
import type { AtletItem } from '../types';

interface AtletTableProps {
  atlets: AtletItem[];
  onOpenModal: () => void;
  onEdit: (item: AtletItem) => void;
  onDelete: (id: string) => void;
  title?: string;
  defaultCategory?: string;
  hideCategoryFilter?: boolean;
  allowedCategories?: string[];
}

export default function AtletTable({
  atlets,
  onOpenModal,
  onEdit,
  onDelete,
  title = 'DATA ATLET',
  defaultCategory = 'Semua',
  hideCategoryFilter = false,
  allowedCategories,
}: AtletTableProps) {
  const [filterKategori, setFilterKategori] = useState(defaultCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Kategori yang tersedia untuk dropdown filter
  const categoryOptions = allowedCategories || [
    'Tanding',
    'Tunggal Ganda Regu',
    'Silat Bebas',
    'Silat Festival',
  ];

  const filteredAtlets = atlets.filter((item) => {
    // Jika allowedCategories ada, batasi data atlet hanya pada kategori yang diizinkan halaman
    if (allowedCategories && !allowedCategories.includes(item.kategoriLomba)) {
      return false;
    }
    if (filterKategori === 'Semua') return true;
    return item.kategoriLomba === filterKategori;
  });

  return (
    <div className="relative z-10 w-full bg-white/95 backdrop-blur-md border-2 border-slate-300 rounded-3xl shadow-xl p-3 sm:p-5 space-y-3">
      {/* Header Box Data Atlet + Tombol FILTER & TAMBAH */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Badge Judul Cyan */}
        <div className="py-2 px-6 sm:px-8 bg-gradient-to-r from-[#00d2ff] to-[#00b4d8] text-white font-black text-sm sm:text-base tracking-widest uppercase rounded-xl shadow-md shadow-cyan-500/25 border-2 border-white">
          {title}
        </div>

        {/* Tombol Aksi: FILTER (Kuning) & TAMBAH (Magenta) */}
        <div className="flex items-center gap-2">
          {!hideCategoryFilter && (
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="py-1.5 px-4 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#fca311] hover:to-[#f07100] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm border border-white transition-all transform active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>FILTER</span>
              <span className="material-symbols-outlined text-sm">tune</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenModal}
            className="py-1.5 px-4 bg-gradient-to-r from-[#ff007f] to-[#d6006c] hover:from-[#ff1a8c] hover:to-[#e60074] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm border border-white transition-all transform active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <span>TAMBAH</span>
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdown */}
      {isFilterOpen && !hideCategoryFilter && (
        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">Filter Kategori:</span>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 outline-none text-xs"
          >
            <option value="Semua">Semua ({allowedCategories ? allowedCategories.join(' & ') : 'Kategori'})</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabel Grid Data Atlet */}
      <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-inner bg-white">
        <table className="w-full text-left text-xs min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider font-extrabold border-b border-slate-300">
              <th className="py-2.5 px-3">No</th>
              <th className="py-2.5 px-3">Nama Lengkap Atlet</th>
              <th className="py-2.5 px-3">Asal Sekolah</th>
              <th className="py-2.5 px-3">NIK</th>
              <th className="py-2.5 px-3">Kategori</th>
              <th className="py-2.5 px-3">Kelas / Seni</th>
              <th className="py-2.5 px-3 text-center">TB / BB</th>
              <th className="py-2.5 px-3">No. HP</th>
              <th className="py-2.5 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredAtlets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-400 italic">
                  Belum ada data atlet. Klik tombol{' '}
                  <span className="font-bold text-[#ff007f]">+ TAMBAH</span> untuk memasukkan data atlet.
                </td>
              </tr>
            ) : (
              filteredAtlets.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{index + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.nama}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.asalSekolah}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.nik}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066cc] font-bold text-[10px] border border-blue-200">
                      {item.kategoriLomba}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{item.kategoriKelasSeni}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                    {item.tinggi}cm / {item.berat}kg
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-600">{item.noHp}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title="Edit Atlet"
                        className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 inline-flex items-center justify-center transition-colors border border-amber-200 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        title="Hapus Atlet"
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 inline-flex items-center justify-center transition-colors border border-red-200 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
