import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // Track the last action type to signal the companion avatar
  const [lastAction, setLastAction] = useState({ type: null, timestamp: 0 });

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine'; 
      oscillator.frequency.setValueAtTime(580, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08); 

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.log("Audio contextual block prevented click sound playback:", e);
    }
  };

  const addToCart = (item, event) => {
    playClickSound();

    const id = Date.now() + Math.random();
    const newNotif = {
      id,
      text: `Added ${item.n}! ✨`,
      x: event ? event.clientX : window.innerWidth / 2,
      y: event ? event.clientY : window.innerHeight / 2
    };

    setNotifications((prev) => [...prev, newNotif]);
    setLastAction({ type: 'ADD_ITEM', timestamp: Date.now() });

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1000);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.n === item.n);
      if (existingItem) {
        return prevItems.map((i) =>
          i.n === item.n ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemName, amount) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.n === itemName) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemName) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.n !== itemName));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.p * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        notifications,
        lastAction,
        setLastAction,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider wrapper!");
  }
  return context;
}