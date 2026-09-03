'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useCart } from './CartContext';

const SavedTripsContext = createContext();

export function SavedTripsProvider({ children }) {
  const [savedTrips, setSavedTrips] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrated = useRef(false);
  const { cart, updateCartItem } = useCart();

  useEffect(() => {
    const stored = localStorage.getItem('tripwise_saved_trips');
    if (stored) {
      try { setSavedTrips(JSON.parse(stored)); } catch (e) {}
    }
    hydrated.current = true;
    setIsHydrated(true);
  }, []);

  const saveTrip = (trip) => {
    setSavedTrips(prev => {
      const updated = [trip, ...prev];
      localStorage.setItem('tripwise_saved_trips', JSON.stringify(updated));
      return updated;
    });
  };

  const updateTrip = (updatedTrip) => {
    setSavedTrips(prev => {
      const updated = prev.map(t => t.id === updatedTrip.id ? updatedTrip : t);
      localStorage.setItem('tripwise_saved_trips', JSON.stringify(updated));
      return updated;
    });
    // Sync to cart if this trip is in the cart
    const inCart = cart.some(item => item.id === updatedTrip.id);
    if (inCart) {
      const { quantity, ...tripData } = updatedTrip;
      updateCartItem(updatedTrip.id, tripData);
    }
  };

  const deleteTrip = (id) => {
    setSavedTrips(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('tripwise_saved_trips', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SavedTripsContext.Provider value={{ savedTrips, saveTrip, updateTrip, deleteTrip, isHydrated }}>
      {children}
    </SavedTripsContext.Provider>
  );
}

export function useSavedTrips() {
  return useContext(SavedTripsContext);
}
