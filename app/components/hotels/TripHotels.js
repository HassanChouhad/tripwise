'use client';

import { Star, X, Hotel } from 'lucide-react';
import { useSavedTrips } from '../../context/SavedTripsContext';

const cityHotelImages = {
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=250&fit=crop',
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=250&fit=crop',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=250&fit=crop',
  'Marseille': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=250&fit=crop',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop',
};

export default function TripHotels({ trip }) {
  const { updateTrip } = useSavedTrips();
  const hotels = trip.hotels || [];

  if (hotels.length === 0) return null;

  const removeHotel = (index) => {
    const updatedHotels = hotels.filter((_, i) => i !== index);
    const removedPrice = hotels[index]?.pricePerNight || 0;
    updateTrip({
      ...trip,
      hotels: updatedHotels,
      cost: (trip.cost || 0) - removedPrice
    });
  };

  return (
    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Hotel size={18} style={{ color: 'var(--color-accent-blue)' }} />
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>
          Selected Hotels ({hotels.length})
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
        {hotels.map((hotel, idx) => (
          <div key={idx} style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Hotel image */}
            <div style={{ height: '100px', overflow: 'hidden' }}>
              <img
                src={cityHotelImages[hotel.city] || cityHotelImages['Paris']}
                alt={hotel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeHotel(idx)}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(239, 68, 68, 0.85)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: '24px', height: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '12px'
              }}
              title="Remove hotel"
            >
              <X size={14} />
            </button>

            {/* Hotel info */}
            <div style={{ padding: 'var(--space-3)' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>
                {hotel.name}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                {hotel.city}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-accent-primary)' }}>
                  €{Math.round(hotel.pricePerNight)}<span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}> /night</span>
                </span>
                {hotel.rating && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: 'var(--font-size-xs)' }}>
                    <Star size={12} fill="var(--color-accent-amber)" color="var(--color-accent-amber)" />
                    {Number(hotel.rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
