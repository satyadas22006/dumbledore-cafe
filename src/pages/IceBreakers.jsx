import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, AlertTriangle, MessageSquare, Zap } from 'lucide-react';
import ArcadeBackground from '../components/ArcadeBackground';

// Pure chatpata drama prompts
const SPICY_PROMPTS = [
  "Who's most likely to accidentally start dating someone from this café? 👀",
  "What's the biggest green flag you've ignored because they were hot? 🔥",
  "Who's your celebrity \"hear me out\"? 🤔",
  "What's your most embarrassing search history item that isn't illegal? 🔍",
  "Have you ever secretly stalked someone's Spotify listening activity? 🎧",
  "What is your absolute number one toxic trait? 💅",
  "What's something you'd defend with your LIFE even though everyone disagrees? ⚔️",
  "What's your most completely unnecessary purchase this month? 💸",
  "What's a red flag you'd still probably ignore? 🚩",
  "Who at this table would survive the longest in a zombie apocalypse? 🧟",
  "What's your current personal Roman Empire? 🏛️",
  "If your last situationship had a movie title, what would it be? 🎬",
  "Who is the undisputed biggest yapper at this table? 🗣️",
  "What's the most delusional thing you've convinced yourself of? 🌀",
  "Which app would expose you the absolute most if people saw your screen time? 📱",
  "Have you ever pretended not to see someone you know in public? 🙈",
  "What's your worst \"I can fix them\" moment? 🛠️",
  "What is the pettiest thing you've done in the last 6 months? 🧊",
  "What's one spicy opinion you hold that would instantly get you cancelled? 🤫",
  "What's the funniest, most unnecessary lie you've ever told? 🤥",
  "If everyone here swapped unlocked phones for 5 minutes... who would panic first? 🚨",
  "Who's most likely to accidentally become famous for something weird? 🌟",
  "What's your most used emoji and why is it highly suspicious? 🧐",
  "What's one thing you absolutely and silently judge other people for? ⚖️",
  "If your life had a loading screen tip right now, what would it say? 🎮"
];

// 1-in-8 Chaos Wildcards
const CHAOS_CARDS = [
  {
    title: "🐥 DUCK ATTACK!",
    text: "Everyone points at the person most likely to ghost a group chat on 3, 2, 1... No explanations allowed. 🔪",
    color: "#FFB6C9" // Pink attack
  },
  {
    title: "🐥 CHAOS CARD",
    text: "Everyone at the table has to answer the next card drawn. Absolute no skipping allowed! 🎲",
    color: "#FFE08A" // Yellow panic
  },
  {
    title: "🐥 PLOT TWIST",
    text: "The oldest person at the table gets to invent and ask their own unhinged question next. 👑",
    color: "#FFF7D8" // Soft cream
  }
];

const FloatingDoodle = ({ char, className }) => (
  <div className={`absolute text-3xl opacity-25 select-none pointer-events-none font-bold ${className}`}>
    {char}
  </div>
);

