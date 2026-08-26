'use client';

import { useSavedTrips } from '../context/SavedTripsContext';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';

export default function ItineraryPage() {
  const { savedTrips } = useSavedTrips();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Multi-City Saved Itineraries</h1>
        <p className="text-caption">View and manage your optimized multi-leg travel route.</p>
      </div>

      {savedTrips.length === 0 ? (
        <ItineraryTimeline />
      ) : (
        savedTrips.map((trip, idx) => (
          <ItineraryTimeline key={idx} searchResults={{ flights: trip.legs, destinations: trip.legs.map(l => ({ name: l.route })), startDate: '2025-10-10' }} />
        ))
      )}
    </div>
  );
}
