'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

function createCityIcon(color, label) {
  return new L.DivIcon({
    className: '',
    html: `<div style="
      background:${color};color:white;
      min-width:24px;height:24px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      border:2px solid rgba(255,255,255,0.8);
    ">${label}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function createPriceLabel(price) {
  return new L.DivIcon({
    className: '',
    html: `<div style="
      background:rgba(124,58,237,0.9);color:white;
      padding:2px 8px;border-radius:10px;
      font-size:11px;font-weight:700;
      white-space:nowrap;
      box-shadow:0 2px 6px rgba(0,0,0,0.2);
    ">€${Math.round(price)}</div>`,
    iconSize: [60, 20],
    iconAnchor: [30, 10]
  });
}

const originIcon = createCityIcon('#7C3AED', '✈');

function getCurvePoints(from, to, numPoints = 30) {
  const points = [];
  const lngDiff = to[1] - from[1];
  const latDiff = to[0] - from[0];
  const dist = Math.sqrt(lngDiff * lngDiff + latDiff * latDiff);
  const curvature = Math.min(dist * 0.2, 15);

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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
    }
  }, [map, bounds]);
  return null;
}

export default function FlightMapInner({ originCity, cityCoords, destinations, onSelectRoute }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !originCity || !cityCoords[originCity]) return null;

  const origin = cityCoords[originCity];
  const originPos = [origin.lat, origin.lng];

  const allPoints = [originPos];
  const routes = destinations
    .filter(d => cityCoords[d.destinationCity])
    .map(d => {
      const dest = cityCoords[d.destinationCity];
      const destPos = [dest.lat, dest.lng];
      allPoints.push(destPos);
      return { ...d, destPos, curvePoints: getCurvePoints(originPos, destPos) };
    });

  const bounds = L.latLngBounds(allPoints);

  return (
    <MapContainer
      center={originPos}
      zoom={3}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <FitBounds bounds={bounds} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Origin */}
      <Marker position={originPos} icon={originIcon}>
        <Popup><strong>{originCity}</strong><br />Your departure city</Popup>
      </Marker>

      {/* Routes and destinations */}
      {routes.map((route) => {
        const destIcon = createCityIcon('#3B82F6', route.destinationCity[0]);
        const midIdx = Math.floor(route.curvePoints.length / 2);
        const midPoint = route.curvePoints[midIdx];
        const priceIcon = createPriceLabel(route.cheapestPrice);

        return (
          <div key={route.destinationCity}>
            {/* Arc line */}
            <Polyline
              positions={route.curvePoints}
              pathOptions={{ color: '#7C3AED', weight: 2, opacity: 0.6, dashArray: '6, 4' }}
              eventHandlers={{
                click: () => onSelectRoute?.(originCity, route.destinationCity)
              }}
            />

            {/* Price label at midpoint */}
            <Marker position={midPoint} icon={priceIcon} interactive={false} />

            {/* Destination marker */}
            <Marker
              position={route.destPos}
              icon={destIcon}
              eventHandlers={{
                click: () => onSelectRoute?.(originCity, route.destinationCity)
              }}
            >
              <Popup>
                <strong>{route.destinationCity}</strong><br />
                From <strong>€{Math.round(route.cheapestPrice)}</strong><br />
                {route.flightCount} flights available
              </Popup>
            </Marker>
          </div>
        );
      })}
    </MapContainer>
  );
}
