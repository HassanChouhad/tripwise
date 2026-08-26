'use client';

import { useState } from 'react';
import { Check, Sparkles, Bookmark, Heart } from 'lucide-react';
import flightData from '../../data/flights.json';
import { useSavedTrips } from '../../context/SavedTripsContext';
import styles from './ItineraryTimeline.module.css';

export default function ItineraryTimeline({ searchResults }) {
  const { saveTrip } = useSavedTrips();
  const [saved, setSaved] = useState(false);

  const hasDynamic = searchResults && searchResults.flights && searchResults.flights.length > 0;
  
  const itinerary = hasDynamic ? {
    id: `trip-${Date.now()}`,
    title: `Best Itinerary Found from ${searchResults.destinations[0]?.name.split(',')[0]}`,
    subtitle: `Optimized for ${searchResults.startDate}`,
    totalPrice: searchResults.flights.reduce((sum, f) => sum + f.price, 0) || 850,
    pricePerPerson: searchResults.flights.reduce((sum, f) => sum + f.price, 0) || 850,
    legs: searchResults.destinations.slice(0, -1).map((d, i) => {
      const flight = searchResults.flights[i] || searchResults.flights[0];
      const baseDate = new Date(searchResults.startDate || '2025-10-10');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return {
        month: months[baseDate.getUTCMonth()],
        day: baseDate.getUTCDate() + (i * 3),
        route: `${d.name.split(',')[0]} → ${searchResults.destinations[i + 1]?.name.split(',')[0]}`,
        details: `${flight ? flight.airlineCode : 'AF'} 10:30 → 18:45`,
        airline: flight ? flight.airline : 'Air France',
        duration: flight ? flight.duration : '8h 15m',
        stops: flight && flight.stops === 0 ? 'Direct' : '1 stop'
      };
    }),
    includes: [
      "Flights + Hotels",
      "Multi-city Itinerary",
      "24/7 Support"
    ]
  } : flightData.bestItinerary;

  const handleSaveTrip = () => {
    saveTrip(itinerary);
    setSaved(true);
    alert('🎉 Trip and itinerary saved successfully! You can view it under "Trips", "Flights", and "Itineraries".');
  };

  return (
    <div className={styles.itinerarySection}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>
            <Sparkles size={20} color="var(--color-accent-amber)" />
            {itinerary.title}
          </h2>
          <span className={styles.subtitle}>{itinerary.subtitle}</span>
        </div>
        <button
          className={styles.viewDetailsBtn}
          id="save-trip-btn"
          onClick={handleSaveTrip}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: saved ? 'var(--color-accent-green)' : undefined, color: saved ? 'white' : undefined }}
        >
          <Bookmark size={14} />
          {saved ? 'Trip Saved!' : 'Save Trip'}
        </button>
      </div>

      <div className={styles.contentGrid}>
        {/* Vertical Timeline */}
        <div className={styles.timelineCard}>
          {itinerary.legs.map((leg, index) => (
            <div key={index} className={styles.timelineItem}>
              <div className={styles.dateBadge}>
                <span className={styles.dateMonth}>{leg.month}</span>
                <span className={styles.dateDay}>{leg.day}</span>
              </div>
              <div className={styles.flightDetails}>
                <div className={styles.routeHeader}>
                  <span className={styles.routeName}>{leg.route}</span>
                </div>
                <div className={styles.times}>{leg.details}</div>
                <div className={styles.flightMeta}>
                  <span className={styles.airlineTag}>{leg.airline}</span>
                  <span>•</span>
                  <span>{leg.duration}</span>
                  <span>•</span>
                  <span>{leg.stops}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price & Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.bestValueBadge}>Best Value</div>
          
          <div className={styles.priceBlock}>
            <div className={styles.priceAmount}>€{itinerary.totalPrice}</div>
            <div className={styles.priceLabel}>per person</div>
          </div>

          <div className={styles.includesList}>
            {itinerary.includes.map((item, idx) => (
              <div key={idx} className={styles.includeItem}>
                <Check size={16} className={styles.includeIcon} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button
            className={styles.viewTripBtn}
            id="view-this-trip-btn"
            onClick={handleSaveTrip}
          >
            {saved ? '✓ Trip Saved' : 'Save & View This Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
