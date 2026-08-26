import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';

export default function ItineraryPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Multi-City Itineraries</h1>
        <p className="text-caption">View and manage your optimized multi-leg travel route.</p>
      </div>

      <ItineraryTimeline />
    </div>
  );
}
