'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Download,
  Sparkles,
  RefreshCw,
  Printer,
  ChevronLeft,
  User,
  Hash,
  QrCode,
  Sliders,
  CheckCircle2,
  Share2,
  Layers,
} from 'lucide-react';

interface ParticipantOption {
  id: string;
  nama: string;
  no_bib: string;
  jenis_kelamin?: string;
  kategori?: string;
}

type CategoryType = '12k' | '7k' | '3k';

interface CategoryConfig {
  name: string;
  badge: string;
  bgImage: string;
  textColor: string;
  accentColor: string;
  themeColor: string;
}

const CATEGORIES_CONFIG: Record<CategoryType, CategoryConfig> = {
  '12k': {
    name: '12K PAWITRA',
    badge: '12K',
    bgImage: '/bib-12-clean.jpeg',
    textColor: '#ffffff',
    accentColor: '#da0000',
    themeColor: '#e11d48',
  },
  '7k': {
    name: '7K JUNIOR PAWITRA',
    badge: '7K',
    bgImage: '/bib-7-clean.jpeg',
    textColor: '#000000',
    accentColor: '#fffc01',
    themeColor: '#eab308',
  },
  '3k': {
    name: '3K HALLO PAWITRA',
    badge: '3K',
    bgImage: '/bib-3-clean.jpeg',
    textColor: '#ffffff',
    accentColor: '#01d420',
    themeColor: '#22c55e',
  },
};

