import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackToCafeButton from '../components/BackToCafeButton';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import html2canvas from 'html2canvas';

// Styled to resemble the notepad aesthetic from 4574037118514075.jpg and 9429480467553114.webp
const ScrapbookCard = ({ children, className, rotation = 0, variant = 'notebook' }) => {
  const getVariantStyles = () => {
    if (variant === 'lined') {
      return {
        background: 'linear-gradient(#fff 0px, transparent 0px), linear-gradient(#eef2f7 29px, #a5c8ed 30px)',
        backgroundSize: '100% 30px',
        paddingTop: '40px',
        lineHeight: '30px'
      };
    }
    // Default notebook blank sheet
    return { backgroundColor: '#FFFDF9' };
  };

  return (
    <motion.div 
      whileHover={{ rotate: 0, scale: 1.012 }}
      style={{ rotate: `${rotation}deg`, ...getVariantStyles() }}
      className={`relative p-8 border border-neutral-300 shadow-md rounded-sm ${className}`}
    >
      {/* Decorative Binder Holes / Spiral Cutouts on left edge matching reference images */}
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-4 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-[#FAF6EE] border border-neutral-300 shadow-inner" />
        ))}
      </div>

      {/* Mock Paperclip Decorative Layer */}
      <div className="absolute -top-4 right-8 w-6 h-12 border-4 border-pink-400 rounded-full opacity-80 pointer-events-none transform rotate-12 after:content-[''] after:absolute after:inset-1 after:border-2 after:border-pink-400 after:rounded-full" />

      {/* Content wrapper padding to clear the left hole punches */}
      <div className="pl-6">
        {children}
      </div>
    </motion.div>
  );
};

const VIBE_CONFIGS = {
  '🌧️ Rainy Day Comfort': { category: 'Rainy Day Comfort', emoji: '🌧️', color: '#9D446E', summary: 'Guests chose this for deep reflection, quiet moments, and warm, steady comfort on slower days.' },
  '✨ Main Character Energy': { category: 'Main Character Energy', emoji: '✨', color: '#FF8B72', summary: 'An absolute vibrant aesthetic choice! Visitors felt highly inspired, productive, and beautifully in focus.' },
  '☕ Coffee & Conversations': { category: 'Coffee & Conversations', emoji: '☕', color: '#FF4B72', summary: 'Fueled by shared stories, deep catching up sessions, laughter, and high social synergy.' },
  '🌸 Peaceful Escape': { category: 'Peaceful Escape', emoji: '🌸', color: '#FFE094', summary: 'A sanctuary space where customers came to disconnect, escape reality, and slow down time.' }
};

const makePieSlices = (metrics) => {
  let accumulatedAngle = 0;
  return metrics.map((item) => {
    const percentageAngle = (item.value / 100) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + percentageAngle;
    accumulatedAngle = endAngle;
    return { ...item, startAngle, endAngle };
  });
};

