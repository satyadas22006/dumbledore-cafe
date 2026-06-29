import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Coffee, Smile } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  // Gingham check pattern background styles mimicking 3659243442003164.jpg
  const ginghamBackgroundStyle = {
    backgroundColor: '#f4f8ff',
    backgroundImage: `
      linear-gradient(90deg, rgba(162, 194, 232, 0.4) 50%, transparent 50%),
      linear-gradient(rgba(162, 194, 232, 0.4) 50%, transparent 50%)
    `,
    backgroundSize: '40px 40px'
  }; 

  return (
    <div 
      style={ginghamBackgroundStyle}
      className="min-h-screen text-[#472C20] font-sans relative overflow-hidden flex items-center justify-center p-6 select-none"
    >
      {/* Cozy scrapbooked sticker floating assets inspired directly by 3659243442003164.jpg */}
      <motion.div animate={{ y: [0, -8, 0], rotate: [8, 12, 8] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-8 text-6xl drop-shadow-sm">☀️</motion.div>
      <motion.div animate={{ y: [0, 6, 0], rotate: [-5, 5, -5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-32 right-12 text-5xl drop-shadow-sm">🍎</motion.div>
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-16 left-12 text-4xl opacity-90">⭐</motion.div>
      <motion.div className="absolute bottom-32 right-16 text-5xl rotate-12 opacity-85">🍰</motion.div>
      <motion.div className="absolute top-1/2 left-6 text-4xl -rotate-12">🍅</motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#FFFDF9] border-[5px] border-[#472C20] rounded-[35px] shadow-[12px_12px_0_#472C20] p-8 text-center flex flex-col items-center relative z-10"
      >
        {/* Soft custom badge header */}
        <span className="inline-flex items-center gap-1 bg-[#FFE08A] border-2 border-[#472C20] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_#472C20] mb-4">
          ✨ Welcome Friend
        </span>

        <h1 className="text-4xl font-serif font-black tracking-tight mb-1 text-[#472C20]">Dumble' Door</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-[#FF9F29] mb-8">Cozy Social Café</p>

        {/* The Action Buttons Row Layout */}
        <div className="w-full space-y-4">
          
          {/* OPTION 1: Enter Café Immediately */}
          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-[#A8E6CF] border-[4px] border-[#472C20] rounded-2xl font-serif font-black text-xl py-4 text-[#472C20] shadow-[5px_5px_0_#472C20] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_#472C20] active:translate-y-[2px] active:shadow-[2px_2px_0_#472C20] transition-all flex items-center justify-center gap-2 group"
          >
            <Coffee size={20} className="group-hover:animate-spin" /> Enter Café Directly
          </button>

          {/* OPTION 2: Customize Avatar Dress Up Screen */}
          <button
            onClick={() => onNavigate('avatar-studio')}
            className="w-full bg-[#FFB6C9] border-[4px] border-[#472C20] rounded-2xl font-black text-sm py-3.5 text-[#472C20] shadow-[4px_4px_0_#472C20] hover:bg-[#FFA3BA] hover:translate-y-[-1px] active:translate-y-[2px] active:shadow-[2px_2px_0_#472C20] transition-all flex items-center justify-center gap-2"
          >
            <Smile size={16} /> Create Your Avatar First
          </button>
          
        </div>

        <div className="mt-8 text-[9px] font-black uppercase opacity-40 tracking-widest">
          Jagda, Rourkela • Gather & Play
        </div>
      </motion.div>
    </div>
  );
}