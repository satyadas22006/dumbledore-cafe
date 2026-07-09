import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, AlertTriangle, MessageSquare, Zap } from 'lucide-react';

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

const FloatingDoodle = ({ char, className, style }) => (
  <div className={`absolute text-3xl opacity-25 select-none pointer-events-none font-bold ${className}`} style={style}>
    {char}
  </div>
);

/* ---------------------------------------------------------------------
   Original decorative doodles — a paperclip, a flower, sparkle stars,
   and a little frog + kitten duo. Hand-drawn in a generic kawaii style
   for this page only; not based on any existing character or brand.
--------------------------------------------------------------------- */
const Paperclip = ({ className = '', color = '#F2A6C4' }) => (
  <svg viewBox="0 0 24 48" className={className}>
    <path
      d="M12 4 C6 4 3 8 3 14 L3 34 C3 40 7 44 13 44 C19 44 22 40 22 35 L22 14 C22 11 20 9 17 9 C14 9 12 11 12 14 L12 32"
      fill="none"
      stroke={color}
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

const Flower = ({ className = '' }) => (
  <svg viewBox="0 0 60 60" className={className}>
    <g fill="#B79AD6">
      <circle cx="30" cy="14" r="11" />
      <circle cx="30" cy="46" r="11" />
      <circle cx="14" cy="30" r="11" />
      <circle cx="46" cy="30" r="11" />
      <circle cx="19" cy="19" r="10" />
      <circle cx="41" cy="19" r="10" />
      <circle cx="19" cy="41" r="10" />
      <circle cx="41" cy="41" r="10" />
    </g>
    <circle cx="30" cy="30" r="9" fill="#F4E3A1" />
  </svg>
);

const SparkleStar = ({ className = '', fill = '#F6C445' }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={fill} />
  </svg>
);

const Frog = ({ className = '' }) => (
  <svg viewBox="0 0 60 60" className={className}>
    <ellipse cx="30" cy="34" rx="20" ry="18" fill="#7FC96B" />
    <circle cx="16" cy="14" r="9" fill="#7FC96B" />
    <circle cx="44" cy="14" r="9" fill="#7FC96B" />
    <circle cx="16" cy="14" r="5" fill="#fff" />
    <circle cx="44" cy="14" r="5" fill="#fff" />
    <circle cx="17" cy="15" r="2.4" fill="#3C2F2F" />
    <circle cx="45" cy="15" r="2.4" fill="#3C2F2F" />
    <path d="M20 36 Q30 44 40 36" stroke="#3C2F2F" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="18" cy="34" r="3.5" fill="#B7E3A8" opacity="0.7" />
    <circle cx="42" cy="34" r="3.5" fill="#B7E3A8" opacity="0.7" />
  </svg>
);

const Kitten = ({ className = '' }) => (
  <svg viewBox="0 0 60 60" className={className}>
    <path d="M14 10 L22 24 L10 24 Z" fill="#3B2E2A" />
    <path d="M46 10 L38 24 L50 24 Z" fill="#3B2E2A" />
    <circle cx="30" cy="34" r="22" fill="#3B2E2A" />
    <circle cx="22" cy="32" r="2.6" fill="#fff" />
    <circle cx="38" cy="32" r="2.6" fill="#fff" />
    <circle cx="30" cy="39" r="2" fill="#F2A6C4" />
    <path d="M25 43 Q30 47 35 43" stroke="#F2A6C4" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="19" cy="38" r="3" fill="#5C4B45" opacity="0.6" />
    <circle cx="41" cy="38" r="3" fill="#5C4B45" opacity="0.6" />
  </svg>
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
    <div className="min-h-screen font-sans text-[#472C20] relative overflow-hidden select-none bg-[#FFFBEA] flex flex-col">

      {/* ============ TOP: rainbow plaid banner ============ */}
      <div
        className="w-full h-14 md:h-16 relative shrink-0"
        style={{
          backgroundColor: '#F6DDE6',
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 3px, transparent 3px, transparent 22px),
            repeating-linear-gradient(-45deg, rgba(120,190,220,0.55) 0px, rgba(120,190,220,0.55) 3px, transparent 3px, transparent 26px),
            repeating-linear-gradient(45deg, rgba(246,196,90,0.5) 0px, rgba(246,196,90,0.5) 2px, transparent 2px, transparent 34px),
            repeating-linear-gradient(-45deg, rgba(230,120,150,0.5) 0px, rgba(230,120,150,0.5) 2px, transparent 2px, transparent 40px)
          `,
        }}
      >
        <div
          className="absolute -bottom-2 left-0 w-full h-4"
          style={{
            backgroundImage: 'radial-gradient(circle at 10px 0, transparent 9px, #FBE07A 9.5px)',
            backgroundSize: '20px 16px',
            backgroundColor: '#FBE07A',
            WebkitMaskImage: 'radial-gradient(circle at 10px 0px, transparent 9px, black 9.5px)',
            maskImage: 'radial-gradient(circle at 10px 0px, transparent 9px, black 9.5px)',
          }}
        />
      </div>

      {/* Flower + paperclip cluster, top-right */}
      <div className="hidden md:block absolute top-3 right-6 z-20">
        <Flower className="w-16 h-16" />
        <Paperclip className="w-6 h-12 absolute -left-4 top-8 rotate-[20deg]" color="#F2A6C4" />
        <Paperclip className="w-5 h-10 absolute -left-8 top-14 -rotate-[15deg]" color="#8FCB6E" />
      </div>

      {/* ============ MAIN CREAM BODY ============ */}
      <div className="flex-1 relative px-6 pt-10 pb-6">

        {/* Decorative Sanrio/Cozy Floating Cafe Doodles */}
        <FloatingDoodle char="✨" className="top-2 left-10 rotate-12 animate-pulse" />
        <FloatingDoodle char="💛" className="bottom-16 left-14 rotate-45" />
        <FloatingDoodle char="🍞" className="top-1/3 right-12 -rotate-6 animate-bounce" style={{ animationDuration: '4s' }} />
        <FloatingDoodle char="☕" className="top-2/3 left-8 -rotate-12" />

        {/* Top Header Navigation */}
        <div className="max-w-md mx-auto mb-6 relative z-10">
          <button 
            onClick={() => onNavigate('games')} 
            className="flex items-center gap-2 text-sm font-black text-[#472C20] hover:opacity-80 transition-opacity uppercase tracking-wider bg-white border-2 border-[#F0C97A] rounded-full px-4 py-1.5 shadow-[3px_3px_0_#F0C97A]"
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
                className="bg-white border-2 border-[#F0C97A] rounded-[35px] shadow-[8px_8px_0_#F6DDE6] p-8 text-center flex flex-col items-center mt-6 shadow-[8px_8px_0_#F6DDE6] min-h-[380px] justify-center"
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
                      e.target.parentNode.innerHTML = "<div class='text-7xl p-4 bg-[#FFE08A] border-2 border-[#F0C97A] rounded-full shadow-[4px_4px_0_#F0C97A]'>🐥🔪</div>";
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
                  className="w-full bg-[#FFB347] border-2 border-[#472C20] rounded-[22px] font-black text-lg py-4 text-[#472C20] shadow-[5px_5px_0_#472C20] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_#472C20] active:translate-y-[2px] active:shadow-[2px_2px_0_#472C20] transition-all flex items-center justify-center gap-2 group"
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
                  <div className="bg-white border-2 border-[#F0C97A] rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#F0C97A] relative max-w-[200px] text-center">
                    {isChaos ? "🚨 CHOOSE CHAOS!" : "👁️ Don't lie."}
                    {/* Speech Bubble Arrow tails */}
                    <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-[#F0C97A] rotate-45"></div>
                  </div>
                </div>

                {/* Main Custom Rounded Question Card Deck */}
                <div 
                  className="border-2 border-[#472C20] rounded-[35px] p-8 shadow-[8px_8px_0_#472C20] min-h-[380px] flex flex-col justify-between items-center relative overflow-hidden text-center"
                  style={{ backgroundColor: currentCard.color }}
                >
                  {/* Visual Texture Sparkle Overlays */}
                  <span className="absolute top-4 left-4 text-xl opacity-20">⭐</span>
                  <span className="absolute bottom-4 right-4 text-xl opacity-20">✨</span>

                  {/* Card Title Label */}
                  <div className="flex items-center gap-1.5 bg-white border-2 border-[#472C20] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_#472C20] mt-1">
                    {isChaos ? (
                      <AlertTriangle size={12} className="text-[#FF9F29] stroke-[3]" />
                    ) : (
                      <MessageSquare size={12} className="text-[#FFB347] stroke-[3]" />
                    )}
                    {currentCard.title}
                  </div>

                  {/* Question Body Text Box */}
                  <div className="my-auto py-10 px-2">
                    <p className="text-xl font-black text-[#472C20] leading-snug tracking-tight">
                      {currentCard.text}
                    </p>
                  </div>

                  {/* Footer Signature Sticker */}
                  <div className="w-full flex justify-center items-center gap-1 opacity-90 border-t-2 border-dashed border-[#472C20]/20 pt-4">
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
                    className="w-full bg-[#FFE08A] border-2 border-[#472C20] rounded-2xl font-black text-sm py-3.5 text-[#472C20] shadow-[5px_5px_0_#472C20] hover:rotate-1 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <Zap size={14} className="fill-current stroke-[3]" /> Next Question 🎲
                  </button>
                  
                  <p className="text-[11px] font-black opacity-60 uppercase tracking-widest text-center bg-white border border-[#F0C97A] rounded-md px-3 py-1">
                    Pass the screen to your right 🔄
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============ BOTTOM: sparkle wave + gingham footer ============ */}
      <div className="relative shrink-0">
        {/* sparkly teal wave strip */}
        <div
          className="w-full h-4"
          style={{
            backgroundColor: '#8FD9D6',
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1.5px)',
            backgroundSize: '10px 10px',
          }}
        />
        {/* orange gingham footer */}
        <div
          className="w-full h-16 md:h-20 relative overflow-visible"
          style={{
            backgroundColor: '#F5A947',
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.35) 50%, transparent 50%),
              linear-gradient(rgba(255,255,255,0.35) 50%, transparent 50%)
            `,
            backgroundSize: '26px 26px',
          }}
        >
          {/* frog + kitten duo, bottom-left */}
          <div className="hidden md:flex absolute -top-10 left-6 items-end z-20">
            <div
              className="w-24 h-24 rounded-full flex items-end justify-center overflow-visible relative"
              style={{ backgroundColor: '#F6B8CF' }}
            >
              <SparkleStar className="w-4 h-4 absolute -top-2 -left-1" />
              <SparkleStar className="w-5 h-5 absolute -top-5 left-6" fill="#F0A93A" />
              <Frog className="w-14 h-14 relative -mr-2 mb-1" />
              <Kitten className="w-16 h-16 relative mb-0" />
            </div>
            <Paperclip className="w-5 h-9 -ml-3 mb-1 rotate-[25deg]" color="#F6C445" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Icebreakers;