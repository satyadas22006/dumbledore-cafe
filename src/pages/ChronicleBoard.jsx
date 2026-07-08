import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { useAvatar } from '../context/AvatarContext';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Activity } from 'lucide-react';
import BackToCafeButton from '../components/BackToCafeButton';

// --- BRIGHT & HAPPY FOOD CONFIGURATIONS ---
const VIBE_CONFIGS = {
  '🌧️ Rainy Day Comfort': { color: '#B28DFF', texture: 'dots', label: 'Rainy Day Comfort' },
  '✨ Main Character Energy': { color: '#FFB7B2', texture: 'lines', label: 'Main Character' },
  '☕ Coffee & Conversations': { color: '#FFDAC1', texture: 'sprinkles', label: 'Coffee & Chats' },
  '🌸 Peaceful Escape': { color: '#FDFD96', texture: 'crumbs', label: 'Peaceful Escape' }
};

const PURPOSE_CONFIGS = {
  'food': { color: '#FFCB77', texture: 'dots', label: 'Food Mission 🥟' },
  'catch': { color: '#FF9CEE', texture: 'lines', label: 'Catching Up ❤️' },
  'escape': { color: '#A0E8AF', texture: 'sprinkles', label: 'Reality Escape 🌧️' },
  'family': { color: '#85E3FF', texture: 'crumbs', label: 'Family Time 👨‍👩‍👧' }
};

const BRIGHT_PALETTE = [
  { color: '#85E3FF', texture: 'dots' },   
  { color: '#B5EAD7', texture: 'lines' },     
  { color: '#FF9AA2', texture: 'sprinkles' },  
  { color: '#E2F0CB', texture: 'crumbs' },  
  { color: '#C7CEEA', texture: 'dots' },    
  { color: '#FDE4CE', texture: 'lines' }    
];

// --- SCRAPBOOK DECORATIONS ---
const WashiTape = ({ className, color = "bg-white/60" }) => (
  <div 
    className={`absolute w-12 h-5 md:w-16 md:h-6 backdrop-blur-sm shadow-sm z-20 mix-blend-overlay ${color} ${className}`}
    style={{ borderLeft: '2px dashed rgba(122, 92, 88, 0.2)', borderRight: '2px dashed rgba(122, 92, 88, 0.2)' }} 
  />
);

