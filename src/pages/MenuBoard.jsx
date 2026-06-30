import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase'; 
import { doc, onSnapshot } from 'firebase/firestore';
import { THEMES } from '../constants/data';
import BackToCafeButton from '../components/BackToCafeButton';
// --- SMOOTH SCROLLING SECTION COMPONENT ---
// --- SMOOTH SCROLLING SECTION COMPONENT ---
const MenuSection = ({ title, info, idx, setTheme }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px", once: false });

  // 8 matching pastel themes that cycle
  const palettes = [
    { bg: '#A8E6CF', text: '#2D5A4D' }, // Mint
    { bg: '#FFB6C9', text: '#5D2E3A' }, // Rose
    { bg: '#FFE08A', text: '#5D4A25' }, // Cream
    { bg: '#D4EBFF', text: '#2A4B66' }, // Sky
    { bg: '#E5D3FF', text: '#4B3A66' }, // Lavender
    { bg: '#FFD3B6', text: '#664A35' }, // Peach
    { bg: '#D4F1F4', text: '#2A5D5A' }, // Aqua
    { bg: '#FADADD', text: '#663A40' }  // Pale Pink
  ];

  // Logic: Cycle back to index 0 if idx >= 8
  const currentPalette = palettes[idx % palettes.length];

  useEffect(() => {
    if (isInView) {
      // Pass the actual palette object to App.jsx so the entire page shifts
      setTheme(currentPalette);
    }
  }, [isInView, currentPalette, setTheme]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 min-h-[70vh] py-16`}
    >
      <div className="w-full md:w-5/12 text-center md:text-left flex flex-col items-center md:items-start">
        <div 
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border-2 border-[#472C20] font-black text-[10px] text-[#472C20] uppercase tracking-widest shadow-[3px_3px_0_#472C20] mb-6"
          style={{ backgroundColor: currentPalette.bg }}
        >
          <Sparkles size={12} /> Chapter {idx + 1}
        </div>
        <h2 className="text-6xl md:text-8xl font-cursive transform -rotate-3 drop-shadow-sm">
          {title}
        </h2>
      </div>

      <div className="w-full md:w-7/12 bg-[#FFFDF9] border-[4px] border-[#472C20] rounded-[2.5rem] p-8 md:p-10 shadow-[8px_8px_0_#472C20]">
        <ul className="space-y-6 text-[#472C20]">
          {(info.items || []).map((item, i) => (
            <li key={i} className={`flex justify-between items-end border-b-2 border-dashed border-[#472C20]/20 pb-4 transition-all ${item.soldOut ? 'opacity-60 grayscale' : ''}`}>
              
              {/* Item Name & Cute Sold Out Badge */}
              <div className="flex items-center gap-3">
                <span className={`font-serif text-2xl md:text-3xl font-black ${item.soldOut ? 'line-through decoration-[3px] decoration-[#472C20]/60' : ''}`}>
                  {item.n}
                </span>
                {item.soldOut && (
                  <span className="font-cursive text-xl text-rose-500 transform -rotate-6 font-bold tracking-wide">
                    *all gone!*
                  </span>
                )}
              </div>

              {/* Price Tag */}
              <span className={`font-mono font-black text-xl bg-white border-2 border-[#472C20] px-3 py-1.5 rounded-xl shadow-[3px_3px_0_#472C20] ${item.soldOut ? 'text-[#472C20]/50 line-through decoration-2' : 'text-[#FF9F29]'}`}>
                ₹{item.p}
              </span>

            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// --- MAIN MENU BOARD ---
export default function MenuBoard({ setTheme, theme }) {
  const navigate = useNavigate();
  
  // LIVE DATABASE STATE
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    // Listen to Firebase directly
    const unsubscribe = onSnapshot(doc(db, "settings", "fullMenu"), (docSnap) => {
      if (docSnap.exists()) {
        setMenuData(docSnap.data().data);
      } else {
        setMenuData({});
      }
    });
    return () => unsubscribe();
  }, []);

  // Dynamic grid that uses the current text color at 10% opacity
  // const dynamicGridStyle = {
  //   backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
  //   backgroundSize: '32px 32px',
  //   opacity: 0.1, 
  //   position: 'absolute',
  //   inset: 0,
  //   zIndex: 0,
  //   pointerEvents: 'none'
  // };

  return (
    <div className="min-h-screen relative overflow-hidden select-none pb-24 transition-colors duration-700">
      {/* Background Grid Overlay */}
      {/* <div style={dynamicGridStyle}></div> */}

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Navigation */}
        <BackToCafeButton className="mb-16" />

        {/* Big Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-24 h-8 bg-white/20 backdrop-blur-sm rotate-[-2deg] shadow-sm z-20 border border-white/40"></div>
          <h1 className="text-8xl md:text-[9rem] font-serif font-black tracking-tighter">
            The Menu.
          </h1>
          <p className="font-cursive text-3xl opacity-80 mt-2 transform rotate-2">
            Freshly cooked, just for you.
          </p>
        </motion.div>
        
        {/* Render Menu Sections or Loading State */}
        <div className="space-y-12 min-h-[50vh]">
          {!menuData ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-mono font-bold tracking-widest uppercase">Brewing the menu...</p>
            </div>
          ) : Object.keys(menuData).length === 0 ? (
            <div className="text-center font-mono font-bold tracking-widest uppercase opacity-60">
              The menu is currently being rewritten. Check back soon!
            </div>
          ) : (
            Object.entries(menuData).map(([category, info], idx) => (
              <MenuSection key={category} title={category} info={info} idx={idx} setTheme={setTheme} />
            ))
          )}
        </div>

      </div>
    </div>
  );
}