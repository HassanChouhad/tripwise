'use client';

import { useState } from 'react';
import SearchBar from './components/search/SearchBar';
import ItineraryTimeline from './components/itinerary/ItineraryTimeline';
import WeatherOverview from './components/weather/WeatherOverview';
import HotelCarousel from './components/hotels/HotelCarousel';

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchResults = (flights, destinations, startDate) => {
    setSearchResults({ flights, destinations, startDate });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <SearchBar onSearchResults={handleSearchResults} />
      
      {searchResults && (
        <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-accent-primary)' }}>
          <h3>🔍 Search Results ({searchResults.searchResults?.length || searchResults.flights?.length || 0} flight routes found in database)</h3>
          <p className="text-caption">
            Route: {searchResults.destinations.map(d => d.name).join(' → ')} on {searchResults.startDate}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)' }}>
        <ItineraryTimeline searchResults={searchResults} />
        <WeatherOverview searchResults={searchResults} />
      </div>

      <HotelCarousel searchResults={searchResults} />
    </div>
  );
}
