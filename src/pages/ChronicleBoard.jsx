import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { useAvatar } from '../context/AvatarContext';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import Receipt from './Receipt';

const VIBE_CONFIGS = {
  '🌧️ Rainy Day Comfort': { color: '#9D446E', name: 'Grape' },
  '✨ Main Character Energy': { color: '#FF8A65', name: 'Orange' },
  '☕ Coffee & Conversations': { color: '#F06292', name: 'Raspberry' },
  '🌸 Peaceful Escape': { color: '#FFE082', name: 'Lemon' }
};

export default function ChronicleBoard() {
  const { avatar } = useAvatar(); 
  const [memories, setMemories] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [hoveredVibe, setHoveredVibe] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const globalQuery = query(collection(db, "memories"), orderBy("createdAt", "desc"));
    const unsubscribeGlobal = onSnapshot(globalQuery, (snapshot) => {
      const allMemories = snapshot.docs.map(doc => doc.data());
      setMemories(allMemories);
      setLoading(false);
    }, (error) => {
      console.error("Error reading global ledger metrics:", error);
      setLoading(false);
    });

    const userQuery = query(collection(db, "memories"), orderBy("createdAt", "desc"), limit(1));
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        setUserReview(snapshot.docs[0].data());
      }
    });

    return () => {
      unsubscribeGlobal();
      unsubscribeUser();
    };
  }, [avatar]);

  const totalCount = memories.length || 1;
  
  const metrics = Object.keys(VIBE_CONFIGS).reduce((acc, key) => {
    const matchingCount = memories.filter(m => m.vibe === key).length;
    acc[key] = {
      count: matchingCount,
      percentage: Math.round((matchingCount / totalCount) * 100) || 0
    };
    return acc;
  }, {});

  const dominantVibe = Object.keys(metrics).reduce((a, b) => 
    metrics[a].percentage > metrics[b].percentage ? a : b
  , '✨ Main Character Energy');

  const getMostCommonReviewForVibe = (vibeName) => {
    const texts = memories
      .filter(m => m.vibe === vibeName && m.review && m.review.trim() !== "")
      .map(m => m.review.trim());

    if (texts.length === 0) return "No written whispers logged for this vibe yet!";

    const frequencyMap = {};
    let maxCount = 0;
    let mostCommonText = texts[0];

    texts.forEach(text => {
      frequencyMap[text] = (frequencyMap[text] || 0) + 1;
      if (frequencyMap[text] > maxCount) {
        maxCount = frequencyMap[text];
        mostCommonText = text;
      }
    });

    return mostCommonText;
  };

  const generatePiePaths = () => {
    let accumulatedAngle = -Math.PI / 2; 
    const radius = 170; 
    const center = 190;

    return Object.entries(VIBE_CONFIGS).map(([vibeName, config]) => {
      const percentage = metrics[vibeName].percentage;
      if (percentage === 0) return null;

      const angleDelta = (percentage / 100) * (Math.PI * 2);
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angleDelta;
      accumulatedAngle = endAngle;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArcFlag = percentage > 50 ? 1 : 0;

      const pathData = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;

      const middleAngle = startAngle + (angleDelta / 2);
      const labelRadius = radius * 0.65; 
      const textX = center + labelRadius * Math.cos(middleAngle);
      const textY = center + labelRadius * Math.sin(middleAngle);

      return {
        vibeName,
        color: config.color,
        pathData,
        textX,
        textY
      };
    }).filter(Boolean);
  };

  const piePaths = generatePiePaths();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs font-bold uppercase text-[#472C20]">
        ☕ Loading Cute Ledger Canvas...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#EBE3F5] bg-[radial-gradient(circle_at_center,#C5B4E3_0%,#EBE3F5_70%)] text-[#472C20] py-12 px-4 md:px-8 relative overflow-hidden select-none flex flex-col items-center">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#472c2010_1px,transparent_1px),linear-gradient(to_bottom,#472c2010_1px,transparent_1px)] bg-[size:42px_42px] pointer-events-none z-0" />

      <div className="relative w-full max-w-6xl mb-12 z-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#FAF6EE]/90 backdrop-blur-sm rounded-[24px] p-6 shadow-sm">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-[#EBE3F5] text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-xl mb-3">
            📊 LIVE VIBE ANALYTICS
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-[#472C20]">
            The Shared Ledger
          </h1>
          <p className="text-xs font-mono uppercase tracking-wide text-[#472C20]/60 mt-1">
            Atmosphere: <span className="text-[#9D446E] font-black">{dominantVibe}</span>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 max-w-xs text-center md:text-right shadow-sm">
          <span className="text-[10px] font-mono font-bold block text-[#FF8A65]">CURRENT SUMMARY</span>
          <span className="text-xs font-serif italic font-semibold">
            {metrics[dominantVibe].percentage}% Patrons share this vibe spaces.
          </span>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10 flex-1">
        
        <div className="lg:col-span-5 bg-[#FAF6EE]/90 backdrop-blur-sm rounded-[28px] p-6 shadow-sm flex flex-col items-center justify-between min-h-[540px]">
          <div className="w-full text-center lg:text-left mb-2">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#472C20]/60">Atmosphere Share</h3>
          </div>

          <div className="relative w-[380px] h-[380px] flex items-center justify-center p-4">
            <svg viewBox="0 0 380 380" className="w-full h-full overflow-visible drop-shadow-sm">
              <circle cx="190" cy="190" r="172" fill="none" stroke="#472C20" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />
              <g>
                {piePaths.map((slice) => {
                  const isHovered = hoveredVibe === slice.vibeName;
                  return (
                    <g key={slice.vibeName}>
                      <motion.path
                        d={slice.pathData}
                        fill={slice.color}
                        stroke="#FAF6EE"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        animate={{ scale: isHovered ? 1.04 : 1 }}
                        originX="190px"
                        originY="190px"
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                        className="cursor-pointer"
                        onMouseEnter={() => {
                          setHoveredVibe(slice.vibeName);
                          setTooltipPos({ x: slice.textX, y: slice.textY });
                        }}
                        onMouseLeave={() => setHoveredVibe(null)}
                      />
                      <text
                        x={slice.textX}
                        y={slice.textY}
                        fill="#FFFFFF"
                        fontSize="16"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none font-sans select-none tracking-wide drop-shadow-[1px_1px_1px_rgba(71,44,32,0.4)]"
                      >
                        {metrics[slice.vibeName].percentage}%
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            <AnimatePresence>
              {hoveredVibe && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ 
                    position: 'absolute',
                    top: `${tooltipPos.y}px`, 
                    left: `${tooltipPos.x}px`,
                    transform: 'translate(-50%, -105%)'
                  }}
                  className="bg-[#FFFEE0] border-2 border-[#472C20]/20 rounded-2xl p-5 shadow-md w-[275px] z-50 text-left pointer-events-none"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VIBE_CONFIGS[hoveredVibe].color }} />
                    <span className="font-black text-xs text-[#472C20] tracking-wide uppercase">{hoveredVibe}</span>
                  </div>
                  <div className="border-t border-dashed border-[#472C20]/10 pt-2">
                    <span className="text-[9px] uppercase font-mono font-black tracking-wider text-[#FF8A65] block mb-1">Most Common Reflection</span>
                    <p className="text-xs text-[#472C20] font-serif italic font-medium leading-relaxed">
                      "{getMostCommonReviewForVibe(hoveredVibe)}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full bg-white/40 backdrop-blur-[2px] py-2.5 px-4 flex flex-wrap justify-center gap-5 items-center mt-2 rounded-xl">
            {Object.entries(VIBE_CONFIGS).map(([vibeName, config]) => (
              <div key={vibeName} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: config.color }} />
                <span className="text-xs font-serif font-bold text-[#472C20]/80 tracking-wide">{config.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
          <div className="bg-white/90 backdrop-blur-sm rounded-[28px] p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-dashed border-[#472C20]/10 pb-3 mb-4">
                <h2 className="text-md font-serif font-black tracking-wide text-[#472C20] flex items-center gap-2">
                  <span>✨</span> Your Stashed Scrapbook Memory
                </h2>
                {userReview && (
                  <span className="text-xs font-mono font-bold bg-[#FAF6EE] text-[#472C20] px-2.5 py-0.5 rounded-xl shadow-xs">
                    {userReview.rating === 4 ? '🎉 EXCELLENT' : '✨ GOOD'}
                  </span>
                )}
              </div>

              {userReview ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-[#472C20]/80">👤 {userReview.name || 'Cozy Wanderer'}</span>
                    <span className="text-[#472C20]/20 text-xs">•</span>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#FF8A65]">{userReview.vibe}</span>
                  </div>
                  <div className="bg-[#FAF6EE]/60 p-4 rounded-2xl italic text-xs text-[#472C20] font-medium leading-relaxed font-serif shadow-xs">
                    "{userReview.review || 'No written commentary was filed into the session logs.'}"
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#472C20]/40 italic py-8 text-center">No scrapbook entries stashed away in memory space.</p>
              )}
            </div>
          </div>

          {/* REPLACEMENT COMPONENT: GET UR RECEIPT */}
         <div className="bg-white/90 backdrop-blur-sm rounded-[28px] p-6 shadow-sm flex-1 flex flex-col justify-center items-center gap-4">
  <button 
    onClick={() => window.print()}
    className="px-8 py-4 bg-[#472C20] text-white font-black uppercase tracking-widest rounded-full hover:bg-[#9D446E] transition-all shadow-lg active:scale-95"
  >
    Get Ur Receipt
  </button>
  
  <Receipt data={userReview} />
</div>
        </div>
      </div>
    </div>
  );
}