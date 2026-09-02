'use client';

import { useEffect, useState } from 'react';
import { Star, Plus, Check } from 'lucide-react';
import hotelData from '../../data/hotels.json';
import { useSavedTrips } from '../../context/SavedTripsContext';
import styles from './HotelCarousel.module.css';

const cityHotelImages = {
  'Tokyo': [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=250&fit=crop',
  ],
  'Kyoto': [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=250&fit=crop',
  ],
  'Osaka': [
    'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=400&h=250&fit=crop',
  ],
  'Paris': [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=250&fit=crop',
  ],
  'London': [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=400&h=250&fit=crop',
  ],
  'Rome': [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400&h=250&fit=crop',
  ],
  'Marseille': [
    'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1600267185393-e158a98703de?w=400&h=250&fit=crop',
  ],
};

function getHotelImage(hotel, index) {
  if (hotel.image && hotel.image.startsWith('http')) return hotel.image;
  const images = cityHotelImages[hotel.city];
  if (images) return images[index % images.length];
  return null;
}

export default function HotelCarousel({ searchResults }) {
  const [hotels, setHotels] = useState(hotelData.hotels);
  const [addedHotels, setAddedHotels] = useState({});
  const [activeCity, setActiveCity] = useState(null);
  const { savedTrips, updateTrip } = useSavedTrips();

  // Get all destination cities (skip origin)
  const allCities = (searchResults?.destinations || [])
    .slice(1)
    .map(d => (d.name || d).split(',')[0].trim())
    .filter(Boolean);
  const searchDate = searchResults?.startDate || '';

  useEffect(() => {
    if (allCities.length > 0 && !activeCity) {
      setActiveCity(allCities[0]);
    }
  }, [allCities.join(',')]);

  useEffect(() => {
    if (allCities.length === 0) return;

    Promise.all(
      allCities.map(city =>
        fetch(`/api/hotels?city=${city}&date=${searchDate}`)
          .then(res => res.json())
          .then(data => data.hotels || [])
          .catch(() => [])
      )
    ).then(results => {
      const combined = results.flat();
      if (combined.length > 0) {
        setHotels(combined);
      }
    });
  }, [allCities.join(','), searchDate]);

  const addHotelToTrip = (hotel) => {
    const latestTrip = savedTrips[0];
    if (!latestTrip) {
      alert('Save a trip first, then add hotels to it.');
      return;
    }

    const updatedTrip = {
      ...latestTrip,
      hotels: [...(latestTrip.hotels || []), {
        name: hotel.name,
        city: hotel.city,
        price_per_night: hotel.pricePerNight,
        pricePerNight: hotel.pricePerNight,
        nights: hotel.nights || 3,
        rating: hotel.rating
      }],
      cost: (latestTrip.cost || 0) + (hotel.pricePerNight * (hotel.nights || 3))
    };

    updateTrip(updatedTrip);
    setAddedHotels(prev => ({ ...prev, [hotel.id]: true }));
  };

  // Filter hotels by active city
  const filteredHotels = activeCity
    ? hotels.filter(h => h.city === activeCity)
    : hotels;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Recommended Hotels</span> 🏨
        </div>
        {savedTrips.length > 0 && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
            Adding to: {savedTrips[0]?.name || 'Latest trip'}
          </span>
        )}
      </div>

      {/* City tabs */}
      {allCities.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {allCities.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                background: city === activeCity ? 'rgba(124, 58, 237, 0.15)' : 'var(--color-bg-tertiary)',
                color: city === activeCity ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                border: `1px solid ${city === activeCity ? 'rgba(124, 58, 237, 0.4)' : 'var(--color-border)'}`,
                transition: 'all 150ms ease'
              }}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {filteredHotels.map((hotel, index) => (
          <div key={hotel.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              {getHotelImage(hotel, index) ? (
                <img src={getHotelImage(hotel, index)} alt={hotel.name} className={styles.imagePlaceholder} />
              ) : (
                <div className={styles.imageFallback}>🏨</div>
              )}
              <div className={styles.badge}>
                <Star size={12} fill="var(--color-accent-amber)" color="var(--color-accent-amber)" />
                {Number(hotel.rating).toFixed(1)}
              </div>
            </div>
            <div className={styles.content}>
              <div className={styles.hotelName}>{hotel.name}</div>
              <div className={styles.location}>{hotel.city} • {hotel.nights || 3} nights</div>
              <div className={styles.footer}>
                <div className={styles.price}>
                  €{hotel.pricePerNight} <span className={styles.priceUnit}>/ night</span>
                </div>
                <button
                  onClick={() => addHotelToTrip(hotel)}
                  disabled={addedHotels[hotel.id]}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: addedHotels[hotel.id] ? 'default' : 'pointer',
                    background: addedHotels[hotel.id] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                    color: addedHotels[hotel.id] ? 'var(--color-accent-green)' : 'var(--color-accent-primary)',
                    border: `1px solid ${addedHotels[hotel.id] ? 'rgba(16, 185, 129, 0.3)' : 'rgba(124, 58, 237, 0.3)'}`
                  }}
                >
                  {addedHotels[hotel.id] ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add to Trip</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
