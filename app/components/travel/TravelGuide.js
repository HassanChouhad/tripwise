'use client';

import { useState } from 'react';
import { Train, Bus, Car, MapPin, Clock, Banknote } from 'lucide-react';
import travelData from '../../data/travel-guide.json';

function getTransportIcon(mode) {
  const lower = mode.toLowerCase();
  if (lower.includes('train') || lower.includes('express') || lower.includes('rer') || lower.includes('line') || lower.includes('haruka') || lower.includes('rapi')) return Train;
  if (lower.includes('bus') || lower.includes('shuttle') || lower.includes('coach') || lower.includes('navette')) return Bus;
  return Car;
}

export default function TravelGuide({ destinations, flights }) {
  const [activeCity, setActiveCity] = useState(destinations?.[0] || null);

  if (!destinations || destinations.length === 0) return null;

  // Calculate stay days between flights for multi-destination trips
  const getStayInfo = (city) => {
    if (!flights || flights.length < 2) return null;
    const arrivalFlight = flights.find(f => (f.destinationCity || f.route?.split('→')[1]?.trim() || '').includes(city));
    const departureFlight = flights.find(f => (f.originCity || f.route?.split('→')[0]?.trim() || '').includes(city));
    if (arrivalFlight && departureFlight && arrivalFlight.date && departureFlight.date) {
      const arrival = new Date(arrivalFlight.date);
      const departure = new Date(departureFlight.date);
      const days = Math.round((departure - arrival) / (1000 * 60 * 60 * 24));
      if (days > 0) return { days, arrival: arrivalFlight.date, departure: departureFlight.date };
    }
    return null;
  };

  const cityData = travelData[activeCity];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Travel Guide for Your Trip
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          How to reach your destinations and what to explore.
        </p>
      </div>

      {/* City tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {destinations.map(city => (
          <button
            key={city}
            onClick={() => setActiveCity(city)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeCity === city ? 'var(--gradient-primary)' : 'var(--color-bg-tertiary)',
              color: activeCity === city ? 'white' : 'var(--color-text-secondary)',
              border: 'none'
            }}
          >
            {city}
          </button>
        ))}
      </div>

      {cityData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Stay info for multi-destination */}
          {(() => {
            const stayInfo = getStayInfo(activeCity);
            if (stayInfo) {
              return (
                <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    You're staying {stayInfo.days} night{stayInfo.days > 1 ? 's' : ''} in {activeCity}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Arriving {stayInfo.arrival} • Departing {stayInfo.departure}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Airport to city transport */}
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Getting from {cityData.airport} to City Center
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
              Recommended transport options to reach your hotel
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {cityData.transport.map((t, idx) => {
                const Icon = getTransportIcon(t.mode);
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color: 'var(--color-accent-primary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{t.mode}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{t.description}</div>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                          <Clock size={12} /> {t.duration}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-green)', fontWeight: 600 }}>
                          <Banknote size={12} /> {t.cost}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Places to visit */}
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Places to Visit in {activeCity}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
              Top attractions and experiences
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              {cityData.places.map((place, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={16} style={{ color: 'var(--color-accent-blue)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{place.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-accent-primary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>{place.type}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{place.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Travel guide not available for {activeCity} yet.</p>
        </div>
      )}
    </div>
  );
}
