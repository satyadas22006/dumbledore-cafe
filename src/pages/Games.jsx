import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Heart } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import BackToCafeButton from '../components/BackToCafeButton';

/* ---------------------------------------------------------------------
   CafePup — Original decorative corner illustration.
   (Kept for the top-right peeking position)
--------------------------------------------------------------------- */
const CafePup = ({ className = '', style = {} }) => (
  <svg viewBox="0 0 120 130" className={className} style={style}>
    <ellipse cx="60" cy="102" rx="28" ry="24" fill="#FBE3B5" />
    <ellipse cx="30" cy="40" rx="15" ry="21" fill="#E7B98C" transform="rotate(-25 30 40)" />
    <ellipse cx="90" cy="40" rx="15" ry="21" fill="#E7B98C" transform="rotate(25 90 40)" />
    <circle cx="60" cy="56" r="34" fill="#FBE3B5" stroke="#FFF7E3" strokeWidth="3" />
    <path d="M28 42 Q60 12 92 42 Q60 30 28 42 Z" fill="#F2A6A6" />
    <circle cx="60" cy="15" r="6" fill="#F6C9C9" />
    <circle cx="39" cy="63" r="6" fill="#F9C4C4" opacity="0.65" />
    <circle cx="81" cy="63" r="6" fill="#F9C4C4" opacity="0.65" />
    <circle cx="46" cy="56" r="3.2" fill="#6B5B4E" />
    <circle cx="74" cy="56" r="3.2" fill="#6B5B4E" />
    <ellipse cx="60" cy="65" rx="3.5" ry="3" fill="#B98A5E" />
    <path d="M60 68 Q60 73 55 73 M60 68 Q60 73 65 73" stroke="#6B5B4E" strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="78" cy="98" rx="8" ry="7" fill="#FBE3B5" stroke="#FFF7E3" strokeWidth="2" />
    <ellipse cx="42" cy="98" rx="8" ry="7" fill="#FBE3B5" stroke="#FFF7E3" strokeWidth="2" />
  </svg>
);

/* ---------------------------------------------------------------------
   PompompurinPup — Hand-drawn SVG mimicking your uploaded image:
   Yellow pudding dog holding a fresh bouquet of pink tulips!
--------------------------------------------------------------------- */
const PompompurinPup = ({ className = '', style = {} }) => (
  <svg viewBox="0 0 140 140" className={className} style={style}>
    <ellipse cx="70" cy="125" rx="45" ry="8" fill="#D2B06A" opacity="0.3" />
    <ellipse cx="70" cy="95" rx="36" ry="28" fill="#FFF8BD" />
    <circle cx="45" cy="115" r="14" fill="#FFF8BD" />
    <circle cx="95" cy="115" r="14" fill="#FFF8BD" />
    <g transform="rotate(-15 35 65)">
      <ellipse cx="35" cy="65" rx="14" ry="22" fill="#FFF8BD" />
    </g>
    <path d="M18 55 Q12 50 16 44 Q22 46 24 52 Q28 46 32 50 Q28 58 18 55 Z" fill="#C2D1F0" /> 
    <g transform="rotate(15 105 65)">
      <ellipse cx="105" cy="65" rx="14" ry="22" fill="#FFF8BD" />
    </g>
    <path d="M122 55 Q128 50 124 44 Q118 46 116 52 Q112 46 108 50 Q112 58 122 55 Z" fill="#C2D1F0" />
    <circle cx="70" cy="70" r="38" fill="#FFF8BD" />
    <path d="M46 44 Q70 20 94 44 Q70 38 46 44 Z" fill="#704F37" />
    <ellipse cx="70" cy="30" rx="4" ry="6" fill="#704F37" />
    <circle cx="48" cy="78" r="7" fill="#FFA3A3" opacity="0.5" />
    <circle cx="92" cy="78" r="7" fill="#FFA3A3" opacity="0.5" />
    <circle cx="58" cy="70" r="3.5" fill="#3D2616" />
    <circle cx="82" cy="70" r="3.5" fill="#3D2616" />
    <ellipse cx="70" cy="75" rx="3.5" ry="2.5" fill="#3D2616" />
    <path d="M70 77.5 Q66 81 63 79 M70 77.5 Q74 81 77 79" stroke="#3D2616" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <ellipse cx="42" cy="96" rx="10" ry="14" fill="#FFF8BD" transform="rotate(-30 42 96)" />
    <path d="M64 92 Q68 115 56 126" stroke="#5D8C43" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M72 90 Q72 112 68 124" stroke="#5D8C43" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M84 92 Q74 114 78 125" stroke="#5D8C43" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M60 115 Q46 100 62 95 Q68 108 60 115 Z" fill="#6EA650" />
    <path d="M75 118 Q92 106 82 96 Q76 108 75 118 Z" fill="#6EA650" />
    <g transform="translate(50, 80)">
      <ellipse cx="10" cy="12" rx="9" ry="12" fill="#F491A5" />
      <path d="M4 6 Q10 18 16 6" stroke="#FFF1F3" strokeWidth="1" fill="none" />
    </g>
    <g transform="translate(68, 76)">
      <ellipse cx="10" cy="12" rx="10" ry="13" fill="#F7A1B5" />
      <path d="M3 6 Q10 20 17 6" stroke="#FFF1F3" strokeWidth="1" fill="none" />
    </g>
    <g transform="translate(80, 88)">
      <ellipse cx="10" cy="11" rx="9" ry="12" fill="#F491A5" />
      <path d="M4 5 Q10 17 16 5" stroke="#FFF1F3" strokeWidth="1" fill="none" />
    </g>
    <ellipse cx="94" cy="98" rx="10" ry="13" fill="#FFF8BD" transform="rotate(45 94 98)" />
  </svg>
);

