import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';

export default function TripsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">My Trips</h1>
        <p className="text-caption">Access your saved itineraries, confirmed flight bookings, and hotel stays.</p>
      </div>

      <ItineraryTimeline />
    </div>
  );
}
