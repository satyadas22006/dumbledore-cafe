import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { THEMES } from '../constants/data';
import { db } from '../firebase'; 
import { doc, onSnapshot } from 'firebase/firestore';
// --- DUMMY DATA FOR DESIGN TESTING ---
const DUMMY_MENU = {
  "Italian Pasta": {
    theme: THEMES.navy,
    items: [
      { n: "Spaghetti Meatball Pasta", p: "209", soldOut: false },
      { n: "Baked Mac & Cheese", p: "249", soldOut: true },
      { n: "Truffle Mushroom Risotto", p: "289", soldOut: false }
    ]
  },
  "Cozy Burgers": {
    theme: THEMES.terra,
    items: [
      { n: "The Big Brown Burger", p: "159", soldOut: false },
      { n: "Crispy Shroom Slider", p: "129", soldOut: false },
      { n: "Spicy Paneer Crunch", p: "149", soldOut: false }
    ]
  },
  "Sweet Tooth": {
    theme: THEMES.rose,
    items: [
      { n: "Matcha Affogato", p: "149", soldOut: false },
      { n: "Mochi Waffles", p: "199", soldOut: false },
      { n: "Lavender Cold Brew", p: "129", soldOut: false }
    ]
  }
};

// --- SMOOTH SCROLLING SECTION COMPONENT ---
const MenuSection = ({ title, info, idx, setTheme }) => {
  const ref = useRef(null);
  
  // Triggers when the section hits the exact middle of the screen
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px", once: false });

  useEffect(() => {
    if (isInView) {
      setTheme(info.theme);
    }
  }, [isInView, info.theme, setTheme]);

  // Alternate pastel tags
  const tagColors = ['bg-[#A8E6CF]', 'bg-[#FFB6C9]', 'bg-[#FFE08A]', 'bg-[#D4EBFF]'];
  const tagColor = tagColors[idx % tagColors.length];

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 min-h-[70vh] py-16`}
    >
      {/* Category Title Area (Inherits global text color automatically) */}
      <div className="w-full md:w-5/12 text-center md:text-left flex flex-col items-center md:items-start">
        <div className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full border-2 border-[#472C20] font-black text-[10px] text-[#472C20] uppercase tracking-widest shadow-[3px_3px_0_#472C20] mb-6 ${tagColor}`}>
          <Sparkles size={12} /> Chapter {idx + 1}
        </div>
        <h2 className="text-6xl md:text-8xl font-cursive transform -rotate-3 drop-shadow-sm">
          {title}
        </h2>
      </div>

      {/* Menu Items Card (Explicitly styled to not inherit global white text) */}
      <div className="w-full md:w-7/12 bg-[#FFFDF9] border-[4px] border-[#472C20] rounded-[2.5rem] p-8 md:p-10 shadow-[8px_8px_0_#472C20] hover:shadow-[12px_12px_0_#472C20] transition-shadow duration-300">
        <ul className="space-y-6 text-[#472C20]">
          {info.items.map((item, i) => {
            return (
              <li key={i} className={`flex justify-between items-end border-b-2 border-dashed border-[#472C20]/20 pb-4 transition-all ${item.soldOut ? 'opacity-40 grayscale' : 'hover:translate-x-2'}`}>
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-2xl md:text-3xl font-black flex items-center gap-3">
                    {item.n}
                    {item.soldOut && (
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-[#FF9B9B] px-2 py-1 rounded-full border-2 border-[#472C20] shadow-[2px_2px_0_#472C20]">
                        Sold Out
                      </span>
                    )}
                  </span>
                </div>
                <span className="font-mono font-black text-xl text-[#FF9F29] shrink-0 bg-white border-2 border-[#472C20] px-3 py-1.5 rounded-xl shadow-[3px_3px_0_#472C20]">
                  ₹{item.p}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
};

// --- MAIN MENU BOARD ---
export default function MenuBoard({ setTheme, theme }) {
  const navigate = useNavigate();

  // Dynamic grid that uses the current text color at 10% opacity
  const dynamicGridStyle = {
    backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    opacity: 0.1, // Keeps the grid subtle against the shifting background colors
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none'
  };

  return (
    <div className="min-h-screen relative overflow-hidden select-none pb-24 transition-colors duration-700">
      {/* Background Grid Overlay */}
      <div style={dynamicGridStyle}></div>

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Navigation */}
        <div className="mb-16 flex justify-between items-center">
          <button 
            onClick={() => navigate('/cafe')} 
            className="flex items-center gap-2 text-sm font-black tracking-wider uppercase hover:opacity-70 transition-opacity bg-white border-2 border-[#472C20] text-[#472C20] px-4 py-2 rounded-full shadow-[3px_3px_0_#472C20]"
          >
            <ArrowLeft size={16} className="stroke-[3]" /> Back to Cafe
          </button>
        </div>

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
        
        {/* Render Menu Sections */}
        <div className="space-y-12">
          {Object.entries(DUMMY_MENU).map(([category, info], idx) => (
            <MenuSection key={category} title={category} info={info} idx={idx} setTheme={setTheme} />
          ))}
        </div>

      </div>
    </div>
  );
}