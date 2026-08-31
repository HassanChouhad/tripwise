'use client';

import { useState } from 'react';
import SearchBar from './components/search/SearchBar';
import ItineraryTimeline from './components/itinerary/ItineraryTimeline';
import WeatherOverview from './components/weather/WeatherOverview';
import HotelCarousel from './components/hotels/HotelCarousel';
import FlightMap from './components/map/FlightMap';

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchResults = (flights, destinations, startDate, endDate) => {
    setSearchResults({ flights, destinations, startDate, endDate });
  };

  const handleMapRouteSelect = (origin, destination) => {
    // Scroll to search bar and let user refine
    const searchSection = document.getElementById('trip-type-tabs');
    if (searchSection) searchSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <SearchBar onSearchResults={handleSearchResults} />

      <FlightMap
        startDate={searchResults?.startDate}
        searchDestinations={searchResults?.destinations}
        onSelectRoute={handleMapRouteSelect}
      />
      
      {searchResults && (
        <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-accent-primary)' }}>
          <h3>🔍 Search Results ({searchResults.searchResults?.length || searchResults.flights?.length || 0} flight routes found in database)</h3>
          <p className="text-caption">
            Route: {searchResults.destinations.map(d => d.name).join(' → ')} • {searchResults.startDate}{searchResults.endDate ? ` to ${searchResults.endDate}` : ''}
          </p>
        </div>
      )}

      <div className="home-grid">
        <ItineraryTimeline searchResults={searchResults} />
        <WeatherOverview searchResults={searchResults} />
      </div>

      <HotelCarousel searchResults={searchResults} />
    </div>
  );
}
