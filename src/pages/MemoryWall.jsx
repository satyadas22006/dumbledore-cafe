import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; 
import BackToCafeButton from '../components/BackToCafeButton';

// Refined desaturated tab colors to cycle elegantly behind the front card
const TAB_COLORS = ['#E5BAC6', '#EAD2B6', '#B7D9E0', '#D3C5EB'];

// Custom UI components replacing emojis with high-fidelity inline graphics
const CalendarIcons = {
  January: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Pink Octopus */}
      <div className="w-7 h-7 bg-[#F4A2B4] rounded-full relative">
        <div className="absolute bottom-[-2px] left-0 right-0 flex justify-between px-1">
          <div className="w-2 h-2 bg-[#F4A2B4] rounded-full" />
          <div className="w-2 h-2 bg-[#F4A2B4] rounded-full" />
          <div className="w-2 h-2 bg-[#F4A2B4] rounded-full" />
        </div>
        <div className="absolute top-3 left-2 w-1 h-1 bg-[#2C241B] rounded-full" />
        <div className="absolute top-3 right-2 w-1 h-1 bg-[#2C241B] rounded-full" />
        <div className="absolute top-4 left-3.5 w-1 h-0.5 bg-[#2C241B] rounded-full" />
      </div>
    </div>
  ),
  February: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Blue Cloud/Spiral Cookie */}
      <div className="w-8 h-8 bg-[#BFE3EE] rounded-full relative flex items-center justify-center border-2 border-dashed border-[#A4D4E3]">
        <div className="w-4 h-4 border-2 border-[#FDFBF7] rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
      </div>
    </div>
  ),
  March: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Kiwi Slice */}
      <div className="w-8 h-8 bg-[#89C343] rounded-full border-2 border-[#6B9E30] flex items-center justify-center relative overflow-hidden">
        <div className="w-3 h-3 bg-[#EAF5CE] rounded-full" />
        <div className="absolute inset-0 border border-dotted border-[#2C241B]/40 rounded-full m-1.5" />
      </div>
    </div>
  ),
  April: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Orange Cat Head Graphic */}
      <div className="w-7 h-7 bg-[#F4A261] rounded-tl-2xl rounded-tr-2xl rounded-bl-xl rounded-br-xl relative">
        <div className="absolute top-[-4px] left-1 text-[8px] text-[#E76F51]">✦</div>
        <div className="absolute bottom-1 left-2 w-1 h-1 bg-[#2C241B] rounded-full" />
        <div className="absolute bottom-1 right-2 w-1 h-1 bg-[#2C241B] rounded-full" />
      </div>
    </div>
  ),
  May: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Cute Fried Egg */}
      <div className="w-9 h-8 bg-white border border-[#E5E5E5] rounded-full relative flex items-center justify-center shadow-xs">
        <div className="w-4 h-4 bg-[#FFC300] rounded-full absolute" />
      </div>
    </div>
  ),
  June: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Four Leaf Clover */}
      <div className="w-7 h-7 grid grid-cols-2 gap-0.5 rotate-45">
        <div className="w-3 h-3 bg-[#74C67A] rounded-full" />
        <div className="w-3 h-3 bg-[#74C67A] rounded-full" />
        <div className="w-3 h-3 bg-[#74C67A] rounded-full" />
        <div className="w-3 h-3 bg-[#74C67A] rounded-full" />
      </div>
    </div>
  ),
  July: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Golden Croissant */}
      <div className="w-8 h-5 bg-[#E9C46A] rounded-full relative overflow-hidden flex items-center justify-between px-1 border-b-2 border-[#D4A326]">
        <div className="w-0.5 h-full bg-[#D4A326]/30" />
        <div className="w-0.5 h-full bg-[#D4A326]/30" />
      </div>
    </div>
  ),
  August: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Red Tomato */}
      <div className="w-8 h-8 bg-[#E76F51] rounded-full relative shadow-inner">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#2A9D8F] rounded-full" />
      </div>
    </div>
  ),
  September: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Retro Blue Camcorder / Camera */}
      <div className="w-8 h-6 bg-[#A8DADC] rounded-md relative flex items-center justify-end px-1 border border-[#457B9D]">
        <div className="w-2 h-3 bg-[#457B9D] rounded-xs" />
        <div className="absolute left-1 w-1.5 h-1.5 bg-[#E63946] rounded-full" />
      </div>
    </div>
  ),
  October: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Strawberry Cream Cake */}
      <div className="w-8 h-7 bg-[#FDFBF7] border border-[#E5BAC6] rounded-b-md relative flex justify-around items-start pt-1 shadow-xs">
        <div className="w-2 h-2 bg-[#E63946] rounded-full" />
        <div className="w-2 h-2 bg-[#E63946] rounded-full" />
        <div className="w-2 h-2 bg-[#E63946] rounded-full" />
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#F4A2B4]" />
      </div>
    </div>
  ),
  November: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Lime Green Button */}
      <div className="w-7 h-7 bg-[#98D8A0] rounded-full border-2 border-[#7BC685] flex items-center justify-center gap-0.5 p-1">
        <div className="w-1 h-1 bg-white rounded-full" />
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  ),
  December: () => (
    <div className="w-10 h-10 relative flex items-center justify-center">
      {/* Round Pink Character / Ornament */}
      <div className="w-8 h-8 bg-[#F497A9] rounded-full relative flex items-center justify-center">
        <div className="w-5 h-2 bg-[#DF6B86] rounded-full absolute bottom-1" />
        <div className="w-1.5 h-1 bg-[#2C241B] rounded-full absolute top-3 left-2" />
        <div className="w-1.5 h-1 bg-[#2C241B] rounded-full absolute top-3 right-2" />
      </div>
    </div>
  )
};

