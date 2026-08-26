'use client';

import { useSavedTrips } from '../context/SavedTripsContext';
import SearchBar from '../components/search/SearchBar';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';

export default function FlightsPage() {
  const { savedTrips } = useSavedTrips();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Flight Search & Saved Flight Deals</h1>
        <p className="text-caption">Find multi-city flights or access your saved flight itineraries.</p>
      </div>

      <SearchBar />

      {savedTrips.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>✈️ Your Saved Flight Itineraries</h2>
          {savedTrips.map((trip, idx) => (
            <ItineraryTimeline key={idx} searchResults={{ flights: trip.legs, destinations: trip.legs.map(l => ({ name: l.route })), startDate: '2025-10-10' }} />
          ))}
        </div>
      )}
    </div>
  );
}