export default function ChronicleBoard() {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [vibeMetrics, setVibeMetrics] = useState([]);
  const [recentStory, setRecentStory] = useState(null);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const boardRef = useRef(null);

  // Soft cream scrapbook background wallpaper
  const journalGridStyle = {
    backgroundColor: '#FAF6EE',
    backgroundImage: `
      linear-gradient(#E8E2D5 1px, transparent 1px),
      linear-gradient(90deg, #E8E2D5 1px, transparent 1px)
    `,
    backgroundSize: '24px 24px'
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "memories"), (snapshot) => {
      let vibeCounts = { '🌧️ Rainy Day Comfort': 0, '✨ Main Character Energy': 0, '☕ Coffee & Conversations': 0, '🌸 Peaceful Escape': 0 };
      let totalVibes = 0;
      let rawMemories = [];
      let dishCounts = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        rawMemories.push(data);

        if (data.vibe && vibeCounts[data.vibe] !== undefined) {
          vibeCounts[data.vibe]++;
          totalVibes++;
        }
        if (data.dish) {
          dishCounts[data.dish] = (dishCounts[data.dish] || 0) + 1;
        }
      });

      const sortedMemories = rawMemories.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const latestReview = sortedMemories.find(m => m.review && m.review.trim() !== "");
      
      if (latestReview) {
        setRecentStory({
          text: latestReview.review,
          author: latestReview.name || 'Cozy Wanderer',
          purpose: latestReview.purpose ? `🥟 ${latestReview.purpose.toUpperCase()}` : '☕ VISITING',
          photoUrl: latestReview.photoUrl || null
        });
      }

      const fallbackTotal = totalVibes === 0 ? 1 : totalVibes;
      const computedVibes = Object.keys(VIBE_CONFIGS).map(key => ({
        id: key,
        ...VIBE_CONFIGS[key],
        value: totalVibes === 0 ? 25 : Math.round((vibeCounts[key] / fallbackTotal) * 100)
      }));

      const sortedDishes = Object.entries(dishCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(entry => entry[0]);
      setFavoriteDishes(sortedDishes.length > 0 ? sortedDishes : ['Matcha Latte', 'Croissant', 'Mochi Waffles']);
      setVibeMetrics(computedVibes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const exportAsImage = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const canvas = await html2canvas(boardRef.current, {
        useCORS: true, 
        backgroundColor: '#FAF6EE',
        scale: 2, 
        logging: false,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'my-cafe-chronicles.png';
      link.click();
    } catch (err) {
      console.error("Could not capture board snapshot:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const maxVibe = vibeMetrics.length > 0 ? vibeMetrics.reduce((max, current) => current.value > max.value ? current : max, vibeMetrics[0]) : null;
  const slicesData = makePieSlices(vibeMetrics);

  return (
    <div style={journalGridStyle} className="min-h-screen py-12 px-6 select-none relative">
      
      {/* Control Actions Layer */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <BackToCafeButton />
        <button
          onClick={exportAsImage}
          disabled={isExporting}
          className="bg-[#472C20] text-[#FAF6EE] font-serif font-bold text-xs px-5 py-2.5 rounded-full border-2 border-[#472C20] hover:bg-[#FFFDF9] hover:text-[#472C20] transition-all duration-200 shadow-[4px_4px_0_#A8E6CF] active:translate-y-0.5 disabled:opacity-50"
        >
          {isExporting ? '📸 Framing Picture...' : '✨ Save Chronicles Card'}
        </button>
      </div>

      {/* Snapshot capture target block */}
      <div ref={boardRef} style={journalGridStyle} className="max-w-6xl mx-auto p-6 rounded-3xl relative">
        
        {/* Playful top tape header decoration */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-pink-300/60 mix-blend-multiply px-8 py-1 text-[11px] uppercase tracking-widest font-mono text-[#472C20] rotate-[-1deg] border-b border-pink-400/30">
          📌 Community Board Snapshot
        </div>

        <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-6xl font-cursive text-center mt-6 mb-12 text-[#472C20]">
          The Chronicle.
        </motion.h1>

        <div className="flex flex-col gap-10">
          
          {/* Today's Story — Styled as a Lined Notebook Page layout variant */}
          {recentStory && (
            <ScrapbookCard rotation={-0.5} variant="lined" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-red-300 pb-2 mb-4">
                <div>
                  <span className="bg-[#FFB6C9] border border-[#472C20]/40 text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded text-[#472C20]">
                    📝 Live Guestbook Whisper
                  </span>
                  <h3 className="font-bold text-lg text-[#472C20] mt-1 font-serif">Today's Entry</h3>
                </div>
                <span className="text-[10px] font-mono font-black border border-[#472C20]/30 px-2 py-0.5 bg-amber-50/60 rounded text-[#472C20] self-start sm:self-center mt-2 sm:mt-0">
                  {recentStory.purpose}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                {recentStory.photoUrl && (
                  <div className="bg-[#FFFDF9] p-2 border border-neutral-300 shadow-sm rotate-[-2deg] rounded-xs shrink-0 w-44">
                    <div className="w-full h-36 bg-[#FAF6EE] overflow-hidden flex items-center justify-center">
                      <img 
                        src={recentStory.photoUrl} 
                        alt="Vintage Snapshot" 
                        className="w-full h-full object-cover sepia-[15%] contrast-[102%]"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="font-serif italic text-lg text-[#472C20]/90 leading-loose">
                    "{recentStory.text}"
                  </p>
                  <p className="text-right font-mono text-xs font-bold text-neutral-500 mt-2">
                    — Written by: {recentStory.author}
                  </p>
                </div>
              </div>
            </ScrapbookCard>
          )}

          {/* Ledger Board Analytics Sheet */}
          <ScrapbookCard rotation={0.5} className="w-full flex flex-col items-center justify-center relative">
            <div className="w-full text-center max-w-xl mx-auto mb-4">
              <span className="bg-[#A8E6CF] border border-[#472C20]/30 text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded text-[#472C20]">
                📊 Live Vibe Analytics
              </span>
              <h3 className="font-serif font-black text-2xl text-[#472C20] mt-3">The Shared Ledger</h3>
              
              {maxVibe && !loading && (
                <p className="text-xs font-serif italic text-neutral-600 mt-2">
                  Dominant Atmosphere: Most patrons are experiencing <span className="font-bold not-italic" style={{ color: maxVibe.color }}>{maxVibe.category} ({maxVibe.value}%)</span>
                </p>
              )}
            </div>

            {loading ? (
              <div className="h-72 flex items-center justify-center font-mono text-xs opacity-50 animate-pulse text-[#472C20]">Reading logs...</div>
            ) : (
              <div 
                className="relative w-72 h-72 flex items-center justify-center cursor-pointer mb-6"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <svg viewBox="0 0 200 200" className="w-64 h-64 transform -rotate-90 overflow-visible drop-shadow-sm">
                  {slicesData.map((slice) => {
                    const radStart = (slice.startAngle * Math.PI) / 180;
                    const radEnd = (slice.endAngle * Math.PI) / 180;
                    
                    const x1 = 100 + 85 * Math.cos(radStart);
                    const y1 = 100 + 85 * Math.sin(radStart);
                    const x2 = 100 + 85 * Math.cos(radEnd);
                    const y2 = 100 + 85 * Math.sin(radEnd);
                    
                    const largeArcFlag = slice.value > 50 ? 1 : 0;
                    const pathData = `M 100 100 L ${x1} ${y1} A 85 85 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    const textAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
                    const textRad = (textAngle * Math.PI) / 180;
                    const textX = 100 + 52 * Math.cos(textRad);
                    const textY = 100 + 52 * Math.sin(textRad);

                    const isSelected = hoveredSlice === slice.id;

                    return (
                      <g key={slice.id}>
                        <motion.path
                          d={pathData}
                          fill={slice.color}
                          stroke="#FFFDF9"
                          strokeWidth="2"
                          animate={{ 
                            scale: isSelected ? 1.03 : 1,
                          }}
                          onMouseEnter={() => setHoveredSlice(slice.id)}
                        />
                        {slice.value > 4 && (
                          <text x={textX} y={textY} fill="#FFFDF9" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="central" transform={`rotate(90, ${textX}, ${textY})`}>
                            {slice.value}%
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Scrapbook Sticky Note Tooltip Popover Overlay */}
                <AnimatePresence>
                  {hoveredSlice && (() => {
                    const target = slicesData.find(s => s.id === hoveredSlice);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute pointer-events-none z-50 bg-[#FFFFCC] border border-amber-300 text-neutral-800 p-3 shadow-md max-w-[200px] text-left rounded-xs"
                        style={{ left: `${mousePos.x - 100}px`, top: `${mousePos.y - 120}px` }}
                      >
                        <div className="font-bold text-xs flex items-center gap-1 border-b border-dashed border-amber-400/40 pb-1 mb-1">
                          <span>{target.emoji}</span>
                          <span>{target.category}</span>
                        </div>
                        <p className="text-[10px] font-serif leading-relaxed italic">"{target.summary}"</p>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            )}

            {/* Flat Legend Matrix Display layout */}
            <div className="w-full flex flex-wrap justify-center gap-4 pt-2 border-t border-dashed border-neutral-200">
              {slicesData.map((slice) => {
                const isSelected = hoveredSlice === slice.id;
                return (
                  <div 
                    key={slice.id} 
                    onMouseEnter={() => setHoveredSlice(slice.id)} 
                    onMouseLeave={() => setHoveredSlice(null)} 
                    className={`flex items-center gap-2 px-3 py-1 rounded transition-all duration-150 ${isSelected ? 'bg-amber-50 shadow-xs' : ''}`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="font-serif text-xs text-[#472C20]">{slice.emoji} {slice.category}</span>
                    <span className="font-mono text-[10px] text-neutral-400">({slice.value}%)</span>
                  </div>
                );
              })}
            </div>
          </ScrapbookCard>

          {/* Obsessions Layer Sheet */}
          <ScrapbookCard rotation={-0.3} className="w-full">
            <h3 className="font-mono text-xs uppercase tracking-wider mb-4 text-[#472C20]">✨ Current Obsessions</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {favoriteDishes.map((item) => (
                <div key={item} className="px-5 py-1.5 border border-neutral-300 rounded-sm bg-white font-serif text-sm text-[#472C20] shadow-xs whitespace-nowrap">
                  ☕ {item}
                </div>
              ))}
            </div>
          </ScrapbookCard>
          
        </div>
      </div>
    </div>
  );
}