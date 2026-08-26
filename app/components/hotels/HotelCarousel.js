'use client';

import { Star } from 'lucide-react';
import hotelData from '../../data/hotels.json';
import styles from './HotelCarousel.module.css';

export default function HotelCarousel() {
  const hotels = hotelData.hotels;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Recommended Hotels</span> 🏨
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
              <div className={styles.location}>{hotel.city} • {hotel.checkIn} - {hotel.checkOut}</div>
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
