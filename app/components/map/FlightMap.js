'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader, Navigation } from 'lucide-react';
import styles from './FlightMap.module.css';

const MapInner = dynamic(() => import('./FlightMapInner'), { ssr: false });

const cityCoords = {
  'Tokyo':     { lat: 35.6762, lng: 139.6503, code: 'NRT', country: 'Japan' },
  'Kyoto':     { lat: 35.0116, lng: 135.7681, code: 'KIX', country: 'Japan' },
  'Osaka':     { lat: 34.6937, lng: 135.5023, code: 'KIX', country: 'Japan' },
  'Paris':     { lat: 48.8566, lng: 2.3522,   code: 'CDG', country: 'France' },
  'Marseille': { lat: 43.2965, lng: 5.3698,   code: 'MRS', country: 'France' },
  'London':    { lat: 51.5074, lng: -0.1278,  code: 'LHR', country: 'UK' },
  'Rome':      { lat: 41.9028, lng: 12.4964,  code: 'FCO', country: 'Italy' },
  'Bali':      { lat: -8.3405, lng: 115.092,  code: 'DPS', country: 'Indonesia' },
  'New York':  { lat: 40.7128, lng: -74.0060, code: 'JFK', country: 'USA' },
};

function findNearestCity(lat, lng) {
  let nearest = 'Paris';
  let minDist = Infinity;
  for (const [city, coords] of Object.entries(cityCoords)) {
    const d = Math.sqrt((coords.lat - lat) ** 2 + (coords.lng - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = city;
    }
  }
  return nearest;
}

export { cityCoords };

export default function FlightMap({ startDate, onSelectRoute }) {
  const [originCity, setOriginCity] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState('detecting');

  useEffect(() => {
    if (!navigator.geolocation) {
      setOriginCity('Paris');
      setGeoStatus('fallback');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude);
        setOriginCity(nearest);
        setGeoStatus('detected');
      },
      () => {
        setOriginCity('Paris');
        setGeoStatus('fallback');
      },
      { timeout: 5000 }
    );
  }, []);

  const fetchDestinations = useCallback(async () => {
    if (!originCity) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ origin: originCity });
      if (startDate) params.set('date', startDate);
      const res = await fetch(`/api/flights/destinations?${params}`);
      const data = await res.json();
      setDestinations(data.destinations || []);
    } catch (e) {
      console.error('Failed to fetch destinations:', e);
    }
    setLoading(false);
  }, [originCity, startDate]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleCitySelect = (city) => {
    setOriginCity(city);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <Navigation size={18} /> Explore Flights from {originCity || '...'}
          </h2>
          <p className={styles.subtitle}>
            {geoStatus === 'detected' ? 'Based on your location' : 'Select your departure city'}
            {startDate ? ` • ${startDate}` : ' • All available dates'}
          </p>
        </div>
        <div className={styles.originSelector}>
          {Object.keys(cityCoords).map(city => (
            <button
              key={city}
              className={`${styles.originBtn} ${city === originCity ? styles.originBtnActive : ''}`}
              onClick={() => handleCitySelect(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.mapWrapper}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <Loader size={24} className={styles.spinner} />
            <span>Loading flight routes...</span>
          </div>
        ) : (
          <MapInner
            originCity={originCity}
            cityCoords={cityCoords}
            destinations={destinations}
            onSelectRoute={onSelectRoute}
          />
        )}
      </div>

      {!loading && destinations.length > 0 && (
        <div className={styles.routeList}>
          {destinations.map((dest) => (
            <button
              key={dest.destinationCity}
              className={styles.routeCard}
              onClick={() => onSelectRoute?.(originCity, dest.destinationCity)}
            >
              <span className={styles.routeCity}>{dest.destinationCity}</span>
              <span className={styles.routePrice}>from €{Math.round(dest.cheapestPrice)}</span>
              <span className={styles.routeCount}>{dest.flightCount} flights</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
