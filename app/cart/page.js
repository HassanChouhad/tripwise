'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart, Star, X, Hotel, Pencil, ChevronDown, ChevronUp } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, updateCartItem, clearCart, cartTotal, isHydrated } = useCart();
  const router = useRouter();
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [hotelsByCity, setHotelsByCity] = useState({});
  const [activeHotelCity, setActiveHotelCity] = useState({});
  const [loadingHotels, setLoadingHotels] = useState({});

  const removeHotelFromCartItem = (tripId, hotelIndex) => {
    const item = cart.find(i => i.id === tripId);
    if (!item) return;
    const hotel = item.hotels[hotelIndex];
    const updatedHotels = item.hotels.filter((_, i) => i !== hotelIndex);
    updateCartItem(tripId, {
      hotels: updatedHotels,
      cost: (item.cost || 0) - (hotel?.pricePerNight || 0)
    });
  };

  const addHotelToCartItem = (tripId, hotel) => {
    const item = cart.find(i => i.id === tripId);
    if (!item) return;
    const exists = (item.hotels || []).some(h => h.name === hotel.name && h.city === hotel.city);
    if (exists) return;
    updateCartItem(tripId, {
      hotels: [...(item.hotels || []), { name: hotel.name, city: hotel.city, pricePerNight: hotel.pricePerNight, rating: hotel.rating }],
      cost: (item.cost || 0) + (hotel.pricePerNight || 0)
    });
  };

  const toggleExpand = async (tripId) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
      return;
    }
    setExpandedTrip(tripId);

    const item = cart.find(i => i.id === tripId);
    if (!item) return;
    const destinations = (item.destinations || []).slice(1);
    if (destinations.length === 0) return;
    if (hotelsByCity[tripId]) {
      if (!activeHotelCity[tripId]) setActiveHotelCity(prev => ({ ...prev, [tripId]: destinations[0] }));
      return;
    }

    setLoadingHotels(prev => ({ ...prev, [tripId]: true }));
    const results = {};
    for (const city of destinations) {
      try {
        const res = await fetch(`/api/hotels?city=${city}`);
        const data = await res.json();
        results[city] = data.hotels || [];
      } catch { results[city] = []; }
    }
    setHotelsByCity(prev => ({ ...prev, [tripId]: results }));
    setActiveHotelCity(prev => ({ ...prev, [tripId]: destinations[0] }));
    setLoadingHotels(prev => ({ ...prev, [tripId]: false }));
  };

  if (!isHydrated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h1 className="text-display">Your Cart</h1>
        <p className="text-caption">Loading...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <div>
          <h1 className="text-display">Your Cart</h1>
          <p className="text-caption">Your travel cart is empty.</p>
        </div>
        <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <ShoppingCart size={48} style={{ opacity: 0.3, margin: '0 auto var(--space-4)' }} />
          <h3>No trips in your cart</h3>
          <p className="text-caption" style={{ marginTop: '8px' }}>
            Plan a trip with the AI Planner or search for flights, then add them to your cart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-display">Your Cart</h1>
          <p className="text-caption">{cart.length} trip{cart.length > 1 ? 's' : ''} in your cart</p>
        </div>
        <button
          onClick={clearCart}
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 600, cursor: 'pointer' }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {cart.map(item => {
          const isExpanded = expandedTrip === item.id;
          const destinations = (item.destinations || []).slice(1);
          const tripHotels = hotelsByCity[item.id] || {};
          const currentCity = activeHotelCity[item.id] || destinations[0];
          const cityHotelList = tripHotels[currentCity] || [];
          const existingHotelNames = (item.hotels || []).map(h => `${h.name}-${h.city}`);

          return (
            <div key={item.id} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              {/* Trip header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: '4px' }}>
                    {item.name || item.title || 'Unnamed Trip'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {(item.destinations || []).join(' → ')}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                    {item.start_date}{item.end_date ? ` to ${item.end_date}` : ''} • {(item.flights || item.legs || []).length} flight{(item.flights || item.legs || []).length !== 1 ? 's' : ''} • {(item.hotels || []).length} hotel{(item.hotels || []).length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '4px 8px' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px', cursor: 'pointer' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px', cursor: 'pointer' }}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', minWidth: '80px', textAlign: 'right' }}>
                    €{((item.cost || 0) * item.quantity).toLocaleString()}
                  </div>

                  <button onClick={() => removeFromCart(item.id)} style={{ padding: '8px', color: '#EF4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Hotels in this trip */}
              {item.hotels && item.hotels.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <Hotel size={14} style={{ color: 'var(--color-accent-blue)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Hotels ({item.hotels.length})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    {item.hotels.map((hotel, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--font-size-xs)'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{hotel.name}</div>
                          <div style={{ color: 'var(--color-text-tertiary)' }}>
                            {hotel.city} • €{Math.round(hotel.pricePerNight)}/night
                            {hotel.rating && (
                              <span style={{ marginLeft: '6px' }}>
                                <Star size={10} fill="var(--color-accent-amber)" color="var(--color-accent-amber)" style={{ verticalAlign: '-1px' }} /> {Number(hotel.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeHotelFromCartItem(item.id, idx)}
                          title="Remove hotel"
                          style={{
                            padding: '4px', cursor: 'pointer', color: '#EF4444',
                            background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%',
                            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit trip toggle */}
              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => toggleExpand(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer',
                    background: isExpanded ? 'rgba(124, 58, 237, 0.15)' : 'var(--color-bg-tertiary)',
                    color: isExpanded ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                    border: `1px solid ${isExpanded ? 'rgba(124, 58, 237, 0.4)' : 'var(--color-border)'}`
                  }}
                >
                  <Pencil size={12} />
                  {isExpanded ? 'Close' : 'Edit Hotels'}
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <button
                  onClick={() => router.push('/trips')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer',
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  Modify Full Trip
                </button>
              </div>

              {/* Expandable hotel browser */}
              {isExpanded && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                    Browse Hotels to Add
                  </div>

                  {/* City tabs */}
                  {destinations.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                      {destinations.map(city => (
                        <button
                          key={city}
                          onClick={() => setActiveHotelCity(prev => ({ ...prev, [item.id]: city }))}
                          style={{
                            padding: '4px 12px', borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer',
                            background: city === currentCity ? 'rgba(124, 58, 237, 0.15)' : 'var(--color-bg-secondary)',
                            color: city === currentCity ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                            border: `1px solid ${city === currentCity ? 'rgba(124, 58, 237, 0.4)' : 'var(--color-border)'}`
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}

                  {loadingHotels[item.id] ? (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', padding: 'var(--space-4)', textAlign: 'center' }}>Loading hotels...</div>
                  ) : cityHotelList.length === 0 ? (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', padding: 'var(--space-4)', textAlign: 'center' }}>No hotels found for {currentCity}</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                      {cityHotelList.slice(0, 6).map((hotel) => {
                        const alreadyAdded = existingHotelNames.includes(`${hotel.name}-${hotel.city}`);
                        return (
                          <div key={hotel.id} style={{
                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)'
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>{hotel.name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                                €{hotel.pricePerNight}/night
                                {hotel.rating && <> • <Star size={9} fill="var(--color-accent-amber)" color="var(--color-accent-amber)" style={{ verticalAlign: '-1px' }} /> {Number(hotel.rating).toFixed(1)}</>}
                              </div>
                            </div>
                            <button
                              onClick={() => addHotelToCartItem(item.id, hotel)}
                              disabled={alreadyAdded}
                              style={{
                                padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                                fontSize: '10px', fontWeight: 600, cursor: alreadyAdded ? 'default' : 'pointer',
                                background: alreadyAdded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                                color: alreadyAdded ? 'var(--color-accent-green)' : 'var(--color-accent-primary)',
                                border: `1px solid ${alreadyAdded ? 'rgba(16, 185, 129, 0.3)' : 'rgba(124, 58, 237, 0.3)'}`
                              }}
                            >
                              {alreadyAdded ? '✓ Added' : '+ Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Total</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>€{cartTotal.toLocaleString()}</div>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          style={{ background: 'var(--gradient-primary)', color: 'white', padding: '16px 32px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--font-size-base)', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
