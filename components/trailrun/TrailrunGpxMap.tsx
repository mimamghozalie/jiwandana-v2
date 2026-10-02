'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { TrailrunWaypoint } from '@/lib/types';
import { Loader2, Layers, Maximize2, AlertCircle, Mountain, RefreshCw } from 'lucide-react';

interface TrailrunGpxMapProps {
  gpxUrl: string;
  routeTitle: string;
  routeDistance?: string;
  routeElevation?: string;
  waypoints?: TrailrunWaypoint[];
}

interface ParsedGpxData {
  trackpoints: [number, number][];
  elevations: number[];
  waypoints: Array<{
    lat: number;
    lon: number;
    name: string;
    desc?: string;
    ele?: number;
  }>;
  minEle: number;
  maxEle: number;
}

export default function TrailrunGpxMap({
  gpxUrl,
  routeTitle,
  routeDistance,
  routeElevation,
  waypoints = [],
}: TrailrunGpxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<Record<string, any>>({});
  const polylineRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'topo' | 'satellite' | 'osm'>('topo');
  const [stats, setStats] = useState<{ pointCount: number; minEle: number; maxEle: number } | null>(null);

  // Helper to parse GPX XML string via DOMParser
  const parseGpx = (xmlText: string): ParsedGpxData => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const trkpts = xmlDoc.getElementsByTagName('trkpt');
    const trackpoints: [number, number][] = [];
    const elevations: number[] = [];

    let minEle = Infinity;
    let maxEle = -Infinity;

    for (let i = 0; i < trkpts.length; i++) {
      const pt = trkpts[i];
      const lat = parseFloat(pt.getAttribute('lat') || '0');
      const lon = parseFloat(pt.getAttribute('lon') || '0');
      if (!isNaN(lat) && !isNaN(lon)) {
        trackpoints.push([lat, lon]);

        const eleNode = pt.getElementsByTagName('ele')[0];
        if (eleNode && eleNode.textContent) {
          const ele = parseFloat(eleNode.textContent);
          if (!isNaN(ele)) {
            elevations.push(ele);
            if (ele < minEle) minEle = ele;
            if (ele > maxEle) maxEle = ele;
          }
        }
      }
    }

    // Parse <wpt>
    const wpts = xmlDoc.getElementsByTagName('wpt');
    const gpxWaypoints: ParsedGpxData['waypoints'] = [];
    for (let i = 0; i < wpts.length; i++) {
      const wpt = wpts[i];
      const lat = parseFloat(wpt.getAttribute('lat') || '0');
      const lon = parseFloat(wpt.getAttribute('lon') || '0');
      const name = wpt.getElementsByTagName('name')[0]?.textContent || `Titik ${i + 1}`;
      const desc = wpt.getElementsByTagName('desc')[0]?.textContent || '';
      const ele = parseFloat(wpt.getElementsByTagName('ele')[0]?.textContent || '0');
      if (!isNaN(lat) && !isNaN(lon)) {
        gpxWaypoints.push({ lat, lon, name, desc, ele });
      }
    }

    return {
      trackpoints,
      elevations,
      waypoints: gpxWaypoints,
      minEle: minEle === Infinity ? 0 : Math.round(minEle),
      maxEle: maxEle === -Infinity ? 0 : Math.round(maxEle),
    };
  };

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet so it never executes during SSR
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix Leaflet default icon path issues in bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        // Initial center on Mount Penanggungan / Pawitra Mojokerto
        const map = L.map(mapContainerRef.current, {
          center: [-7.60749, 112.58863],
          zoom: 14,
          zoomControl: false,
        });

        // Add Zoom Control at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile Layers
        const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '&copy; OpenTopoMap contributors',
        });

        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          }
        );

        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });

        // Add default Topo layer
        topoLayer.addTo(map);

        layersRef.current = {
          topo: topoLayer,
          satellite: satelliteLayer,
          osm: osmLayer,
        };

        mapInstanceRef.current = map;
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Layer
  const switchLayer = (type: 'topo' | 'satellite' | 'osm') => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current) return;

    Object.values(layersRef.current).forEach((l) => map.removeLayer(l));
    layersRef.current[type]?.addTo(map);
    setActiveLayer(type);
  };

  // Fetch, Parse, and Render GPX data whenever gpxUrl changes
  useEffect(() => {
    if (!gpxUrl) return;

    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadGpx = async () => {
      try {
        const res = await fetch(gpxUrl);
        if (!res.ok) {
          throw new Error(`File GPX tidak ditemukan (HTTP ${res.status})`);
        }
        const xmlText = await res.text();
        if (isCancelled) return;

        const parsed = parseGpx(xmlText);
        if (parsed.trackpoints.length === 0) {
          throw new Error('Tidak ada titik koordinat lintasan dalam file GPX ini.');
        }

        setStats({
          pointCount: parsed.trackpoints.length,
          minEle: parsed.minEle,
          maxEle: parsed.maxEle,
        });

        // Now render on map using Leaflet
        const L = await import('leaflet');
        const map = mapInstanceRef.current;
        if (!map || isCancelled) return;

        // Clear existing polylines and markers
        if (polylineRef.current) {
          map.removeLayer(polylineRef.current);
          polylineRef.current = null;
        }
        if (markersLayerRef.current) {
          map.removeLayer(markersLayerRef.current);
          markersLayerRef.current = null;
        }

        const featureGroup = L.featureGroup();

        // 1. Draw glowing polyline
        // Casing/shadow line for high visibility on both satellite & contour map
        const casingLine = L.polyline(parsed.trackpoints, {
          color: '#0d1c32',
          weight: 7,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        });

        // Core gold line
        const mainLine = L.polyline(parsed.trackpoints, {
          color: '#C9A227',
          weight: 4.5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        });

        casingLine.addTo(featureGroup);
        mainLine.addTo(featureGroup);
        polylineRef.current = featureGroup;
        featureGroup.addTo(map);

        // 2. Add Start & Finish Markers
        const markersGroup = L.layerGroup();
        const startPt = parsed.trackpoints[0];
        const finishPt = parsed.trackpoints[parsed.trackpoints.length - 1];

        // Start Icon
        const startIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color:#10b981; color:#ffffff; font-weight:bold; font-size:10px; padding:3px 8px; border-radius:9999px; border:2px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.5); display:flex; align-items:center; gap:3px; white-space:nowrap;"><span>START</span></div>`,
          iconSize: [50, 24],
          iconAnchor: [25, 12],
        });

        // Finish Icon
        const finishIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color:#e11d48; color:#ffffff; font-weight:bold; font-size:10px; padding:3px 8px; border-radius:9999px; border:2px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.5); display:flex; align-items:center; gap:3px; white-space:nowrap;"><span>FINISH</span></div>`,
          iconSize: [55, 24],
          iconAnchor: [27, 12],
        });

        if (startPt) {
          L.marker(startPt, { icon: startIcon })
            .bindPopup(`<div style="font-family:sans-serif; font-size:12px;"><strong>Start Gate</strong><br>Lapangan Utama Majapahit</div>`)
            .addTo(markersGroup);
        }

        if (finishPt) {
          // If finish is very close to start (< 50m), offset slightly for readability
          const isLoop = Math.abs(startPt[0] - finishPt[0]) < 0.0003 && Math.abs(startPt[1] - finishPt[1]) < 0.0003;
          const finishPos: [number, number] = isLoop
            ? [finishPt[0] + 0.0002, finishPt[1] + 0.0002]
            : finishPt;

          L.marker(finishPos, { icon: finishIcon })
            .bindPopup(`<div style="font-family:sans-serif; font-size:12px;"><strong>Finish Gate</strong><br>Garis Akhir Perlombaan</div>`)
            .addTo(markersGroup);
        }

        // 3. Add GPX Waypoints or JSON waypoints as interactive markers
        parsed.waypoints.forEach((wp, idx) => {
          const wpIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background-color:#0d1c32; color:#C9A227; font-size:11px; font-weight:bold; width:26px; height:26px; border-radius:50%; border:2px solid #C9A227; box-shadow:0 3px 8px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center;">${idx + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          L.marker([wp.lat, wp.lon], { icon: wpIcon })
            .bindPopup(`
              <div style="font-family:sans-serif; font-size:12px; min-width:140px;">
                <strong style="color:#0d1c32; font-size:13px;">${wp.name}</strong>
                ${wp.desc ? `<p style="margin:4px 0; color:#64748b;">${wp.desc}</p>` : ''}
                ${wp.ele ? `<div style="margin-top:4px; font-size:11px; color:#C9A227; font-weight:bold;">Elevasi: ${wp.ele} m dpl</div>` : ''}
              </div>
            `)
            .addTo(markersGroup);
        });

        markersLayerRef.current = markersGroup;
        markersGroup.addTo(map);

        // Auto Zoom to Route
        map.fitBounds(mainLine.getBounds(), {
          padding: [50, 50],
          maxZoom: 16,
        });

        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error rendering GPX map:', err);
          setError(err.message || 'Gagal memuat rute GPX');
          setLoading(false);
        }
      }
    };

    loadGpx();

    return () => {
      isCancelled = true;
    };
  }, [gpxUrl]);

  const handleResetView = () => {
    if (mapInstanceRef.current && polylineRef.current) {
      mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), {
        padding: [50, 50],
      });
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-950 overflow-hidden font-sans">
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
          <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Memuat peta navigasi GPS ({routeTitle})...
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {error && !loading && (
        <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white">
          <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Peta GPX Belum Dapat Ditampilkan</h4>
          <p className="text-xs text-slate-400 max-w-md mb-4">{error}</p>
          <a
            href={gpxUrl}
            download
            className="px-4 py-2 bg-[#C9A227] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#d1a751] transition-colors"
          >
            Unduh File GPX Langsung
          </a>
        </div>
      )}

      {/* Floating Map Controls Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Switcher (Top Left) */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-xl p-1 flex items-center gap-1 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => switchLayer('topo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'topo'
                ? 'bg-[#C9A227] text-[#0d1c32] font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            🏔️ Topografi
          </button>
          <button
            type="button"
            onClick={() => switchLayer('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'satellite'
                ? 'bg-[#C9A227] text-[#0d1c32] font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            🛰️ Satelit
          </button>
          <button
            type="button"
            onClick={() => switchLayer('osm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'osm'
                ? 'bg-[#C9A227] text-[#0d1c32] font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            🗺️ Street
          </button>
        </div>

        {/* Center / Reset Button (Top Right) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleResetView}
            className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-xl text-xs flex items-center gap-1.5"
            title="Pusatkan Rute"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="hidden sm:inline text-[11px] font-semibold">Reset View</span>
          </button>
        </div>
      </div>

      {/* Floating Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-[#C9A227]" />
            <span className="font-semibold text-white">Jalur Lintasan Lomba</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Start Gate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Finish Gate</span>
          </div>
          {stats && stats.maxEle > 0 && (
            <div className="pt-1 border-t border-white/10 text-[10px] text-slate-400">
              Elevasi: {stats.minEle}m - {stats.maxEle}m dpl ({stats.pointCount} titik GPS)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
