'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  HeartPulse,
  Phone,
  AlertTriangle,
  Copy,
  Check,
  Printer,
  Share2,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Hash,
  Search,
  RefreshCw,
  Droplet,
  Award,
  AlertCircle,
  MessageCircle,
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

  // Fetch data saat parameter BIB berubah
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
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans print:bg-white print:p-0 flex flex-col justify-center items-center p-3 sm:p-6">
      {/* Container Lebar Standar Medis Dossier */}
      <div className="w-full max-w-2xl mx-auto space-y-4 font-sans">
        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 print:hidden">
            <RefreshCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
            <div className="text-base font-bold text-slate-800 font-sans">
              Mengambil Data Medis Peserta...
            </div>
            <p className="text-xs text-slate-400 font-mono">Nomor BIB: {inputBib}</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && errorMsg && (
          <div className="p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 print:hidden">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900 font-sans">Data Tidak Ditemukan</div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{errorMsg}</p>
            </div>

            {/* Input Pencarian Ulang */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm mx-auto pt-2">
              <input
                type="text"
                value={inputBib}
                onChange={(e) => setInputBib(e.target.value)}
                placeholder="Masukkan Nomor BIB (misal: M-00069)"
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none font-mono font-bold uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Cari
              </button>
            </form>
          </div>
        )}

        {/* No Search Initial State */}
        {!loading && !participant && !errorMsg && (
          <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm print:hidden">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900 font-sans">
                Pemeriksaan Biodata Peserta
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ketik nomor dada pelari (BIB) untuk memeriksa riwayat medis, NIK, dan kontak darurat pasien.
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm mx-auto pt-2">
              <input
                type="text"
                value={inputBib}
                onChange={(e) => setInputBib(e.target.value)}
                placeholder="Contoh: M-00069"
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none font-mono font-bold uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Cek Data
              </button>
            </form>
          </div>
        )}

        {/* PARTICIPANT FOUND: CLEAN MEDICAL PASS DOSSIER */}
        {!loading && participant && (
          <div className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-2xl print:border-none print:shadow-none print:rounded-none font-sans">
            {/* Header: Event & Race Identification */}
            <div className=" p-5 sm:p-6 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
                    {participant.nama}
                  </div>
                  {participant.nama_bib && participant.nama_bib !== participant.nama && (
                    <div className="text-xs  font-semibold font-sans">
                      Nama di BIB: <span className="font-bold">{participant.nama_bib}</span>
                    </div>
                  )}
                </div>

                {/* Nomor BIB & Kategori (Besar) */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-center shadow-xs">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold block text-slate-900/70 font-sans">
                      NOMOR BIB
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono tracking-wider leading-none">
                      {participant.no_bib}
                    </span>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold block text-slate-400 font-sans">
                      KATEGORI
                    </span>
                    <span className="text-lg font-bold font-mono leading-none">
                      {participant.kategori || '12K'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-7 space-y-6 font-sans">
              {/* ============================================================== */}
              {/* SECTION 1: TRIASE DARURAT MEDIS (HIGHEST PRIORITY)            */}
              {/* ============================================================== */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider border-b border-rose-200 pb-2 font-sans">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Triase &amp; Informasi Medis Darurat</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* 1.1 GOLONGAN DARAH */}
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                      <Droplet className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block font-sans">
                        GOLONGAN DARAH
                      </span>
                      <span className="text-2xl font-black text-rose-950 font-sans">
                        {participant.golongan_darah || 'TIDAK DIKETAHUI'}
                      </span>
                    </div>
                  </div>

                  {/* 1.2 USIA & TANGGAL LAHIR */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Usia / Tgl. Lahir
                    </span>
                    <div className="text-base font-black text-slate-900 font-sans">
                      {calculateAge(participant.tanggal_lahir)}
                    </div>
                    <span className="text-[11px] text-slate-600 block font-sans">
                      {formatDateIndo(participant.tanggal_lahir)}
                    </span>
                  </div>

                  {/* 1.3 JENIS KELAMIN */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Jenis Kelamin
                    </span>
                    <div className="text-base font-black text-slate-900 font-sans">
                      {participant.jenis_kelamin || '—'}
                    </div>
                    <span className="text-[11px] text-slate-600 block font-sans">
                      Warga: {participant.kewarganegaraan || 'Indonesia'}
                    </span>
                  </div>
                </div>

                {/* 1.4 RIWAYAT PENYAKIT & ALERGI (FULL WIDTH ALERT) */}
                <div
                  className={`p-4 rounded-2xl border-2 ${participant.riwayat_medis &&
                    participant.riwayat_medis.trim() !== '' &&
                    participant.riwayat_medis !== '-'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 shrink-0 mt-0.5 ${participant.riwayat_medis &&
                        participant.riwayat_medis.trim() !== '' &&
                        participant.riwayat_medis !== '-'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                        }`}
                    />
                    <div className="space-y-1 flex-1 font-sans">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80 font-sans">
                        Catatan Riwayat Medis / Alergi / Cedera
                      </span>
                      <div className="text-sm sm:text-base font-bold leading-snug font-sans">
                        {participant.riwayat_medis &&
                          participant.riwayat_medis.trim() !== '' &&
                          participant.riwayat_medis !== '-'
                          ? participant.riwayat_medis
                          : 'Tidak ada riwayat medis atau alergi tercatat.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.5 KONTAK DARURAT (EMERGENCY CONTACT KELUARGA DENGAN CALL & WA BUTTON) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-300 space-y-3 font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block font-sans">
                        KONTAK DARURAT (KELUARGA / KERABAT)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-rose-950 mt-0.5">
                        {emergencyPhoneDisplay}
                      </div>
                    </div>

                    {/* Action buttons (Hidden on Print) */}
                    {emergencyPhoneClean && (
                      <div className="flex items-center gap-2 print:hidden">
                        <a
                          href={`tel:${emergencyPhoneClean}`}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors font-sans"
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
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors font-sans"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-rose-800/80 leading-relaxed font-sans">
                    Nomor di atas merupakan kontak darurat utama yang didaftarkan peserta saat registrasi resmi.
                  </p>
                </div>
              </div>

              {/* ============================================================== */}
              {/* SECTION 2: ADMINISTRASI RS & ASURANSI BPJS                     */}
              {/* ============================================================== */}
              <div className="space-y-3 pt-2 font-sans">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-2 font-sans">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  <span>Administrasi Pendaftaran RS &amp; Asuransi BPJS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* NIK */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-2 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        NIK (KTP / Paspor)
                      </span>
                      {participant.nik && participant.nik.replace(/\D/g, '').length === 16 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-sans">
                          16 Digit ✓
                        </span>
                      )}
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                      {participant.nik && participant.nik !== '-' ? participant.nik : 'Belum Terisi'}
                    </div>
                    {participant.nik && participant.nik !== '-' && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(participant.nik || '', 'nik')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer print:hidden font-sans"
                      >
                        {copiedField === 'nik' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Tersalin ke Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin NIK untuk SIMRS / BPJS</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* NO KK */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-2 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                        <Hash className="w-3 h-3 text-slate-500" />
                        Nomor Kartu Keluarga (KK)
                      </span>
                      {participant.kk && participant.kk.replace(/\D/g, '').length === 16 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-sans">
                          16 Digit ✓
                        </span>
                      )}
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                      {participant.kk && participant.kk !== '-' ? participant.kk : 'Belum Terisi'}
                    </div>
                    {participant.kk && participant.kk !== '-' && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(participant.kk || '', 'kk')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer print:hidden font-sans"
                      >
                        {copiedField === 'kk' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Tersalin ke Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Nomor KK</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional ID ITRA */}
                {participant.id_itra && participant.id_itra !== '-' && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900 font-sans">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>ID ITRA:</span>
                      <strong className="font-mono">{participant.id_itra}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================== */}
              {/* SECTION 3: IDENTITAS DOMISILI & KONTAK PESERTA                 */}
              {/* ============================================================== */}
              <div className="space-y-3 pt-2 font-sans">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-2 font-sans">
                  <MapPin className="w-4 h-4 text-slate-700" />
                  <span>Domisili &amp; Kontak Pasien</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                  {/* Alamat Lengkap */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-sans">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans">
                      Alamat KTP / Domisili
                    </span>
                    <p className="font-semibold text-slate-800 leading-relaxed font-sans">
                      {participant.alamat || '—'}
                    </p>
                    <p className="text-slate-500 text-[11px] font-sans">
                      {[participant.kota, participant.provinsi].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>

                  {/* Kontak Pribadi */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-sans">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans">
                        No. HP / WhatsApp Pasien
                      </span>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {participant.no_hp || '—'}
                      </div>
                    </div>
                    {participant.nama_komunitas && participant.nama_komunitas !== 'opsional' && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans">
                          Komunitas / Klub Lari
                        </span>
                        <div className="font-semibold text-slate-800 font-sans">
                          {participant.nama_komunitas}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar (Print / Share) - Hidden on Print */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden font-sans">
              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedField === 'link' ? 'Tautan Tersalin!' : 'Bagikan Tautan'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors font-sans"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Rekam Medis (A4)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
