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

interface GpxElevPoint {
  ele: number;
  distKm: number;
}

interface GpxElevationData {
  points: GpxElevPoint[];
  minEle: number;
  maxEle: number;
  totalGain: number;
  totalDistKm: number;
}

export default function TrailrunRouteSection({
  routes,
  activeRouteKey,
  onSelectRouteKey,
}: TrailrunRouteSectionProps) {
  const routeKeys = Object.keys(routes || {});
  const safeActiveKey = routeKeys.includes(activeRouteKey) ? activeRouteKey : (routeKeys[0] || '3k');
  const activeRoute = routes?.[safeActiveKey] || Object.values(routes || {})[0];

  const [gpxEleData, setGpxEleData] = React.useState<GpxElevationData | null>(null);
  const [hoverPoint, setHoverPoint] = React.useState<{
    ele: number;
    distKm: number;
    xPercent: number;
    yPercent: number;
  } | null>(null);

  const graphContainerRef = React.useRef<HTMLDivElement>(null);

  const currentKey = safeActiveKey.toLowerCase();
  const gpxUrl = activeRoute?.gpxFile || `/routes/${currentKey}.gpx`;

  // Reset hover state when active route changes
  React.useEffect(() => {
    setHoverPoint(null);
  }, [safeActiveKey]);

  // Parse real elevation points directly from GPX file
  React.useEffect(() => {
    if (!gpxUrl) return;

    let isCancelled = false;

    fetch(encodeURI(gpxUrl))
      .then((res) => {
        if (!res.ok) throw new Error(`GPX fetch failed (${res.status})`);
        return res.text();
      })
      .then((xmlText) => {
        if (isCancelled) return;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const trkpts = xmlDoc.getElementsByTagName('trkpt');

        const rawPoints: GpxElevPoint[] = [];
        let minEle = Infinity;
        let maxEle = -Infinity;
        let totalGain = 0;
        let prevEle: number | null = null;
        let runningDistMeters = 0;
        let prevLat: number | null = null;
        let prevLon: number | null = null;

        const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371000; // meters
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        for (let i = 0; i < trkpts.length; i++) {
          const pt = trkpts[i];
          const lat = parseFloat(pt.getAttribute('lat') || '0');
          const lon = parseFloat(pt.getAttribute('lon') || '0');
          if (prevLat !== null && prevLon !== null && !isNaN(lat) && !isNaN(lon)) {
            runningDistMeters += haversineMeters(prevLat, prevLon, lat, lon);
          }
          prevLat = lat;
          prevLon = lon;

          const eleNode = pt.getElementsByTagName('ele')[0];
          if (eleNode && eleNode.textContent) {
            const ele = parseFloat(eleNode.textContent);
            if (!isNaN(ele)) {
              rawPoints.push({
                ele: Math.round(ele),
                distKm: runningDistMeters / 1000,
              });
              if (ele < minEle) minEle = ele;
              if (ele > maxEle) maxEle = ele;
              if (prevEle !== null && ele > prevEle) {
                totalGain += ele - prevEle;
              }
              prevEle = ele;
            }
          }
        }

        if (rawPoints.length > 0) {
          // Downsample to 150 points for high-definition smooth SVG curve
          const targetPoints = Math.min(150, rawPoints.length);
          const sampled: GpxElevPoint[] = [];
          const step = (rawPoints.length - 1) / (targetPoints - 1);
          for (let i = 0; i < targetPoints; i++) {
            const idx = Math.min(rawPoints.length - 1, Math.round(i * step));
            sampled.push(rawPoints[idx]);
          }

          setGpxEleData({
            points: sampled,
            minEle: Math.round(minEle),
            maxEle: Math.round(maxEle),
            totalGain: Math.round(totalGain),
            totalDistKm: runningDistMeters / 1000,
          });
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('GPX elevation parse error, fallback to JSON:', err);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [gpxUrl]);

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
          <TrailrunGpxMap
            key={currentKey}
            gpxUrl={activeRoute.gpxFile || `/routes/${currentKey}.gpx`}
            routeTitle={activeRoute.title}
            routeDistance={activeRoute.distance}
            routeElevation={activeRoute.elevation}
            waypoints={activeRoute.waypoints}
          />

          {/* Waypoints Sequence List */}
          {/* {activeRoute.waypoints && activeRoute.waypoints.length > 0 && (
            <div className="p-6 bg-slate-50/70 border-t border-black/10">
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
            </div>
          )} */}
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
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {hoverPoint ? (
                <div className="px-3 py-1.5 bg-[#0d1c32] text-[#C9A227] border border-[#C9A227] rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-[fadeIn_0.2s_ease-out]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ketinggian: <strong className="text-white font-mono text-sm">{hoverPoint.ele.toLocaleString('id-ID')} m dpl</strong></span>
                  <span className="text-slate-300 font-normal">| KM {hoverPoint.distKm.toFixed(2)}</span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-black/10 shadow-xs">
                  <span className="material-symbols-outlined text-sm text-[#C9A227]">touch_app</span>
                  <span>Geser / sentuh grafik untuk cek ketinggian</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Puncak:</span>
                <span className="px-3 py-1 bg-white border border-black/10 rounded-lg text-xs font-bold text-[#C9A227] shadow-xs">
                  {gpxEleData ? `${gpxEleData.maxEle.toLocaleString('id-ID')} m dpl` : activeRoute.maxAlt}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Elevation Graph with Interactive Scrubber */}
          {(() => {
            const fallbackPoints: GpxElevPoint[] = (activeRoute.elevationPoints || []).map((ele, idx, arr) => ({
              ele,
              distKm: (idx / Math.max(1, arr.length - 1)) * (parseFloat(activeRoute.distance || '10') || 10),
            }));
            const points: GpxElevPoint[] = gpxEleData?.points || fallbackPoints;
            if (!points || points.length < 2) return null;

            const maxVal = gpxEleData?.maxEle || Math.max(...points.map((p) => p.ele));
            const minVal = gpxEleData?.minEle || Math.min(...points.map((p) => p.ele));
            const range = Math.max(1, maxVal - minVal);
            const displayMax = gpxEleData ? `${gpxEleData.maxEle.toLocaleString('id-ID')} m dpl` : activeRoute.maxAlt;

            const handleScrub = (clientX: number) => {
              if (!graphContainerRef.current) return;
              const rect = graphContainerRef.current.getBoundingClientRect();
              const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
              const ratio = clampedX / rect.width;
              const idx = Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1))));
              const pt = points[idx];
              const ySvg = 185 - ((pt.ele - minVal) / range) * 150;

              setHoverPoint({
                ele: pt.ele,
                distKm: pt.distKm,
                xPercent: (idx / (points.length - 1)) * 100,
                yPercent: (ySvg / 200) * 100,
              });
            };

            return (
              <div className="space-y-2">
                <div
                  ref={graphContainerRef}
                  onMouseMove={(e) => handleScrub(e.clientX)}
                  onMouseLeave={() => setHoverPoint(null)}
                  onTouchMove={(e) => {
                    if (e.touches && e.touches[0]) {
                      handleScrub(e.touches[0].clientX);
                    }
                  }}
                  onTouchEnd={() => setHoverPoint(null)}
                  className="h-48 sm:h-56 w-full bg-white border border-black/10 rounded-xl p-4 flex items-end relative overflow-hidden cursor-crosshair select-none touch-none shadow-xs"
                >
                  <svg
                    viewBox="0 0 1000 200"
                    className="w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`elevFill-${currentKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#C9A227" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#C9A227" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>

                    <polygon
                      points={`0,200 ${points
                        .map((pt, idx) => {
                          const x = (idx / (points.length - 1)) * 1000;
                          const y = 185 - ((pt.ele - minVal) / range) * 150;
                          return `${x},${y}`;
                        })
                        .join(' ')} 1000,200`}
                      fill={`url(#elevFill-${currentKey})`}
                    />

                    <polyline
                      points={points
                        .map((pt, idx) => {
                          const x = (idx / (points.length - 1)) * 1000;
                          const y = 185 - ((pt.ele - minVal) / range) * 150;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#C9A227"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive Scrubber Crosshair on SVG */}
                    {hoverPoint && (
                      <g>
                        <line
                          x1={hoverPoint.xPercent * 10}
                          y1={10}
                          x2={hoverPoint.xPercent * 10}
                          y2={200}
                          stroke="#C9A227"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                          opacity="0.85"
                        />
                        <circle
                          cx={hoverPoint.xPercent * 10}
                          cy={hoverPoint.yPercent * 2}
                          r="7"
                          fill="#C9A227"
                          fillOpacity="0.3"
                        />
                        <circle
                          cx={hoverPoint.xPercent * 10}
                          cy={hoverPoint.yPercent * 2}
                          r="4.5"
                          fill="#0d1c32"
                          stroke="#C9A227"
                          strokeWidth="2.5"
                        />
                      </g>
                    )}
                  </svg>

                  {/* Floating Tooltip Indicator */}
                  {hoverPoint && (
                    <div
                      className="absolute pointer-events-none transition-transform duration-75 z-20"
                      style={{
                        left: `${hoverPoint.xPercent}%`,
                        top: `${hoverPoint.yPercent}%`,
                        transform: `translate(${hoverPoint.xPercent > 80 ? '-100%' : hoverPoint.xPercent < 20 ? '0%' : '-50%'}, -120%)`,
                      }}
                    >
                      <div className="bg-[#0d1c32]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-xl border border-[#C9A227] flex flex-col items-center text-center whitespace-nowrap">
                        <span className="text-[10px] uppercase font-bold text-[#C9A227] tracking-wider leading-none">
                          KM {hoverPoint.distKm.toFixed(2)}
                        </span>
                        <span className="text-sm font-black text-white font-mono leading-tight mt-0.5">
                          {hoverPoint.ele.toLocaleString('id-ID')} m dpl
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 left-4 text-[10px] text-slate-400 font-sans font-medium pointer-events-none">
                    ▲ Max: {displayMax}
                  </div>
                  <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 font-sans font-medium pointer-events-none">
                    ▼ Min: {minVal.toLocaleString('id-ID')} m dpl
                  </div>
                  <div className="absolute bottom-2 right-4 text-[10px] text-slate-400 font-sans font-medium pointer-events-none">
                    Garis Finish: {activeRoute.distance}
                  </div>
                </div>

                <div className="flex sm:hidden justify-between items-center px-1 text-[11px] text-slate-500 font-medium">
                  <span>Sentuh / geser jari pada grafik untuk melihat ketinggian</span>
                </div>
              </div>
            );
          })()}

          {/* Summary Grid of Track Characteristics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-black/10">
              <span className="text-[11px] text-slate-500 font-medium block">Total Elevasi</span>
              <strong className="text-base text-slate-900 font-bold">
                {gpxEleData ? `+${gpxEleData.totalGain.toLocaleString('id-ID')} m` : activeRoute.elevation}
              </strong>
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
              href={activeRoute.gpxFile || `/routes/${currentKey}.gpx`}
              download={activeRoute.gpxFile ? activeRoute.gpxFile.split('/').pop() : `pawitra-trailrun-${currentKey}.gpx`}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer no-underline"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Unduh GPX ({safeActiveKey.toUpperCase()})</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
