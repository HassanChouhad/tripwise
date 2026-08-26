'use client';

import { Check, Sparkles } from 'lucide-react';
import flightData from '../../data/flights.json';
import styles from './ItineraryTimeline.module.css';

export default function ItineraryTimeline() {
  const itinerary = flightData.bestItinerary;

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
        <button className={styles.viewDetailsBtn} id="view-details-btn">
          View Details
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

          <button className={styles.viewTripBtn} id="view-this-trip-btn">
            View This Trip
          </button>
        </div>
      </div>
    </div>
  );
}
