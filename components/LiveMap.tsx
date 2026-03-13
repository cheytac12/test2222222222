'use client';

import { useEffect, useRef } from 'react';
import type { Complaint } from '@/types';
import { getMarkerColor, getStatusColor } from '@/lib/utils';

interface LiveMapProps {
  complaints: Complaint[];
  height?: string;
}

/**
 * LiveMap – renders all complaints as color-coded Leaflet markers.
 * Loaded dynamically (no SSR) because Leaflet requires window.
 */
export default function LiveMap({ complaints, height = '600px' }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([20, 0], 2);
      mapInstanceRef.current = map;

      // OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      addMarkers(L, map, complaints);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when complaints change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      // Remove existing markers
      map.eachLayer((layer: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((layer as any) instanceof L.Marker) map.removeLayer(layer as Parameters<typeof map.removeLayer>[0]);
      });
      addMarkers(L, map, complaints);
    });
  }, [complaints]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg overflow-hidden shadow border border-gray-200"
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addMarkers(L: any, map: any, complaints: Complaint[]) {
  complaints.forEach((c) => {
    if (c.latitude == null || c.longitude == null) return;

    const color = getMarkerColor(c.status);
    const statusCss = getStatusColor(c.status);

    // Custom colored circle marker
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:14px;height:14px;
        border-radius:50%;
        background:${color};
        border:2px solid white;
        box-shadow:0 1px 3px rgba(0,0,0,0.4)">
      </div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([c.latitude, c.longitude], { icon }).addTo(map);

    marker.bindPopup(`
      <div style="min-width:180px;font-family:sans-serif;font-size:13px">
        <p style="font-weight:700;margin:0 0 4px">${c.complaint_id}</p>
        <p style="margin:2px 0"><strong>Type:</strong> ${c.issue_type}</p>
        <p style="margin:2px 0"><strong>Description:</strong> ${c.description.slice(0, 80)}${c.description.length > 80 ? '…' : ''}</p>
        <p style="margin:4px 0 0">
          <span style="
            display:inline-block;padding:2px 8px;border-radius:9999px;
            font-size:11px;font-weight:600;
            background:${color}22;color:${color};border:1px solid ${color}44">
            ${c.status}
          </span>
        </p>
      </div>
    `);
  });
}

// Re-export status info for legend use
export { getMarkerColor, getStatusColor };