const MONTHS_CONFIG = [
  { index: 0, label: "January", symbol: "⋆.🎀", component: CalendarIcons.January },
  { index: 1, label: "February", symbol: "🪽", component: CalendarIcons.February },
  { index: 2, label: "March", symbol: "꒱𐦍", component: CalendarIcons.March },
  { index: 3, label: "April", symbol: "✩‧₊", component: CalendarIcons.April },
  { index: 4, label: "May", symbol: "⋆.✧", component: CalendarIcons.May },
  { index: 5, label: "June", symbol: "✩‧₊", component: CalendarIcons.June },
  { index: 6, label: "July", symbol: "⋆.𖦹", component: CalendarIcons.July },
  { index: 7, label: "August", symbol: "๑ !", component: CalendarIcons.August },
  { index: 8, label: "September", symbol: "𖦹.·.", component: CalendarIcons.September },
  { index: 9, label: "October", symbol: ".๑𖦹", component: CalendarIcons.October },
  { index: 10, label: "November", symbol: "✩‧₊", component: CalendarIcons.November },
  { index: 11, label: "December", symbol: "⋆.❀", component: CalendarIcons.December }
];

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

const RedCoquetteBow = () => (
  <svg viewBox="0 0 100 60" className="w-20 h-12 mx-auto opacity-90 drop-shadow-sm">
    <path d="M 50,22 C 42,8 20,10 32,24 C 38,30 46,25 50,22 Z" fill="none" stroke="#943E47" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 50,22 C 58,8 80,10 68,24 C 62,30 54,25 50,22 Z" fill="none" stroke="#943E47" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 50,24 C 49,22 47,22 47,24 C 47,26 50,28 50,28 C 50,28 53,26 53,24 C 53,22 51,22 50,24 Z" fill="#943E47" />
    <path d="M 46,25 C 42,36 34,44 40,50" fill="none" stroke="#943E47" strokeWidth="2.0" strokeLinecap="round" />
    <path d="M 54,25 C 58,36 66,44 60,50" fill="none" stroke="#943E47" strokeWidth="2.0" strokeLinecap="round" />
  </svg>
);