const GameCard = ({ emoji, title, subtitle, accent, onClick }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02, rotate: -1 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative bg-white/95 border-[3px] border-white rounded-[2rem] p-6 cursor-pointer shadow-[0_6px_20px_rgb(0,0,0,0.07)] flex items-center gap-5 overflow-hidden w-full"
  >
    <div
      className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-60"
      style={{ backgroundColor: accent }}
    />
    <div
      className="relative shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner"
      style={{ backgroundColor: accent }}
    >
      {emoji}
    </div>
    <div className="relative text-left">
      <h2 className="text-xl font-serif font-black text-[#6B5B4E]">{title}</h2>
      <p className="text-xs font-bold text-[#8a7a6a] tracking-wide mt-0.5">{subtitle}</p>
    </div>
    <Sparkles size={22} className="absolute right-4 bottom-4 text-[#f2c9a0]" />
  </motion.div>
);

const Games = ({ onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'hue_hunt_matches'),
      orderBy('finalScore', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPlayers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Firestore Error: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6 md:p-12 flex flex-col items-center relative overflow-x-hidden"
      style={{
        backgroundColor: '#FCE8A8',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0.55) 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.55) 2px, transparent 2px)',
        backgroundSize: '54px 54px',
      }}
    >
      <BackToCafeButton className="mb-8 z-20 relative" />

      <Heart
        size={44}
        strokeWidth={2}
        className="hidden md:block absolute bottom-8 right-8 text-[#e8d18a] opacity-70 z-10"
      />

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-pink-100/80 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-pink-900 border border-pink-200">
            <Sparkles size={18} /> dumble play corner <Sparkles size={18} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#6B5B4E]">The Cozy Arcade</h1>
        </div>

        {/* Updated grid ratio to give the elements slightly more room */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-stretch">
          
          {/* RECTANGLE 1: LEFT — Enlarged games panel */}
          <div className="relative bg-[#F3C775] rounded-[2.75rem] p-10 md:p-14 border-[4px] border-white shadow-[0_12px_40px_rgb(0,0,0,0.1)] flex flex-col justify-center">
            
            {/* Peeking pup, repositioned nicely on the expanded layout */}
            <CafePup className="absolute -top-11 -right-4 w-24 h-24 drop-shadow-md" />

            <div className="flex items-center gap-2 mb-6 font-black text-white/90 uppercase tracking-widest text-sm">
              <Sparkles size={18} /> pick a game
            </div>

            {/* Increased card gap */}
            <div className="flex flex-col gap-6 w-full">
              <GameCard
                emoji="📸"
                title="Hue Hunt"
                subtitle="spot the colors around you"
                accent="#FBEAB0"
                onClick={() => onNavigate('hue-hunt')}
              />
              <GameCard
                emoji="💬"
                title="Talk Box"
                subtitle="cozy icebreaker questions"
                accent="#D9ECEF"
                onClick={() => onNavigate('icebreakers')}
              />
            </div>

            {/* Pompompurin puppy sitting comfortably */}
            <PompompurinPup
              className="hidden md:block absolute -bottom-12 -left-8 w-32 h-32 drop-shadow-md"
            />
          </div>

          {/* RECTANGLE 2: RIGHT — Enlarged leaderboard panel */}
          <div className="rounded-[2.75rem] border-[4px] border-white shadow-[0_12px_40px_rgb(0,0,0,0.1)] overflow-hidden flex flex-col min-h-[500px]">
            <div className="bg-white/90 py-5 flex items-center justify-center gap-2 font-black text-[#6B5B4E] uppercase tracking-widest text-base border-b-2 border-dashed border-[#6B5B4E]/10">
              <Trophy size={22} className="text-amber-500" /> Top Hunters
            </div>
            
            {/* Increased inner padding here (p-8) for a bigger, breathing layout */}
            <div
              className="flex-1 p-8 flex flex-col justify-start"
              style={{
                backgroundColor: '#EAF2DE',
                backgroundImage:
                  'linear-gradient(90deg, rgba(255,255,255,0.7) 8px, transparent 8px), linear-gradient(rgba(255,255,255,0.7) 8px, transparent 8px)',
                backgroundSize: '24px 24px',
              }}
            >
              {loading ? (
                <p className="text-center text-sm opacity-50 mt-6">Loading scores...</p>
              ) : players.length > 0 ? (
                <div className="space-y-3 w-full">
                  {players.map((player, i) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center bg-white/80 rounded-2xl px-4 py-3 font-bold text-[#6B5B4E] text-sm shadow-sm border border-white/40"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-black ${
                            i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-300' : i === 2 ? 'bg-orange-300' : 'bg-[#c9b89a]'
                          }`}
                        >
                          {i + 1}
                        </span>
                        {player.playerName || 'Anonymous'}
                      </span>
                      <span className="font-extrabold text-[#5D8C43]">{player.finalScore ?? 0} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm opacity-50 font-serif mt-6">No hunters yet...</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
};

export default Games;