import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Fallback data to ensure the screen is never blank
const MOCK_MENU = {
  "Italian Pasta": {
    theme: "blue",
    items: [
      { n: "Spaghetti Meatball Pasta", p: "209" },
      { n: "Baked Mac & Cheese", p: "249" }
    ]
  },
  "Burgers": {
    theme: "red",
    items: [{ n: "The Big Brown Burger", p: "159" }]
  }
};

export default function MenuBoard({ setTheme }) {
  const [menu, setMenu] = useState(null);
  const [soldOutItems, setSoldOutItems] = useState([]);

  useEffect(() => {
    // We set the menu immediately to prevent the blank screen
    console.log("MenuBoard: Initializing with fallback menu data.");
    setMenu(MOCK_MENU);
    setSoldOutItems(["Baked Mac & Cheese"]);
  }, []);

  // Simple loading state
  if (!menu) return <div className="p-20 text-center font-mono text-xl">Brewing...</div>;

  return (
    <div style={{ backgroundColor: '#FAF6EE', minHeight: '100vh', padding: '2rem' }}>
      <h1 className="text-7xl font-serif text-center mb-12">The Menu.</h1>
      
      <div className="max-w-4xl mx-auto space-y-12">
        {Object.entries(menu).map(([category, info], idx) => (
          <div key={category} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-black">
            <h2 className="text-4xl font-bold mb-6 underline">{category}</h2>
            <ul className="space-y-4">
              {info.items.map((item) => {
                const isSoldOut = soldOutItems.includes(item.n);
                return (
                  <li key={item.n} className={`flex justify-between text-xl border-b border-gray-200 pb-2 ${isSoldOut ? 'opacity-50' : ''}`}>
                    <span>{item.n} {isSoldOut && <span className="text-xs uppercase">(Sold Out)</span>}</span>
                    <span className="font-bold">₹{item.p}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
//