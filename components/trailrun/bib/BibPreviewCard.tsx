'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  QrCode,
  Sliders,
  RefreshCw,
  FileCode,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type BibCategoryType = '12k' | '7k' | '3k';

interface CategoryConfig {
  name: string;
  badge: string;
  bgImage: string;
  textColor: string;
  accentColor: string;
  themeColor: string;
}

const CATEGORIES_CONFIG: Record<BibCategoryType, CategoryConfig> = {
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

export interface BibPreviewCardProps {
  bibNumber: string;
  runnerName: string;
  category?: string;
  gender?: string;
  showCustomizer?: boolean;
  showCategorySwitcher?: boolean;
  className?: string;
}

export default function BibPreviewCard({
  bibNumber: initialBib,
  runnerName: initialName,
  category: initialCategory = '12k',
  gender: _gender,
  showCustomizer = true,
  showCategorySwitcher = false,
  className = '',
}: BibPreviewCardProps) {
  // Normalize category key
  const detectCategoryKey = (catStr?: string): BibCategoryType => {
    const clean = (catStr || '').toLowerCase();
    if (clean.includes('7')) return '7k';
    if (clean.includes('3')) return '3k';
    return '12k';
  };

  const [selectedCategory, setSelectedCategory] = useState<BibCategoryType>(
    detectCategoryKey(initialCategory)
  );

  // Sync state if initialCategory changes
  useEffect(() => {
    setSelectedCategory(detectCategoryKey(initialCategory));
  }, [initialCategory]);

  const currentConfig = CATEGORIES_CONFIG[selectedCategory];

  // Editable text states (can be modified in preview card if needed)
  const [bibNumber, setBibNumber] = useState(initialBib || 'M-00001');
  const [runnerName, setRunnerName] = useState(initialName || 'NAMA LENGKAP PELARI');

  useEffect(() => {
    if (initialBib) setBibNumber(initialBib);
  }, [initialBib]);

  useEffect(() => {
    if (initialName) setRunnerName(initialName);
  }, [initialName]);

  // Styling Customization State (Same as bib-generator)
  const [bibFontSize, setBibFontSize] = useState<number>(340);
  const [nameFontSize, setNameFontSize] = useState<number>(76);
  const [bibOffsetY, setBibOffsetY] = useState<number>(880);
  const [nameOffsetY, setNameOffsetY] = useState<number>(1175);
  const [isItalic, setIsItalic] = useState<boolean>(true);
  const [letterSpacing, setLetterSpacing] = useState<number>(14);

  // QR Code Options
  const [showBioQr, setShowBioQr] = useState<boolean>(true);
  const [showGpxQr, setShowGpxQr] = useState<boolean>(false);
  const [bioQrUrl, setBioQrUrl] = useState<string>('');
  const [gpxQrUrl, setGpxQrUrl] = useState<string>('');

  // UI state
  const [isExpandedControls, setIsExpandedControls] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Generate dynamic QR URLs
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jiwandana.com';
    const cleanBib = encodeURIComponent(bibNumber.trim().toUpperCase());
    setBioQrUrl(`${origin}/trailrun/peserta?bib=${cleanBib}`);
    setGpxQrUrl(`${origin}/api/trailrun/download-gpx?cat=${selectedCategory}`);
  }, [bibNumber, selectedCategory]);

  // Name calculation for SVG preview & canvas
  const cleanName = runnerName.trim().toUpperCase();
  let actualNameSize = nameFontSize;
  if (cleanName.length > 25) {
    actualNameSize = Math.max(48, Math.floor(nameFontSize * (25 / cleanName.length)));
  }

  // Handler: Download High-Res PNG (Ukuran Cetak Asli 2483 x 1774 px, 300 DPI)
  const handleDownloadPng = async () => {
    setIsDownloading(true);
    setDownloadSuccess(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2483;
      canvas.height = 1774;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Tidak dapat membuat Canvas 2D');

      // 1. Gambar background template bersih sesuai kategori
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => reject(new Error('Gagal memuat template gambar'));
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

      // 5. Render Nama Pelari
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = currentConfig.textColor;
      ctx.font = `bold ${actualNameSize}px "Arial", "Poppins", sans-serif`;
      ctx.letterSpacing = '4px';
      ctx.fillText(cleanName, 1420, nameOffsetY);
      ctx.restore();

      // 6. Download file PNG
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (!blob) throw new Error('Gagal mengekspor blob kanvas');

      const url = URL.createObjectURL(blob);
      const filename = `BIB-${selectedCategory.toUpperCase()}-${bibNumber.trim().replace(/[^a-zA-Z0-9_-]/g, '')}.png`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(`Berhasil mengunduh ${filename}`);
    } catch (err: any) {
      alert(`Gagal download PNG: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handler: Download File Vektor SVG
  const handleDownloadSvg = () => {
    try {
      const filename = `BIB-${selectedCategory.toUpperCase()}-${bibNumber.trim().replace(/[^a-zA-Z0-9_-]/g, '')}.svg`;
      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2483 1774" width="2483" height="1774">
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
        font-family: 'Arial', 'Poppins', sans-serif;
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

  ${showBioQr
          ? `<!-- 2. QR Code BIO -->
  <g id="qr-bio">
    <image href="https://api.qrserver.com/v1/create-qr-code/?size=320x320&amp;data=${encodeURIComponent(
            bioQrUrl
          )}" x="103" y="554" width="320" height="320" preserveAspectRatio="xMidYMid meet" />
  </g>`
          : ''
        }

  ${showGpxQr
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
  <text id="runner-name" x="1420" y="${nameOffsetY}" class="runner-name" font-size="${actualNameSize}" letter-spacing="4">
    ${cleanName}
  </text>
</svg>`;

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
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
    <div
      className={`bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-xl print:shadow-none print:border-2 print:border-black print:rounded-2xl ${className}`}
    >
      {/* 1. Header Bar: Info Kategori & Status Resolusi (Clean White Theme) */}
      <div className="bg-white text-slate-900 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-xs"
            style={{
              backgroundColor: `${currentConfig.accentColor}15`,
              color: currentConfig.accentColor === '#fffc01' ? '#b45309' : currentConfig.accentColor,
              borderColor: `${currentConfig.accentColor}35`,
            }}
          >
            {currentConfig.badge}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900 flex items-center gap-2">
              <span>Kartu Resmi E-BIB Pelari</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono border border-slate-200">
                A5 • 300 DPI
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Format cetak resolusi tinggi siap pakai (2483 × 1774 px).
            </p>
          </div>
        </div>

        {/* Category Display - Sesuai Data Kategori Peserta yang Dicari */}
        {showCategorySwitcher ? (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs border border-slate-200 print:hidden">
            {(['12k', '7k', '3k'] as BibCategoryType[]).map((catKey) => {
              const isSelected = selectedCategory === catKey;
              const cfg = CATEGORIES_CONFIG[catKey];
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${isSelected
                      ? 'bg-[#C9A227] text-[#0d1c32] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {cfg.badge}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-xs flex items-center gap-1.5"
              style={{
                backgroundColor: `${currentConfig.accentColor}12`,
                color: currentConfig.accentColor === '#fffc01' ? '#b45309' : currentConfig.accentColor,
                borderColor: `${currentConfig.accentColor}35`,
              }}
            >
              <span className="text-[10px] text-slate-500 font-normal">Kategori:</span>
              <span className="font-extrabold">{currentConfig.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Live Graphical BIB Canvas / SVG (A5 Aspect Ratio 1.4 : 1) */}
      <div className="p-4 sm:p-6 bg-slate-900/5 border-b border-black/5">
        <div className="relative w-full overflow-hidden rounded-2xl bg-black/50 shadow-inner border border-black/15 group">
          <div className="w-full relative" style={{ paddingBottom: '71.44%' }}>
            <svg
              viewBox="0 0 2483 1774"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{
                filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.25))',
              }}
            >
              <defs>
                <style>{`
                  .bib-text-num {
                    font-family: "Arial Black", "Impact", "Montserrat", sans-serif;
                    font-weight: 900;
                    font-style: ${isItalic ? 'italic' : 'normal'};
                    fill: ${currentConfig.textColor};
                    text-anchor: middle;
                    dominant-baseline: central;
                  }
                  .bib-text-name {
                    font-family: "Arial", "Poppins", sans-serif;
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

              {/* 2. QR Code BIO Placeholder */}
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

              {/* 3. QR Code GPX Placeholder */}
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

              {/* 4. Nomor BIB Dinamis */}
              <text
                x="1420"
                y={bibOffsetY}
                className="bib-text-num"
                fontSize={bibFontSize}
                letterSpacing={letterSpacing}
              >
                {bibNumber.trim().toUpperCase()}
              </text>

              {/* 5. Nama Pelari Dinamis */}
              <text
                x="1420"
                y={nameOffsetY}
                className="bib-text-name"
                fontSize={actualNameSize}
                letterSpacing={4}
              >
                {cleanName}
              </text>
            </svg>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* 3. Action Toolbar (Download PNG 300 DPI, Download SVG, Print) */}
      <div className="p-4 sm:p-5 bg-white flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-black/5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Download PNG Button */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isDownloading}
            className="px-5 py-2.5 bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            title="Download gambar resolusi cetak asli 300 DPI (2483 x 1774 px)"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Memproses PNG...' : 'Download BIB (PNG 300 DPI)'}</span>
          </button>

          {/* Print Button */}
          {/* <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            title="Cetak langsung menggunakan printer Anda"
          >
            <Printer className="w-4 h-4 text-[#C9A227]" />
            <span>Print Langsung</span>
          </button> */}
        </div>

        {/* Toggle Customizer Accordion */}
        {/* {showCustomizer && (
          <button
            type="button"
            onClick={() => setIsExpandedControls(!isExpandedControls)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-black/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>{isExpandedControls ? 'Sembunyikan Pengaturan' : 'Kustomisasi Tampilan'}</span>
            {isExpandedControls ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        )} */}
      </div>

      {/* 4. Collapsible Customization Panel (Same controls as in bib-generator) */}
      {showCustomizer && isExpandedControls && (
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-black/5 space-y-5 animate-[fadeIn_0.3s_ease-out] print:hidden">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#C9A227]" />
              <span>Pengaturan Format Teks & QR Code</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setBibFontSize(340);
                setNameFontSize(76);
                setBibOffsetY(880);
                setNameOffsetY(1175);
                setIsItalic(true);
                setLetterSpacing(14);
                setShowBioQr(true);
                setShowGpxQr(true);
              }}
              className="text-[11px] font-semibold text-[#C9A227] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          {/* Input Edit Data Kartu (Nomor BIB & Nama) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-black/5 shadow-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Edit Nomor BIB
              </label>
              <input
                type="text"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value.toUpperCase())}
                placeholder="Contoh: M-00001"
                maxLength={12}
                className="w-full bg-slate-50 border border-black/10 focus:border-[#C9A227] rounded-xl px-3.5 py-2 text-xs font-mono font-bold tracking-wider outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Edit Nama Lengkap Pelari
              </label>
              <input
                type="text"
                value={runnerName}
                onChange={(e) => setRunnerName(e.target.value.toUpperCase())}
                placeholder="NAMA LENGKAP PELARI"
                className="w-full bg-slate-50 border border-black/10 focus:border-[#C9A227] rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Kolom 1: Ukuran Font & Posisi */}
            <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
              <span className="font-bold text-slate-800 block text-xs">Ukuran & Posisi Teks</span>

              {/* Slider Font BIB */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Ukuran Font BIB:</span>
                  <span className="font-mono font-bold text-slate-900">{bibFontSize}px</span>
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

              {/* Posisi Vertikal BIB */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Posisi Vertikal BIB (Y):</span>
                  <span className="font-mono font-bold text-slate-900">{bibOffsetY}px</span>
                </div>
                <input
                  type="range"
                  min="700"
                  max="1050"
                  step="5"
                  value={bibOffsetY}
                  onChange={(e) => setBibOffsetY(Number(e.target.value))}
                  className="w-full accent-[#C9A227] cursor-pointer"
                />
              </div>

              {/* Slider Font Nama */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Ukuran Font Nama:</span>
                  <span className="font-mono font-bold text-slate-900">{nameFontSize}px</span>
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

              {/* Posisi Vertikal Nama */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Posisi Vertikal Nama (Y):</span>
                  <span className="font-mono font-bold text-slate-900">{nameOffsetY}px</span>
                </div>
                <input
                  type="range"
                  min="1050"
                  max="1300"
                  step="5"
                  value={nameOffsetY}
                  onChange={(e) => setNameOffsetY(Number(e.target.value))}
                  className="w-full accent-[#C9A227] cursor-pointer"
                />
              </div>
            </div>

            {/* Kolom 2: Gaya Font & QR Code */}
            <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
              <span className="font-bold text-slate-800 block text-xs">Gaya Tipografi & QR Code</span>

              {/* Slider Letter Spacing */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Jarak Huruf BIB:</span>
                  <span className="font-mono font-bold text-slate-900">{letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-[#C9A227] cursor-pointer"
                />
              </div>

              {/* Toggle Italic */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600 font-medium">Gaya Miring BIB:</span>
                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${isItalic
                    ? 'bg-[#C9A227] text-[#0d1c32]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {isItalic ? 'Italic (Miring)' : 'Normal (Tegak)'}
                </button>
              </div>

              {/* QR Code Checkboxes */}
              <div className="pt-2 border-t border-black/5 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-black/5">
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">QR Code BIO Peserta</span>
                    <span className="text-[10px] text-slate-500">Tautan verifikasi resmi</span>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-card-bio"
                    checked={showBioQr}
                    onChange={(e) => setShowBioQr(e.target.checked)}
                    className="rounded border-slate-300 text-[#C9A227] focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-black/5">
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">QR Code GPX Rute</span>
                    <span className="text-[10px] text-slate-500">Tautan rute lintasan GPX</span>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-card-gpx"
                    checked={showGpxQr}
                    onChange={(e) => setShowGpxQr(e.target.checked)}
                    className="rounded border-slate-300 text-[#C9A227] focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
