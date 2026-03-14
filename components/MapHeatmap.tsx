'use client';

import { useEffect, useRef } from 'react';
import type { ComplaintWithImages } from '@/types';

interface MapHeatmapProps {
  complaints: ComplaintWithImages[];
  height?: string;
}

/** Color for each crime type used in the heatmap and legend */
export const CRIME_TYPE_COLORS: Record<string, string> = {
  Robbery: '#DC2626',           // red
  Murder: '#7F1D1D',            // dark red / crimson
  Assault: '#EA580C',           // orange
  Theft: '#7C3AED',             // purple
  Harassment: '#DB2777',        // pink
  'Missing Person': '#2563EB',  // blue
  Other: '#6B7280',             // gray
};

const DEFAULT_COLOR = '#6B7280';

/** Returns the dominant crime type within a grid cell */
function getDominantType(types: string[]): string {
  const counts: Record<string, number> = {};
  for (const t of types) {
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Other';
}

/**
 * MapHeatmap – renders a Leaflet map with a colour-coded crime-type heatmap
 * overlay. Nearby complaints are grouped into 0.5° grid cells. Each cell is
 * drawn as a semi-transparent rectangle coloured by the most frequent crime
 * type in that cell.  Individual complaint markers are also rendered on top.
 */
export default function MapHeatmap({ complaints, height = '550px' }: MapHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatLayersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerLayersRef = useRef<any[]>([]);

  // Initialise the map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([20.5937, 78.9629], 5);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      renderLayers(L, map, complaints);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update layers when complaints change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      // Remove existing heat cells
      heatLayersRef.current.forEach((l) => map.removeLayer(l));
      heatLayersRef.current = [];
      // Remove existing markers
      markerLayersRef.current.forEach((l) => map.removeLayer(l));
      markerLayersRef.current = [];
      renderLayers(L, map, complaints);
    });
  }, [complaints]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderLayers(L: any, map: any, data: ComplaintWithImages[]) {
    const valid = data.filter((c) => c.latitude != null && c.longitude != null);

    // ── Grid-based heatmap ─────────────────────────────────────────────────
    const CELL = 0.5; // degrees
    const grid: Record<string, string[]> = {};
    valid.forEach((c) => {
      const row = Math.floor(c.latitude! / CELL);
      const col = Math.floor(c.longitude! / CELL);
      const key = `${row}_${col}`;
      if (!grid[key]) grid[key] = [];
      grid[key]!.push(c.issue_type);
    });

    Object.entries(grid).forEach(([key, types]) => {
      const [rowStr, colStr] = key.split('_');
      const row = Number(rowStr);
      const col = Number(colStr);
      const south = row * CELL;
      const north = south + CELL;
      const west = col * CELL;
      const east = west + CELL;

      const dominant = getDominantType(types);
      const color = CRIME_TYPE_COLORS[dominant] ?? DEFAULT_COLOR;
      const intensity = Math.min(0.55, 0.15 + types.length * 0.08);

      const rect = L.rectangle(
        [
          [south, west],
          [north, east],
        ],
        {
          color: color,
          weight: 0.5,
          fillColor: color,
          fillOpacity: intensity,
          opacity: 0.4,
        }
      ).addTo(map);

      rect.bindTooltip(
        `<strong>${dominant}</strong><br/>${types.length} report${types.length !== 1 ? 's' : ''} in this area`,
        { sticky: true, className: 'text-xs' }
      );

      heatLayersRef.current.push(rect);
    });

    // ── Individual markers (small dots) ───────────────────────────────────
    valid.forEach((c) => {
      const color = CRIME_TYPE_COLORS[c.issue_type] ?? DEFAULT_COLOR;
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:10px;height:10px;
          border-radius:50%;
          background:${color};
          border:2px solid white;
          box-shadow:0 1px 3px rgba(0,0,0,0.5)">
        </div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const marker = L.marker([c.latitude!, c.longitude!], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:180px;font-family:sans-serif;font-size:12px">
          <p style="font-weight:700;margin:0 0 3px">${c.complaint_id}</p>
          <p style="margin:2px 0"><strong>Type:</strong> ${c.issue_type}</p>
          <p style="margin:2px 0"><strong>Status:</strong> ${c.status}</p>
          <p style="margin:2px 0">${c.description.slice(0, 80)}${c.description.length > 80 ? '…' : ''}</p>
        </div>
      `);
      markerLayersRef.current.push(marker);
    });
  }

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg overflow-hidden shadow border border-gray-200"
    />
  );
}
