'use client';

import { useEffect, useState } from 'react';
import { Star, Plus, Check } from 'lucide-react';
import hotelData from '../../data/hotels.json';
import { useSavedTrips } from '../../context/SavedTripsContext';
import styles from './HotelCarousel.module.css';

export default function HotelCarousel({ searchResults }) {
  const [hotels, setHotels] = useState(hotelData.hotels);
  const [addedHotels, setAddedHotels] = useState({});
  const { savedTrips, updateTrip } = useSavedTrips();

  const searchCity = searchResults?.destinations?.[1]?.name?.split(',')[0] || searchResults?.destinations?.[0]?.name?.split(',')[0];

  useEffect(() => {
    if (searchCity) {
      fetch(`/api/hotels?city=${searchCity}&date=${searchResults?.startDate || ''}`)
        .then(res => res.json())
        .then(data => {
          if (data.hotels && data.hotels.length > 0) {
            setHotels(data.hotels);
          }
        })
        .catch(console.error);
    }
  }, [searchCity, searchResults?.startDate]);

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

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Recommended Hotels {searchCity ? `in ${searchCity}` : ''}</span> 🏨
        </div>
        {savedTrips.length > 0 && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
            Adding to: {savedTrips[0]?.name || 'Latest trip'}
          </span>
        )}
      </div>

      <div className={styles.grid}>
        {hotels.map((hotel) => (
          <div key={hotel.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <div className={styles.imagePlaceholder}>🏨</div>
              <div className={styles.badge}>
                <Star size={12} fill="var(--color-accent-amber)" color="var(--color-accent-amber)" />
                {hotel.rating}
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
