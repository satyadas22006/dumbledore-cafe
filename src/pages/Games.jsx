import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import BackToCafeButton from '../components/BackToCafeButton';
import ArcadeBackground from '../components/ArcadeBackground';

/* ---------------------------------------------------------------------
   Game picker card — subtle dot texture, gradient icon bubble, no
   oversized mascot illustrations.
--------------------------------------------------------------------- */
const GameCard = ({ emoji, title, subtitle, iconBg, blobColor, onClick }) => (
  <motion.button
    whileHover={{ y: -4, scale: 1.015 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full text-left relative bg-white/95 border-2 border-[#472C20]/10 rounded-[1.75rem] p-5 flex items-center gap-4 shadow-[0_4px_16px_rgba(71,44,32,0.08)] hover:shadow-[0_10px_26px_rgba(71,44,32,0.16)] hover:border-[#472C20]/20 transition-all overflow-hidden group"
  >
    <div
      className="absolute inset-0 opacity-[0.05] pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(#472C20 1px, transparent 1px)', backgroundSize: '14px 14px' }}
    />
    <div
      className="absolute -right-7 -bottom-7 w-24 h-24 rounded-full opacity-25 group-hover:scale-110 transition-transform"
      style={{ backgroundColor: blobColor }}
    />

    <div
      className="relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-black/5"
      style={{ background: iconBg }}
    >
      {emoji}
    </div>
    <div className="relative flex-1 min-w-0">
      <h3 className="text-lg font-serif font-black text-[#472C20] leading-tight">{title}</h3>
      <p className="text-[11px] font-bold text-[#472C20]/50 uppercase tracking-wide mt-0.5">{subtitle}</p>
    </div>
    <ChevronRight
      size={20}
      className="relative shrink-0 text-[#472C20]/30 group-hover:text-[#472C20]/70 group-hover:translate-x-1 transition-all"
    />
  </motion.button>
);

/* ---------------------------------------------------------------------
   Rank badge — gold / silver / bronze medals for the top 3, a plain
   numbered pill for everyone else.
--------------------------------------------------------------------- */
const RankBadge = ({ rank }) => {
  const medals = {
    1: { bg: 'linear-gradient(135deg,#F8D888,#E8A83C)', ring: '#C98A1F', icon: '🥇' },
    2: { bg: 'linear-gradient(135deg,#EDF1F5,#C3CCD6)', ring: '#98A2AD', icon: '🥈' },
    3: { bg: 'linear-gradient(135deg,#E8BB94,#CC8955)', ring: '#A96B3E', icon: '🥉' }
  };
  const m = medals[rank];

  if (m) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base shadow-md shrink-0"
        style={{ background: m.bg, border: `2px solid ${m.ring}` }}
      >
        {m.icon}
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 bg-[#6F9587] border-2 border-[#587A6E]">
      {rank}
    </div>
  );
};

const LeaderboardRow = ({ player, rank }) => (
  <motion.div
    initial={{ opacity: 0, x: 8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: rank * 0.03 }}
    className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 border transition-colors ${
      rank === 1
        ? 'bg-white border-[#E8A83C]/50 shadow-[0_3px_14px_rgba(232,168,60,0.28)]'
        : 'bg-white/75 border-white/60'
    }`}
  >
    <RankBadge rank={rank} />
    <span className="flex-1 min-w-0 font-bold text-sm text-[#2F5449] truncate">
      {player.playerName || 'Anonymous'}
    </span>
    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-full bg-[#E9F3EE] text-[#2F5449] whitespace-nowrap">
      {player.finalScore ?? 0} <span className="opacity-50 font-bold">pts</span>
    </span>
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
    >
      <ArcadeBackground variant="hub" />

      <BackToCafeButton className="mb-8 z-20 relative" />

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#472C20] border-2 border-[#472C20]/15 shadow-sm">
            <Sparkles size={14} className="text-[#E8825A]" /> dumble play corner <Sparkles size={14} className="text-[#6FAE9E]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#472C20]">The Cozy Arcade</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-stretch">

          {/* LEFT — warm coral/terracotta games panel */}
          <div
            className="relative rounded-[2.75rem] p-8 md:p-10 border-[4px] border-white shadow-[0_14px_40px_rgba(232,130,90,0.22)] flex flex-col justify-center overflow-hidden"
            style={{ background: 'linear-gradient(150deg, #F2A473 0%, #E8825A 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }}
            />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-14 -left-10 w-40 h-40 rounded-full bg-white/10" />

            <div className="relative flex items-center gap-2 mb-6 font-black text-white uppercase tracking-widest text-sm drop-shadow-sm">
              <Sparkles size={18} /> pick a game
            </div>

            <div className="relative flex flex-col gap-5 w-full">
              <GameCard
                emoji="📸"
                title="Hue Hunt"
                subtitle="spot the colors around you"
                iconBg="linear-gradient(150deg,#FFE9C7,#F6C86B)"
                blobColor="#F6C86B"
                onClick={() => onNavigate('hue-hunt')}
              />
              <GameCard
                emoji="💬"
                title="Talk Box"
                subtitle="cozy icebreaker questions"
                iconBg="linear-gradient(150deg,#DCEFEA,#9FCFC0)"
                blobColor="#9FCFC0"
                onClick={() => onNavigate('icebreakers')}
              />
            </div>
          </div>

          {/* RIGHT — cool sage/teal leaderboard panel */}
          <div
            className="rounded-[2.75rem] border-[4px] border-white shadow-[0_14px_40px_rgba(111,149,135,0.22)] overflow-hidden flex flex-col min-h-[500px]"
            style={{ background: 'linear-gradient(160deg, #EAF4EF 0%, #D8EAE2 100%)' }}
          >
            <div className="bg-white/85 backdrop-blur-sm py-5 flex items-center justify-center gap-2 font-black text-[#2F5449] uppercase tracking-widest text-base border-b-2 border-dashed border-[#2F5449]/10">
              <Trophy size={20} className="text-[#E8A83C]" /> Top Hunters
            </div>

            <div className="flex-1 p-6 md:p-7 flex flex-col justify-start">
              {loading ? (
                <p className="text-center text-sm opacity-50 mt-6 text-[#2F5449]">Loading scores...</p>
              ) : players.length > 0 ? (
                <div className="space-y-2.5 w-full">
                  {players.map((player, i) => (
                    <LeaderboardRow key={player.id} player={player} rank={i + 1} />
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-10">
                  <span className="text-4xl opacity-60">🏆</span>
                  <p className="text-sm font-serif italic opacity-50 text-[#2F5449]">
                    No hunters yet... be the first!
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Games;