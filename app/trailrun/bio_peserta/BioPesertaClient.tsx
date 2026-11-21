'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Phone,
  Copy,
  Check,
  Printer,
  Share2,
  RefreshCw,
  Search,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';

interface ParticipantData {
  id: string;
  nama: string;
  nama_bib?: string | null;
  no_bib: string;
  kategori: string;
  nik?: string | null;
  kk?: string | null;
  jenis_kelamin: string;
  tanggal_lahir?: string | null;
  golongan_darah?: string | null;
  riwayat_medis?: string | null;
  kontak_darurat?: string | null;
  no_hp?: string | null;
  email?: string | null;
  alamat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  kewarganegaraan?: string | null;
  nama_komunitas?: string | null;
  id_itra?: string | null;
  created_at?: string;
}

// Helper kalkulasi umur dari tanggal lahir (YYYY-MM-DD)
function calculateAge(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return '—';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Tahun`;
  } catch {
    return '—';
  }
}

// Helper format tanggal Indonesia
function formatDateIndo(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Helper membersihkan format nomor HP untuk wa.me dan tel:
function cleanPhoneForLink(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  if (!digits.startsWith('62')) {
    return '62' + digits;
  }
  return digits;
}

export default function BioPesertaClient() {
  const searchParams = useSearchParams();
  const bibParam =
    searchParams.get('no_bib') ||
    searchParams.get('bib') ||
    searchParams.get('q') ||
    '';

  const [inputBib, setInputBib] = useState(bibParam);
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(bibParam));
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (bibParam) {
      setInputBib(bibParam);
      fetchParticipant(bibParam);
    }
  }, [bibParam]);

  const fetchParticipant = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    setErrorMsg('');
    setParticipant(null);

    try {
      const res = await fetch(`/api/trailrun/peserta?no_bib=${encodeURIComponent(clean)}`);
      const json = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(
          json.message || `Data peserta dengan nomor BIB "${clean}" tidak ditemukan.`
        );
      }

      setParticipant(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat biodata peserta.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputBib.trim()) {
      fetchParticipant(inputBib.trim());
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text || text === '-' || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Biodata Medis BIB ${participant?.no_bib || ''} - ${participant?.nama || ''}`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      copyToClipboard(window.location.href, 'link');
    }
  };

  const emergencyPhoneClean = cleanPhoneForLink(participant?.kontak_darurat);
  const emergencyPhoneDisplay = participant?.kontak_darurat?.trim() || '—';

  return (
    <div className="min-h-screen bg-[#f0ebf8] text-[#202124] font-sans py-6 px-3 sm:px-4 print:bg-white print:p-0">
      <div className="w-full max-w-[640px] mx-auto font-sans space-y-3">
        {/* SEARCH BAR (Bisa digunakan untuk cari nomor BIB lain - Hidden on Print) */}
        {/* <div className="bg-white rounded-lg border border-[#dadce0] p-3 shadow-xs print:hidden">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputBib}
                onChange={(e) => setInputBib(e.target.value)}
                placeholder="Masukkan Nomor BIB (Contoh: M-00069)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#dadce0] rounded-md focus:border-[#673ab7] focus:ring-1 focus:ring-[#673ab7] outline-none font-mono font-bold uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#673ab7] hover:bg-[#5e35b1] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
            </button>
          </form>
        </div> */}

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-lg border border-[#dadce0] p-10 text-center space-y-3 shadow-xs">
            <RefreshCw className="w-6 h-6 text-[#673ab7] animate-spin mx-auto" />
            <div className="text-xs text-[#5f6368]">Memuat biodata peserta...</div>
          </div>
        )}

        {/* ERROR / NOT FOUND */}
        {!loading && errorMsg && (
          <div className="bg-white rounded-lg border border-[#dadce0] p-6 text-center space-y-2 shadow-xs">
            <AlertCircle className="w-8 h-8 text-[#d93025] mx-auto" />
            <div className="text-sm font-bold text-[#202124]">Data Tidak Ditemukan</div>
            <div className="text-xs text-[#5f6368]">{errorMsg}</div>
          </div>
        )}

        {/* SINGLE SOLID WHITE CARD: SEMUA DATA DALAM 1 CARD TANPA GAP */}
        {!loading && participant && (
          <div className="bg-white rounded-lg border border-[#dadce0] shadow-xs overflow-hidden print:border-none print:shadow-none">
            {/* Top colored stripe */}
            <div className="h-2.5 bg-[#673ab7] w-full" />

            {/* Header Form */}
            <div className="p-6 border-b border-[#dadce0] space-y-1">
              <div className="text-2xl font-bold text-[#202124] tracking-tight">
                Biodata Peserta Trailrun
              </div>
              <div className="text-xs text-[#5f6368] leading-relaxed">
                Trailrun Lintas Candi Majapahit 2026 • Arsip Data Rekam Medis &amp; Rumah Sakit
              </div>
            </div>

            {/* Content Fields: Bersambung dalam 1 card dengan pemisah garis tipis tanpa gap */}
            <div className="divide-y divide-[#dadce0] text-sm">
              {/* 1. NOMOR BIB */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Nomor BIB <span className="text-[#d93025]">*</span>
                </div>
                <div className="text-xl font-bold font-mono text-[#202124]">
                  {participant.no_bib}
                </div>
              </div>

              {/* 2. KATEGORI LARI */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Kategori Lari <span className="text-[#d93025]">*</span>
                </div>
                <div className="font-bold text-[#202124]">
                  {participant.kategori || '12K'}
                </div>
              </div>

              {/* 3. NAMA LENGKAP & NAMA DI BIB */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Nama Lengkap (Sesuai KTP) <span className="text-[#d93025]">*</span>
                </div>
                <div className="text-base font-bold text-[#202124]">
                  {participant.nama}
                </div>
                {participant.nama_bib && participant.nama_bib !== participant.nama && (
                  <div className="text-xs text-[#5f6368] pt-0.5">
                    Nama di BIB: <span className="font-semibold text-[#202124]">{participant.nama_bib}</span>
                  </div>
                )}
              </div>

              {/* 4. NIK (KTP / PASPOR) - TEPAT DI BAWAH NAMA */}
              <div className="p-4 sm:p-5 space-y-1.5">
                <div className="text-xs font-semibold text-[#5f6368]">
                  NIK (KTP / Paspor) <span className="text-[#d93025]">*</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-mono font-bold text-[#202124]">
                    {participant.nik && participant.nik !== '-' ? participant.nik : 'Belum Diisi'}
                  </span>
                  {participant.nik && participant.nik !== '-' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(participant.nik || '', 'nik')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-[#dadce0] text-xs font-semibold rounded text-[#1a73e8] inline-flex items-center gap-1 cursor-pointer print:hidden"
                    >
                      {copiedField === 'nik' ? (
                        <>
                          <Check className="w-3 h-3 text-[#188038]" />
                          <span className="text-[#188038]">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 5. NOMOR KARTU KELUARGA (KK) - TEPAT DI BAWAH NIK */}
              <div className="p-4 sm:p-5 space-y-1.5">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Nomor Kartu Keluarga (KK)
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-mono font-bold text-[#202124]">
                    {participant.kk && participant.kk !== '-' ? participant.kk : 'Belum Diisi'}
                  </span>
                  {participant.kk && participant.kk !== '-' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(participant.kk || '', 'kk')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-[#dadce0] text-xs font-semibold rounded text-[#1a73e8] inline-flex items-center gap-1 cursor-pointer print:hidden"
                    >
                      {copiedField === 'kk' ? (
                        <>
                          <Check className="w-3 h-3 text-[#188038]" />
                          <span className="text-[#188038]">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 6. GOLONGAN DARAH */}
              <div className="p-4 sm:p-5 space-y-1.5">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Golongan Darah <span className="text-[#d93025]">*</span>
                </div>
                <div>
                  <span className="text-base font-black text-[#d93025] bg-[#fce8e6] border border-[#fad2cf] px-3 py-1 rounded inline-block">
                    {participant.golongan_darah || 'Tidak Diketahui'}
                  </span>
                </div>
              </div>

              {/* 7. RIWAYAT MEDIS / ALERGI */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Riwayat Penyakit / Alergi / Cedera
                </div>
                <div className="font-medium text-[#202124] leading-relaxed">
                  {participant.riwayat_medis &&
                    participant.riwayat_medis.trim() !== '' &&
                    participant.riwayat_medis !== '-'
                    ? participant.riwayat_medis
                    : 'Tidak ada riwayat medis atau alergi tercatat.'}
                </div>
              </div>

              {/* 8. KONTAK DARURAT (KELUARGA) */}
              <div className="p-4 sm:p-5 space-y-2">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Kontak Darurat (Keluarga / Kerabat) <span className="text-[#d93025]">*</span>
                </div>
                <div className="text-lg font-mono font-bold text-[#202124]">
                  {emergencyPhoneDisplay}
                </div>

                {emergencyPhoneClean && (
                  <div className="flex items-center gap-2 pt-1 print:hidden">
                    <a
                      href={`tel:${emergencyPhoneClean}`}
                      className="px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Panggil Telepon</span>
                    </a>
                    <a
                      href={`https://wa.me/${emergencyPhoneClean}?text=${encodeURIComponent(
                        `Halo, kami dari Tim Medis / Rumah Sakit terkait peserta Trailrun atas nama ${participant.nama} (Nomor BIB ${participant.no_bib}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#188038] hover:bg-[#137333] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              {/* 9. TANGGAL LAHIR & USIA */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Tanggal Lahir &amp; Usia
                </div>
                <div className="font-semibold text-[#202124]">
                  {formatDateIndo(participant.tanggal_lahir)} • ({calculateAge(participant.tanggal_lahir)})
                </div>
              </div>

              {/* 10. JENIS KELAMIN */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Jenis Kelamin
                </div>
                <div className="font-medium text-[#202124]">
                  {participant.jenis_kelamin || '—'}
                </div>
              </div>

              {/* 11. ALAMAT & DOMISILI */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Alamat KTP / Domisili
                </div>
                <div className="text-[#202124] leading-relaxed">
                  {participant.alamat || '—'}
                </div>
                <div className="text-xs text-[#5f6368]">
                  {[participant.kota, participant.provinsi].filter(Boolean).join(', ') || '—'}
                </div>
              </div>

              {/* 12. NO HP PASIEN */}
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-semibold text-[#5f6368]">
                  Nomor WhatsApp / HP Pasien
                </div>
                <div className="font-mono font-medium text-[#202124]">
                  {participant.no_hp || '—'}
                </div>
              </div>

              {/* 13. ID ITRA (JIKA ADA) */}
              {participant.id_itra && participant.id_itra !== '-' && (
                <div className="p-4 sm:p-5 space-y-1">
                  <div className="text-xs font-semibold text-[#5f6368]">
                    ID ITRA
                  </div>
                  <div className="font-mono font-bold text-[#202124]">
                    {participant.id_itra}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BAR DI BAGIAN BAWAH CARD (PRINT & SHARE) */}
            <div className="bg-[#f8f9fa] p-4 border-t border-[#dadce0] flex items-center justify-between gap-2 print:hidden">
              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#1a73e8] border border-[#dadce0] rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedField === 'link' ? 'Tersalin!' : 'Bagikan Tautan'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-[#673ab7] hover:bg-[#5e35b1] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Form (Print)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