export default function BibGeneratorClient() {
  const searchParams = useSearchParams();
  const initialBib = searchParams.get('no_bib') || searchParams.get('bib') || 'M-00001';
  const initialName = searchParams.get('nama') || searchParams.get('name') || 'MOHAMMAD QOSIM AL HAFIEZH';
  const initialCat = (searchParams.get('kategori') || searchParams.get('cat') || '12k').toLowerCase() as CategoryType;

  // Category State (12K, 7K, 3K)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    CATEGORIES_CONFIG[initialCat] ? initialCat : '12k'
  );

  // Form State
  const [bibNumber, setBibNumber] = useState(initialBib);
  const [runnerName, setRunnerName] = useState(initialName);
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');

  // Styling Customization State
  const [bibFontSize, setBibFontSize] = useState<number>(340);
  const [nameFontSize, setNameFontSize] = useState<number>(76);
  const [bibOffsetY, setBibOffsetY] = useState<number>(880);
  const [nameOffsetY, setNameOffsetY] = useState<number>(1175);
  const [isItalic, setIsItalic] = useState<boolean>(true);
  const [letterSpacing, setLetterSpacing] = useState<number>(14);

  // QR Code State
  const [showBioQr, setShowBioQr] = useState<boolean>(true);
  const [showGpxQr, setShowGpxQr] = useState<boolean>(true);
  const [bioQrUrl, setBioQrUrl] = useState<string>(
    `https://jiwandana.com/trailrun/peserta?no_bib=${encodeURIComponent(initialBib)}`
  );
  const [gpxQrUrl, setGpxQrUrl] = useState<string>('https://jiwandana.com/routes/12k.gpx');

  // UI state
  const [participants, setParticipants] = useState<ParticipantOption[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState<boolean>(false);
  const [isGeneratingBib, setIsGeneratingBib] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const currentConfig = CATEGORIES_CONFIG[selectedCategory] || CATEGORIES_CONFIG['12k'];

  // Auto-sync Bio QR URL when BIB number changes
  useEffect(() => {
    setBioQrUrl(`https://jiwandana.com/trailrun/peserta?no_bib=${encodeURIComponent(bibNumber.trim())}`);
    if (bibNumber.toUpperCase().startsWith('F')) {
      setGender('Perempuan');
    } else if (bibNumber.toUpperCase().startsWith('M')) {
      setGender('Laki-laki');
    }
  }, [bibNumber]);

  // Load registered participants from DB for quick-fill
  useEffect(() => {
    async function fetchParticipants() {
      setIsLoadingParticipants(true);
      try {
        const res = await fetch('/api/trailrun/peserta');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setParticipants(
            json.data.map((p: any) => ({
              id: p.id,
              nama: p.nama,
              no_bib: p.no_bib,
              jenis_kelamin: p.jenis_kelamin,
              kategori: p.kategori,
            }))
          );
        }
      } catch (err) {
        console.warn('Gagal memuat peserta database:', err);
      } finally {
        setIsLoadingParticipants(false);
      }
    }
    fetchParticipants();
  }, []);

  // Handler: Generate BIB Baru dari API
  const handleGenerateBib = async () => {
    setIsGeneratingBib(true);
    try {
      const res = await fetch(
        `/api/trailrun/generate-bib?gender=${encodeURIComponent(gender)}&current=${encodeURIComponent(bibNumber)}`
      );
      const data = await res.json();
      if (data.success && data.bib) {
        setBibNumber(data.bib);
      }
    } catch (err) {
      console.error('Error auto-generating BIB:', err);
    } finally {
      setIsGeneratingBib(false);
    }
  };

  // Handler: Pilih peserta dari dropdown
  const handleSelectParticipant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    if (!pId) return;
    const selected = participants.find((p) => p.id === pId);
    if (selected) {
      setBibNumber(selected.no_bib || 'M-00001');
      setRunnerName(selected.nama || '');
      if (selected.jenis_kelamin?.toLowerCase().startsWith('p') || selected.jenis_kelamin?.toLowerCase().startsWith('f')) {
        setGender('Perempuan');
      } else {
        setGender('Laki-laki');
      }

      // Auto detect category
      const rawCat = (selected.kategori || '').toLowerCase();
      if (rawCat.includes('7')) {
        setSelectedCategory('7k');
      } else if (rawCat.includes('3')) {
        setSelectedCategory('3k');
      } else {
        setSelectedCategory('12k');
      }
    }
  };

  // Handler: Download High-Res PNG (Ukuran Cetak Asli 2483 x 1774 px)
  const handleDownloadPng = async () => {
    setIsDownloading(true);
    setDownloadSuccess(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2483;
      canvas.height = 1774;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Tidak dapat membuat Canvas 2D');

      // 1. Gambar background template bersih sesuai kategori terpilih
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => reject(new Error('Gagal memuat gambar template'));
        bgImg.src = currentConfig.bgImage;
      });

      ctx.drawImage(bgImg, 0, 0, 2483, 1774);

      // 2. Gambar QR Code BIO (jika aktif)
      if (showBioQr && bioQrUrl) {
        try {
          const qrBioImg = new Image();
          qrBioImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            qrBioImg.onload = () => resolve();
            qrBioImg.onerror = () => resolve();
            qrBioImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
              bioQrUrl
            )}`;
          });
          if (qrBioImg.complete && qrBioImg.naturalWidth > 0) {
            ctx.drawImage(qrBioImg, 103, 554, 320, 320);
          }
        } catch {
          // Lewatkan QR jika offline
        }
      }

      // 3. Gambar QR Code GPX (jika aktif)
      if (showGpxQr && gpxQrUrl) {
        try {
          const qrGpxImg = new Image();
          qrGpxImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            qrGpxImg.onload = () => resolve();
            qrGpxImg.onerror = () => resolve();
            qrGpxImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
              gpxQrUrl
            )}`;
          });
          if (qrGpxImg.complete && qrGpxImg.naturalWidth > 0) {
            ctx.drawImage(qrGpxImg, 103, 1014, 320, 320);
          }
        } catch {
          // Lewatkan QR jika offline
        }
      }

      // 4. Render Nomor BIB
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = currentConfig.textColor;
      const italicPrefix = isItalic ? 'italic ' : '';
      ctx.font = `${italicPrefix}900 ${bibFontSize}px "Arial Black", "Impact", "Montserrat", sans-serif`;
      ctx.letterSpacing = `${letterSpacing}px`;
      ctx.fillText(bibNumber.trim().toUpperCase(), 1420, bibOffsetY);
      ctx.restore();

      // 5. Render Nama Pelari (Di Bawah Nomor BIB)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = currentConfig.textColor;
      ctx.font = `bold ${nameFontSize}px "Arial", "Poppins", sans-serif`;
      ctx.letterSpacing = '4px';

      const cleanName = runnerName.trim().toUpperCase();
      let actualNameSize = nameFontSize;
      if (cleanName.length > 25) {
        actualNameSize = Math.max(48, Math.floor(nameFontSize * (25 / cleanName.length)));
        ctx.font = `bold ${actualNameSize}px "Arial", "Poppins", sans-serif`;
      }
      ctx.fillText(cleanName, 1420, nameOffsetY);
      ctx.restore();

      // 6. Ekspor ke file Blob PNG dan unduh
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Gagal menghasilkan file PNG');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `BIB-PATAS-${currentConfig.badge}-${bibNumber.trim().toUpperCase()}-${cleanName.replace(
          /\s+/g,
          '_'
        )}.png`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadSuccess(`Berhasil mengunduh ${filename}`);
      }, 'image/png');
    } catch (err: any) {
      alert(`Gagal download gambar: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handler: Download File SVG Vektor
  const handleDownloadSvg = () => {
    try {
      const cleanName = runnerName.trim().toUpperCase();
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2483 1774" width="2483" height="1774">
  <defs>
    <style>
      .bib-num {
        font-family: 'Arial Black', 'Impact', sans-serif;
        font-weight: 900;
        font-style: ${isItalic ? 'italic' : 'normal'};
        fill: ${currentConfig.textColor};
        text-anchor: middle;
        dominant-baseline: central;
      }
      .runner-name {
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        fill: ${currentConfig.textColor};
        text-anchor: middle;
        dominant-baseline: central;
        text-transform: uppercase;
      }
    </style>
  </defs>

  <!-- 1. Background Clean Template (${currentConfig.badge}) -->
  <image href="${currentConfig.bgImage}" width="2483" height="1774" />

  ${
    showBioQr
      ? `<!-- 2. QR Code BIO -->
  <g id="qr-bio">
    <image href="https://api.qrserver.com/v1/create-qr-code/?size=320x320&amp;data=${encodeURIComponent(
      bioQrUrl
    )}" x="103" y="554" width="320" height="320" preserveAspectRatio="xMidYMid meet" />
  </g>`
      : ''
  }

  ${
    showGpxQr
      ? `<!-- 3. QR Code GPX -->
  <g id="qr-gpx">
    <image href="https://api.qrserver.com/v1/create-qr-code/?size=320x320&amp;data=${encodeURIComponent(
      gpxQrUrl
    )}" x="103" y="1014" width="320" height="320" preserveAspectRatio="xMidYMid meet" />
  </g>`
      : ''
  }

  <!-- 4. Nomor BIB Dinamis -->
  <text id="bib-number" x="1420" y="${bibOffsetY}" class="bib-num" font-size="${bibFontSize}" letter-spacing="${letterSpacing}">
    ${bibNumber.trim().toUpperCase()}
  </text>

  <!-- 5. Nama Pelari Dinamis -->
  <text id="runner-name" x="1420" y="${nameOffsetY}" class="runner-name" font-size="${nameFontSize}" letter-spacing="4">
    ${cleanName}
  </text>
</svg>`;

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `BIB-PATAS-${currentConfig.badge}-${bibNumber.trim().toUpperCase()}-${cleanName.replace(
        /\s+/g,
        '_'
      )}.svg`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(`Berhasil mengunduh ${filename}`);
    } catch (err: any) {
      alert(`Gagal download SVG: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  // Handler: Print langsung
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0d1017] text-white font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-[#161a23]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/trailrun"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Trailrun</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Official BIB Generator</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border"
                style={{
                  backgroundColor: `${currentConfig.accentColor}25`,
                  color: currentConfig.accentColor === '#fffc01' ? '#facc15' : currentConfig.accentColor,
                  borderColor: `${currentConfig.accentColor}40`,
                }}
              >
                {currentConfig.badge}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Update nomor BIB & nama pelari secara instan dengan ekspor resolusi tinggi (300 DPI siap cetak).
            </p>
          </div>
        </div>

        {/* Quick actions top-right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak langsung halaman ini"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden md:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download file Vector SVG"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Unduh SVG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isDownloading}
            className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Memproses...' : 'Download PNG'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {downloadSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between print:hidden">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </span>
            <button
              onClick={() => setDownloadSuccess(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              LEFT COLUMN: FORM CONTROLS (4 Cols)
          ========================================================================= */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            {/* 1. Category Switcher (12K / 7K / 3K) */}
            <div className="bg-[#161a23] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Pilih Kategori Lomba</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(['12k', '7k', '3k'] as CategoryType[]).map((catKey) => {
                  const isSelected = selectedCategory === catKey;
                  const cfg = CATEGORIES_CONFIG[catKey];
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedCategory(catKey)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                        isSelected
                          ? 'border-[#C9A227] bg-[#C9A227]/15 text-[#C9A227] shadow-sm'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm font-black tracking-tight">{cfg.badge}</span>
                      <span
                        className="w-2.5 h-1 rounded-full"
                        style={{ backgroundColor: cfg.accentColor }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Quick-Pick Registered Participant */}
            <div className="bg-[#161a23] border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
              <label className="block text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Pilih Peserta Terdaftar (Database)</span>
              </label>
              <select
                onChange={handleSelectParticipant}
                disabled={isLoadingParticipants}
                className="w-full bg-[#0d1017] border border-white/10 focus:border-[#C9A227] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="">
                  {isLoadingParticipants ? 'Memuat data peserta...' : '— Pilih dari database peserta —'}
                </option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.no_bib} • {p.nama} ({p.kategori || '12K'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 leading-tight">
                Pilih peserta untuk mengisi Nomor BIB, Kategori, dan Nama secara otomatis.
              </p>
            </div>

            {/* 3. Input Data Utama */}
            <div className="bg-[#161a23] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-white/10 pb-3">
                <Hash className="w-4 h-4 text-[#C9A227]" />
                <span>Data Kartu BIB</span>
              </h2>

              {/* No. BIB Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Nomor BIB <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateBib}
                    disabled={isGeneratingBib}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C9A227] hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingBib ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingBib ? 'Mengenerate...' : 'Generate Auto'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bibNumber}
                    onChange={(e) => setBibNumber(e.target.value.toUpperCase())}
                    placeholder="Contoh: M-00001"
                    maxLength={10}
                    className="flex-1 bg-[#0d1017] border border-white/10 focus:border-[#C9A227] text-white rounded-xl px-4 py-3 text-sm font-mono font-bold tracking-wider outline-none"
                  />
                  <select
                    value={gender}
                    onChange={(e) => {
                      const g = e.target.value as 'Laki-laki' | 'Perempuan';
                      setGender(g);
                      const pref = g === 'Perempuan' ? 'F-' : 'M-';
                      if (!bibNumber.startsWith(pref)) {
                        setBibNumber(`${pref}${bibNumber.slice(2) || '00001'}`);
                      }
                    }}
                    className="bg-[#0d1017] border border-white/10 text-xs text-slate-300 rounded-xl px-2.5 outline-none cursor-pointer"
                    title="Jenis Kelamin"
                  >
                    <option value="Laki-laki">M- (L)</option>
                    <option value="Perempuan">F- (P)</option>
                  </select>
                </div>
              </div>

              {/* Nama Pelari */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Lengkap Pelari <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value.toUpperCase())}
                  placeholder="NAMA LENGKAP PELARI"
                  className="w-full bg-[#0d1017] border border-white/10 focus:border-[#C9A227] text-white rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider outline-none"
                />
              </div>

              {/* QR Code Options */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Pengaturan QR Code</span>
                </span>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <label htmlFor="toggle-bio" className="cursor-pointer">
                    Tampilkan QR BIO Peserta
                  </label>
                  <input
                    type="checkbox"
                    id="toggle-bio"
                    checked={showBioQr}
                    onChange={(e) => setShowBioQr(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-[#C9A227] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <label htmlFor="toggle-gpx" className="cursor-pointer">
                    Tampilkan QR GPX Rute
                  </label>
                  <input
                    type="checkbox"
                    id="toggle-gpx"
                    checked={showGpxQr}
                    onChange={(e) => setShowGpxQr(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-[#C9A227] focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 4. Custom Styling Controls (Sliders) */}
            <div className="bg-[#161a23] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-white/10 pb-3">
                <Sliders className="w-4 h-4 text-[#C9A227]" />
                <span>Kustomisasi Tampilan Font</span>
              </h2>

              {/* Ukuran Font BIB */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Ukuran Font BIB</span>
                  <span className="font-mono text-white">{bibFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="450"
                  step="5"
                  value={bibFontSize}
                  onChange={(e) => setBibFontSize(Number(e.target.value))}
                  className="w-full accent-[#C9A227] cursor-pointer"
                />
              </div>

              {/* Ukuran Font Nama */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Ukuran Font Nama</span>
                  <span className="font-mono text-white">{nameFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="2"
                  value={nameFontSize}
                  onChange={(e) => setNameFontSize(Number(e.target.value))}
                  className="w-full accent-[#C9A227] cursor-pointer"
                />
              </div>

              {/* Italic Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <label className="text-xs text-slate-400">Gaya Font Italic (Miring)</label>
                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isItalic
                      ? 'bg-[#C9A227] text-[#0d1c32]'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {isItalic ? 'Italic' : 'Normal'}
                </button>
              </div>

              {/* Reset to Default */}
              <button
                type="button"
                onClick={() => {
                  setBibFontSize(340);
                  setNameFontSize(76);
                  setBibOffsetY(880);
                  setNameOffsetY(1175);
                  setIsItalic(true);
                  setLetterSpacing(14);
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Format Standar</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: LIVE VECTOR & CANVAS PREVIEW (8 Cols)
          ========================================================================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#161a23] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3 print:hidden">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <strong className="text-slate-200">Live Preview Cetak</strong> • Format A5 Landscape (2483 × 1774 px)
                </span>
                <span className="text-[11px] font-mono text-slate-500">300 DPI High-Resolution</span>
              </div>

              {/* Card Container with Realistic Aspect Ratio (1.4:1) */}
              <div className="relative w-full overflow-hidden rounded-xl bg-black/40 shadow-inner border border-white/10 group">
                <svg
                  ref={svgRef}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2483 1774"
                  className="w-full h-auto block"
                >
                  <defs>
                    <style>{`
                      .svg-bib-num {
                        font-family: 'Arial Black', 'Impact', 'Montserrat', sans-serif;
                        font-weight: 900;
                        font-style: ${isItalic ? 'italic' : 'normal'};
                        fill: ${currentConfig.textColor};
                        text-anchor: middle;
                        dominant-baseline: central;
                      }
                      .svg-runner-name {
                        font-family: 'Arial', 'Poppins', sans-serif;
                        font-weight: bold;
                        fill: ${currentConfig.textColor};
                        text-anchor: middle;
                        dominant-baseline: central;
                        text-transform: uppercase;
                      }
                    `}</style>
                  </defs>

                  {/* 1. Background Clean Template */}
                  <image href={currentConfig.bgImage} width="2483" height="1774" preserveAspectRatio="none" />

                  {/* 2. QR Code Placeholders */}
                  {showBioQr && (
                    <g id="preview-qr-bio">
                      <image
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                          bioQrUrl
                        )}`}
                        x="103"
                        y="554"
                        width="320"
                        height="320"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  )}

                  {showGpxQr && (
                    <g id="preview-qr-gpx">
                      <image
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                          gpxQrUrl
                        )}`}
                        x="103"
                        y="1014"
                        width="320"
                        height="320"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  )}

                  {/* 3. Dynamic Nomor BIB */}
                  <text
                    id="preview-bib-number"
                    x="1420"
                    y={bibOffsetY}
                    className="svg-bib-num"
                    fontSize={bibFontSize}
                    letterSpacing={letterSpacing}
                  >
                    {bibNumber.trim().toUpperCase() || 'M-00000'}
                  </text>

                  {/* 4. Dynamic Runner Name */}
                  <text
                    id="preview-runner-name"
                    x="1420"
                    y={nameOffsetY}
                    className="svg-runner-name"
                    fontSize={
                      runnerName.trim().length > 25
                        ? Math.max(48, Math.floor(nameFontSize * (25 / runnerName.trim().length)))
                        : nameFontSize
                    }
                    letterSpacing="4"
                  >
                    {runnerName.trim().toUpperCase() || 'NAMA LENGKAP PELARI'}
                  </text>
                </svg>
              </div>

              {/* Bottom Quick-Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
                <div className="text-slate-400 text-[11px]">
                  File output otomatis diberi nama: <br />
                  <code className="text-[#C9A227] font-mono text-[10px]">
                    BIB-PATAS-{currentConfig.badge}-{bibNumber.trim().toUpperCase()}-
                    {runnerName.trim().replace(/\s+/g, '_').toUpperCase() || 'RUNNER'}.png
                  </code>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isDownloading}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                    <span>{isDownloading ? 'Mengekspor...' : 'Download PNG 300 DPI'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
