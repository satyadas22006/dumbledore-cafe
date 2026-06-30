import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Smile } from 'lucide-react';
import BackToCafeButton from '../components/BackToCafeButton';

const Games = ({ onNavigate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className="max-w-4xl mx-auto px-6 pt-12 select-none"
    >
      {/* Back button */}
      <BackToCafeButton className="mb-10" />

      {/* Main Hand-drawn Window Board */}
      <div className="bg-[#F9F6F0] text-[#3C2F2F] border-4 border-[#3C2F2F] rounded-[2.5rem] shadow-[8px_8px_0px_0px_#3C2F2F] p-6 md:p-10 relative overflow-hidden">
        
        {/* Playful Header Section */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#F1E9DB] border-2 border-[#3C2F2F] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-500 animate-spin" /> dumble play corner <Smile size={14} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight">
            The Cozy Arcade
          </h1>
          <p className="text-sm max-w-md mx-auto opacity-80 font-medium">
            Take a little break, grab your drink, and pick a game to play while you wait!
          </p>
        </div>

        {/* Game Cards Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          
          {/* Card 1: Hue Hunt */}
          <motion.div 
            whileHover={{ scale: 1.03, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('hue-hunt')}
            className="bg-[#FFFDF9] border-4 border-[#3C2F2F] rounded-[2rem] p-8 cursor-pointer shadow-[5px_5px_0px_0px_#3C2F2F] flex flex-col items-center text-center group transition-colors hover:bg-[#FFF9EC]"
          >
            <div className="w-20 h-20 bg-[#FFE8C5] rounded-full border-4 border-[#3C2F2F] flex items-center justify-center text-4xl shadow-inner mb-4 group-hover:animate-bounce">
              📸
            </div>
            <h2 className="text-2xl font-serif font-black">Hue Hunt</h2>
            <p className="text-xs font-medium opacity-70 mt-3 leading-relaxed">
              Find and snap photos of matching colored items around your table before the countdown timer hits zero!
            </p>
          </motion.div>

          {/* Card 2: Icebreakers */}
          <motion.div 
            whileHover={{ scale: 1.03, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('icebreakers')}
            className="bg-[#FFFDF9] border-4 border-[#3C2F2F] rounded-[2rem] p-8 cursor-pointer shadow-[5px_5px_0px_0px_#3C2F2F] flex flex-col items-center text-center group transition-colors hover:bg-[#EDF6FF]"
          >
            <div className="w-20 h-20 bg-[#D4EBFF] rounded-full border-4 border-[#3C2F2F] flex items-center justify-center text-4xl shadow-inner mb-4 group-hover:animate-bounce">
              💬
            </div>
            <h2 className="text-2xl font-serif font-black">Talk Box</h2>
            <p className="text-xs font-medium opacity-70 mt-3 leading-relaxed">
              Getting to know each other better. Draw charming, unexpected table questions to spark casual chatter.
            </p>
          </motion.div>

        </div>

        {/* Bottom decorative scribble badge */}
        <div className="text-center mt-12 text-[11px] font-bold uppercase tracking-widest opacity-40">
          • built for friendly tables •
        </div>
      </div>
    </motion.div>
  );
};

export default Games;