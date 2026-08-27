'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const SavedTripsContext = createContext();

export function SavedTripsProvider({ children }) {
  const [savedTrips, setSavedTrips] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrated = useRef(false);

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
