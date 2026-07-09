import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Gamepad2, Coffee, BookOpen, ArrowRight, Camera, Clock, Heart } from 'lucide-react';
import { THEMES } from '../constants/data';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// --- COZY SCRAPBOOK UI COMPONENTS ---

const WashiTape = ({ className, color = "bg-white/60" }) => (
  <div 
    className={`absolute w-12 h-5 md:w-16 md:h-6 backdrop-blur-sm shadow-sm z-20 mix-blend-overlay ${color} ${className}`}
    style={{ 
      borderLeft: '2px dashed rgba(71, 44, 32, 0.2)', 
      borderRight: '2px dashed rgba(71, 44, 32, 0.2)' 
    }} 
  />
);

const Paperclip = ({ className }) => (
  <div className={`absolute w-3 h-10 md:w-4 md:h-12 border-[2.5px] border-[#472C20]/70 rounded-full z-30 shadow-[1px_1px_0_rgba(71,44,32,0.3)] bg-gradient-to-b from-gray-100 to-gray-300 ${className}`}>
    <div className="absolute top-1 right-[2px] bottom-3 w-1.5 border-r-[2.5px] border-t-[2.5px] border-b-[2.5px] border-[#472C20]/70 rounded-r-full"></div>
  </div>
);

const ScrapbookCard = ({ children, colSpan, bgClass, rotate = 0, onClick, delay = 0, extraClasses = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, type: "spring", bounce: 0.3 }}
    whileHover={{ scale: 1.02, rotate: rotate === 0 ? 1 : 0, zIndex: 30 }}
    whileTap={{ scale: 0.98, boxShadow: "2px 2px 0px #472C20", transform: "translate(4px, 4px)" }}
    onClick={onClick}
    className={`relative cursor-pointer border-[3px] border-[#472C20] rounded-[24px] p-5 md:p-6 shadow-[8px_8px_0_#472C20] flex flex-col group transition-all duration-300 ${colSpan} ${bgClass} ${extraClasses}`}
  >
    {children}
  </motion.div>
);

