import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const MenuBoard = () => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This creates a real-time "live" link to your Firebase database
    const unsub = onSnapshot(doc(db, "settings", "fullMenu"), (doc) => {
      if (doc.exists()) {
        setMenu(doc.data().data);
        setLoading(false);
      }
    });
    
    // This cleans up the connection when the user leaves the page
    return () => unsub();
  }, []);

  if (loading) return <div className="text-center p-20 text-white font-mono">Syncing Menu...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] p-8 text-white">
      <h1 className="text-4xl font-bold mb-12 text-center text-emerald-400">Dumble' Door Menu</h1>
      
      <div className="max-w-3xl mx-auto">
        {Object.entries(menu).map(([category, info]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-mono uppercase border-b border-emerald-900 pb-2 mb-6 text-emerald-600">
              {category}
            </h2>
            
            <div className="space-y-4">
              {info.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-lg font-medium">{item.n}</span>
                  <span className="text-emerald-400 font-mono font-bold">₹{item.p}</span>
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