import SearchBar from './components/search/SearchBar';
import ItineraryTimeline from './components/itinerary/ItineraryTimeline';
import WeatherOverview from './components/weather/WeatherOverview';
import HotelCarousel from './components/hotels/HotelCarousel';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <SearchBar />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)' }}>
        <ItineraryTimeline />
        <WeatherOverview />
      </div>

      <HotelCarousel />
    </div>
  );
}
