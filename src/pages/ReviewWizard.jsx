import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar } from '../context/AvatarContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { Sparkles, Heart, Coffee, Check, ArrowRight, Search, Camera, RefreshCw } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';

/* ---------------------------------------------------------------------
   Mobile-only floating ambience — bottom-to-top infinite drift, same
   technique as MemoryWall.jsx's FloatingPaper. The desktop parallax desk
   scene (mug/cat/planner/etc) is sized and positioned for wide viewports
   and gets hidden below `lg`; this is what fills that space on phones so
   the page doesn't feel bare and loses the "living journal" feel.
--------------------------------------------------------------------- */
const FloatingUpDoodle = ({ char, left, duration, delay }) => (
  <motion.div
    initial={{ y: '115%', opacity: 0 }}
    animate={{ y: '-15%', opacity: [0, 0.55, 0.55, 0] }}
    transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
    className="absolute text-3xl select-none"
    style={{ left }}
  >
    {char}
  </motion.div>
);

export default function ReviewWizard({ onComplete, onNavigate, theme, twin, setTwin }) {
  const { avatar } = useAvatar();
  const [step, setStep] = useState(1);
  const totalSteps = 9; 
  const [menuData, setMenuData] = useState(null);

  // Camera States
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const lastSubmissionRef = useRef(0);

  // --- Decorative parallax tracking for cozy desktop ambiance ---
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      const docSnap = await getDoc(doc(db, "settings", "fullMenu"));
      if (docSnap.exists()) {
        setMenuData(docSnap.data().data);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // --- WIZARD FORM STATE ---
  const [rating, setRating] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [favoriteDish, setFavoriteDish] = useState('');
  const [selectedHighlights, setSelectedHighlights] = useState([]);
  const [vibe, setVibe] = useState('');
  const [review, setReview] = useState(''); 
  const [anonymousName, setAnonymousName] = useState('');
  
  const [isSearchingTwin, setIsSearchingTwin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = () => {
    if (step < 7) {
      setStep(prev => prev + 1);
    } else if (step === 7) {
      setStep(8);
      setIsSearchingTwin(true);
    } else if (step === 8) {
      setStep(9);
    }
  };

  useEffect(() => {
    if (step === 8 && isSearchingTwin) {
      const timer = setTimeout(() => {
        setIsSearchingTwin(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step, isSearchingTwin]);

  const startCamera = async () => {
    setCameraError('');
    setCapturedImage(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setCameraError('Could not launch lens. Tap below to retry or check browser permissions!');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageDataUrl);

      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  const toggleItemSelection = (itemName) => {
    if (selectedItems.includes(itemName)) {
      setSelectedItems(prev => prev.filter(i => i !== itemName));
      if (favoriteDish === itemName) setFavoriteDish('');
    } else {
      setSelectedItems(prev => [...prev, itemName]);
    }
  };

  const toggleHighlight = (highlight) => {
    setSelectedHighlights(prev => 
      prev.includes(highlight) ? prev.filter(h => h !== highlight) : [...prev, highlight]
    );
  };

  const handleInstagramShare = () => {
    alert("📸 Snapshot stashed to your clipboard! Opening Instagram Stories layout framework...");
  };
  
  const saveToDatabase = async () => {
    const now = Date.now();
    if (now - lastSubmissionRef.current < 10000) {
      return null;
    }
    lastSubmissionRef.current = now;

    const memoryDoc = {
      rating: rating || 3,
      purpose: purpose || 'escape',
      items: selectedItems.length > 0 ? selectedItems : ['Cozy Brew'],
      dish: favoriteDish || 'Cozy Brew',
      highlights: selectedHighlights,
      vibe: vibe || '☕ Coffee & Conversations',
      review: review || '',
      name: anonymousName && anonymousName.trim() !== "" ? anonymousName.trim() : 'Anonymous',
      createdAt: Date.now()
      // NOTE: the captured snapshot is intentionally NOT included here.
      // It never gets written to Firestore — for privacy it only ever
      // lives in local React state for this one session (see
      // executeFinalization below), so it can never surface on the
      // Memory Wall or in the admin portal.
    };

    try {
      await addDoc(collection(db, "memories"), memoryDoc);
      return memoryDoc;
    } catch (err) {
      console.error("Database save failed:", err);
      return null;
    }
  };

  const executeFinalization = async () => {
    setIsSubmitting(true);
    const savedResult = await saveToDatabase();

    const baseMemory = savedResult || {
      rating: rating || 3,
      purpose: purpose || 'escape',
      items: selectedItems.length > 0 ? selectedItems : ['Cozy Brew'],
      dish: favoriteDish || 'Cozy Brew',
      highlights: selectedHighlights,
      vibe: vibe || '☕ Coffee & Conversations',
      review: review || '',
      name: anonymousName && anonymousName.trim() !== "" ? anonymousName.trim() : 'Anonymous',
      createdAt: Date.now()
    };

    // The photo is attached ONLY here — to the local, in-memory object used
    // for this one-time receipt/chronicle view. It's never persisted, so a
    // page refresh (or landing on /chronicle any other way) means it's
    // simply gone, by design.
    const finalMemory = { ...baseMemory, photoURL: capturedImage || null };

    onComplete(finalMemory);
    onNavigate('chronicle');
    setIsSubmitting(false); 
  };

  const pageVariants = {
    initial: { opacity: 0, x: -15 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: 15, transition: { duration: 0.2 } }
  };

  return (
    <div
      className="min-h-screen py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{
        background: 'radial-gradient(circle at center, #2F241A 0%, #17100B 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Google Fonts Injection for vintage typography */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .font-hand { font-family: 'Caveat', cursive; }
        .font-serif-vintage { font-family: 'Instrument Serif', serif; font-style: italic; }
        
        .journal-shadow {
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.75),
            0 0 40px rgba(0, 0, 0, 0.6),
            inset 0 1px 1px rgba(255, 255, 255, 0.08);
        }

        .journal-ruled {
          background-image: repeating-linear-gradient(0deg, transparent 0px, transparent 27px, rgba(83, 69, 56, 0.15) 28px);
          background-position: 0 6px;
        }

        @keyframes microDrift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes subtleSteam {
          0% { transform: translateY(2px) scaleX(0.9); opacity: 0.3; }
          50% { transform: translateY(-5px) scaleX(1.1); opacity: 0.7; }
          100% { transform: translateY(-12px) scaleX(0.9); opacity: 0; }
        }
        @keyframes tailWag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }

        .live-item { animation: microDrift 7s ease-in-out infinite; }
        .live-steam path { animation: subtleSteam 3.5s ease-in-out infinite; }
        .cat-tail { animation: tailWag 4s ease-in-out infinite; transform-origin: 22px 26px; }
      `}</style>

      {/* ============ LIVE WALLPAPER BACKGROUND DESK LAYER (desktop/tablet only) ============ */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ transform: `translate(${parallax.x * 8}px, ${parallax.y * 6}px)`, transition: 'transform 0.5s ease-out' }}
      >
        {/* Cozy Mug Top & Saucer */}
        <div className="absolute top-[8%] left-[6%] w-24 h-24 live-item opacity-80" style={{ animationDelay: '0s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="55" rx="44" ry="28" fill="#FAF2DC" stroke="#5C432E" strokeWidth="2.5" />
            <ellipse cx="50" cy="55" rx="36" ry="20" fill="#EFE4C8" stroke="#70533A" strokeWidth="1" strokeDasharray="3 3" />
            <ellipse cx="46" cy="48" rx="28" ry="18" fill="#E2A752" stroke="#5C432E" strokeWidth="2.5" />
            <ellipse cx="46" cy="48" rx="22" ry="13" fill="#42250F" />
            <ellipse cx="42" cy="44" rx="14" ry="6" fill="#693B1C" opacity="0.4" />
            <g className="live-steam">
              <path d="M42 25 Q39 16 44 12" stroke="#FAF2DC" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M52 23 Q55 15 50 10" stroke="#FAF2DC" strokeWidth="1.5" fill="none" strokeLinecap="round" style={{ animationDelay: '1.2s' }} />
            </g>
          </svg>
        </div>

        {/* Orange Tabby Cat Sleeping */}
        <div className="absolute bottom-[6%] left-[4%] w-40 h-28 live-item opacity-85" style={{ animationDelay: '1.5s' }}>
          <svg viewBox="0 0 160 110" className="w-full h-full">
            <ellipse cx="75" cy="65" rx="55" ry="38" fill="#DE8B43" stroke="#4E3621" strokeWidth="2" />
            <path d="M40 45 Q55 35 80 45" fill="none" stroke="#A85214" strokeWidth="4" strokeLinecap="round" />
            <path d="M35 65 Q55 60 75 75" fill="none" stroke="#A85214" strokeWidth="4" strokeLinecap="round" />
            <circle cx="115" cy="48" r="26" fill="#DE8B43" stroke="#4E3621" strokeWidth="2" />
            <circle cx="115" cy="48" r="26" fill="#ECA25C" opacity="0.3" />
            <polygon points="98,32 104,8 116,24" fill="#DE8B43" stroke="#4E3621" strokeWidth="2" />
            <polygon points="132,32 138,8 124,24" fill="#DE8B43" stroke="#4E3621" strokeWidth="2" />
            <circle cx="100" cy="52" r="4" fill="#EAA3A9" />
            <circle cx="128" cy="52" r="4" fill="#EAA3A9" />
            <path d="M104 46 Q109 50 112 46" fill="none" stroke="#4E3621" strokeWidth="2" strokeLinecap="round" />
            <path d="M118 46 Q121 50 126 46" fill="none" stroke="#4E3621" strokeWidth="2" strokeLinecap="round" />
            <path d="M112 52 L115 55 L118 52" fill="none" stroke="#4E3621" strokeWidth="1.5" />
            <path className="cat-tail" d="M25 75 Q15 65 22 45 Q30 35 25 25" fill="none" stroke="#DE8B43" strokeWidth="11" strokeLinecap="round" />
            <path className="cat-tail" d="M25 75 Q15 65 22 45 Q30 35 25 25" fill="none" stroke="#4E3621" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Washi Tapes */}
        <div className="absolute top-[5%] right-[14%] w-24 h-20 live-item opacity-75" style={{ animationDelay: '3.2s' }}>
          <svg viewBox="0 0 80 60" className="w-full h-full">
            <path d="M10 20 L45 12 C48 12, 50 16, 45 22 L12 28 C8 28, 6 23, 10 20 Z" fill="#B0A0CD" stroke="#4E3621" strokeWidth="1.5" />
            <circle cx="28" cy="19" r="4" fill="#FAF2DC" />
            <path d="M25 38 L65 30 C69 30, 72 34, 68 39 L30 46 C26 46, 22 42, 25 38 Z" fill="#DE8F6E" stroke="#4E3621" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Planner Binder */}
        <div className="absolute top-[32%] right-[4%] w-32 h-40 live-item opacity-80" style={{ animationDelay: '0.8s' }}>
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <rect x="5" y="5" width="85" height="105" rx="6" fill="#E2A752" stroke="#4E3621" strokeWidth="2" />
            <rect x="12" y="12" width="72" height="92" rx="3" fill="#FAF2DC" />
            <line x1="20" y1="32" x2="75" y2="32" stroke="#70533A" strokeWidth="1" opacity="0.3" />
            <line x1="20" y1="46" x2="75" y2="46" stroke="#70533A" strokeWidth="1" opacity="0.3" />
            <path d="M40 90 Q40 75 50 75 Q60 75 60 90 Z" fill="#DE8F6E" opacity="0.4" />
            <text x="20" y="25" className="font-hand font-bold text-[14px]" fill="#534538">Planner</text>
            <rect x="40" y="0" width="16" height="10" rx="2" fill="none" stroke="#4E3621" strokeWidth="2" />
          </svg>
        </div>

        {/* Artist Paint Color Palette */}
        <div className="absolute bottom-[8%] right-[5%] w-28 h-24 live-item opacity-80" style={{ animationDelay: '2.4s' }}>
          <svg viewBox="0 0 90 70" className="w-full h-full">
            <path d="M12 45 C5 25, 25 5, 55 10 C75 12, 85 32, 75 52 C68 64, 45 68, 32 60 C26 55, 20 58, 12 45 Z" fill="#EFE4C8" stroke="#4E3621" strokeWidth="2" />
            <ellipse cx="62" cy="42" rx="5" ry="7" fill="#25180E" />
            <circle cx="24" cy="26" r="5" fill="#CD6A4E" />
            <circle cx="42" cy="20" r="5" fill="#E2A752" />
            <circle cx="60" cy="22" r="5" fill="#48533C" />
          </svg>
        </div>

        {/* Terracotta Alarm Clock */}
        <div className="absolute top-[40%] left-[3%] w-20 h-24 live-item opacity-75" style={{ animationDelay: '1.9s' }}>
          <svg viewBox="0 0 60 74" className="w-full h-full">
            <line x1="16" y1="62" x2="8" y2="72" stroke="#4E3621" strokeWidth="4" strokeLinecap="round" />
            <line x1="44" y1="62" x2="52" y2="72" stroke="#4E3621" strokeWidth="4" strokeLinecap="round" />
            <circle cx="30" cy="38" r="24" fill="#CD6A4E" stroke="#4E3621" strokeWidth="2" />
            <circle cx="30" cy="38" r="19" fill="#FAF2DC" />
            <circle cx="12" cy="12" r="7" fill="#CD6A4E" stroke="#4E3621" strokeWidth="2" />
            <circle cx="48" cy="12" r="7" fill="#CD6A4E" stroke="#4E3621" strokeWidth="2" />
            <line x1="30" y1="38" x2="30" y2="25" stroke="#4E3621" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="38" x2="40" y2="38" stroke="#4E3621" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* ============ MOBILE-ONLY: floating-upward ambience ============
          Desktop desk scene is sized for wide viewports and is hidden
          below `lg`. This fills that gap on phones with continuously
          drifting doodles (bottom → top, looping) so the page never
          feels empty and the "cozy desk" mood carries over. */}
      <div className="lg:hidden absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingUpDoodle char="☕" left="6%" duration={13} delay={0} />
        <FloatingUpDoodle char="🍪" left="20%" duration={17} delay={3.5} />
        <FloatingUpDoodle char="✨" left="36%" duration={11} delay={1.2} />
        <FloatingUpDoodle char="🐾" left="52%" duration={19} delay={6} />
        <FloatingUpDoodle char="🌿" left="68%" duration={15} delay={2.4} />
        <FloatingUpDoodle char="📖" left="82%" duration={21} delay={8} />
        <FloatingUpDoodle char="🎀" left="14%" duration={18} delay={10} />
        <FloatingUpDoodle char="🕰️" left="62%" duration={14} delay={4.6} />
        <FloatingUpDoodle char="☁️" left="90%" duration={20} delay={0.8} />
      </div>

      {/* ================= TWO-PAGE SCRAPBOOK JOURNAL HARDCOVER ================= */}
      <div className="w-full max-w-4xl bg-[#48533C] rounded-[24px] p-6 md:p-8 relative journal-shadow border border-[#536046] flex flex-col lg:flex-row gap-8 items-stretch z-10">

        {/* Mobile-only top spine/ribbon — the side ribbon below is desktop-only
            (hidden lg:block), so this keeps the "journal" read clear on phones */}
        <div className="lg:hidden w-full flex items-center justify-center gap-2 -mt-1 mb-1">
          <div className="flex-1 h-2.5 bg-[#B05B43] opacity-90 rounded-full shadow-inner" />
          <div className="w-6 h-6 bg-[#E2A752] rounded-full border border-[#9C6C2E] flex items-center justify-center shadow-md shrink-0">
            <Heart size={11} className="text-[#562215]" fill="currentColor" />
          </div>
          <div className="flex-1 h-2.5 bg-[#B05B43] opacity-90 rounded-full shadow-inner" />
        </div>
        
        {/* Ribbon Bookmark - Terracotta (desktop/tablet only, unchanged) */}
        <div className="absolute right-12 top-0 bottom-0 w-3 bg-[#B05B43] opacity-90 z-40 rounded-sm shadow-inner pointer-events-none hidden lg:block">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#E2A752] rounded-full border border-[#9C6C2E] flex items-center justify-center shadow-md">
            <Heart size={10} className="text-[#562215]" fill="currentColor" />
          </div>
        </div>

        {/* LEFT PAGE: THE INTEGRATED FUNCTIONAL REFLECTION JOURNAL */}
        <div className="flex-1 bg-[#FAF2DC] rounded-2xl p-6 md:p-8 flex flex-col justify-between relative shadow-xl lg:shadow-inner border-2 lg:border border-[#E0D3B4]">
          {/* Subtle lined journal paper look */}
          <div 
            className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-2xl" 
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, #534538 0px, #534538 1px, transparent 1px, transparent 28px)' }}
          />

          <div className="relative z-10 w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-[#E3D7B9] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-hand text-2xl text-[#534538] font-bold">Dear Diary, entry #17</span>
                {step <= totalSteps && (
                  <span className="text-[10px] uppercase font-mono bg-[#EFE4C8] px-1.5 py-0.5 rounded text-[#534538]/60 font-bold">
                    ({step}/{totalSteps})
                  </span>
                )}
              </div>
              <span className="text-xs font-mono opacity-60 bg-[#EFE4C8] px-2 py-0.5 rounded text-[#534538]">Pg. 0{step}</span>
            </div>

            {/* Avatar Framework Floating Widget */}
            {step <= totalSteps && (
              <div className="absolute -top-14 right-0 flex items-center gap-2 rounded-full p-1 z-20 bg-[#E2A752] border-2 border-[#534538]">
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-white/40">
                  <AvatarRenderer config={avatar} size={40} animate={true} />
                </div>
                <div className="font-hand rounded-xl px-2 py-0.5 text-xs font-bold text-[#534538] bg-[#FAF2DC] border border-[#534538]">
                  {step === 1 && "Be honest! 💛"}
                  {step === 3 && "Any snacks? 🥞"}
                  {step === 7 && "Write nicely! 🖋️"}
                  {step === 9 && "Say Cheese! 📸"}
                  {step !== 1 && step !== 3 && step !== 7 && step !== 9 && "Looks neat! ✨"}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-[280px] flex flex-col justify-center"
              >
                {/* STEP 1: RATING */}
                {step === 1 && (
                  <div className="space-y-4 text-center">
                    <h2 className="font-serif-vintage text-4xl text-[#3A2E25] leading-tight">How's your heart leaving the café today?</h2>
                    <div className="flex flex-wrap justify-center gap-3 pt-3">
                      {[
                        { val: 1, label: '🌧️ Missed' },
                        { val: 2, label: '😐 Okay' },
                        { val: 3, label: '✨ Good' },
                        { val: 4, label: '🎉 Amazing' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => { setRating(opt.val); handleNextStep(); }}
                          className="px-5 py-3 rounded-xl font-bold text-sm border-2 border-[#534538] transition-all"
                          style={{
                            background: rating === opt.val ? '#E2A752' : '#FFFDF9',
                            boxShadow: '3px 3px 0 #534538',
                            color: '#3A2E25'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: PURPOSE */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-serif-vintage text-4xl text-[#3A2E25] text-center">Why were you visiting us?</h2>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[
                        { id: 'food', text: '🥟 Food Mission' },
                        { id: 'catch', text: '❤️ Catching Up' },
                        { id: 'escape', text: '🌧️ Escaping Reality' },
                        { id: 'family', text: '👨‍👩‍👧 Family Time' }
                      ].map(item => (
                        <div
                          key={item.id}
                          onClick={() => { setPurpose(item.id); handleNextStep(); }}
                          className="cursor-pointer p-4 rounded-xl border-2 border-[#534538] transition-all"
                          style={{
                            background: purpose === item.id ? '#DE8F6E' : '#FFFDF9',
                            boxShadow: '3px 3px 0 #534538'
                          }}
                        >
                          <p className="font-bold text-sm text-[#3A2E25]">{item.text}</p>
                          <p className="font-mono text-[9px] uppercase opacity-50 mt-1">Tap to select stamp</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: DYNAMIC MENU */}
                {step === 3 && menuData && (
                  <div className="space-y-4">
                    <h2 className="font-serif-vintage text-4xl text-[#3A2E25] text-center">What did you gather at the table?</h2>
                    <div className="max-h-[190px] overflow-y-auto pr-1 space-y-2">
                      {Object.entries(menuData).map(([category, info]) => (
                        <details key={category} className="group rounded-xl border-2 border-[#534538] bg-[#FFFDF9]">
                          <summary className="cursor-pointer p-3 font-bold uppercase tracking-wider text-xs flex justify-between items-center outline-none text-[#3A2E25]">
                            {category} <span className="group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="p-2 border-t border-[#534538] bg-[#FAF2DC] grid grid-cols-1 gap-1.5">
                            {info.items.map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() => toggleItemSelection(item.n)}
                                className="p-2.5 rounded-lg flex justify-between items-center text-left font-bold text-xs transition-all border border-[#534538]"
                                style={{ background: selectedItems.includes(item.n) ? '#B5D1A9' : '#FFFDF9' }}
                              >
                                <span>{item.n}</span>
                                {selectedItems.includes(item.n) && <Check size={12} />}
                              </button>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={handleNextStep} 
                        disabled={selectedItems.length === 0} 
                        className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl disabled:opacity-40 flex items-center gap-1 bg-[#534538] text-[#FAF2DC]"
                      >
                        Continue <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: MAIN CHARACTER */}
                {step === 4 && (
                  <div className="text-center space-y-4">
                    <h2 className="font-serif-vintage text-4xl text-[#3A2E25]">The Main Character of your meal?</h2>
                    <div className="flex flex-wrap justify-center gap-2 py-2">
                      {selectedItems.map(item => (
                        <button
                          key={item}
                          onClick={() => { setFavoriteDish(item); handleNextStep(); }}
                          className="px-4 py-2.5 rounded-xl font-bold text-xs border-2 border-[#534538]"
                          style={{
                            background: favoriteDish === item ? '#E2A752' : '#FFFDF9',
                            boxShadow: '3px 3px 0 #534538'
                          }}
                        >
                          👑 {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5: COLLECT STICKERS */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h2 className="font-serif-vintage text-4xl text-[#3A2E25] text-center">Collect your review stickers</h2>
                    <div className="flex flex-wrap justify-center gap-2 py-2">
                      {[
                        '⭐ Perfectly Cooked', '☁️ Cozy Alley', '💛 Friendly Staff', 
                        '🍴 Delicious Decor', '✨ Worth Coming Back'
                      ].map(badge => {
                        const active = selectedHighlights.includes(badge);
                        return (
                          <button
                            key={badge}
                            onClick={() => toggleHighlight(badge)}
                            className="px-3 py-2 rounded-full font-bold text-xs border border-[#534538] transition-transform"
                            style={{
                              background: active ? '#E2A752' : '#FFFDF9',
                              transform: active ? 'rotate(-3deg)' : 'none'
                            }}
                          >
                            {badge}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-end">
                      <button onClick={handleNextStep} className="text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#534538] text-[#FAF2DC] rounded-xl">
                        Next Page
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: MOOD VIBE */}
                {step === 6 && (
                  <div className="space-y-4">
                    <h2 className="font-serif-vintage text-4xl text-[#3A2E25] text-center">Capture today's exact mood vibe</h2>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {[
                        '🌧️ Rainy Day Comfort', '✨ Main Character Energy', 
                        '☕ Coffee & Conversations', '🌸 Peaceful Escape'
                      ].map(vOption => (
                        <button
                          key={vOption}
                          onClick={() => { setVibe(vOption); handleNextStep(); }}
                          className="p-3 rounded-xl border border-[#534538] font-bold text-xs text-left transition-colors"
                          style={{ background: vibe === vOption ? '#689B94' : '#FFFDF9' }}
                        >
                          {vOption}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7: GUESTBOOK TEXT MEMORY ENTRY */}
                {step === 7 && (
                  <div className="space-y-4">
                    <h2 className="font-serif-vintage text-3xl text-[#3A2E25]">Leave a little memory whisper...</h2>
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#534538] bg-[#F6EED9] p-3 shadow-inner">
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="What will you remember about today? Scribble down..."
                        className="journal-ruled w-full h-24 resize-none focus:outline-none text-base bg-transparent font-hand font-bold leading-[28px] text-[#534538]"
                      />
                    </div>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-[#F6EED9] border border-dashed border-[#70533A]">
                      <span className="font-hand text-base text-[#70533A]">Signed,</span>
                      <input
                        type="text"
                        value={anonymousName}
                        onChange={(e) => setAnonymousName(e.target.value)}
                        placeholder="anonymous handle..."
                        className="flex-1 bg-transparent text-xs font-bold outline-none border-b border-[#534538]/30 text-[#3A2E25]"
                      />
                    </div>
                    <button
                      onClick={handleNextStep}
                      className="w-full font-bold py-2.5 rounded-xl bg-[#CD6A4E] text-[#FFFDF9] border-2 border-[#534538]"
                    >
                      Seal Page into Ledger ✨
                    </button>
                  </div>
                )}

                {/* STEP 8: TWIN REVEAL */}
                {step === 8 && (
                  <div className="text-center py-2 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      {isSearchingTwin ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 flex flex-col items-center">
                          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#CD6A4E]" />
                          <h3 className="font-hand text-2xl font-bold text-[#534538]">Searching for someone who shared your café vibe...</h3>
                        </motion.div>
                      ) : (
                        <motion.div key="reveal" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-4">
                          {twin ? (
                            <div className="space-y-3 w-full text-left">
                              <span className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#DE8F6E] border border-[#534538] text-[#3D1E14]">✨ Cafe Twin Found</span>
                              <div className="rounded-xl p-3 bg-[#FFFDF9] border-2 border-[#534538]">
                                <h4 className="font-bold text-sm text-[#3A2E25]">👤 {twin.name || 'Cozy Wanderer'}</h4>
                                <p className="text-[11px] text-[#CD6A4E] font-bold">Vibe: {twin.vibe || 'Food Adventure'}</p>
                                <p className="text-xs mt-1.5 italic p-2 bg-[#F7EED6] rounded border border-stone-200">"{twin.review || 'Loved the space!'}"</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 py-4">
                              <div className="text-4xl">🌱</div>
                              <h3 className="font-hand text-2xl font-bold text-[#534538]">You are a complete original today!</h3>
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-2 w-full pt-2">
                            <button onClick={handleNextStep} className="w-full rounded-xl font-bold py-2.5 text-xs uppercase bg-[#534538] text-[#FAF2DC]">
                              Add a Scrapbook Photo 📸
                            </button>
                            <button onClick={executeFinalization} disabled={isSubmitting} className="w-full rounded-xl font-bold py-2.5 text-xs uppercase border border-[#534538] text-[#534538]">
                              {isSubmitting ? 'Syncing...' : 'Skip & View Dashboard 📊'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* STEP 9: VINTAGE CAMERA UI */}
                {step === 9 && (
                  <div className="space-y-4 text-center">
                    <h2 className="font-hand text-2xl font-bold text-[#534538]">Capture your snapshot memory</h2>
                    <p className="text-[11px] font-bold text-[#534538]/60 italic -mt-2">
                      📌 just for your receipt — stays on this device only, never saved or shared, poof after you leave~
                    </p>
                    
                    <div className="w-full rounded-2xl p-3 bg-gradient-to-br from-[#DFD4B7] to-[#B09F7A] border-2 border-[#534538] flex flex-col md:flex-row gap-3 items-center">
                      <div className="w-full md:w-[60%] aspect-[4/3] rounded-xl p-1.5 bg-[#F3ECDB] border border-[#534538] flex flex-col">
                        <div className="w-full flex-1 bg-black rounded overflow-hidden relative flex items-center justify-center">
                          {cameraStream && !capturedImage && (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                          )}
                          {capturedImage && (
                            <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
                          )}
                          {!cameraStream && !capturedImage && (
                            <button onClick={startCamera} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[#CD6A4E] text-[#FFFDF9] rounded-lg border border-[#534538]">
                              Power Lens On
                            </button>
                          )}
                        </div>
                        {cameraError && <p className="text-[9px] text-red-700 font-bold mt-1">{cameraError}</p>}
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full relative flex items-center justify-center bg-gradient-to-b from-[#FAF2DC] to-[#9E8A64] border-2 border-[#534538]">
                          {cameraStream && !capturedImage ? (
                            <button onClick={capturePhoto} className="w-8 h-8 rounded-full bg-[#CD6A4E] border border-[#534538] font-bold text-[9px] text-[#FFFDF9]" fill="none">SNAP</button>
                          ) : (
                            <button onClick={startCamera} className="w-8 h-8 rounded-full bg-[#FFFDF9] border border-[#534538] text-[9px] flex items-center justify-center">
                              {capturedImage ? <RefreshCw size={10} /> : 'SET'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                      <button onClick={handleInstagramShare} className="flex-1 text-white font-bold text-xs uppercase py-2.5 rounded-xl bg-gradient-to-r from-[#8a3ab9] to-[#fbad50] border border-[#534538]">
                        Share to Stories
                      </button>
                      <button onClick={executeFinalization} disabled={isSubmitting} className="font-bold text-xs uppercase px-4 py-2.5 rounded-xl bg-[#534538] text-[#FAF2DC]">
                        {isSubmitting ? 'Syncing...' : 'View Dashboard 🧾'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Branding inside Left Page */}
          <div className="mt-4 border-t border-[#E3D7B9] pt-2 flex justify-between items-center text-[9px] font-mono tracking-widest uppercase text-[#9A8D76] relative z-10">
            <span>Cozy Canvas Collective</span>
            <span>Est. 2026</span>
          </div>
        </div>

        {/* RIGHT SIDE: THE COVER ART STYLE DECORATIVE BADGE SHEET */}
        <div className="w-full lg:w-[320px] relative min-h-[340px] lg:min-h-auto rounded-2xl overflow-hidden bg-[#2D3525]/30 border border-white/5 p-4 flex flex-wrap gap-4 items-center justify-center content-center">
          
          {/* Vintage Flower Postage Stamp */}
          <div className="w-28 bg-[#FAF2DC] p-2 rounded-sm shadow-md border-2 border-dashed border-[#C5B99A] rotate-[-4deg] hover:scale-105 transition-transform duration-300">
            <div className="border border-[#DFD5BA] p-1 bg-[#FFFDF7] text-center">
              <div className="flex justify-between font-mono text-[7px] text-[#8A7D63]">
                <span>USA</span>
                <span>29¢</span>
              </div>
              <svg viewBox="0 0 40 60" className="w-10 h-14 mx-auto my-1 opacity-90" fill="none">
                <path d="M20 55 C20 35, 22 25, 20 10" stroke="#48533C" strokeWidth="1.5" strokeLinecap="round"/>
                <ellipse cx="20" cy="18" rx="8" ry="7" fill="#E2A752"/>
                <circle cx="20" cy="18" r="4" fill="#F1C76B"/>
              </svg>
              <span className="font-serif-vintage text-[10px] block text-[#48533C] tracking-wide">Morning Sun</span>
            </div>
          </div>

          {/* Fresh Apricot Tint Badge */}
          <div className="w-28 bg-[#DE8F6E] p-2 rounded-xl shadow-md border border-[#C57756] rotate-[6deg] hover:scale-105 transition-transform duration-300 text-center text-[#3D1E14] font-serif">
            <div className="border border-dashed border-[#5A2D1B]/30 rounded-lg p-1">
              <span className="text-[7px] uppercase tracking-wider block font-sans font-bold opacity-60">Fresh Farm</span>
              <span className="text-xs font-bold block -mt-0.5 font-serif-vintage">Apricots</span>
              <div className="flex justify-center gap-0.5 my-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#E2A752] shadow-inner" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#D68F47] shadow-inner -ml-1" />
              </div>
              <span className="text-[8px] font-mono opacity-80">$0.30</span>
            </div>
          </div>

          {/* Terracotta Transit Ticket */}
          <div className="w-40 bg-[#E0A96D] px-2.5 py-1.5 rounded-sm shadow-xs border-y-2 border-dashed border-[#A8743C] rotate-[-1deg] flex justify-between items-center text-[#3A2109] font-mono text-[8px] hover:scale-105 transition-transform duration-300">
            <div>
              <div className="font-bold uppercase tracking-tight text-[9px] font-serif-vintage">Slow Transit</div>
              <div>SINGLE TICKET</div>
            </div>
            <div className="text-right border-l border-[#3A2109]/20 pl-2 font-bold">
              <div>OCT 17</div>
            </div>
          </div>

          {/* Yellow Ceramic Coffee Mug View */}
          <div className="w-24 h-24 bg-[#FAF2DC] rounded-full shadow-md border border-[#DFD5BA] p-2 flex items-center justify-center rotate-[12deg] hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full border border-dashed border-[#C5B99A] rounded-full flex flex-col items-center justify-center relative">
              <svg viewBox="0 0 40 40" className="w-12 h-12">
                <ellipse cx="20" cy="20" rx="15" ry="13" fill="#E2A752" stroke="#AA762E" strokeWidth="1"/>
                <ellipse cx="20" cy="19" rx="11" ry="9" fill="#753C1A"/>
                <path d="M 16,11 Q 15,7 18,5" fill="none" stroke="#FAF2DC" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
              </svg>
            </div>
          </div>

          {/* Scripted Whisper Callout Sticker */}
          <div className="bg-[#E7D6B8] border-2 border-[#FAF2DC] px-3 py-1 rounded-full shadow-md text-[#534538] font-bold text-xs rotate-[-8deg] flex items-center gap-1 hover:scale-105 transition-transform duration-300">
            <span>✨</span>
            <span className="font-hand text-sm tracking-wide">slow morning morning</span>
            <span>🍳</span>
          </div>

        </div>

      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}