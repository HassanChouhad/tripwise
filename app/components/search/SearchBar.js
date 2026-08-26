'use client';

import { useState } from 'react';
import { Search, Plus, X, Calendar, Users, ChevronDown, Shield, Brain, CloudSun, Backpack } from 'lucide-react';
import styles from './SearchBar.module.css';

const defaultDestinations = [
  { id: 1, name: 'Paris, France (CDG)', isOrigin: true },
  { id: 2, name: 'Tokyo, Japan (NRT)', isOrigin: false },
  { id: 3, name: 'Kyoto, Japan (KIX)', isOrigin: false },
  { id: 4, name: 'Osaka, Japan (KIX)', isOrigin: false },
];

const tripTypes = ['Round Trip', 'Multi-city', 'One Way'];

const features = [
  { icon: Shield, text: 'Best Price Guarantee', colorClass: 'featureBadgeIconPurple', emoji: '🛡️' },
  { icon: Brain, text: 'Smart Itinerary Optimizer', colorClass: 'featureBadgeIconBlue', emoji: '🧠' },
  { icon: CloudSun, text: 'Weather Aware', colorClass: 'featureBadgeIconAmber', emoji: '🌤️' },
  { icon: Backpack, text: 'AI Packing Suggestions', colorClass: 'featureBadgeIconGreen', emoji: '🎒' },
];

export default function SearchBar() {
  const [tripType, setTripType] = useState('Multi-city');
  const [destinations, setDestinations] = useState(defaultDestinations);
  const [dates, setDates] = useState('Oct 10 – Oct 20, 2025');
  const [travelers, setTravelers] = useState(2);
  const [classType, setClassType] = useState('Economy');

  const removeDestination = (id) => {
    if (destinations.length > 2) {
      setDestinations(destinations.filter(d => d.id !== id));
    }
  };

  const addDestination = () => {
    const newId = Math.max(...destinations.map(d => d.id)) + 1;
    setDestinations([...destinations, { id: newId, name: 'Select destination', isOrigin: false }]);
  };

  return (
    <div className={styles.searchSection}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <div className={styles.greetingLeft}>
          <h1>Hello, Explorer! 👋</h1>
          <p>Where are you going next?</p>
        </div>
        <div className={styles.greetingIcon}>🗺️</div>
      </div>

      {/* Trip Type Tabs */}
      <div className={styles.tripTypeTabs} id="trip-type-tabs">
        {tripTypes.map((type) => (
          <button
            key={type}
            className={`${styles.tripTypeTab} ${tripType === type ? styles.tripTypeTabActive : ''}`}
            onClick={() => setTripType(type)}
            id={`tab-${type.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className={styles.searchForm} id="search-form">
        <div className={styles.destinationChips}>
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className={`${styles.chip} ${dest.isOrigin ? styles.chipOrigin : ''}`}
            >
              <span className={styles.chipDot} />
              <span>{dest.name}</span>
              {!dest.isOrigin && destinations.length > 2 && (
                <button
                  className={styles.chipRemove}
                  onClick={() => removeDestination(dest.id)}
                  aria-label={`Remove ${dest.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button className={styles.addDestBtn} onClick={addDestination} id="add-destination-btn">
            <Plus size={14} />
            Add Destination
          </button>
        </div>

        <div className={styles.searchFields}>
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Dates</span>
            <div className={styles.fieldInput}>
              <Calendar size={16} />
              <span>{dates}</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Travelers</span>
            <div className={styles.fieldInput}>
              <Users size={16} />
              <span>{travelers} Travelers</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Class</span>
            <div className={styles.fieldInput}>
              <span>{classType}</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <button className={styles.searchBtn} id="search-trips-btn">
            <Search size={18} />
            Search Trips
          </button>
        </div>
      </div>

      {/* Feature Badges */}
      <div className={styles.featureBadges}>
        {features.map((feature) => (
          <div key={feature.text} className={styles.featureBadge}>
            <div className={`${styles.featureBadgeIcon} ${styles[feature.colorClass]}`}>
              {feature.emoji}
            </div>
            <span className={styles.featureBadgeText}>{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
