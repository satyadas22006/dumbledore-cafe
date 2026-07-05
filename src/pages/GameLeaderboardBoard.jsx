import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

// ── Design tokens ──────────────
const INK = '#472C20';
const CREAM = '#FAF6EE';
const LAVENDER_DEEP = '#C5B4E3';

// ── "Kirby" Style Avatar Component ──────────────
const KirbyAvatar = ({ size = 50 }) => (
  <div 
    className="relative rounded-full shadow-md border-2 border-white/50"
    style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #FFC1D9 0%, #FF85B3 100%)' 
    }}
  >
    {/* Simple facial features to evoke the aesthetic */}
    <div className="absolute top-[35%] left-[25%] w-[15%] h-[20%] bg-[#472C20] rounded-full" />
    <div className="absolute top-[35%] right-[25%] w-[15%] h-[20%] bg-[#472C20] rounded-full" />
    <div className="absolute top-[60%] left-[45%] w-[10%] h-[5%] bg-[#472C20] rounded-full" />
  </div>
);

export default function GameLeaderboardBoard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const topPlayersQuery = query(collection(db, 'gameStats'), orderBy('score', 'desc'), limit(50));
    const unsubscribe = onSnapshot(topPlayersQuery, (snapshot) => {
      setPlayers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center font-mono text-white">Loading...</div>;

  return (
    <div 
      className="w-full min-h-screen p-6 md:p-12 relative" 
      style={{ 
        background: LAVENDER_DEEP,
        backgroundImage: `linear-gradient(to right, ${INK}08 1px, transparent 1px), linear-gradient(to bottom, ${INK}08 1px, transparent 1px)`,
        backgroundSize: '40px 40px' 
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-black text-center mb-16 text-white drop-shadow-md">Leaderboard</h1>

        {/* Podium Area */}
        <div className="flex items-end justify-center gap-6 mb-16">
          {[2, 1, 3].map((rank, index) => {
            const player = players[index];
            return (
              <motion.div 
                key={rank} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-24"
              >
                <KirbyAvatar size={rank === 1 ? 80 : 60} />
                <div 
                  className="w-full mt-4 rounded-t-2xl flex flex-col items-center justify-center shadow-lg"
                  style={{ 
                    height: rank === 1 ? 180 : 120, 
                    background: rank === 1 ? '#F0B429' : '#C5B4E3' 
                  }}
                >
                  <span className="text-white font-black text-2xl">{rank}</span>
                  {player && <span className="text-white text-xs font-bold mt-1">{player.score}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* List Area */}
        <div className="bg-white/80 backdrop-blur-md rounded-[40px] p-8 shadow-xl">
          {players.slice(3).map((player, i) => (
            <div key={player.id} className="flex items-center gap-6 py-4 border-b border-black/5 last:border-0">
              <span className="font-mono text-xl font-black opacity-30 w-8">{i + 4}</span>
              <KirbyAvatar size={40} />
              <span className="font-bold text-lg flex-1">{player.username}</span>
              <span className="font-black text-lg">{player.score?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}