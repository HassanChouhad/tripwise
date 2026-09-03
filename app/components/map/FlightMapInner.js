'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

function createPriceBubble(city, price, isSelected) {
  const bg = isSelected ? '#7C3AED' : '#1a73e8';
  return new L.DivIcon({
    className: '',
    html: `<div style="
      background:${bg};color:white;
      padding:4px 10px;border-radius:16px;
      font-size:12px;font-weight:700;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      cursor:pointer;
      display:flex;align-items:center;gap:4px;
      border:2px solid rgba(255,255,255,0.9);
      transition:transform 0.15s;
    ">€${Math.round(price)}</div>`,
    iconSize: [70, 28],
    iconAnchor: [35, 14]
  });
}

function createOriginIcon() {
  return new L.DivIcon({
    className: '',
    html: `<div style="
      background:#EF4444;color:white;
      width:12px;height:12px;border-radius:50%;
      box-shadow:0 0 0 4px rgba(239,68,68,0.3), 0 2px 6px rgba(0,0,0,0.3);
      border:2px solid white;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
}

function getCurvePoints(from, to, numPoints = 30) {
  const points = [];
  const lngDiff = to[1] - from[1];
  const latDiff = to[0] - from[0];
  const dist = Math.sqrt(lngDiff * lngDiff + latDiff * latDiff);
  const curvature = Math.min(dist * 0.15, 10);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = from[0] + latDiff * t;
    const lng = from[1] + lngDiff * t;
    const offset = curvature * Math.sin(Math.PI * t);
    const perpLat = -lngDiff / dist * offset;
    const perpLng = latDiff / dist * offset;
    points.push([lat + perpLat, lng + perpLng]);
  }
  return points;
}

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }
  }, [map, bounds]);
  return null;
}

function RecenterButton({ bounds }) {
  const map = useMap();
  return (
    <button
      onClick={() => bounds && bounds.isValid() && map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 })}
      title="Reset view"
      style={{
        position: 'absolute', top: '10px', right: '10px', zIndex: 1000,
        background: 'white', border: '2px solid rgba(0,0,0,0.2)', borderRadius: '4px',
        width: '34px', height: '34px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', lineHeight: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
      }}
    >⌖</button>
  );
}

export default function FlightMapInner({ originCity, cityCoords, destinations, onSelectRoute, selectedCities }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !originCity || !cityCoords[originCity]) return null;

  const origin = cityCoords[originCity];
  const originPos = [origin.lat, origin.lng];
  const hasSelected = selectedCities && selectedCities.length > 0;

  const allPoints = [originPos];
  const markers = destinations
    .filter(d => cityCoords[d.destinationCity])
    .map(d => {
      const dest = cityCoords[d.destinationCity];
      const destPos = [dest.lat, dest.lng];
      allPoints.push(destPos);
      const isSelected = selectedCities?.includes(d.destinationCity);
      return { ...d, destPos, isSelected };
    });

  const bounds = L.latLngBounds(allPoints);

  return (
    <MapContainer
      center={originPos}
      zoom={3}
      style={{ height: '100%', width: '100%', background: '#e8f4f8' }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <FitBounds bounds={bounds} />
      <RecenterButton bounds={bounds} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Origin dot */}
      <Marker position={originPos} icon={createOriginIcon()}>
        <Popup>
          <div style="text-align:center">
            <strong>{originCity}</strong><br/>
            <span style="color:#666;font-size:12px">Your departure</span>
          </div>
        </Popup>
      </Marker>

      {/* Route lines — only shown after a search */}
      {hasSelected && markers.filter(m => m.isSelected).map((m, idx, arr) => {
        const from = idx === 0 ? originPos : arr[idx - 1].destPos;
        const to = m.destPos;
        const curve = getCurvePoints(from, to);
        return (
          <Polyline
            key={`line-${m.destinationCity}`}
            positions={curve}
            pathOptions={{ color: '#7C3AED', weight: 2.5, opacity: 0.7, dashArray: '6, 4' }}
          />
        );
      })}

      {/* Price bubbles on destinations */}
      {markers.map((m) => (
        <Marker
          key={m.destinationCity}
          position={m.destPos}
          icon={createPriceBubble(m.destinationCity, m.cheapestPrice, m.isSelected)}
          eventHandlers={{
            click: () => onSelectRoute?.(originCity, m.destinationCity)
          }}
        >
          <Popup>
            <div style="min-width:140px">
              <strong style="font-size:14px">{m.destinationCity}</strong><br/>
              <span style="color:#1a73e8;font-weight:700;font-size:16px">€{Math.round(m.cheapestPrice)}</span><br/>
              <span style="color:#666;font-size:12px">{m.flightCount} flight{m.flightCount > 1 ? 's' : ''} available</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
