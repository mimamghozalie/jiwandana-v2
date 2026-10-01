'use client';

import React from 'react';
import { TrailrunRoute } from '@/lib/types';

interface TrailrunRouteSectionProps {
  routes: Record<string, TrailrunRoute>;
  activeRouteKey: string;
  onSelectRouteKey: (key: any) => void;
}

export default function TrailrunRouteSection({
  routes,
  activeRouteKey,
  onSelectRouteKey,
}: TrailrunRouteSectionProps) {
  const routeKeys = Object.keys(routes || {});
  const safeActiveKey = routeKeys.includes(activeRouteKey) ? activeRouteKey : (routeKeys[0] || '10k');
  const activeRoute = routes?.[safeActiveKey] || Object.values(routes || {})[0];

  if (!activeRoute) return null;

  return (
    <section id="rute" className="py-16 md:py-24 bg-white border-t border-black/10">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Header as drawn in sketch: data rute & elevasi / Navigasi Lintasan */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227] block">
            Navigasi Lintasan
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-wide capitalize">
            Data Rute & Elevasi
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto">
            Pelajari kontur medan, titik hidrasi, cagar budaya yang dilintasi, serta profil ketinggian
            lintasan lomba.
          </p>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3">
          {routeKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectRouteKey(key)}
              className={`px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center gap-2 cursor-pointer ${
                safeActiveKey === key
                  ? 'bg-[#C9A227] text-[#0d1c32] font-bold shadow-md'
                  : 'bg-[#f8f8f8] border border-black/10 text-slate-600 hover:border-[#C9A227] hover:text-[#C9A227]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">sprint</span>
              <span>Rute {key.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* BOX 1: MAPS (Interactive visual map + waypoint list) */}
        <div className="border border-black/10 rounded-2xl overflow-hidden bg-slate-950 text-white shadow-xl">
          {/* Map Header Bar */}
          <div className="px-6 py-4 bg-slate-900 border-b border-white/10 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227] flex items-center justify-center text-[#C9A227]">
                <span className="material-symbols-outlined text-lg">map</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  MAPS: {activeRoute.title}
                </h4>
                <span className="text-[11px] text-slate-400">
                  Satelit & Topografi Jalur Lintas Candi Majapahit
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded bg-white/10 border border-white/15">
                Total Jarak: <strong>{activeRoute.distance}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40">
                Elevasi: <strong>{activeRoute.elevation}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Visual Map Canvas / SVG */}
          <div className="relative h-[380px] sm:h-[450px] w-full bg-[#0a1424] overflow-hidden flex items-center justify-center">
            {/* Stylized Topographic Grid Lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C9A227" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Dynamic Animated Route Path */}
            <svg
              viewBox="0 0 800 400"
              className="w-full h-full max-w-4xl p-8 transition-all duration-700"
            >
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A227" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Trail line */}
              {activeRouteKey === '5k' && (
                <path
                  d="M 100 280 C 180 180, 260 220, 360 140 C 460 80, 560 220, 680 200 C 600 320, 300 360, 100 280 Z"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                  className="drop-shadow-lg"
                />
              )}

              {activeRouteKey === '10k' && (
                <path
                  d="M 80 320 C 150 140, 280 260, 400 80 C 520 60, 640 180, 720 120 C 750 260, 500 360, 320 340 C 180 380, 100 350, 80 320 Z"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                  className="drop-shadow-lg"
                />
              )}

              {activeRouteKey === '21k' && (
                <path
                  d="M 60 340 C 120 120, 200 80, 320 60 C 420 40, 500 160, 620 40 C 740 60, 780 260, 700 340 C 580 380, 420 300, 300 370 C 160 380, 80 360, 60 340 Z"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                  className="drop-shadow-lg"
                />
              )}

              {activeRouteKey === '38k' && (
                <path
                  d="M 60 340 C 100 100, 220 50, 340 40 C 460 30, 540 120, 660 30 C 760 50, 790 280, 690 350 C 560 390, 400 310, 280 380 C 150 390, 70 370, 60 340 Z"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                  className="drop-shadow-lg"
                />
              )}

              {/* Waypoint Markers */}
              <circle cx="100" cy="280" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x="115" y="285" fill="#10b981" fontSize="12" fontWeight="bold">
                START / FINISH
              </text>

              <circle cx="360" cy="140" r="7" fill="#C9A227" stroke="#ffffff" strokeWidth="2" />
              <text x="375" y="145" fill="#C9A227" fontSize="11" fontWeight="bold">
                WS 1 (Candi Bajang Ratu)
              </text>

              <circle cx="560" cy="220" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text x="575" y="225" fill="#f59e0b" fontSize="11" fontWeight="bold">
                WS 2 (Candi Tikus)
              </text>
            </svg>

            {/* Map Floating Legend */}
            <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-[11px] space-y-1 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Start & Finish Arena (GOR / Lapangan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
                <span>Pos Minum (Water Station) & Medis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Situs Purbakala Kerajaan Majapahit</span>
              </div>
            </div>
          </div>

          {/* Waypoints Sequence List */}
          <div className="p-6 bg-slate-900/95 border-t border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A227] block mb-3">
              Titik Lintasan & Pos Pantau:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeRoute.waypoints.map((wp, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <strong className="text-white block font-medium">{wp.name}</strong>
                    <span className="text-slate-400 text-[11px]">{wp.type}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[#C9A227] font-bold block">{wp.km}</span>
                    <span className="text-slate-400 text-[10px]">{wp.elev}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOX 2: Data Rute & Elevation Profile (Below MAPS) */}
        <div className="bg-[#f8f8f8] border border-black/10 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/10 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">
                Profil Ketinggian
              </span>
              <h3 className="text-xl font-bold font-serif text-slate-900">
                Grafik Elevasi (Altitude Profile)
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Puncak Tertinggi:</span>
              <span className="px-3 py-1 bg-white border border-black/10 rounded-lg text-xs font-bold text-[#C9A227]">
                {activeRoute.maxAlt}
              </span>
            </div>
          </div>

          {/* SVG Elevation Graph */}
          <div className="space-y-2">
            <div className="h-44 sm:h-52 w-full bg-white border border-black/10 rounded-xl p-4 flex items-end relative overflow-hidden">
              <svg
                viewBox="0 0 1000 200"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="elevFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C9A227" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#C9A227" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Gradient Area under curve */}
                <polygon
                  points={`0,200 ${activeRoute.elevationPoints
                    .map((val, idx) => {
                      const x = (idx / (activeRoute.elevationPoints.length - 1)) * 1000;
                      const y = 200 - (val / 1300) * 180;
                      return `${x},${y}`;
                    })
                    .join(' ')} 1000,200`}
                  fill="url(#elevFill)"
                />

                {/* Elevation Line */}
                <polyline
                  points={activeRoute.elevationPoints
                    .map((val, idx) => {
                      const x = (idx / (activeRoute.elevationPoints.length - 1)) * 1000;
                      const y = 200 - (val / 1300) * 180;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#C9A227"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Altitude markers */}
              <div className="absolute top-2 left-4 text-[10px] text-slate-400 font-sans font-medium">
                ▲ Max: {activeRoute.maxAlt}
              </div>
              <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 font-sans font-medium">
                ▼ Min: 110 m dpl
              </div>
              <div className="absolute bottom-2 right-4 text-[10px] text-slate-400 font-sans font-medium">
                Garis Finish: {activeRoute.distance}
              </div>
            </div>
          </div>

          {/* Summary Grid of Track Characteristics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-black/10">
              <span className="text-[11px] text-slate-500 font-medium block">Total Elevasi</span>
              <strong className="text-base text-slate-900 font-bold">{activeRoute.elevation}</strong>
            </div>
            <div className="p-4 rounded-xl bg-white border border-black/10">
              <span className="text-[11px] text-slate-500 font-medium block">Batas Waktu (COT)</span>
              <strong className="text-base text-slate-900 font-bold">{activeRoute.cot}</strong>
            </div>
            <div className="p-4 rounded-xl bg-white border border-black/10">
              <span className="text-[11px] text-slate-500 font-medium block">Hydration Point</span>
              <strong className="text-base text-slate-900 font-bold">{activeRoute.wsCount}</strong>
            </div>
            <div className="p-4 rounded-xl bg-white border border-black/10">
              <span className="text-[11px] text-slate-500 font-medium block">Karakter Lintasan</span>
              <strong className="text-xs text-slate-900 font-semibold block mt-0.5">
                Single Track ({activeRoute.surface.trail})
              </strong>
            </div>
          </div>

          {/* Download GPX Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#C9A227]/30">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#C9A227]">download_for_offline</span>
              <div>
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  File Navigasi GPS (.GPX)
                </h5>
                <p className="text-[11px] text-slate-500">
                  Kompatibel dengan jam Garmin, Suunto, Coros, serta aplikasi Strava.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(`File GPX untuk ${activeRoute.title} akan segera dirilis menjelang technical meeting.`);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Unduh File GPX</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
