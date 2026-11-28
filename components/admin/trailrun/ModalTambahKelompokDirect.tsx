'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Building,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Save,
  Sparkles,
} from 'lucide-react';
import { parseTrailrunExcelFile, downloadTrailrunExcelTemplate } from '@/lib/excel-template';

interface ParticipantDraft {
  id: string;
  nama: string;
  nama_bib: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  kategori: '12K' | '7K' | '3K';
  ukuran_jersey: string;
  no_bib: string;
  no_hp: string;
  email: string;
  nik: string;
  kk: string;
  tanggal_lahir: string;
  golongan_darah: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kontak_darurat: string;
  riwayat_medis: string;
}

interface ModalTambahKelompokDirectProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const createEmptyParticipant = (): ParticipantDraft => ({
  id: Math.random().toString(36).slice(2, 10),
  nama: '',
  nama_bib: '',
  jenis_kelamin: 'Laki-laki',
  kategori: '12K',
  ukuran_jersey: '-',
  no_bib: '',
  no_hp: '',
  email: '',
  nik: '',
  kk: '',
  tanggal_lahir: '',
  golongan_darah: '-',
  alamat: '',
  kota: '',
  provinsi: '',
  kontak_darurat: '',
  riwayat_medis: '-',
});

export default function ModalTambahKelompokDirect({
  isOpen,
  onClose,
  onSuccess,
}: ModalTambahKelompokDirectProps) {
  const [groupName, setGroupName] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [picEmail, setPicEmail] = useState('');

  const [participants, setParticipants] = useState<ParticipantDraft[]>([createEmptyParticipant()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [excelImporting, setExcelImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setParticipants((prev) => [...prev, createEmptyParticipant()]);
  };

  const handleRemoveRow = (id: string) => {
    if (participants.length <= 1) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof ParticipantDraft, value: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelImporting(true);
    setErrorMsg('');
    try {
      const parsed = await parseTrailrunExcelFile(file);
      if (!parsed.participants || parsed.participants.length === 0) {
        throw new Error('Tidak ditemukan data peserta yang valid pada file Excel.');
      }

      const mapped: ParticipantDraft[] = parsed.participants.map((p) => {
        const cat = (p.kategori || '').toUpperCase();
        const resolvedCat: '12K' | '7K' | '3K' = cat.includes('12')
          ? '12K'
          : cat.includes('3')
          ? '3K'
          : '7K';
        const gender = (p.jenis_kelamin || '').toLowerCase().includes('perempuan')
          ? 'Perempuan'
          : 'Laki-laki';

        return {
          id: Math.random().toString(36).slice(2, 10),
          nama: p.nama || '',
          nama_bib: p.nama || '',
          jenis_kelamin: gender,
          kategori: resolvedCat,
          ukuran_jersey: (p.ukuran_jersey || '-').toUpperCase(),
          no_bib: p.no_bib || '',
          no_hp: p.no_hp || '',
          email: p.email || '',
          nik: p.nik || '',
          kk: p.kk || '',
          tanggal_lahir: p.tanggal_lahir || '',
          golongan_darah: p.golongan_darah || '-',
          alamat: p.alamat || '',
          kota: p.kota || '',
          provinsi: p.provinsi || '',
          kontak_darurat: p.kontak_darurat || '',
          riwayat_medis: p.riwayat_medis || '-',
        };
      });

      setParticipants(mapped);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membaca file Excel.');
    } finally {
      setExcelImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!groupName.trim()) {
      setErrorMsg('Nama Komunitas / Grup / Instansi wajib diisi.');
      return;
    }
    if (!picName.trim()) {
      setErrorMsg('Nama Penanggung Jawab (PIC) wajib diisi.');
      return;
    }
    const emptyNameIdx = participants.findIndex((p) => !p.nama.trim());
    if (emptyNameIdx !== -1) {
      setErrorMsg(`Nama Lengkap peserta pada baris #${emptyNameIdx + 1} wajib diisi.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/trailrun/kelompok-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_name: groupName.trim(),
          pic_name: picName.trim(),
          pic_phone: picPhone.trim(),
          pic_email: picEmail.trim(),
          participants: participants.map((p) => ({
            nama: p.nama.trim(),
            nama_bib: (p.nama_bib || p.nama).trim(),
            jenis_kelamin: p.jenis_kelamin,
            kategori: p.kategori,
            ukuran_jersey: p.ukuran_jersey || '-',
            no_bib: p.no_bib.trim(),
            no_hp: p.no_hp.trim(),
            email: p.email.trim(),
            nik: p.nik.trim(),
            kk: p.kk.trim(),
            tanggal_lahir: p.tanggal_lahir.trim(),
            golongan_darah: (p.golongan_darah || '').trim() || '-',
            alamat: p.alamat.trim(),
            kota: p.kota.trim(),
            provinsi: p.provinsi.trim(),
            kontak_darurat: p.kontak_darurat.trim(),
            riwayat_medis: (p.riwayat_medis || '').trim() || '-',
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan pendaftaran kelompok direct.');
      }

      // Reset form & close
      setGroupName('');
      setPicName('');
      setPicPhone('');
      setPicEmail('');
      setParticipants([createEmptyParticipant()]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-5xl bg-[#0a1424] rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-[scaleUp_0.2s_ease-out]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-black/40 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tipe: DIRECT</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nominal: Rp 0 • Status: PAID (Lunas)</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-sans flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#C9A227]" />
              <span>Tambah Peserta Kelompok (Direct Rp 0)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Daftarkan rombongan sponsor, undangan, atau pembayaran langsung tanpa gateway. No. BIB akan dibuat otomatis jika dikosongkan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Data Komunitas & PIC */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>1. Data Rombongan &amp; Penanggung Jawab (PIC)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nama Komunitas / Grup *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Komunitas Sponsor / VIP"
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 focus:border-[#C9A227] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nama PIC *
                </label>
                <input
                  type="text"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  placeholder="Nama Koordinator"
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 focus:border-[#C9A227] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  No. WhatsApp PIC
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={picPhone}
                    onChange={(e) => setPicPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/15 focus:border-[#C9A227] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Email PIC
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={picEmail}
                    onChange={(e) => setPicEmail(e.target.value)}
                    placeholder="pic@email.com"
                    className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/15 focus:border-[#C9A227] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Daftar Peserta */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>2. Daftar Peserta ({participants.length} Orang)</span>
              </h4>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => downloadTrailrunExcelTemplate(groupName)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span>Template Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={excelImporting}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{excelImporting ? 'Membaca Excel...' : 'Import dari Excel'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1.5 rounded-xl bg-[#C9A227] hover:bg-amber-400 text-slate-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-[#C9A227] font-mono">
                      Peserta #{idx + 1}
                    </span>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(p.id)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {/* Baris Utama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    <div className="lg:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        value={p.nama}
                        onChange={(e) => handleUpdateRow(p.id, 'nama', e.target.value)}
                        placeholder="Nama Lengkap Pelari"
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Gender *
                      </label>
                      <select
                        value={p.jenis_kelamin}
                        onChange={(e) =>
                          handleUpdateRow(
                            p.id,
                            'jenis_kelamin',
                            e.target.value as 'Laki-laki' | 'Perempuan'
                          )
                        }
                        className="w-full px-2.5 py-2 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Laki-laki">Laki-laki (M-)</option>
                        <option value="Perempuan">Perempuan (F-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Kategori *
                      </label>
                      <select
                        value={p.kategori}
                        onChange={(e) =>
                          handleUpdateRow(p.id, 'kategori', e.target.value as '12K' | '7K' | '3K')
                        }
                        className="w-full px-2.5 py-2 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="12K">12K</option>
                        <option value="7K">7K</option>
                        <option value="3K">3K</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Ukuran Jersey
                      </label>
                      <select
                        value={p.ukuran_jersey}
                        onChange={(e) => handleUpdateRow(p.id, 'ukuran_jersey', e.target.value)}
                        className="w-full px-2.5 py-2 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="-">- (Unselected)</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                      </select>
                    </div>
                  </div>

                  {/* Baris Pelengkap 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        No. BIB (Kosong = Auto)
                      </label>
                      <input
                        type="text"
                        value={p.no_bib}
                        onChange={(e) => handleUpdateRow(p.id, 'no_bib', e.target.value.toUpperCase())}
                        placeholder="Auto (M-/F-XXXXX)"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs font-mono text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        No. WhatsApp
                      </label>
                      <input
                        type="text"
                        value={p.no_hp}
                        onChange={(e) => handleUpdateRow(p.id, 'no_hp', e.target.value)}
                        placeholder="0812..."
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={p.email}
                        onChange={(e) => handleUpdateRow(p.id, 'email', e.target.value)}
                        placeholder="email@peserta.com"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        NIK (16 Digit)
                      </label>
                      <input
                        type="text"
                        value={p.nik}
                        onChange={(e) => handleUpdateRow(p.id, 'nik', e.target.value)}
                        placeholder="Opsional"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs font-mono text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        No. KK (16 Digit)
                      </label>
                      <input
                        type="text"
                        value={p.kk}
                        onChange={(e) => handleUpdateRow(p.id, 'kk', e.target.value)}
                        placeholder="Opsional"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs font-mono text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Tgl Lahir (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        value={p.tanggal_lahir}
                        onChange={(e) => handleUpdateRow(p.id, 'tanggal_lahir', e.target.value)}
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Baris Pelengkap 2: Alamat, Kota, Provinsi, Darurat, Gol. Darah, Medis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Gol. Darah
                      </label>
                      <input
                        type="text"
                        value={p.golongan_darah}
                        onChange={(e) => handleUpdateRow(p.id, 'golongan_darah', e.target.value.toUpperCase())}
                        placeholder="- / A / B / AB / O"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Alamat Lengkap
                      </label>
                      <input
                        type="text"
                        value={p.alamat}
                        onChange={(e) => handleUpdateRow(p.id, 'alamat', e.target.value)}
                        placeholder="Alamat lengkap"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Kota / Kab
                      </label>
                      <input
                        type="text"
                        value={p.kota}
                        onChange={(e) => handleUpdateRow(p.id, 'kota', e.target.value)}
                        placeholder="Kota"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Kontak Darurat
                      </label>
                      <input
                        type="text"
                        value={p.kontak_darurat}
                        onChange={(e) => handleUpdateRow(p.id, 'kontak_darurat', e.target.value)}
                        placeholder="Nama & No HP"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Riwayat Medis
                      </label>
                      <input
                        type="text"
                        value={p.riwayat_medis}
                        onChange={(e) => handleUpdateRow(p.id, 'riwayat_medis', e.target.value)}
                        placeholder="-"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 focus:border-[#C9A227] rounded-lg text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Kelompok Direct (Rp 0)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
