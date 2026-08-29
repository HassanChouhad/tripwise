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

const cityImages = {
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=400&fit=crop',
  'Marseille': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&h=400&fit=crop',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=400&fit=crop',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=400&fit=crop',
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1200&h=400&fit=crop',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=400&fit=crop',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=400&fit=crop',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=400&fit=crop',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=400&fit=crop',
};

const defaultDestinations = [
  { id: 1, name: 'Paris, France (CDG)', isOrigin: true },
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
  const [endDate, setEndDate] = useState('2025-10-20');
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
    setDestinations([...destinations, { id: newId, name: '', isOrigin: false }]);
  };

  const handleSearch = async () => {
    const originCity = destinations[0]?.name.split(',')[0] || 'Paris';
    const destCity = destinations[1]?.name.split(',')[0] || 'Tokyo';
    try {
      const res = await fetch(`/api/flights?date=${startDate}&origin=${originCity}&destination=${destCity}`);
      const data = await res.json();
      if (onSearchResults) {
        onSearchResults(data.flights, destinations, startDate, endDate);
      } else {
        alert(`Found ${data.flights?.length || 0} flight options from ${originCity} to ${destCity} (${startDate} to ${endDate})!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.searchSection}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <img
          src={cityImages[destinations[1]?.name.split(',')[0]] || cityImages[destinations[0]?.name.split(',')[0]] || cityImages['Tokyo']}
          alt={destinations[1]?.name || 'Destination'}
        />
        <div className={styles.heroBannerOverlay}>
          <h1>Hello, Explorer! 👋</h1>
          <p>Where are you going next?</p>
        </div>
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
            <span className={styles.fieldLabel}>From</span>
            <div className={styles.fieldInput}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                id="date-start-input"
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: '500', outline: 'none', cursor: 'pointer', flex: 1 }}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>To</span>
            <div className={styles.fieldInput}>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                id="date-end-input"
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: '500', outline: 'none', cursor: 'pointer', flex: 1 }}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Travelers</span>
            <div className={styles.fieldInput}>
              <Users size={16} style={{ flexShrink: 0 }} />
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
