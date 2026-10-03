'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TrailrunRoute } from '@/lib/types';

const TrailrunGpxMap = dynamic(() => import('@/components/trailrun/TrailrunGpxMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] sm:h-[480px] bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
      <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">
        Menyiapkan Peta Leaflet GPS...
      </span>
    </div>
  ),
});

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
  const safeActiveKey = routeKeys.includes(activeRouteKey) ? activeRouteKey : (routeKeys[0] || '3k');
  const activeRoute = routes?.[safeActiveKey] || Object.values(routes || {})[0];

  if (!activeRoute) return null;
  const currentKey = safeActiveKey.toLowerCase();

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
              className={`px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center gap-2 cursor-pointer ${safeActiveKey === key
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
        <div className="border border-black/10 rounded-2xl overflow-hidden bg-white text-slate-800 shadow-sm">
          {/* Map Header Bar */}
          <div className="px-6 py-4 bg-slate-50 border-b border-black/10 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
                <span className="material-symbols-outlined text-lg">map</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wide font-sans">
                  MAPS: {activeRoute.title}
                </h4>
                <span className="text-[11px] text-slate-500">
                  Satelit & Topografi Jalur Lintas Candi Majapahit
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-slate-700 shadow-xs">
                Total Jarak: <strong className="text-slate-900">{activeRoute.distance}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#C9A227]/10 text-[#a37f17] border border-[#C9A227]/30 font-bold shadow-xs">
                Elevasi: <strong>{activeRoute.elevation}</strong>
              </span>
            </div>
          </div>

          {/* Real Interactive Leaflet GPX Map */}
          {/* <TrailrunGpxMap
            key={currentKey}
            gpxUrl={activeRoute.gpxFile || `/routes/${currentKey}.gpx`}
            routeTitle={activeRoute.title}
            routeDistance={activeRoute.distance}
            routeElevation={activeRoute.elevation}
            waypoints={activeRoute.waypoints}
          /> */}

          {/* Waypoints Sequence List */}
          {/* <div className="p-6 bg-slate-50/70 border-t border-black/10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] block mb-3">
              Titik Lintasan & Pos Pantau:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeRoute.waypoints.map((wp, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white border border-black/10 flex items-center justify-between text-xs shadow-xs hover:border-[#C9A227]/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 block font-semibold">{wp.name}</strong>
                    <span className="text-slate-500 text-[11px]">{wp.type}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[#C9A227] font-bold block">{wp.km}</span>
                    <span className="text-slate-400 text-[10px]">{wp.elev}</span>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* BOX 2: Data Rute & Elevation Profile (Below MAPS) */}
        <div className="bg-[#f8f8f8] border border-black/10 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/10 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">
                Profil Ketinggian
              </span>
              {/* <h3 className="text-xl font-bold font-serif text-slate-900">
                Grafik Elevasi (Altitude Profile)
              </h3> */}
            </div>
            {/* <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Puncak Tertinggi:</span>
              <span className="px-3 py-1 bg-white border border-black/10 rounded-lg text-xs font-bold text-[#C9A227]">
                {activeRoute.maxAlt}
              </span>
            </div> */}
          </div>

          {/* SVG Elevation Graph */}
          {/* <div className="space-y-2">
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
          </div> */}

          {/* Summary Grid of Track Characteristics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
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

          </div>

          {/* Download GPX Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#C9A227]/30">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#C9A227]">download_for_offline</span>
              <div>
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  File Navigasi GPS (.GPX) - {activeRoute.title}
                </h5>
                <p className="text-[11px] text-slate-500">
                  Kompatibel dengan jam Garmin, Suunto, Coros, serta aplikasi Strava &amp; Komoot.
                </p>
              </div>
            </div>

            <a
              href={activeRoute.gpxFile || `/routes/pawitra-trailrun-${currentKey}.gpx`}
              download={`pawitra-trailrun-${currentKey}.gpx`}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer no-underline"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Unduh File GPX ({safeActiveKey.toUpperCase()})</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
