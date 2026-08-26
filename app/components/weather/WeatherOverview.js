'use client';

import { useState } from 'react';
import { CloudSun, Backpack, Check } from 'lucide-react';
import packingRules from '../../data/packing-rules.json';
import styles from './WeatherOverview.module.css';

export default function WeatherOverview({ searchResults }) {
  const rawCities = searchResults && searchResults.destinations
    ? searchResults.destinations.map(d => d.name.split(',')[0])
    : ['Tokyo', 'Kyoto', 'Osaka'];

  const activeCities = Array.from(new Set(rawCities));

  const [selectedCity, setSelectedCity] = useState(activeCities[0] || 'Tokyo');

  const cityWeatherList = activeCities.map((city, idx) => ({
    city,
    dateRange: searchResults?.startDate ? `Day ${idx * 3 + 1} – ${idx * 3 + 3}` : 'Oct 10 – Oct 13',
    tempHigh: 18 + (idx * 2),
    tempLow: 12 + idx,
    icon: idx % 2 === 0 ? '⛅' : '🌧️'
  }));

  const currentCityName = activeCities.includes(selectedCity) ? selectedCity : activeCities[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Weather Card */}
      <div className={styles.sideCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <CloudSun size={18} color="var(--color-accent-amber)" />
            Weather Overview
          </div>
        </div>

        {cityWeatherList.map((item) => (
          <div key={item.city} className={styles.cityRow}>
            <div>
              <div className={styles.cityName}>{item.city}</div>
              <div className={styles.cityDates}>{item.dateRange}</div>
            </div>
            <div className={styles.temp}>
              {item.icon} {item.tempHigh}° / {item.tempLow}°
            </div>
          </div>
        ))}
      </div>

      {/* Packing Card */}
      <div className={styles.sideCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <Backpack size={18} color="var(--color-accent-green)" />
            Packing Suggestions
          </div>
        </div>

        <div className={styles.packingTabs}>
          {activeCities.map((city) => (
            <button
              key={city}
              className={`${styles.tab} ${currentCityName === city ? styles.activeTab : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </button>
          ))}
        </div>

        <div className={styles.itemList}>
          {packingRules.conditions.mild.items.map((item, idx) => (
            <div key={idx} className={styles.item}>
              <Check size={14} color="var(--color-accent-green)" />
              {item}
            </div>
          ))}
          {packingRules.conditions.rain.items.map((item, idx) => (
            <div key={`rain-${idx}`} className={styles.item}>
              <Check size={14} color="var(--color-accent-green)" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
