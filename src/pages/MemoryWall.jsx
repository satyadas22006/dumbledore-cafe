import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Matches your directory structure exactly
import BackToCafeButton from '../components/BackToCafeButton';

// Refined desaturated tab colors to cycle elegantly behind the front card
const TAB_COLORS = ['#E5BAC6', '#EAD2B6', '#B7D9E0', '#D3C5EB'];

// A crisp inline SVG reproduction of the coquette bow featured in 16607092371649770.webp
const RedCoquetteBow = () => (
  <svg viewBox="0 0 100 60" className="w-20 h-12 mx-auto opacity-90 drop-shadow-sm">
    {/* Left Loop */}
    <path 
      d="M 50,22 C 42,8 20,10 32,24 C 38,30 46,25 50,22 Z" 
      fill="none" 
      stroke="#943E47" 
      strokeWidth="2.3" 
      strokeLinecap="round"
      strokeLinejoin="round" 
    />
    {/* Right Loop */}
    <path 
      d="M 50,22 C 58,8 80,10 68,24 C 62,30 54,25 50,22 Z" 
      fill="none" 
      stroke="#943E47" 
      strokeWidth="2.3" 
      strokeLinecap="round"
      strokeLinejoin="round" 
    />
    {/* Center Little Knot/Heart */}
    <path 
      d="M 50,24 C 49,22 47,22 47,24 C 47,26 50,28 50,28 C 50,28 53,26 53,24 C 53,22 51,22 50,24 Z" 
      fill="#943E47" 
    />
    {/* Left Ribbon Tail */}
    <path 
      d="M 46,25 C 42,36 34,44 40,50" 
      fill="none" 
      stroke="#943E47" 
      strokeWidth="2.0" 
      strokeLinecap="round" 
    />
    {/* Right Ribbon Tail */}
    <path 
      d="M 54,25 C 58,36 66,44 60,50" 
      fill="none" 
      stroke="#943E47" 
      strokeWidth="2.0" 
      strokeLinecap="round" 
    />
  </svg>
);

const MemoryWall = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // `order` holds card IDs from front to back sequence in the queue stack
  const [order, setOrder] = useState([]);
  const [exitDir, setExitDir] = useState(0);
  
  // Track if the top item is the one-time "Reviews <3" cover index view
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
      setOrder(fetchedMemories.map(m => m.id));
      loading && setLoading(false);
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

  const formatDate = (createdAt) => {
    if (createdAt?.seconds) return new Date(createdAt.seconds * 1000).toLocaleDateString();
    if (createdAt) return new Date(createdAt).toLocaleDateString();
    return "Recent";
  };

  // Drag handler cycling structural queue positions seamlessly
  const handleDragEnd = (_event, info) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 1 : -1;
      
      if (isShowingCover) {
        // Swipe away the main entry index cover directly into the review workflow queue
        setExitDir(direction);
        setIsShowingCover(false);
      } else {
        // Send front active review to back of the queue loop instantly
        dismiss(direction);
      }
    }
  };

  const dismiss = (direction) => {
    setExitDir(direction);
    setOrder(prev => {
      const [front, ...rest] = prev;
      return [...rest, front]; // Append card to tail end of the array queue
    });
  };

  const frontId = order[0];
  const front = frontId ? byId[frontId] : null;
  // Map out remaining cards inline directly under the stack layer order tracking system
  const upcoming = order.slice(1, 4).map(id => byId[id]).filter(Boolean);

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

      {memories.length === 0 ? (
        <div className="text-center py-24 relative z-10">
          <p className="text-xl font-serif text-[#2C241B]/60">
            No memories filed yet. Leave a review to start the archive!
          </p>
        </div>
      ) : (
        <>
          {/* Main folder container - Upscaled for premium spatial distribution */}
          <div className="relative mx-auto mt-20 w-full max-w-[540px] z-10 px-2">
            
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
                    {/* Upper Diagonal Specular Mirror Reflection */}
                    <div 
                      className="absolute inset-0 pointer-events-none z-30 opacity-35 mix-blend-overlay"
                      style={{
                        background: 'linear-gradient(140deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 30%, transparent 60%)'
                      }}
                    />
                    {/* Ambient Top Light Glare */}
                    <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none z-30" />

                    {/* Centered Minimalist Coquette Bow from 16607092371649770.webp */}
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