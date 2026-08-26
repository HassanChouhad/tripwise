'use client';

import { useState } from 'react';
import { CloudSun, Backpack, Check } from 'lucide-react';
import packingRules from '../../data/packing-rules.json';
import styles from './WeatherOverview.module.css';

export default function WeatherOverview() {
  const [selectedCity, setSelectedCity] = useState('Tokyo');
  const weatherData = packingRules.mockWeather;

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

        {Object.entries(weatherData).map(([city, data]) => (
          <div key={city} className={styles.cityRow}>
            <div>
              <div className={styles.cityName}>{city}</div>
              <div className={styles.cityDates}>{data.dateRange}</div>
            </div>
            <div className={styles.temp}>
              {data.icon} {data.tempHigh}° / {data.tempLow}°
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
          {Object.keys(weatherData).map((city) => (
            <button
              key={city}
              className={`${styles.tab} ${selectedCity === city ? styles.activeTab : ''}`}
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
          {weatherData[selectedCity]?.packingConditions.includes('rain') &&
            packingRules.conditions.rain.items.map((item, idx) => (
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
