'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import hotelData from '../../data/hotels.json';
import styles from './HotelCarousel.module.css';

export default function HotelCarousel({ searchResults }) {
  const [hotels, setHotels] = useState(hotelData.hotels);

  const searchCity = searchResults?.destinations[1]?.name.split(',')[0] || searchResults?.destinations[0]?.name.split(',')[0];

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

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Recommended Hotels {searchCity ? `in ${searchCity}` : ''}</span> 🏨
        </div>
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
              <div className={styles.location}>{hotel.city} • {hotel.date || 'Oct 10'}</div>
              <div className={styles.footer}>
                <div className={styles.price}>
                  €{hotel.pricePerNight} <span className={styles.priceUnit}>/ night</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
