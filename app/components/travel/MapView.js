'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

const airportIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#7C3AED;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">✈</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const cityCenterIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#3B82F6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏙</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const placeIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#F59E0B;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">📍</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function MapView({ cityData, cityName }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !cityData) return null;

  const { airportCoords, cityCenter, cityCenterName, places } = cityData;
  if (!airportCoords || !cityCenter) return null;

  const center = cityCenter;
  const routeLine = [airportCoords, cityCenter];

  const bounds = L.latLngBounds([airportCoords, cityCenter]);
  if (places) {
    places.forEach(p => {
      if (p.coords) bounds.extend(p.coords);
    });
  }

  return (
    <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)', height: '400px' }}>
      <MapContainer
        bounds={bounds.pad(0.1)}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Airport to City Center route */}
        <Polyline
          positions={routeLine}
          pathOptions={{ color: '#7C3AED', weight: 3, dashArray: '8, 8', opacity: 0.8 }}
        />

        {/* Airport marker */}
        <Marker position={airportCoords} icon={airportIcon}>
          <Popup>
            <strong>{cityData.airport}</strong><br />
            Airport
          </Popup>
        </Marker>

        {/* City center marker */}
        <Marker position={cityCenter} icon={cityCenterIcon}>
          <Popup>
            <strong>{cityCenterName}</strong><br />
            City Center
          </Popup>
        </Marker>

        {/* Places to visit */}
        {places && places.map((place, idx) => (
          place.coords && (
            <Marker key={idx} position={place.coords} icon={placeIcon}>
              <Popup>
                <strong>{place.name}</strong><br />
                <em>{place.type}</em><br />
                {place.description}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
