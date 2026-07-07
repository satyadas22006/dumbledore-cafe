import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

export default function GameLeaderboardBoard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'hue_hunt_matches'), orderBy('finalScore', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      {/* Outer Creature Shape Container */}
      <div className="bg-[#A3E4D7] border-[6px] border-[#472C20] rounded-[40px] p-8 w-full max-w-2xl shadow-[15px_15px_0_rgba(71,44,32,0.2)] relative">
        
        {/* Decorative Header Ribbon */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#F1948A] border-[4px] border-[#472C20] px-12 py-3 rounded-full shadow-lg">
          <h1 className="text-3xl font-black text-white uppercase tracking-widest">Leaderboard</h1>
        </div>

        {/* Inner Dashed Content Area */}
        <div className="bg-[#FAF6EE] border-[4px] border-[#472C20] border-dashed rounded-[30px] p-8 mt-8 min-h-[500px]">
          {loading ? (
            <p className="text-center font-black py-20 text-[#472C20]">Loading...</p>
          ) : (
            <div className="space-y-6">
              {players.map((p, i) => (
                <div key={p.id} className="flex items-center gap-6 py-4 border-b-2 border-dashed border-[#472C20]/20">
                  <span className="font-black text-3xl text-[#472C20]/40 w-12">#{i + 1}</span>
                  <span className="font-bold text-xl text-[#472C20] flex-1">{p.playerName || "Anonymous"}</span>
                  <span className="font-black text-xl bg-[#FAD7A0] px-6 py-2 rounded-full border-2 border-[#472C20]">
                    {p.finalScore?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button onClick={() => navigate(-1)} className="bg-[#FAD7A0] border-4 border-[#472C20] px-8 py-3 rounded-full font-black text-[#472C20] hover:scale-105 transition-transform">
            BACK
          </button>
          <button onClick={() => navigate('/games')} className="bg-[#85C1E9] border-4 border-[#472C20] px-8 py-3 rounded-full font-black text-[#472C20] hover:scale-105 transition-transform">
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}