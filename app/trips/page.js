'use client';

import { useSavedTrips } from '../context/SavedTripsContext';
import { useCart } from '../context/CartContext';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';
import TripHotels from '../components/hotels/TripHotels';
import HotelCarousel from '../components/hotels/HotelCarousel';
import TravelGuide from '../components/travel/TravelGuide';
import { ShoppingCart } from 'lucide-react';

export default function TripsPage() {
  const { savedTrips, deleteTrip } = useSavedTrips();
  const { addToCart, cart } = useCart();

  const isInCart = (tripId) => cart.some(item => item.id === tripId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">My Saved Trips</h1>
        <p className="text-caption">Access your saved itineraries, hotels, transport options, and places to visit.</p>
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
          const inCart = isInCart(trip.id);
          const destinations = (trip.destinations || []).map(d => typeof d === 'string' ? d : d.name);
          const firstDest = destinations[1] || destinations[0];
          return (
            <div key={trip.id} style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginBottom: '8px' }}>
                <button
                  onClick={() => addToCart(trip)}
                  disabled={inCart}
                  style={{
                    background: inCart ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                    color: inCart ? 'var(--color-accent-green)' : 'var(--color-accent-primary)',
                    border: `1px solid ${inCart ? 'rgba(16, 185, 129, 0.3)' : 'rgba(124, 58, 237, 0.3)'}`,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: inCart ? 'default' : 'pointer',
                    fontSize: 'var(--font-size-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShoppingCart size={14} />
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => deleteTrip(trip.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-xs)'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Flight itinerary */}
              <ItineraryTimeline searchResults={{ flights: trip.flights || trip.legs || [], destinations: destinations.map(d => ({ name: d })), startDate: trip.start_date, cost: trip.cost }} />

              {/* Selected hotels with remove option */}
              {trip.hotels && trip.hotels.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <TripHotels trip={trip} />
                </div>
              )}

              {/* Browse more hotels for this trip */}
              <div style={{ marginTop: 'var(--space-4)' }}>
                <HotelCarousel searchResults={{ destinations: destinations.map(d => ({ name: d })) }} />
              </div>

              {/* Travel guide + map */}
              {destinations.length > 0 && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <TravelGuide destinations={destinations} flights={trip.flights || trip.legs || []} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