const Icebreakers = ({ onNavigate }) => {
  const [currentCard, setCurrentCard] = useState(null);
  const [isChaos, setIsChaos] = useState(false);
  const [rotation, setRotation] = useState(0);

  const drawCard = () => {
    // 1 in 8 chance to trigger a Chaos Event card
    const triggerChaos = Math.floor(Math.random() * 8) === 0;
    const randomTilt = (Math.random() * 8 - 4).toFixed(1);
    setRotation(randomTilt);

    if (triggerChaos) {
      const randomChaos = CHAOS_CARDS[Math.floor(Math.random() * CHAOS_CARDS.length)];
      setCurrentCard(randomChaos);
      setIsChaos(true);
    } else {
      let pool = SPICY_PROMPTS;
      if (currentCard && !isChaos) {
        pool = SPICY_PROMPTS.filter(p => p !== currentCard.text);
      }
      const randomText = pool[Math.floor(Math.random() * pool.length)];
      setCurrentCard({
        title: "✨ Secret Card ✨",
        text: randomText,
        color: "#FFF7D8"
      });
      setIsChaos(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-[#472C20] relative overflow-hidden px-6 pt-12 pb-24 select-none">
      <ArcadeBackground variant="icebreakers" />

      {/* Decorative Sanrio/Cozy Floating Cafe Doodles */}
      <FloatingDoodle char="✨" className="top-12 left-10 rotate-12 animate-pulse" />
      <FloatingDoodle char="⭐" className="top-24 right-16 -rotate-12" />
      <FloatingDoodle char="💛" className="bottom-32 left-14 rotate-45" />
      <FloatingDoodle char="🍞" className="bottom-16 right-12 -rotate-6 animate-bounce" style={{ animationDuration: '4s' }} />
      <FloatingDoodle char="☕" className="top-2/3 left-8 -rotate-12" />
      <FloatingDoodle char="🍰" className="top-1/3 right-10 rotate-12" />
      <FloatingDoodle char="🔪" className="bottom-48 right-1/4 rotate-90 opacity-10" />
      <FloatingDoodle char="🐥" className="top-8 left-1/3 opacity-20" />

      {/* Top Header Navigation */}
      <div className="max-w-md mx-auto mb-6 relative z-10">
        <button 
          onClick={() => onNavigate('games')} 
          className="flex items-center gap-2 text-sm font-black text-[#472C20] hover:opacity-80 transition-opacity uppercase tracking-wider bg-[#FFF7D8] border-2 border-[#472C20] rounded-full px-4 py-1.5 shadow-[3px_3px_0_#472C20]"
        >
          <ArrowLeft size={14} className="stroke-[3]" /> run away
        </button>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!currentCard ? (
            /* ================= LOBBY SCREEN ================= */
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#FFF7D8] border-[5px] border-[#472C20] rounded-[35px] shadow-[10px_10px_0_#472C20] p-8 text-center flex flex-col items-center mt-6"
            >
              {/* Cute Crime Mascot Image from project assets */}
              <div className="relative mb-4">
                <img 
                  src="/duck.png" 
                  alt="Mascot Duck" 
                  className="w-40 h-40 object-contain animate-bounce select-none pointer-events-none"
                  style={{ animationDuration: '2s' }}
                  onError={(e) => {
                    // Fallback visual indicator just in case asset path shifts
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = "<div class='text-7xl p-4 bg-[#FFE08A] border-4 border-[#472C20] rounded-full shadow-[4px_4px_0_#472C20]'>🐥🔪</div>";
                  }}
                />
              </div>

              {/* Unhinged Title Header */}
              <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-black tracking-tight text-[#472C20]">
                  Today's Victim...
                </h1>
                <p className="text-sm font-bold text-[#6D4C41] max-w-xs leading-relaxed">
                  Answer honestly. The duck knows when you're caping. Pull a card & expose your friends. ✨
                </p>
              </div>

              {/* Chunky Action Button */}
              <button
                onClick={drawCard}
                className="w-full bg-[#FFB347] border-[4px] border-[#472C20] rounded-[22px] font-black text-lg py-4 text-[#472C20] shadow-[5px_5px_0_#472C20] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_#472C20] active:translate-y-[2px] active:shadow-[2px_2px_0_#472C20] transition-all flex items-center justify-center gap-2 group"
              >
                🍳 Cook Up Drama 
                <span className="group-hover:rotate-12 transition-transform">✨</span>
              </button>
            </motion.div>
          ) : (
            /* ================= PLAYING / DECK SCREEN ================= */
            <motion.div
              key="gameplay"
              initial={{ opacity: 0, y: 40, scale: 0.85, rotate: parseFloat(rotation) - 4 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: parseFloat(rotation) }}
              exit={{ opacity: 0, y: -40, scale: 0.85, rotate: parseFloat(rotation) + 4 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="w-full"
            >
              {/* Duck Speech Bubble Tip Indicator */}
              <div className="flex flex-col items-center mb-5 relative">
                <div className="bg-white border-[4px] border-[#472C20] rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#472C20] relative max-w-[200px] text-center">
                  {isChaos ? "🚨 CHOOSE CHAOS!" : "👁️ Don't lie."}
                  {/* Speech Bubble Arrow tails */}
                  <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-[4px] border-r-[4px] border-[#472C20] rotate-45"></div>
                </div>
              </div>

              {/* Main Custom Rounded Question Card Deck */}
              <div 
                className="border-[5px] border-[#472C20] rounded-[35px] p-6 shadow-[10px_10px_0_#472C20] min-h-[280px] flex flex-col justify-between items-center relative overflow-hidden text-center"
                style={{ backgroundColor: currentCard.color }}
              >
                {/* Visual Texture Sparkle Overlays */}
                <span className="absolute top-4 left-4 text-xl opacity-20">⭐</span>
                <span className="absolute bottom-4 right-4 text-xl opacity-20">✨</span>

                {/* Card Title Label */}
                <div className="flex items-center gap-1.5 bg-white border-[3px] border-[#472C20] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_#472C20] mt-1">
                  {isChaos ? (
                    <AlertTriangle size={12} className="text-[#FF9F29] stroke-[3]" />
                  ) : (
                    <MessageSquare size={12} className="text-[#FFB347] stroke-[3]" />
                  )}
                  {currentCard.title}
                </div>

                {/* Question Body Text Box */}
                <div className="my-auto py-6 px-2">
                  <p className="text-xl font-black text-[#472C20] leading-snug tracking-tight">
                    {currentCard.text}
                  </p>
                </div>

                {/* Footer Signature Sticker */}
                <div className="w-full flex justify-center items-center gap-1 opacity-90 border-t-2 border-dashed border-[#472C20]/20 pt-3">
                  <span className="text-lg">🐥</span>
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                    {isChaos ? "Mild Chaos System" : "Spicy Cafe Truth Deck"}
                  </span>
                </div>
              </div>

              {/* Bottom Gameplay Controller Drawer Area */}
              <div className="mt-10 flex flex-col items-center gap-4">
                <button
                  onClick={drawCard}
                  className="w-full bg-[#FFE08A] border-[4px] border-[#472C20] rounded-2xl font-black text-sm py-3.5 text-[#472C20] shadow-[5px_5px_0_#472C20] hover:rotate-1 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Zap size={14} className="fill-current stroke-[3]" /> Next Question 🎲
                </button>
                
                <p className="text-[11px] font-black opacity-60 uppercase tracking-widest text-center bg-[#FFF7D8] border border-[#472C20]/40 rounded-md px-3 py-1">
                  Pass the screen to your right 🔄
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Icebreakers;