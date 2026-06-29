import React from 'react';
import { motion } from 'framer-motion';

const ScrapbookCard = ({ children, className, rotation = 0 }) => (
  <motion.div 
    whileHover={{ rotate: 0, scale: 1.02 }}
    style={{ rotate: `${rotation}deg` }}
    className={`bg-[#FFFDF9] p-8 border-2 border-[#472C20] shadow-[8px_8px_0_#472C20] ${className}`}
  >
    {children}
  </motion.div>
);

const ChronicleBoard = ({ memories, theme }) => {
  return (
    <div className="min-h-screen py-20 px-6" style={{ 
      backgroundColor: '#FAF6EE', 
      backgroundImage: `linear-gradient(#E8E2D5 1px, transparent 1px), linear-gradient(90deg, #E8E2D5 1px, transparent 1px)`, 
      backgroundSize: '24px 24px' 
    }}>
      <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }} className="text-7xl font-cursive text-center mb-16 text-[#472C20]">
        The Chronicle.
      </motion.h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Today's Story (Polaroid Style) */}
        <ScrapbookCard rotation={-2} className="md:col-span-2 flex items-center gap-8">
          <div className="w-32 h-32 bg-gray-200 border border-black flex items-center justify-center font-mono">Photo</div>
          <div>
            <h3 className="font-bold text-xl mb-2">Today's Story</h3>
            <p className="font-serif italic">"A quiet morning turned chaotic when the café cat decided the espresso machine was a jungle gym..."</p>
          </div>
        </ScrapbookCard>

        {/* Duck Commentary (Sticky Note) */}
        <ScrapbookCard rotation={3} className="bg-yellow-100 flex flex-col justify-between">
          <p className="text-sm font-mono opacity-70">DUCKY SAYS:</p>
          <p className="font-cursive text-2xl">"The coffee is 10/10, but the crumbs? 0/10. Do better, humans."</p>
        </ScrapbookCard>

        {/* Trending Items */}
        <ScrapbookCard rotation={-1} className="md:col-span-3">
          <h3 className="font-mono text-xs uppercase tracking-widest mb-6">Current Obsessions</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['Matcha Latte', 'Croissant', 'Pour Over'].map((item) => (
              <div key={item} className="px-6 py-2 border-2 border-[#472C20] rounded-full bg-white font-bold">
                {item}
              </div>
            ))}
          </div>
        </ScrapbookCard>

        {/* Floating Decorations */}
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="fixed top-20 right-20 text-6xl">⭐</motion.div>
      </div>
    </div>
  );
};

export default ChronicleBoard;