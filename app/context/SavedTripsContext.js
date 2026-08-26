'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SavedTripsContext = createContext();

export function SavedTripsProvider({ children }) {
  const [savedTrips, setSavedTrips] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tripwise_saved_trips');
      if (stored) {
        try { setSavedTrips(JSON.parse(stored)); } catch (e) {}
      }
    }
  }, []);

  const saveTrip = (trip) => {
    const updated = [trip, ...savedTrips];
    setSavedTrips(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tripwise_saved_trips', JSON.stringify(updated));
    }
  };

  const deleteTrip = (id) => {
    const updated = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tripwise_saved_trips', JSON.stringify(updated));
    }
  };

  return (
    <SavedTripsContext.Provider value={{ savedTrips, saveTrip, deleteTrip }}>
      {children}
    </SavedTripsContext.Provider>
  );
}

export function useSavedTrips() {
  return useContext(SavedTripsContext);
}
