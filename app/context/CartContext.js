'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrationComplete = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem('tripwise_cart');
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch (e) {}
    }
    hydrationComplete.current = true;
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrationComplete.current) {
      localStorage.setItem('tripwise_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (trip) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === trip.id);
      if (exists) return prev;
      return [...prev, { ...trip, quantity: 1 }];
    });
  };

  const removeFromCart = (tripId) => {
    setCart(prev => prev.filter(item => item.id !== tripId));
  };

  const updateQuantity = (tripId, quantity) => {
    setCart(prev => prev.map(item =>
      item.id === tripId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateCartItem = (tripId, updatedFields) => {
    setCart(prev => prev.map(item =>
      item.id === tripId ? { ...item, ...updatedFields } : item
    ));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const itemCost = (item.cost || 0) * (item.quantity || 1);
    return sum + itemCost;
  }, 0);

  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateCartItem, clearCart, cartTotal, cartCount, isHydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
