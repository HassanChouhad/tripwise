'use client';

import { useState } from 'react';
import { Check, Sparkles, Bookmark } from 'lucide-react';
import flightData from '../../data/flights.json';
import { useSavedTrips } from '../../context/SavedTripsContext';
import styles from './ItineraryTimeline.module.css';

export default function ItineraryTimeline({ searchResults }) {
  const { saveTrip } = useSavedTrips();
  const [saved, setSaved] = useState(false);

  const hasDynamic = searchResults && searchResults.flights && searchResults.flights.length > 0;

  // Determine if this is a pre-saved trip (from Trips/Itineraries pages) vs raw API search results
  const isSavedTrip = hasDynamic && (searchResults.cost != null || searchResults.flights[0]?.route);

  let itinerary;

  if (isSavedTrip) {
    // Pre-saved trip: flights are [{flight, route, price}]
    const computedPrice = searchResults.flights.reduce((sum, f) => sum + (f.price || 0), 0);
    const totalPrice = searchResults.cost || computedPrice;
    itinerary = {
      id: `trip-${Date.now()}`,
      title: `Itinerary: ${(searchResults.destinations || []).map(d => typeof d === 'string' ? d : d.name).join(' → ')}`,
      subtitle: `Departure: ${searchResults.startDate || 'N/A'}`,
      totalPrice,
      pricePerPerson: totalPrice,
      legs: searchResults.flights.map((f, i) => {
        const cities = f.route.split(' → ');
        const baseDate = new Date(searchResults.startDate || '2025-10-10');
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return {
          month: months[baseDate.getUTCMonth()],
          day: baseDate.getUTCDate() + (i * 3),
          route: f.route,
          details: `${f.flight || 'Flight'} — €${f.price || 0}`,
          airline: f.flight || 'Airline',
          duration: '',
          stops: ''
        };
      }),
      includes: ["Flights", "Multi-city Itinerary", "24/7 Support"]
    };
  } else if (hasDynamic) {
    // Raw API search results: flights are full DB objects with airlineCode, duration, etc.
    const totalPrice = searchResults.flights.reduce((sum, f) => sum + (f.price || 0), 0);
    itinerary = {
      id: `trip-${Date.now()}`,
      title: `Best Itinerary Found from ${searchResults.destinations[0]?.name?.split(',')[0] || searchResults.destinations[0]}`,
      subtitle: `Optimized for ${searchResults.startDate}`,
      totalPrice,
      pricePerPerson: totalPrice,
      legs: searchResults.destinations.slice(0, -1).map((d, i) => {
        const flight = searchResults.flights[i] || searchResults.flights[0];
        const baseDate = new Date(searchResults.startDate || '2025-10-10');
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const destName = typeof d === 'string' ? d : (d.name?.split(',')[0] || d.name);
        const nextDest = searchResults.destinations[i + 1];
        const nextDestName = typeof nextDest === 'string' ? nextDest : (nextDest?.name?.split(',')[0] || nextDest?.name);
        return {
          month: months[baseDate.getUTCMonth()],
          day: baseDate.getUTCDate() + (i * 3),
          route: `${destName} → ${nextDestName}`,
          details: `${flight?.airlineCode || flight?.airline || 'AF'} ${flight?.departureTime || '10:30'} → ${flight?.arrivalTime || '18:45'}`,
          airline: flight?.airline || 'Air France',
          duration: flight?.duration || '',
          stops: flight?.stops === 0 ? 'Direct' : `${flight?.stops || 1} stop`
        };
      }),
      includes: ["Flights + Hotels", "Multi-city Itinerary", "24/7 Support"]
    };
  } else {
    itinerary = flightData.bestItinerary;
  }

  const handleSaveTrip = () => {
    const destinations = hasDynamic
      ? (searchResults.destinations || []).map(d => typeof d === 'string' ? d : (d.name?.split(',')[0] || d.name))
      : itinerary.legs.map(l => l.route.split(' → ')[0]);
    saveTrip({
      ...itinerary,
      name: itinerary.title || `Trip to ${destinations.join(', ')}`,
      destinations,
      start_date: searchResults?.startDate || '2025-10-10',
      end_date: searchResults?.endDate || searchResults?.startDate || '2025-10-20',
      travelers: 1,
      flights: itinerary.legs.map(l => ({
        flight: l.airline,
        route: l.route,
        price: Math.round(itinerary.totalPrice / (itinerary.legs.length || 1))
      })),
      hotels: [],
      cost: itinerary.totalPrice
    });
    setSaved(true);
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
                  {leg.duration && <><span>•</span><span>{leg.duration}</span></>}
                  {leg.stops && <><span>•</span><span>{leg.stops}</span></>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.bestValueBadge}>Best Value</div>
          
          <div className={styles.priceBlock}>
            <div className={styles.priceAmount}>€{itinerary.totalPrice}</div>
            <div className={styles.priceLabel}>per person</div>
          </div>

          <div className={styles.includesList}>
            {(itinerary.includes || []).map((item, idx) => (
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
