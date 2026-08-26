import SearchBar from '../components/search/SearchBar';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';
import HotelCarousel from '../components/hotels/HotelCarousel';

export default function FlightsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Flight Search & Itineraries</h1>
        <p className="text-caption">Find the best multi-city flight deals optimized for price and convenience.</p>
      </div>

      <SearchBar />
      <ItineraryTimeline />
      <HotelCarousel />
    </div>
  );
}
