import React from 'react';
import { motion } from 'framer-motion';

const MemoryWall = ({ memories }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-6 py-20 relative">
      <h1 className="text-7xl font-serif text-center mb-32">The Wall.</h1>
      
      <div className="masonry-grid columns-1 md:columns-2 lg:columns-3">
        {memories.map((m, idx) => (
          <div key={m.id} className="masonry-item relative rotate-2 hover:rotate-0 hover:z-10 transition-all duration-300 group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-md rotate-[-4deg] shadow-sm z-20 border border-white/60"></div>
            
            <div className="bg-[#FDFBF7] text-[#2C241B] p-6 pb-16 rounded-sm shadow-2xl">
              <div className="bg-white aspect-square mb-6 p-8 flex items-center justify-center shadow-inner border border-[#2C241B]/5 relative">
                <p className="text-4xl font-cursive leading-tight text-center">"{m.text || m.highlights[0]}"</p>
              </div>
              <div className="flex justify-between items-center px-2 mb-2">
                <span className="font-serif font-bold text-xl truncate">{m.dish}</span>
                <span className="text-3xl">{m.vibe.split(" ")[0]}</span>
              </div>
              <div className="px-2 text-sm font-mono opacity-60 flex justify-between">
                <span>{m.name || "Anonymous Enjoyer"}</span>
                <span>{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MemoryWall;