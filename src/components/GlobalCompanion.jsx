import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAvatar } from '../context/AvatarContext';
import { AvatarRenderer } from './AvatarRenderer'; // Directly hooks into your custom vector engine

// --- WITTY CAFE DIALOGUE DATABASE ---
const MESSAGES = {
  welcome: [
    "Welcome to Dumble' Door! 🚪✨",
    "Fresh pastries, fresh vibes. Let's go! 🥐",
    "Plot twist: you're gonna leave with dessert. 🍰",
    "The coffee has been waiting for you... ☕👀",
    "You're looking extra hungry today. 😌"
  ],
  idle: [
    "Bestie... the menu isn't gonna judge you. 😂",
    "I'm starting to think you're here for the aesthetics. ✨",
    "Take your time... I'll pretend I'm not judging. 👀",
    "The croissants are literally staring back at you. 🥐",
    "Choose before I start ordering for you. 😤",
    "Loading... food decisions... ⏳"
  ],
  menu: [
    "Danger zone: everything tastes good. 😮‍💨",
    "The hardest choice since 'what should we watch?' 🍽️",
    "Warning: scrolling may cause sudden hunger. 🤤",
    "Trust me... you can't go wrong here. 😉",
    "One menu, zero bad choices. 💯"
  ],
  coffee: [
    "Coffee first. Adulting later. ☕",
    "Espresso yourself. 🤎",
    "One sip away from becoming productive. ⚡",
    "Coffee: because sleep is just a suggestion. 😌",
    "Certified bean enthusiast detected. 🫘"
  ],
  dessert: [
    "Calories don't count when it's this cute. 🍓",
    "Dessert isn't extra... it's self-care. 💅",
    "Life's uncertain. Cake isn't. 🍰",
    "That cheesecake is lowkey calling your name. 👀",
    "Sweet tooth unlocked. 🍩"
  ],
  spicy: [
    "You're either fearless... or overconfident. 🌶️",
    "Character development incoming. 🔥",
    "Future you is already reaching for water. 💀",
    "Respectfully... good luck. 😭",
    "Spice level: emotional damage. 🌋"
  ],
  addCart: [
    "Ayyy, solid choice! 🛒",
    "Chef approves. 👨‍🍳✨",
    "Adding that to your food collection. 😌",
    "Your future self says 'thank you.' 🤝",
    "One step closer to happiness. 🍽️",
    "Cart looking kinda stacked... 👀"
  ],
  games: [
    "Loser buys the coffee. 😤",
    "Time to prove those gamer skills. 🎮",
    "High score or it didn't happen. 🏆",
    "Tiny game break before the feast? 🍕",
    "Locked in? Let's see it. 🔥"
  ]
};

