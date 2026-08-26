'use client';

import { useState } from 'react';
import { Search, Plus, X, Calendar, Users, ChevronDown, Shield, Brain, CloudSun, Backpack } from 'lucide-react';
import styles from './SearchBar.module.css';

const availableCities = [
  "Paris, France (CDG)",
  "Marseille, France (MRS)",
  "Tokyo, Japan (NRT)",
  "Kyoto, Japan (KIX)",
  "Osaka, Japan (KIX)",
  "London, UK (LHR)",
  "Rome, Italy (FCO)",
  "Bali, Indonesia (DPS)",
  "New York, USA (JFK)"
];

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

export default function SearchBar({ onSearchResults }) {
  const [tripType, setTripType] = useState('Multi-city');
  const [destinations, setDestinations] = useState(defaultDestinations);
  const [startDate, setStartDate] = useState('2025-10-10');
  const [travelers, setTravelers] = useState(2);
  const [classType, setClassType] = useState('Economy');

  const updateDestinationName = (id, newName) => {
    setDestinations(destinations.map(d => d.id === id ? { ...d, name: newName } : d));
  };

  const removeDestination = (id) => {
    if (destinations.length > 2) {
      setDestinations(destinations.filter(d => d.id !== id));
    }
  };

  const addDestination = () => {
    const newId = Math.max(...destinations.map(d => d.id)) + 1;
    setDestinations([...destinations, { id: newId, name: 'Marseille, France (MRS)', isOrigin: false }]);
  };

  const handleSearch = async () => {
    const originCity = destinations[0]?.name.split(',')[0] || 'Paris';
    const destCity = destinations[1]?.name.split(',')[0] || 'Tokyo';
    try {
      const res = await fetch(`/api/flights?date=${startDate}&origin=${originCity}&destination=${destCity}`);
      const data = await res.json();
      if (onSearchResults) {
        onSearchResults(data.flights, destinations, startDate);
      } else {
        alert(`Found ${data.flights?.length || 0} flight options from ${originCity} to ${destCity} on ${startDate}!`);
      }
    } catch (e) {
      console.error(e);
    }
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
              <select
                value={dest.name}
                onChange={(e) => updateDestinationName(dest.id, e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
              >
                {availableCities.map((city) => (
                  <option key={city} value={city} style={{ background: '#1E293B', color: '#F1F5F9' }}>
                    {city}
                  </option>
                ))}
              </select>
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
            <input
              type="date"
              className={styles.fieldInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              id="date-picker-input"
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Travelers</span>
            <div className={styles.fieldInput}>
              <Users size={16} />
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                id="travelers-select"
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: '500', outline: 'none', cursor: 'pointer', flex: 1 }}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num} style={{ background: '#1E293B', color: '#F1F5F9' }}>
                    {num} Traveler{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Class</span>
            <div className={styles.fieldInput}>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                id="class-select"
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: '500', outline: 'none', cursor: 'pointer', flex: 1 }}
              >
                {['Economy', 'Premium Economy', 'Business', 'First Class'].map(cls => (
                  <option key={cls} value={cls} style={{ background: '#1E293B', color: '#F1F5F9' }}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className={styles.searchBtn} id="search-trips-btn" onClick={handleSearch}>
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
