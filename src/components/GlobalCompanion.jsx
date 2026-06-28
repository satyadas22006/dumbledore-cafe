import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext';
import { AvatarRenderer } from './AvatarRenderer';

export default function GlobalCompanion() {
  const { avatar, isCustomized } = useAvatar();
  const location = useLocation();
  const [showBubble, setShowBubble] = useState(true);

  // Hide the companion completely ONLY when on the root landing page or inside the studio creator
  if (location.pathname === '/welcome' || location.pathname === '/avatar-studio') {
    return null;
  }

  // Dynamic contextual remarks depending on which game or board route they open
  const getSpeechBubbleText = () => {
    if (location.pathname.includes('icebreakers')) return "Eye contact time! No yapping lies around me... 👁️";
    if (location.pathname.includes('hue-hunt')) return "Hurry up!! Snap that target color object before the clock dies! 🍓";
    if (location.pathname === '/') return "Welcome back to safety! Let's go cook up some table drama? ✨";
    return "I am observing your clicks quietly... 🐥";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none select-none flex flex-col items-center">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => setShowBubble(false)}
            className="pointer-events-auto cursor-pointer bg-white border-[3px] border-[#472C20] rounded-2xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#472C20] shadow-[4px_4px_0_#472C20] mb-3 text-center max-w-[180px] relative"
          >
            {getSpeechBubbleText()}
            {/* Lower Speech Bubble Tail element arrow indicator */}
            <div className="absolute bottom-[-9px] right-8 w-3 h-3 bg-white border-b-[3px] border-r-[3px] border-[#472C20] rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Avatar Core Container Grid */}
      <motion.div
        className="pointer-events-auto cursor-pointer w-24 h-24 flex items-center justify-center bg-[#FFF7D8]/90 backdrop-blur-sm border-4 border-[#472C20] rounded-full shadow-[5px_5px_0_#472C20]"
        whileHover={{ scale: 1.1, rotate: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowBubble(!showBubble)}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="scale-[0.8] transform translate-y-[-4px]">
          <AvatarRenderer config={avatar} size={100} animate={false} />
        </div>
      </motion.div>
    </div>
  );
}