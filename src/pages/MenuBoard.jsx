import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const MenuSection = ({ title, info, idx, setTheme, soldOutItems }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });
  useEffect(() => { if (isInView) setTheme(info.theme); }, [isInView, info.theme, setTheme]);

  return (
    <div ref={ref} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 min-h-[70vh] py-20`}>
      <div className="w-full md:w-5/12 text-center md:text-left"><h2 className="text-7xl md:text-9xl font-cursive transform -rotate-3">{title}</h2></div>
      <div className="w-full md:w-7/12">
        <ul className="space-y-8">
          {info.items.map(item => {
            const isSoldOut = soldOutItems.includes(item.n);
            return (
              <li key={item.n} className={`flex justify-between items-end border-b border-current border-opacity-20 border-dashed pb-3 transition-opacity ${isSoldOut ? 'opacity-40' : 'opacity-100'}`}>
                <span className="font-serif text-3xl md:text-4xl flex items-center gap-4">
                  {item.n} 
                  {isSoldOut && <span className="text-xs font-mono uppercase tracking-widest bg-current text-white px-2 py-1 rounded">Sold Out</span>}
                </span>
                <span className="font-mono font-bold text-2xl shrink-0 opacity-80">₹{item.p}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const MenuBoard = ({ setTheme }) => {
  const [menu, setMenu] = useState(null);
  const [soldOutItems, setSoldOutItems] = useState([]);

  // Live listener for the Menu Data AND Sold Out State
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "fullMenu"), (doc) => {
      if (doc.exists()) setMenu(doc.data().data);
    });

    const unsubSoldOut = onSnapshot(doc(db, "settings", "menuState"), (doc) => {
      if (doc.exists() && doc.data().soldOut) setSoldOutItems(doc.data().soldOut);
    });

    return () => { unsub(); unsubSoldOut(); };
  }, []);

  if (!menu) return <div className="text-center p-20 text-white font-mono">Loading Cafe...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-8xl font-serif text-center mb-48">The Menu.</h1>
      {Object.entries(menu).map(([cat, info], idx) => (
        <MenuSection key={cat} title={cat} info={info} idx={idx} setTheme={setTheme} soldOutItems={soldOutItems} />
      ))}
    </motion.div>
  );
};

export default MenuBoard;