const MemoryWall = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter configurations
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('All'); 
  const [selectedDay, setSelectedDay] = useState('All');     

  const [order, setOrder] = useState([]);
  const [exitDir, setExitDir] = useState(0);
  const [isShowingCover, setIsShowingCover] = useState(true);

  useEffect(() => {
    const collectionRef = collection(db, 'memories');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMemories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMemories(fetchedMemories);
      if (loading) setLoading(false);
    }, (error) => {
      console.error("Error pulling memories from Firestore: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loading]);

  const byId = useMemo(() => {
    const map = {};
    memories.forEach(m => { map[m.id] = m; });
    return map;
  }, [memories]);

  const getJsDate = (createdAt) => {
    if (createdAt?.seconds) return new Date(createdAt.seconds * 1000);
    if (createdAt) return new Date(createdAt);
    return null;
  };

  const formatDate = (createdAt) => {
    const date = getJsDate(createdAt);
    return date ? date.toLocaleDateString() : "Recent";
  };

  const activeDaysInMonth = useMemo(() => {
    if (selectedMonth === 'All') return new Set();
    const days = new Set();
    memories.forEach(m => {
      const d = getJsDate(m.createdAt);
      if (d && d.getMonth() === selectedMonth) {
        days.add(d.getDate());
      }
    });
    return days;
  }, [memories, selectedMonth]);

  useEffect(() => {
    const filtered = memories.filter(m => {
      const d = getJsDate(m.createdAt);
      if (!d) return selectedMonth === 'All';
      
      const monthMatch = selectedMonth === 'All' || d.getMonth() === selectedMonth;
      const dayMatch = selectedDay === 'All' || d.getDate() === parseInt(selectedDay, 10);
      
      return monthMatch && dayMatch;
    });

    setOrder(filtered.map(m => m.id));
  }, [memories, selectedMonth, selectedDay]);

  const handleDragEnd = (_event, info) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 1 : -1;
      if (isShowingCover) {
        setExitDir(direction);
        setIsShowingCover(false);
      } else {
        dismiss(direction);
      }
    }
  };

  const dismiss = (direction) => {
    setExitDir(direction);
    setOrder(prev => {
      const [front, ...rest] = prev;
      return [...rest, front];
    });
  };

  const frontId = order[0];
  const front = frontId ? byId[frontId] : null;
  const upcoming = order.slice(1, 4).map(id => byId[id]).filter(Boolean);

  const currentSelectedText = useMemo(() => {
    if (selectedMonth === 'All') return 'Monthly recaps <3';
    const conf = MONTHS_CONFIG.find(m => m.index === selectedMonth);
    return conf ? `${conf.label} ${conf.symbol} ${selectedDay !== 'All' ? `(Day ${selectedDay})` : ''}` : 'Filter';
  }, [selectedMonth, selectedDay]);

  const calendarDaysArray = useMemo(() => {
    if (selectedMonth === 'All') return [];
    const year = 2026;
    const firstDayIndex = new Date(year, selectedMonth, 1).getDay();
    const totalDays = new Date(year, selectedMonth + 1, 0).getDate();
    
    const placeholders = Array(firstDayIndex).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return [...placeholders, ...days];
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DCEEF7]">
        <p className="text-2xl font-serif text-[#2C241B] animate-pulse">Unlocking the archive index…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden px-6 py-16 bg-transparent">
      <BackToCafeButton />

      {/* Decorative Custom High-Fidelity Stickers */}
      <div className="pointer-events-none select-none absolute inset-0 z-0">
        {/* Top Left Cat Sticker */}
        <div className="absolute top-20 left-4 md:left-12 lg:left-20 w-44 h-44 -rotate-12 opacity-80 hidden sm:block">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <path d="M10,25 L12,20 L17,20 L13,23 L15,28 L10,25 Z" fill="#BCC5CF" />
            <path d="M85,15 L82,22 L88,25 L85,15 Z" fill="#A1AAB3" />
            <path d="M25,60 C25,38 75,38 75,60 C75,72 68,78 50,78 C32,78 25,72 25,60 Z" fill="#F4F4F4" stroke="#D1D5DB" strokeWidth="1" />
            <path d="M28,45 L22,25 L40,38 Z" fill="#F4F4F4" stroke="#D1D5DB" strokeWidth="1" />
            <path d="M72,45 L78,25 L60,38 Z" fill="#F4F4F4" stroke="#D1D5DB" strokeWidth="1" />
            <path d="M 24,52 A 28,28 0 0,1 76,52" fill="none" stroke="#2D3244" strokeWidth="6" strokeLinecap="round" />
            <rect x="16" y="46" width="10" height="18" rx="4" fill="#1E2230" transform="rotate(-5 21 55)" />
            <rect x="74" y="46" width="10" height="18" rx="4" fill="#1E2230" transform="rotate(5 79 55)" />
            <ellipse cx="40" cy="58" rx="4" ry="1" fill="#FFAEC9" opacity="0.6" />
            <ellipse cx="60" cy="58" rx="4" ry="1" fill="#FFAEC9" opacity="0.6" />
            <line x1="36" y1="54" x2="44" y2="54" stroke="#2C241B" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="56" y1="54" x2="64" y2="54" stroke="#2C241B" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 47,58 Q 49,60 50,58 Q 51,60 53,58" fill="none" stroke="#2C241B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Top Right Pink Camera Sticker */}
        <div className="absolute top-28 right-8 md:right-16 lg:right-28 w-40 h-40 rotate-12 opacity-85 hidden sm:block">
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
            <rect x="15" y="30" width="90" height="60" rx="4" fill="#ECA6BC" />
            <circle cx="75" cy="60" r="24" fill="#D9D9D9" stroke="#B8B8B8" strokeWidth="1" />
            <circle cx="75" cy="60" r="12" fill="#2E2E2E" />
            <circle cx="72" cy="57" r="4" fill="#5E5E5E" opacity="0.6" />
            <rect x="42" y="38" width="12" height="6" rx="2" fill="#EAEAEA" />
          </svg>
        </div>

        <span className="absolute top-10 right-1/4 text-4xl opacity-35 rotate-12">✨</span>
        <span className="absolute bottom-12 left-1/3 text-3xl opacity-25">💕</span>
      </div>

      <div className="text-center mb-2 relative z-10">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#2C241B]/50 mb-2">
          a folder for every visit
        </p>
        <h1 className="text-6xl md:text-7xl font-serif text-[#FFF2BA]">The Review Files</h1>
      </div>

      {/* Styled Grid Popover Filter Dashboard */}
      <div className="relative z-50 flex flex-col items-center mb-8 mt-4">
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center gap-3 px-6 py-3 bg-[#FDFBF7] border-2 border-[#943E47]/30 rounded-xl shadow-md font-serif text-sm text-[#561B23] hover:bg-[#FDFBF7]/90 transition-all focus:outline-none"
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-[#561B23]/10 text-xs text-[#561B23]">✦</div>
          <span className="font-semibold tracking-wide">{currentSelectedText}</span>
          <span className="text-xs opacity-60 ml-2">{pickerOpen ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute top-full mt-3 bg-[#FCFAF5] border-2 border-[#561B23]/10 rounded-2xl shadow-2xl p-5 w-full max-w-[480px] overflow-y-auto max-h-[80vh] text-[#2C241B]"
            >
              <div className="flex justify-between items-center border-b border-[#561B23]/10 pb-3 mb-4">
                <span className="font-serif font-bold text-sm text-[#561B23]">Select ur kinda date</span>
                <button
                  onClick={() => {
                    setSelectedMonth('All');
                    setSelectedDay('All');
                    setPickerOpen(false);
                  }}
                  className="font-mono text-xs bg-[#943E47]/10 text-[#943E47] px-2.5 py-1 rounded-md hover:bg-[#943E47]/20 transition-all"
                >
                  Clear Filters
                </button>
              </div>

              {selectedMonth === 'All' ? (
                /* 3x4 Month Grid Dashboard */
                <div className="grid grid-cols-3 gap-3">
                  {MONTHS_CONFIG.map((m) => {
                    const IconComponent = m.component;
                    return (
                      <button
                        key={m.index}
                        onClick={() => {
                          setSelectedMonth(m.index);
                          setSelectedDay('All');
                        }}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-[#561B23]/10 shadow-xs hover:border-[#943E47]/40 hover:scale-105 transition-all group"
                      >
                        <div className="mb-2">
                          <IconComponent />
                        </div>
                        <span className="font-serif text-xs font-bold text-[#561B23] text-center truncate w-full">
                          {m.label}
                        </span>
                        <span className="font-mono text-[9px] text-[#561B23]/40 mt-0.5">
                          {m.symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Calendar Day Grid Dashboard Component Layer */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                  <button
                    onClick={() => {
                      setSelectedMonth('All');
                      setSelectedDay('All');
                    }}
                    className="self-start text-xs font-mono text-[#943E47] hover:underline mb-4 flex items-center gap-1"
                  >
                    ← Back to Months
                  </button>

                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#561B23]/10 mb-4 shadow-xs">
                    {(() => {
                      const ActiveIcon = MONTHS_CONFIG.find(m => m.index === selectedMonth)?.component;
                      return ActiveIcon ? <ActiveIcon /> : null;
                    })()}
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#561B23]">
                        {MONTHS_CONFIG.find(m => m.index === selectedMonth)?.label}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-[#561B23]/40 mb-2">
                    {DAYS_OF_WEEK.map((d, idx) => (
                      <div key={idx} className="py-1">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                    {calendarDaysArray.map((day, cellIndex) => {
                      if (day === null) {
                        return <div key={`empty-${cellIndex}`} className="p-2 opacity-20">·</div>;
                      }

                      const isLogged = activeDaysInMonth.has(day);
                      const isSelected = selectedDay === day.toString();

                      return (
                        <button
                          key={`day-${day}`}
                          disabled={!isLogged && !isSelected}
                          onClick={() => {
                            setSelectedDay(day.toString());
                            setPickerOpen(false);
                          }}
                          className={`p-2 rounded-lg transition-all font-semibold relative flex items-center justify-center
                            ${isSelected 
                              ? 'bg-[#943E47] text-white shadow-sm scale-105' 
                              : isLogged
                                ? 'bg-[#F3D5DE] text-[#561B23] hover:bg-[#EAC2CE]'
                                : 'text-gray-200 opacity-30 cursor-not-allowed'
                            }
                          `}
                        >
                          <span>{day}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDay('All');
                      setPickerOpen(false);
                    }}
                    className="mt-4 w-full py-2 bg-white border border-[#561B23]/10 hover:bg-[#F3D5DE]/30 text-xs font-serif rounded-lg text-[#561B23] transition-all"
                  >
                    View Whole Month Mix
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-24 relative z-10">
          <p className="text-xl font-serif text-[#2C241B]/60">
            No memories filed yet. Leave a review to start the archive!
          </p>
        </div>
      ) : order.length === 0 ? (
        <div className="text-center py-24 relative z-10">
          <p className="text-xl font-serif text-[#561B23]/70">No logs recorded for this interval.</p>
        </div>
      ) : (
        <>
          {/* Main folder container - Upscaled for premium spatial distribution */}
          <div className="relative mx-auto mt-12 w-full max-w-[540px] z-10 px-2">
            
            {/* Visual Queue Deck: Render background cards cascading under current state */}
            {!isShowingCover && upcoming.slice().reverse().map((m, revIdx) => {
              const depth = upcoming.length - revIdx;
              const rotate = depth % 2 === 0 ? 1 + depth : -(1 + depth);
              return (
                <div
                  key={m.id}
                  className="absolute inset-x-0 top-0 rounded-lg shadow-lg border border-[#E0B8C4]"
                  style={{
                    height: '100%',
                    minHeight: 380,
                    background: TAB_COLORS[depth % TAB_COLORS.length],
                    transform: `translateY(${-depth * 10}px) scale(${1 - depth * 0.03}) rotate(${rotate}deg)`,
                    zIndex: 10 - depth,
                    opacity: 0.7 - depth * 0.15
                  }}
                />
              );
            })}

            {/* The active, swipeable folder inside the queue layer flow */}
            <AnimatePresence mode="popLayout">
              {front && (
                <motion.div
                  key={isShowingCover ? 'cover-view' : front.id}
                  className="relative cursor-grab active:cursor-grabbing"
                  style={{ zIndex: 20 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.55}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, y: 25, scale: 0.98, rotate: -0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: -0.5 }}
                  exit={{
                    x: exitDir * 600,
                    opacity: 0,
                    rotate: exitDir * 12,
                    scale: 0.95,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                >
                  {/* Folder Tab styled with desaturated muted tones */}
                  <div
                    className="w-48 h-10 rounded-t-lg -mb-1 ml-6 flex items-center px-5 shadow-sm relative overflow-hidden"
                    style={{ background: isShowingCover ? '#DBA6B4' : '#CC9CA9' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                    <span className="font-serif text-xs font-semibold text-white tracking-wider truncate">
                      {isShowingCover ? 'what the customers love' : (front.dish || 'REVIEW LOG')}
                    </span>
                  </div>

                  {/* Folder Body: Clean rectangular layout with muted pink palette & clear gloss veneer */}
                  <div
                    className="bg-gradient-to-br from-[#F3D5DE] to-[#EAC2CE] rounded-b-xl rounded-tr-xl shadow-2xl p-8 relative overflow-hidden border border-[#E5BAC6]"
                    style={{ minHeight: 380 }}
                  >
                    {/* HIGH-GLOSS SURFACE REFLECTION */}
                    <div 
                      className="absolute inset-0 pointer-events-none z-30 opacity-35 mix-blend-overlay"
                      style={{
                        background: 'linear-gradient(140deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 30%, transparent 60%)'
                      }}
                    />
                    <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none z-30" />

                    {/* Centered Minimalist Coquette Bow */}
                    <div className="absolute top-6 inset-x-0 text-center pointer-events-none z-20">
                      <RedCoquetteBow />
                    </div>

                    {isShowingCover ? (
                      /* EXCLUSIVE ONE-TIME MAIN LANDING BLOCK */
                      <div className="h-full flex flex-col items-center justify-center text-center pt-16 pb-4 relative z-10">
                        <h2 className="font-serif text-5xl md:text-6xl font-bold text-[#561B23] tracking-wide mt-2 drop-shadow-xs">
                          Reviews &lt;3
                        </h2>
                        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#7A3E46] mt-3">
                          a curated archive of guest love letters
                        </p>
                        
                        <div className="mt-12 w-20 h-[1px] bg-[#561B23]/15" />
                        
                        <p className="font-mono text-xs text-[#561B23] font-medium animate-pulse mt-8">
                          ← please swipe to proceed →
                        </p>
                      </div>
                    ) : (
                      /* THE ACTIVE REVIEW CARD DISPLAY LAYER */
                      <div className="h-full flex flex-col justify-between pt-16 relative z-10">
                        <div>
                          <div className="flex justify-between items-baseline mb-3 border-b border-[#561B23]/10 pb-2">
                            <span className="font-serif font-bold text-xl text-[#420C13] tracking-wide">
                              {front.dish || 'Signature Treat'}
                            </span>
                            <span className="text-2xl opacity-90">{front.vibe ? front.vibe.split(' ')[0] : '✨'}</span>
                          </div>
                          
                          {/* Inner clean stationary reading frame wrapper */}
                          <div className="bg-white/45 p-5 rounded-lg border border-white/50 shadow-inner backdrop-blur-xs my-4">
                            <p className="text-2xl md:text-3xl font-cursive leading-relaxed text-[#3B070D] whitespace-pre-line">
                              "{front.text || (front.highlights && front.highlights[0]) || 'Delicious!'}"
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center font-mono text-xs text-[#6B2E36] mt-4 pt-2">
                            <span className="font-semibold tracking-wide">{front.name || 'Anonymous Guest'}</span>
                            <span className="opacity-80">{formatDate(front.createdAt)}</span>
                          </div>
                          <p className="font-mono text-[10px] text-center text-[#6B2E36]/50 mt-4">
                            ← swipe away to cycle to next file →
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Queue counter metric tracker */}
          <p className="text-center font-mono text-xs text-[#2C241B]/40 mt-14 relative z-10">
            {order.length} review item{order.length !== 1 ? 's' : ''} in loop rotation
          </p>
        </>
      )}
    </div>
  );
};

export default MemoryWall;