const Home = ({ onNavigate }) => {
  const [liveMenu, setLiveMenu] = useState([]);
  
  // --- Global Cafe Settings State matched with Portal ---
  const [cafeInfo, setCafeInfo] = useState({
    name: "Dumble' Door",
    location: "Jagda, Rourkela",
    locationText: "Jagda, Rourkela",
    days: "Tue-Sun",
    startDay: "Tuesday",
    endDay: "Sunday",
    hours: "11:30 - 9:00"
  });

  useEffect(() => {
    // 1. Fetch live menu for sticky notes
    const unsubMenu = onSnapshot(doc(db, "settings", "fullMenu"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().data;
        const allItems = [];
        Object.values(data).forEach(cat => {
          if (cat.items && !cat.items.soldOut) allItems.push(...cat.items);
        });
        setLiveMenu(allItems.sort(() => 0.5 - Math.random()).slice(0, 6));
      }
    });

    // 2. Fetch live Cafe Info
    const unsubInfo = onSnapshot(doc(db, "settings", "cafeInfo"), (docSnap) => {
      if (docSnap.exists()) {
        setCafeInfo(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    return () => {
      unsubMenu();
      unsubInfo();
    };
  }, []);

  return (
    <div className="py-4 md:py-8 px-4 md:px-6 relative overflow-clip select-none">
      
      {/* --- LIVE SCRAPBOOK BACKGROUND ENGINE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
        
        {/* --- TOP ELEMENTS --- */}
        <motion.div animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[2%] left-[2%] md:left-[6%] bg-[#FFFDF9] border border-[#472C20]/20 p-2 md:p-4 shadow-sm opacity-70 flex flex-col items-center rotate-[-6deg] z-0 scale-75 md:scale-100 origin-top-left">
          <WashiTape className="-top-3 left-2 md:left-4 rotate-[10deg] bg-[#D97757]/40" />
          <Clock size={16} className="text-[#472C20]/50 mb-1" />
          <span className="font-mono text-[10px] font-bold text-[#472C20] uppercase tracking-widest">
            {cafeInfo.startDay && cafeInfo.endDay 
              ? `${cafeInfo.startDay.substring(0,3)}-${cafeInfo.endDay.substring(0,3)}` 
              : cafeInfo.days}
          </span>
          <span className="font-serif font-black text-xl text-[#D97757] uppercase">{cafeInfo.hours}</span>
        </motion.div>

        <motion.div animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-40px] right-[5%] md:right-[25%] flex flex-col items-center origin-top opacity-70 z-0 scale-75 md:scale-100">
          <div className="w-[1.5px] h-8 md:h-12 bg-[#472C20]/30"></div>
          <div className="bg-[#FEF6E4] border border-[#472C20]/15 px-3 py-1.5 shadow-sm rounded-b-md relative flex flex-col items-center">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#472C20]/40 rounded-full"></div>
            <span className="font-cursive text-xs text-[#472C20] opacity-80 mt-1">tea time</span>
          </div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0], rotate: [12, 16, 12] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[6%] right-[2%] md:top-[4%] md:right-[8%] w-16 h-16 bg-[#FDF8E1] rounded-full border-[3px] border-[#D97757]/60 shadow-sm flex items-center justify-center border-dashed opacity-70 z-0 scale-75 md:scale-100">
           <span className="font-serif font-black text-[#D97757]/80 text-[10px] uppercase tracking-widest transform -rotate-12">Enjoy!</span>
        </motion.div>

        <motion.div animate={{ y: [0, -15, 0], rotate: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[25%] md:top-[35%] left-[2%] md:left-[4%] text-4xl opacity-40 drop-shadow-sm z-0 scale-75 md:scale-100">
          ⭐
        </motion.div>
        
        <motion.div animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[55%] md:top-[60%] left-[1%] md:left-[3%] bg-[#E6DFD5] p-3 shadow-md border border-[#472C20]/10 rotate-[-12deg] opacity-60 z-0 scale-75 md:scale-100 origin-left">
           <WashiTape className="-top-3 left-2 rotate-[15deg] bg-white/40" />
           <p className="font-cursive text-2xl text-[#472C20]/70">yum!</p>
        </motion.div>

        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-[5%] md:bottom-[10%] left-[3%] md:left-[6%] text-3xl opacity-40 drop-shadow-sm z-0 scale-75 md:scale-100">
          ✨
        </motion.div>

        <div className="absolute bottom-[5%] md:bottom-[8%] right-[4%] md:right-[8%] opacity-50 flex gap-2 rotate-[15deg] drop-shadow-sm scale-75 md:scale-100 z-0">
          <div className="w-3 h-4 bg-[#8D5B4C] rounded-full border border-[#472C20]/30 relative"><div className="absolute inset-y-0.5 left-1/2 w-[1px] bg-[#472C20]/40 rotate-12"></div></div>
          <div className="w-3 h-4 bg-[#8D5B4C] rounded-full border border-[#472C20]/30 relative rotate-[45deg] mt-2"><div className="absolute inset-y-0.5 left-1/2 w-[1px] bg-[#472C20]/40 -rotate-12"></div></div>
          <div className="w-3 h-4 bg-[#8D5B4C] rounded-full border border-[#472C20]/30 relative rotate-[-25deg] -mt-1"><div className="absolute inset-y-0.5 left-1/2 w-[1px] bg-[#472C20]/40 rotate-6"></div></div>
        </div>

        <motion.div animate={{ y: [10, -10, 10], rotate: [3, -3, 3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[45%] md:top-[55%] right-[1%] md:right-[3%] bg-white p-2 pb-5 border border-[#472C20]/20 shadow-md opacity-50 rotate-[8deg] scale-75 md:scale-100 origin-right z-0">
          <WashiTape className="-top-3 right-4 rotate-[-15deg] bg-[#B4C5E4]/60" />
          <div className="w-24 h-24 bg-[#E8E2D5] flex items-center justify-center border border-[#472C20]/10 overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#472C20_25%,transparent_25%,transparent_75%,#472C20_75%,#472C20)] bg-[length:10px_10px]"></div>
            <span className="text-3xl z-10">☕</span>
          </div>
          <p className="font-cursive text-center text-sm text-[#472C20] mt-1.5">cozy days</p>
        </motion.div>

        {liveMenu.map((item, i) => {
          const positions = [
            { top: '26%', left: '78%', rot: 12, bg: '#FDF8E1' },
            { top: '82%', left: '10%', rot: -8, bg: '#EAF0E4' },
            { top: '15%', left: '38%', rot: -4, bg: '#FDEAEB' },
            { top: '75%', left: '68%', rot: 15, bg: '#E8F0F4' },
            { top: '40%', left: '4%', rot: 6, bg: '#FDF8E1' },
            { top: '45%', left: '80%', rot: -12, bg: '#EAF0E4' },
          ];
          const pos = positions[i % positions.length];
          
          return (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.65, y: [0, -15, 0], rotate: [pos.rot, pos.rot + 5, pos.rot] }} transition={{ duration: 7 + (i * 2), repeat: Infinity, ease: "easeInOut", delay: i }} className="absolute px-3 py-2 md:px-4 md:py-3 shadow-sm border border-[#472C20]/10 scale-75 md:scale-100 origin-center z-0" style={{ top: pos.top, left: pos.left, backgroundColor: pos.bg }}>
              <WashiTape className="-top-2 left-1/2 -translate-x-1/2 rotate-1 bg-white/30 w-8 md:w-10" />
              <p className="font-cursive text-base md:text-lg text-[#472C20] leading-none mt-1">{item.n}</p>
              <p className="font-mono text-[8px] md:text-[10px] font-bold text-[#472C20]/60 mt-1">₹{item.p}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-5xl mx-auto relative z-10 mt-2 md:mt-4">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-8 md:mb-16 relative">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-[#E2C7C0] border-2 border-[#472C20] px-3 md:px-4 py-1.5 rounded-full shadow-[3px_3px_0_#472C20] mb-4 md:mb-6 transform -rotate-2">
            <span className="w-2 h-2 bg-[#472C20] rounded-full animate-pulse"></span>
            <span className="font-mono font-bold tracking-widest uppercase text-[8px] md:text-[10px] text-[#472C20]">Gather & Play</span>
          </motion.div>
          
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-[8rem] font-serif font-black text-[#472C20] tracking-tighter relative z-10 leading-none">
              {cafeInfo.name}
            </h1>
            <span className="font-cursive text-4xl md:text-7xl text-[#D97757] absolute -bottom-6 md:-bottom-8 -right-4 md:-right-8 transform -rotate-6 z-0 opacity-80">
              Café
            </span>
          </div>
        </div>

        {/* --- SCRAPBOOK COLLAGE GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
          
          {/* 1. HERO REVIEW CARD */}
          <ScrapbookCard colSpan="md:col-span-7" bgClass="bg-[#F4E1D2]" rotate={-1.5} delay={0.1} onClick={() => onNavigate('review', THEMES.rose)}>
            <WashiTape className="-top-2 -left-4 rotate-[12deg] bg-[#B4C5E4]/80" />
            
            <div className="absolute -bottom-4 md:-bottom-5 right-4 md:right-6 w-16 h-20 md:w-20 md:h-24 bg-[#FDFBF7] border border-[#472C20]/15 shadow-[2px_4px_10px_rgba(71,44,32,0.15)] rotate-[12deg] p-1.5 flex flex-col pointer-events-none group-hover:rotate-[18deg] group-hover:scale-110 transition-all duration-500 z-40">
              <div className="flex-1 bg-[#DBC8C4]/60 relative overflow-hidden border border-[#472C20]/5">
                <Camera size={16} className="absolute inset-0 m-auto text-[#472C20]/40 md:w-5 md:h-5" strokeWidth={1.5} />
              </div>
              <div className="h-5 md:h-6 flex items-center justify-center">
                <span className="font-cursive text-[#472C20]/80 text-[8px] md:text-[10px] transform -rotate-2">memories</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-center p-2 md:p-4">
              <span className="font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#8D5B4C] mb-3 border-b border-[#8D5B4C]/20 pb-1 w-fit">Guestbook Entry</span>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-[#472C20] leading-[1.1] mb-6 relative z-10">
                Leave a piece of <br/>
                <span className="font-cursive text-4xl md:text-5xl text-[#D97757] font-normal transform -rotate-2 inline-block mt-1 relative">
                  your heart
                  <svg className="absolute -bottom-2 md:-bottom-3 left-0 w-full h-2 md:h-3 text-[#D97757]/60" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 10 Q 25 20, 50 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h2>
              <button className="w-fit bg-[#472C20] text-[#FDFBF7] font-mono font-bold uppercase tracking-widest text-[10px] md:text-[11px] px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-[4px_4px_0_rgba(217,119,87,0.6)] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0_rgba(217,119,87,0.6)] transition-all flex items-center gap-2">
                Share Memory <ArrowRight size={14} />
              </button>
            </div>
          </ScrapbookCard>

          {/* 2. MENU CARD */}
          <ScrapbookCard colSpan="md:col-span-5" bgClass="bg-[#E6DFD5]" rotate={2} delay={0.2} onClick={() => onNavigate('menu', THEMES.forest)} extraClasses="overflow-hidden">
            <WashiTape className="-top-3 right-10 rotate-[5deg] bg-white/40" />
            
            <div className="absolute -top-8 -right-6 md:-top-12 md:-right-8 w-36 h-36 md:w-48 md:h-48 border-[6px] border-[#8D5B4C]/20 rounded-full opacity-50 pointer-events-none" style={{ borderRadius: '45% 55% 40% 60%' }}></div>
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-24 h-24 md:w-36 md:h-36 border-[3px] border-[#8D5B4C]/15 rounded-full opacity-40 pointer-events-none" style={{ borderRadius: '55% 45% 60% 40%' }}></div>

            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#472C20] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                  <Coffee size={18} className="text-[#472C20] md:w-5 md:h-5" />
                </div>
                <div className="bg-[#FDFBF7] border-2 border-[#472C20] font-mono font-bold text-[8px] md:text-[9px] uppercase tracking-widest px-2 py-1 shadow-[2px_2px_0_#472C20] transform rotate-3">
                  Live Data
                </div>
              </div>
              
              <div className="mt-8 md:mt-12">
                <h3 className="text-4xl md:text-5xl font-serif font-black text-[#472C20] leading-none mb-1 md:mb-2">Menu</h3>
                <p className="font-cursive text-2xl md:text-3xl text-[#8D5B4C]">Freshly baked cravings</p>
              </div>
            </div>
          </ScrapbookCard>

          {/* 3. CAFÉ CHRONICLE CARD → now opens the Memory Wall */}
          <ScrapbookCard colSpan="md:col-span-4" bgClass="bg-[#C1D7D0]" rotate={-2} delay={0.3} onClick={() => onNavigate('memory-wall', THEMES.navy)} extraClasses="overflow-hidden">
            <Paperclip className="-top-3 md:-top-4 left-1/2 -translate-x-1/2 rotate-[10deg]" />
            
            <div className="absolute inset-0 p-3 md:p-4 opacity-10 pointer-events-none text-[5px] md:text-[6px] text-justify leading-tight font-serif break-words overflow-hidden text-[#472C20]">
              {[...Array(20)].map((_, i) => "The cozy cafe on the corner was filled with laughter and the smell of fresh coffee. The memory wall was full of joy. ").join('')}
            </div>

            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <BookOpen size={20} className="text-[#472C20] md:w-6 md:h-6" />
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-[#472C20]/20 flex items-center justify-center opacity-50 bg-[#FDFBF7]/40 backdrop-blur-sm">
                  <Heart size={12} className="text-[#472C20]" />
                </div>
              </div>
              <div>
                <p className="font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#472C20]/60 mb-1 border-b border-[#472C20]/20 pb-1">Community Ledger</p>
                <h3 className="text-2xl md:text-3xl font-serif font-black leading-tight">Café<br/>Chronicle</h3>
              </div>
            </div>
          </ScrapbookCard>

          {/* 4. ARCADE CARD */}
          <ScrapbookCard colSpan="md:col-span-4" bgClass="bg-[#FDFBF7]" rotate={1.5} delay={0.4} onClick={() => onNavigate('games', THEMES.cream)} extraClasses="overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-8 md:h-10 opacity-80" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #D97757 25%, transparent 25%, transparent 75%, #D97757 75%, #D97757), repeating-linear-gradient(-45deg, #D97757 25%, transparent 25%, transparent 75%, #D97757 75%, #D97757)',
              backgroundSize: '12px 12px md:16px 16px'
            }}></div>
            <div className="absolute top-8 md:top-10 left-0 right-0 border-b-[3px] border-[#472C20]"></div>

            <div className="absolute top-1/2 -right-12 md:-right-16 transform -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#111] border-[4px] border-gray-800 shadow-inner flex items-center justify-center group-hover:rotate-12 transition-transform duration-700 pointer-events-none z-0">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#D97757] border-2 border-[#111] flex items-center justify-center">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white border border-[#111]"></div>
              </div>
              <div className="absolute inset-1.5 md:inset-2 rounded-full border border-gray-700/50"></div>
              <div className="absolute inset-4 md:inset-5 rounded-full border border-gray-700/50"></div>
              <div className="absolute inset-6 md:inset-8 rounded-full border border-gray-700/50"></div>
            </div>

            <WashiTape className="top-4 md:top-6 left-2 rotate-[-8deg] bg-white/80 shadow-md" />
            
            <div className="flex flex-col h-full items-start justify-end relative z-10 pt-12 md:pt-16 w-3/4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FDFBF7] rounded-full border-2 border-[#472C20] flex items-center justify-center shadow-[4px_4px_0_#472C20] mb-3 md:mb-4 group-hover:-translate-y-1 transition-transform">
                <Gamepad2 size={20} className="text-[#D97757] md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-black text-[#472C20] mb-1">Arcade</h3>
              <p className="font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#472C20]/60">Kill some time</p>
            </div>
          </ScrapbookCard>

          {/* 5. VISIT US CARD */}
          <ScrapbookCard colSpan="md:col-span-4" bgClass="bg-[#B4C5E4]" rotate={-1} delay={0.5} onClick={() => onNavigate('directory', THEMES.lavender)} extraClasses="overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 md:h-2 opacity-80" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #D97757 0, #D97757 8px, transparent 8px, transparent 16px, #1E3A8A 16px, #1E3A8A 24px, transparent 24px, transparent 32px)'
            }}></div>

            <div className="absolute top-4 right-3 md:top-6 md:right-4 w-12 h-14 md:w-14 md:h-16 bg-[#FDFBF7] flex flex-col items-center justify-center transform rotate-[6deg] drop-shadow-md z-10"
              style={{
                maskImage: 'radial-gradient(circle at 0px 4px, transparent 2px, black 2.5px), radial-gradient(circle at 100% 4px, transparent 2px, black 2.5px)',
                maskSize: '100% 8px',
                maskRepeat: 'repeat-y'
              }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E2C7C0]/40 border border-[#472C20]/20 flex flex-col items-center justify-center text-[#472C20]/50 relative overflow-hidden">
                <span className="text-[6px] md:text-[8px] font-mono">POST</span>
                <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/30"></div>
              </div>
            </div>

            <div className="absolute bottom-5 right-5 w-20 md:bottom-6 md:right-6 md:w-24 space-y-1.5 md:space-y-2 opacity-30 pointer-events-none">
              <div className="h-[1.5px] md:h-[2px] bg-[#472C20]"></div>
              <div className="h-[1.5px] md:h-[2px] bg-[#472C20]"></div>
              <div className="h-[1.5px] md:h-[2px] bg-[#472C20]"></div>
            </div>

            <div className="flex flex-col h-full justify-between relative z-10 pt-2 md:pt-4">
              <MapPin size={20} className="text-[#472C20] md:w-6 md:h-6" />
              <div className="mt-8 md:mt-12 w-3/4 md:w-2/3">
                <h3 className="text-xl md:text-2xl font-serif font-black text-[#472C20] mb-0.5 md:mb-1">Directory</h3>
                <p className="font-mono text-[8px] md:text-[10px] font-bold opacity-70 uppercase tracking-widest text-[#472C20]">
                  {cafeInfo.locationText || cafeInfo.location}
                </p>
              </div>
            </div>
          </ScrapbookCard>

        </div>
      </div>
    </div>
  );
};

export default Home;