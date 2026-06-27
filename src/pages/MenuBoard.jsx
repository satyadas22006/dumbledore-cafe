import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const MenuBoard = () => {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "fullMenu"), (doc) => {
      if (doc.exists()) {
        setMenu(doc.data().data);
      }
    });
    return () => unsub();
  }, []);

  if (!menu) return <div className="text-center p-20 text-white font-mono">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] p-8 text-white">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Dumble' Door</h1>
        <p className="text-emerald-500 font-mono italic">Jagda, Rourkela</p>
      </div>

      <h1 className="text-3xl font-bold mb-12 text-center text-emerald-400">Dumble' Door Menu</h1>
      
      <div className="max-w-2xl mx-auto">
        {Object.entries(menu).map(([category, info]) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold uppercase mb-6 text-emerald-600 tracking-wider">
              {category}
            </h2>
            
            <div className="space-y-4">
              {info.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-lg">{item.n}</span>
                  <span className="text-emerald-500 font-mono">₹{item.p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBoard;