import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Smile, Trophy } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase'; 
import BackToCafeButton from '../components/BackToCafeButton';

const Games = ({ onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Correct query based on your DB schema
    const q = query(
      collection(db, 'hue_hunt_matches'), 
      orderBy('finalScore', 'desc'), 
      limit(10)
    );
    
    // 2. Using onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen p-6 md:p-12 flex flex-col items-center relative overflow-x-hidden"
      style={{
        backgroundColor: "#FFFBE6",
        backgroundImage: "linear-gradient(90deg, #F8E1E1 1px, transparent 1px), linear-gradient(#F8E1E1 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }}
    >
      <BackToCafeButton className="mb-8 z-20 relative" />

      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 border-[3px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.05)] relative z-10">
        
        {/* Leaderboard Section */}
        <div className="mb-10 bg-white/50 p-6 rounded-3xl border border-white/50 shadow-inner">
          <div className="flex items-center justify-center gap-2 mb-4 font-black text-[#6B5B4E] uppercase tracking-widest text-sm">
            <Trophy size={16} className="text-amber-500" /> Top Hunters
          </div>
          
          {loading ? (
            <p className="text-center text-sm opacity-50">Loading scores...</p>
          ) : players.length > 0 ? (
            <div className="space-y-2">
              {players.map((player, i) => (
                <div key={player.id} className="flex justify-between font-bold text-[#6B5B4E] border-b border-white/50 pb-1">
                  {/* Using the correct DB fields: playerName and finalScore */}
                  <span>{i + 1}. {player.playerName || "Anonymous"}</span>
                  <span>{player.finalScore ?? 0} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm opacity-50 font-serif">No hunters yet...</p>
          )}
        </div>

        {/* Content Header & Games Grid remain the same... */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-pink-100/80 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-pink-900 border border-pink-200">
            <Sparkles size={14} /> dumble play corner <Smile size={14} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#6B5B4E]">The Cozy Arcade</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto">
          <motion.div whileHover={{ y: -5, scale: 1.02 }} onClick={() => onNavigate('hue-hunt')} className="bg-white/90 border border-white rounded-[2rem] p-6 cursor-pointer shadow-lg flex flex-col items-center text-center hover:bg-green-50 transition-colors">
            <div className="text-5xl mb-4">📸</div>
            <h2 className="text-xl font-serif font-bold text-[#6B5B4E]">Hue Hunt</h2>
          </motion.div>
          <motion.div whileHover={{ y: -5, scale: 1.02 }} onClick={() => onNavigate('icebreakers')} className="bg-white/90 border border-white rounded-[2rem] p-6 cursor-pointer shadow-lg flex flex-col items-center text-center hover:bg-blue-50 transition-colors">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-xl font-serif font-bold text-[#6B5B4E]">Talk Box</h2>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Games;