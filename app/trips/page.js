'use client';

import { useSavedTrips } from '../context/SavedTripsContext';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';

export default function TripsPage() {
  const { savedTrips, deleteTrip } = useSavedTrips();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">My Saved Trips</h1>
        <p className="text-caption">Access your saved itineraries, confirmed flight bookings, and routes.</p>
      </div>

      {savedTrips.length === 0 ? (
        <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <h3>No Saved Trips Yet</h3>
          <p className="text-caption" style={{ marginTop: '8px' }}>
            Search for flights on the home page and click "Save & View This Trip" to bookmark your itineraries here.
          </p>
        </div>
      ) : (
        savedTrips.map((trip) => {
          const legs = trip.legs || trip.flights || [];
          return (
            <div key={trip.id} style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button
                  onClick={() => deleteTrip(trip.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--color-accent-red)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-xs)'
                  }}
                >
                  🗑️ Delete Trip
                </button>
              </div>
              <ItineraryTimeline searchResults={{ flights: legs, destinations: (trip.destinations || []).map(d => ({ name: typeof d === 'string' ? d : d.name })), startDate: trip.start_date || '2025-10-10' }} />
            </div>
          );
        })
      )}
    </div>
  );
}