export default function GlobalCompanion() {
  const location = useLocation();
  const { lastAction } = useCart();
  const { avatar } = useAvatar(); // Grab your user's customizable configurations
  
  const [bubbleText, setBubbleText] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [currentPose, setCurrentPose] = useState("normal"); // normal, blink, lookAround, wave, sipCoffee
  const [rotation, setRotation] = useState(0);

  const bubbleTimeoutRef = useRef(null);
  const idleDialogueTimeoutRef = useRef(null);
  const poseTimeoutRef = useRef(null);
  const lastMouseX = useRef(window.innerWidth / 2);

  // --- SPRING DRIVEN ELASTIC CURSOR SEPARATION ---
  const mouseX = useMotionValue(window.innerWidth - 150);
  const mouseY = useMotionValue(window.innerHeight - 150);

  // Tuned spring variables for responsive snapping with zero sluggishness
  const springConfig = { stiffness: 140, damping: 20, mass: 0.4 };
  const companionX = useSpring(mouseX, springConfig);
  const companionY = useSpring(mouseY, springConfig);

  const speak = (category) => {
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    const pool = MESSAGES[category] || MESSAGES.idle;
    const randomMsg = pool[Math.floor(Math.random() * pool.length)];
    setBubbleText(randomMsg);
    setShowBubble(true);
    bubbleTimeoutRef.current = setTimeout(() => setShowBubble(false), 3500);
  };

  const resetIdleTimer = () => {
    if (idleDialogueTimeoutRef.current) clearTimeout(idleDialogueTimeoutRef.current);
    idleDialogueTimeoutRef.current = setTimeout(() => speak("idle"), 15000);
  };

  // --- IDLE STATE MICRO-ANIMATION LOOP ---
  // Triggers organic action sequences if the user stops moving the mouse cursor
  useEffect(() => {
    const cyclePoses = () => {
      const stateOptions = ["blink", "lookAround", "wave", "sipCoffee", "normal"];
      const selectedPose = stateOptions[Math.floor(Math.random() * stateOptions.length)];
      setCurrentPose(selectedPose);

      // Return back to standard continuous bobbing base after a short burst action completes
      poseTimeoutRef.current = setTimeout(() => {
        setCurrentPose("normal");
      }, 1500);
    };

    const interval = setInterval(cyclePoses, 7000);
    return () => {
      clearInterval(interval);
      if (poseTimeoutRef.current) clearTimeout(poseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Natural 50px - 80px offset balance (set here cleanly at 65px horizontally/vertically)
      const targetX = e.clientX + 65;
      const targetY = e.clientY + 65;

      // Calculate change in direction vector to generate a lively tilt angle rotation
      const deltaX = e.clientX - lastMouseX.current;
      setRotation(Math.max(-10, Math.min(10, deltaX * 0.5))); // Clamp tilt within 10 degrees

      mouseX.set(targetX);
      mouseY.set(targetY);

      lastMouseX.current = e.clientX;
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      if (idleDialogueTimeoutRef.current) clearTimeout(idleDialogueTimeoutRef.current);
    };
  }, []);

  // Track context actions
  useEffect(() => {
    if (location.pathname === '/menu') speak("menu");
    else if (location.pathname.startsWith('/games')) speak("games");
    else if (location.pathname === '/') speak("welcome");
  }, [location.pathname]);

  useEffect(() => {
    if (lastAction?.type === 'ADD_ITEM') speak("addCart");
  }, [lastAction]);

  useEffect(() => {
    const handleGlobalHover = (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;

      const textContent = target.innerText?.toLowerCase() || "";
      const isCard = target.closest('.bg-\\[\\#FAF6EE\\]') || target.closest('div');

      if (isCard) {
        if (textContent.includes('coffee') || textContent.includes('brew') || textContent.includes('tea')) speak("coffee");
        else if (textContent.includes('pastry') || textContent.includes('cake') || textContent.includes('dessert') || textContent.includes('sweet')) speak("dessert");
        else if (textContent.includes('spicy') || textContent.includes('chilli') || textContent.includes('peri')) speak("spicy");
      }
    };

    window.addEventListener('mouseover', handleGlobalHover);
    return () => window.removeEventListener('mouseover', handleGlobalHover);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <motion.div
        style={{ x: companionX, y: companionY, rotate: rotation }}
        className="absolute flex flex-col items-center origin-center transition-transform duration-200 ease-out"
      >
        {/* Playful Context Speech Bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: -4 }}
              exit={{ opacity: 0, scale: 0.8, y: 6 }}
              className="bg-[#472C20] text-[#FFFDF9] border-2 border-[#472C20] px-3 py-1.5 rounded-2xl text-xs font-serif font-medium shadow-md text-center max-w-[175px] mb-1.5 relative z-50"
              style={{ borderRadius: '16px 16px 16px 4px' }}
            >
              {bubbleText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- DYNAMIC RENDER PIPELINE FOR THE DESIGNER AVATAR --- */}
        <motion.div
          animate={
            currentPose === "blink" ? { scaleY: [1, 0.2, 1] } :
            currentPose === "lookAround" ? { x: [-4, 4, 0] } :
            currentPose === "wave" ? { rotate: [0, -10, 10, 0] } :
            currentPose === "sipCoffee" ? { y: [0, -4, 0], scale: [1, 1.03, 1] } :
            { y: [0, -6, 0] } // Standard organic hover rhythm bob
          }
          transition={
            currentPose === "normal"
              ? { repeat: Infinity, duration: 2.4, ease: "easeInOut" }
              : { duration: 1.2, ease: "easeInOut" }
          }
          className="w-[75px] h-[75px] relative flex items-center justify-center filter drop-shadow-md select-none"
        >
          {/* Renders your live customizable composite configurations vector asset */}
          <AvatarRenderer config={avatar} size={70} animate={true} />

          {/* Dynamic Extra Action Badge Attachments */}
          {currentPose === "sipCoffee" && (
            <span className="absolute -bottom-1 -right-1 text-lg bg-white p-0.5 rounded-full border border-[#472C20] animate-bounce z-50">☕</span>
          )}
          {currentPose === "wave" && (
            <span className="absolute -bottom-1 -left-1 text-lg animate-pulse z-50 transform origin-bottom rotate-6">👋</span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}