const FloatingDoodle = ({ char, className, delay = 0 }) => (
  <motion.div 
    animate={{ y: [0, -15, 0], rotate: [-10, 10, -10], scale: [1, 1.1, 1] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut" }}
    className={`absolute text-4xl opacity-20 select-none pointer-events-none font-cursive drop-shadow-md ${className}`}
  >
    {char}
  </motion.div>
);

const TextureOverlay = ({ type, color }) => {
  if (type === 'dots') return <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill={color} opacity="0.3" /></pattern>;
  if (type === 'lines') return <pattern id="lines" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="2" opacity="0.2" /></pattern>;
  if (type === 'sprinkles') return <pattern id="sprinkles" width="12" height="12" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="4" height="1.5" rx="0.5" fill={color} opacity="0.4" transform="rotate(15)" /><rect x="7" y="6" width="4" height="1.5" rx="0.5" fill={color} opacity="0.4" transform="rotate(-30)" /></pattern>;
  return <pattern id="crumbs" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M2,2 Q3,1 4,3 T6,2" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" /></pattern>;
};

// --- CLEAN VECTOR PIE CHART ---
const ArtsyPieChart = ({ data, title, hoveredId, setHoveredVibe }) => {
  let accumulatedAngle = -Math.PI / 2;
  const radius = 100;
  const center = 140; 

  const slices = useMemo(() => {
    return data.map((item) => {
      if (item.percentage === 0) return null;
      const angleDelta = (item.percentage / 100) * (Math.PI * 2);
      
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angleDelta;
      accumulatedAngle = endAngle;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);
      const largeArcFlag = item.percentage > 50 ? 1 : 0;

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      const middleAngle = startAngle + (angleDelta / 2);
      const textX = center + (radius * 0.65) * Math.cos(middleAngle);
      const textY = center + (radius * 0.65) * Math.sin(middleAngle);

      return { ...item, pathData, textX, textY };
    }).filter(Boolean);
  }, [data]);

  return (
    <div className="bg-[#FFFDF9] border-[4px] border-[#7A5C58] rounded-[30px] p-6 shadow-[6px_6px_0_#7A5C58] flex flex-col items-center relative group w-full transition-transform hover:-translate-y-1">
      <WashiTape className="-top-3 left-6 rotate-[-3deg] bg-amber-200/50" />
      <h4 className="font-serif font-black text-xl text-[#7A5C58] mb-4 tracking-tight border-b-2 border-dashed border-[#7A5C58]/10 pb-2 w-full text-center">{title}</h4>
      
      <div className="relative w-full aspect-square max-w-[240px]">
        <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
          <defs>
            <TextureOverlay type="dots" color="#7A5C58" />
            <TextureOverlay type="lines" color="#7A5C58" />
            <TextureOverlay type="sprinkles" color="#7A5C58" />
            <TextureOverlay type="crumbs" color="#7A5C58" />
          </defs>
          <circle cx={center} cy={center} r={radius + 8} fill="none" stroke="#7A5C58" strokeWidth="2" strokeDasharray="5 5" className="opacity-30" />
          
          {slices.map((slice) => {
            const isSelected = hoveredId === slice.id;
            return (
              <g key={slice.id} className="cursor-pointer">
                <motion.path
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#FFFDF9"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  animate={{ scale: isSelected ? 1.05 : 1, rotate: isSelected ? [0, 2, -2, 0] : 0 }}
                  originX={`${center}px`}
                  originY={`${center}px`}
                  onMouseEnter={() => setHoveredVibe(slice.id)}
                  onMouseLeave={() => setHoveredVibe(null)}
                />
                {slice.texture && (
                  <path 
                    d={slice.pathData} 
                    fill={`url(#${slice.texture})`} 
                    className="pointer-events-none mix-blend-multiply"
                    style={{ transformOrigin: `${center}px ${center}px` }}
                  />
                )}
                {slice.percentage > 5 && (
                  <text
                    x={slice.textX}
                    y={slice.textY}
                    fill="#7A5C58"
                    fontSize="13"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono tracking-wide pointer-events-none select-none bg-white drop-shadow-md"
                  >
                    {slice.percentage}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full mt-4 flex flex-wrap justify-center gap-2.5 text-[10px] font-mono font-bold">
        {data.map((item) => (
          <div key={item.id} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all ${hoveredId === item.id ? 'bg-[#7A5C58]/5 border-[#7A5C58]' : 'border-transparent'}`}>
            <div className="w-2.5 h-2.5 rounded-full border border-[#7A5C58]/20 shadow-xs" style={{ backgroundColor: item.color }} />
            <span className="text-[#7A5C58]/80 truncate max-w-[100px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- THE MAIN PAGE COMPONENT ---
// Accepts reviewData from App.jsx so it updates INSTANTLY
export default function ChronicleBoard({ reviewData }) {
  const { avatar } = useAvatar(); 
  const [memories, setMemories] = useState([]);
  const [dbUserReview, setDbUserReview] = useState(null);
  const [hoveredVibe, setHoveredVibe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animated Modal Overlay Controls (Dimmed background)
  const [showReceiptPopup, setShowReceiptPopup] = useState(true);
  const [isCrumbling, setIsCrumbling] = useState(false);
  const checkNumber = useMemo(() => Math.floor(Math.random() * 900000) + 100000, []);

  useEffect(() => {
    const unsubGlobal = onSnapshot(query(collection(db, "memories"), orderBy("createdAt", "desc")), (snapshot) => {
      const allMemories = snapshot.docs.map(doc => doc.data());
      setMemories(allMemories);
      setLoading(false);
    });

    const unsubUser = onSnapshot(query(collection(db, "memories"), orderBy("createdAt", "desc"), limit(1)), (snapshot) => {
      if (!snapshot.empty) setDbUserReview(snapshot.docs[0].data());
    });

    return () => {
      unsubGlobal();
      unsubUser();
    };
  }, [avatar]);

  // THE MAGIC FIX: If reviewData is passed from App.jsx, use it instantly. Otherwise, use the DB fetch.
  const activeReview = reviewData || dbUserReview;
  const totalCount = memories.length || 1;

  // --- TOP 5 + OTHERS PROCESSING LOGIC ---
  const processChartData = (fieldName, predefinedConfigMap, fallbackPalette) => {
    if (memories.length === 0) {
      return [{ id: 'empty', label: 'Awaiting Guests', color: '#E8E2D5', texture: 'dots', percentage: 100 }];
    }

    const counts = memories.reduce((acc, m) => {
      const key = m[fieldName] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);

    let result = top5.map(([name, count], idx) => {
      const conf = predefinedConfigMap ? predefinedConfigMap[name] : null;
      return {
        name, count,
        color: conf ? conf.color : fallbackPalette[idx % fallbackPalette.length].color,
        texture: conf ? conf.texture : fallbackPalette[idx % fallbackPalette.length].texture,
        label: conf && conf.label ? conf.label : (name.length > 14 ? name.substring(0,11) + '...' : name)
      };
    });

    if (others.length > 0) {
      const othersCount = others.reduce((sum, item) => sum + item[1], 0);
      result.push({ name: 'Others', count: othersCount, color: '#C7CEEA', texture: 'lines', label: 'Others (Mixed)' });
    }

    const total = result.reduce((sum, item) => sum + item.count, 0) || 1;
    return result.map(item => ({
      ...item, id: item.name,
      percentage: Math.round((item.count / total) * 100)
    }));
  };

  const vibeChartData = useMemo(() => processChartData('vibe', VIBE_CONFIGS, BRIGHT_PALETTE), [memories]);
  const dishChartData = useMemo(() => processChartData('dish', null, BRIGHT_PALETTE), [memories]);
  const purposeChartData = useMemo(() => processChartData('purpose', PURPOSE_CONFIGS, BRIGHT_PALETTE), [memories]);

  // Compute ACTUAL Satisfaction Index Over Time
  const satisfactionTrendPoints = useMemo(() => {
    if (memories.length === 0) return [1,2,3,4,5].map(i => ({ week: `Pt ${i}`, index: 100 }));

    const sorted = [...memories].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const numChunks = 5;
    const chunkSize = Math.max(1, Math.ceil(sorted.length / numChunks));
    const points = [];

    for (let i = 0; i < numChunks; i++) {
      const chunk = sorted.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunk.length === 0) {
        points.push({ week: `Pt ${i + 1}`, index: points.length > 0 ? points[points.length - 1].index : 100 });
        continue;
      }
      const sumRatings = chunk.reduce((sum, m) => sum + (m.rating || 4), 0);
      const maxPossible = chunk.length * 4; 
      const avgSatisfaction = Math.round((sumRatings / maxPossible) * 100);
      points.push({ week: `Pt ${i + 1}`, index: avgSatisfaction });
    }
    return points;
  }, [memories]);

  const dominantVibe = useMemo(() => {
    if (vibeChartData.length === 0 || vibeChartData[0].id === 'empty') return 'Main Character Energy';
    return vibeChartData.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current).label;
  }, [vibeChartData]);

  const handleCrumbleAnimation = () => {
    setIsCrumbling(true);
    setTimeout(() => setShowReceiptPopup(false), 950); 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF0F5] font-mono text-xs font-black uppercase text-[#7A5C58]">
        <Activity size={32} className="animate-spin mb-3 text-[#FF9AA2]" /> Calculating Live Data...
      </div>
    );
  }

  const areaPath = `M 25 150 
    L 25 ${150 - (satisfactionTrendPoints[0].index * 1.3)} 
    L 137.5 ${150 - (satisfactionTrendPoints[1].index * 1.3)} 
    L 250 ${150 - (satisfactionTrendPoints[2].index * 1.3)} 
    L 362.5 ${150 - (satisfactionTrendPoints[3].index * 1.3)} 
    L 475 ${150 - (satisfactionTrendPoints[4].index * 1.3)}
    L 475 150 Z`;

  return (
    <div className="w-full min-h-screen bg-[#FFF0F5] text-[#7A5C58] py-10 px-4 md:px-8 relative overflow-hidden flex flex-col items-center font-sans">
      
      {/* HAPPY BACKGROUND GRAPHICS ART CONSOLE */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#7a5c580c_1px,transparent_1px),linear-gradient(to_bottom,#7a5c580c_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
      <FloatingDoodle char="🍪" className="top-[10%] left-[8%]" delay={0.5} />
      <FloatingDoodle char="🌸" className="top-[35%] right-[5%]" delay={1.2} />
      <FloatingDoodle char="🍰" className="bottom-[18%] left-[4%]" delay={2.1} />
      <FloatingDoodle char="✨" className="top-24 right-1/4 animate-pulse" />
      <FloatingDoodle char="🥐" className="bottom-[8%] right-[15%]" delay={1.8} />

      {/* --- RECEIPT MODAL DRAWER OVERLAY --- */}
      <AnimatePresence>
        {showReceiptPopup && activeReview && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#472C20]/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              animate={isCrumbling ? {
                scale: [1, 0.7, 0.3, 0],
                rotate: [0, 45, 180, 360],
                x: [0, -50, 150, window.innerWidth > 768 ? 400 : 100],
                y: [0, -80, 200, 500],
                borderRadius: ["0px", "40px", "100px", "100px"],
                filter: ["blur(0px)", "blur(1px)", "blur(4px)", "blur(10px)"]
              } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="relative shadow-2xl max-w-sm w-full aspect-[3/4] flex items-center justify-center"
            >

              {/* The Exact Lined Paper Receipt from the screenshot */}
              <div className="w-[80%] bg-[#fbd8c9] relative text-[#173e87] flex flex-col font-sans overflow-hidden border-[4px] border-[#472C20] rounded-lg shadow-2xl z-20 h-full">
                
                <div className="p-4 flex flex-col pt-6 relative border-b-[3px] border-[#2B3A67]">
                  <div className="text-right font-mono text-xl text-[#df3131] tracking-widest opacity-80" style={{ transform: 'scaleY(1.2)' }}>{checkNumber}</div>
                  <h2 className="font-cursive text-5xl text-center font-bold tracking-wider text-[#2B3A67] my-3 transform rotate-[-2deg]">Thank You!</h2>
                  <p className="text-[8px] text-center font-mono font-black tracking-widest uppercase text-[#2B3A67] mb-2">Your patronage is appreciated</p>
                </div>
                
                {/* Lined Paper Section matching image_2d5d56.jpg EXACTLY */}
                <div 
                  className="w-full flex-1 flex flex-col bg-[#EFE0CB]"
                  style={{
                    backgroundImage: 'linear-gradient(180deg, #2B3A67 2px, transparent 2px)',
                    backgroundSize: '100% 46px',
                    backgroundPosition: '0 44px' // Aligns lines to text
                  }}
                >
                  <div className="pt-2 flex-1">
                    {/* INSTANTLY Maps over activeReview instead of waiting for DB */}
                    {activeReview.items && activeReview.items.map((item, idx) => (
                      <div key={idx} className="h-[46px] flex justify-center items-end pb-2 px-6">
                        <span className="font-cursive text-3xl text-[#df3131] font-bold tracking-wider truncate">● {item}</span>
                      </div>
                    ))}
                    <div className="h-[46px] flex justify-center items-end pb-2 px-6">
                      <span className="font-cursive text-4xl text-[#df3131] font-bold transform -rotate-12">:)</span>
                    </div>
                  </div>

                  <div className="h-[46px] flex justify-between items-end pb-2 px-6 border-t-[3px] border-dashed border-[#2B3A67] mt-auto w-full bg-[#EFE0CB]">
                    <span className="font-mono text-[10px] font-black uppercase text-[#2B3A67]">Signature</span>
                    <span className="font-cursive text-2xl text-[#df3131] font-bold transform -rotate-3">- {activeReview.name || 'guest'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCrumbleAnimation}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-[#FF9AA2] text-white font-mono font-black text-xs uppercase tracking-widest px-8 py-3.5 border-[3px] border-[#7A5C58] shadow-[4px_4px_0_#7A5C58] rounded-full hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all whitespace-nowrap z-40"
              >
                Crumble & Close 🗑️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1300px] z-10 flex justify-between items-center mb-8 relative">
        <BackToCafeButton />
      </div>

      {/* --- DASHBOARD LOG LAYOUT GRID --- */}
      <div className="max-w-[1300px] w-full z-10 space-y-10 mt-4">
        
        {/* Title Ledger Section */}
        <div className="bg-[#FFFDF9] border-[4px] border-[#7A5C58] rounded-[35px] p-8 shadow-[8px_8px_0_#7A5C58] flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <WashiTape className="-top-3 left-16 rotate-[2deg] bg-amber-200/40" />
          <div className="text-center md:text-left space-y-2 w-full md:w-auto">
            <span className="bg-[#FFDAC1] border-[2px] border-[#7A5C58] text-[10px] font-mono font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-[#7A5C58] inline-block shadow-[2px_2px_0_#7A5C58]">Community Ledger Metrics</span>
            <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter text-[#7A5C58] pt-2">The Experience Files</h1>
          </div>
          
          <div className="bg-white border-[3px] border-[#7A5C58] rounded-2xl p-5 w-full md:max-w-sm text-center md:text-right shadow-[4px_4px_0_#7A5C58] transform rotate-1">
            <span className="text-[11px] font-mono font-black block text-[#FF9AA2] uppercase tracking-wider mb-2">Atmosphere Pulse</span>
            <span className="text-lg font-serif italic font-black text-[#7A5C58]">
              {vibeChartData.find(v => v.label === dominantVibe)?.percentage || 0}% Patrons share the "{dominantVibe}" vibe space.
            </span>
          </div>
        </div>

        {/* TOP ROW: THE 3 INTERACTIVE CLEAN PIE CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ArtsyPieChart data={vibeChartData} title="🌟 Patrons Mood Vibe" hoveredId={hoveredVibe} setHoveredVibe={setHoveredVibe} />
          <ArtsyPieChart data={dishChartData} title="🍰 Most Chosen Items" hoveredId={hoveredVibe} setHoveredVibe={setHoveredVibe} />
          <ArtsyPieChart data={purposeChartData} title="🥧 Why They Visit Us" hoveredId={hoveredVibe} setHoveredVibe={setHoveredVibe} />
        </div>

        {/* BOTTOM ROW: SATISFACTION TREND GRAPH & STASHED SNAPSHOTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-16">
          
          {/* Satisfaction Index Vector Area Chart */}
          <div className="lg:col-span-7 bg-[#FFFDF9] border-[4px] border-[#7A5C58] rounded-[35px] p-8 shadow-[8px_8px_0_#7A5C58] flex flex-col justify-between relative min-h-[380px]">
            <div className="absolute top-2 right-12 w-3 h-10 border-2 border-[#7A5C58] rounded-full shadow-sm bg-gray-200 rotate-[15deg]"></div>
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#FF9AA2] mb-2 block border-b-2 border-dashed border-[#FF9AA2]/30 pb-1 w-fit">Data-Driven Trend Analysis</span>
              <h3 className="font-serif font-black text-4xl text-[#7A5C58] tracking-tight">Guest Satisfaction Trend</h3>
            </div>

            <div className="w-full h-56 relative mt-6 border-b-4 border-l-4 border-[#7A5C58] px-2 flex items-end justify-center rounded-bl-lg">
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible max-w-full">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB7B2" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFB7B2" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="#7A5C58" strokeWidth="2" strokeDasharray="6 6" opacity="0.1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#7A5C58" strokeWidth="2" strokeDasharray="6 6" opacity="0.1" />
                <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="#7A5C58" strokeWidth="2" strokeDasharray="6 6" opacity="0.1" />
                
                <path d={areaPath} fill="url(#areaGradient)" />
                
                <path
                  d={`M 25 ${150 - (satisfactionTrendPoints[0].index * 1.3)} 
                      L 137.5 ${150 - (satisfactionTrendPoints[1].index * 1.3)} 
                      L 250 ${150 - (satisfactionTrendPoints[2].index * 1.3)} 
                      L 362.5 ${150 - (satisfactionTrendPoints[3].index * 1.3)} 
                      L 475 ${150 - (satisfactionTrendPoints[4].index * 1.3)}`}
                  fill="none" stroke="#FF9AA2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                />

                {satisfactionTrendPoints.map((pt, idx) => {
                  const xCoord = 25 + idx * 112.5;
                  const yCoord = 150 - (pt.index * 1.3);
                  return (
                    <g key={idx} className="cursor-pointer group">
                      <circle cx={xCoord} cy={yCoord} r="8" fill="#FFFDF9" stroke="#7A5C58" strokeWidth="4" />
                      <circle cx={xCoord} cy={yCoord} r="4" fill="#FF9AA2" />
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <rect x={xCoord - 20} y={yCoord - 35} width="40" height="20" rx="4" fill="#7A5C58" />
                        <text x={xCoord} y={yCoord - 24} fill="#FFF" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {pt.index}%
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
              
              <div className="absolute inset-x-0 bottom-[-32px] flex justify-between px-2 font-serif text-[14px] font-black text-[#7A5C58]">
                {satisfactionTrendPoints.map((pt, idx) => <span key={idx}>{pt.week}</span>)}
              </div>
            </div>
          </div>

          {/* Stashed Scrapbook commentary */}
          <div className="lg:col-span-5 bg-[#FFFDF9] border-[4px] border-[#7A5C58] rounded-[35px] p-8 shadow-[8px_8px_0_#7A5C58] flex flex-col justify-between overflow-hidden relative">
            <WashiTape className="-top-3 right-8 rotate-[-5deg] bg-blue-200/50" />
            <div>
              <div className="flex justify-between items-center border-b-2 border-dashed border-[#7A5C58]/20 pb-4 mb-6">
                <h4 className="font-serif font-black text-2xl text-[#7A5C58] flex items-center gap-2">
                  <span>🍓</span> Stashed Reflection Whisper
                </h4>
              </div>

              <div className="space-y-4 relative">
                {activeReview ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] font-bold">
                      <span className="bg-white border-[2px] border-[#7A5C58] px-3 py-1 rounded-full shadow-[2px_2px_0_#7A5C58]">👤 {activeReview.name || 'Cozy Patron'}</span>
                      <span className="bg-white border-[2px] border-[#7A5C58] px-3 py-1 rounded-full shadow-[2px_2px_0_#7A5C58] text-[#9D446E]">{activeReview.vibe || '☕ Coffee & Conversations'}</span>
                    </div>
                    <div className="bg-[#FFF0F5]/50 p-6 border-[3px] border-[#7A5C58] shadow-[inset_2px_4px_10px_rgba(122,92,88,0.1)] rounded-2xl italic font-serif text-lg text-[#7A5C58] leading-relaxed min-h-[140px] flex items-center">
                      "{activeReview.review || 'No text reflection was stashed into the ledger fields for this round.'}"
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#7A5C58]/50 font-serif italic py-10 text-center">No scrapbook entries stashed away in memory space.</p>
                )}
              </div>
            </div>

            <p className="font-mono text-[10px] font-bold opacity-40 uppercase tracking-widest text-center mt-8">
              • authentic guest diary logs •
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}