import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { InstagramIcon, WhatsappIcon, TwitterIcon } from '../components/Icons';

// --- HYPER-REALISTIC SVG TEXTURES & FILTERS ---
const ScrapbookTextures = () => (
  <svg className="hidden">
    <defs>
      {/* 3D Crumpled Paper Filter */}
      <filter id="crumple" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="6" result="noise" />
        <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="3" result="light">
          <feDistantLight azimuth="45" elevation="55" />
        </feDiffuseLighting>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.95 0 0 0  0 0.85 0 0 0  0 0 0 1 0" in="light" result="coloredLight" />
        <feBlend mode="multiply" in="coloredLight" in2="SourceGraphic" />
      </filter>

      {/* Torn Edge Displacement */}
      <filter id="torn-edge">
        <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

// --- DECORATIVE SCRAPBOOK ASSETS ---
const PushPin = ({ className }) => (
  <div className={`absolute z-50 pointer-events-none drop-shadow-md ${className}`}>
    <svg width="40" height="40" viewBox="0 0 40 40">
      <path d="M19,25 L12,38" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M21,18 L16,32" stroke="#7A8794" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="23" cy="15" r="7" fill="#8B1E21" />
      <circle cx="21" cy="13" r="3" fill="#B3393D" />
      <path d="M18,10 Q23,5 28,10" fill="#611315" />
    </svg>
  </div>
);

const CoffeeStain = ({ className }) => (
  <div className={`absolute pointer-events-none z-10 mix-blend-multiply opacity-30 ${className}`}>
    <svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="60" fill="none" stroke="#5C3A21" strokeWidth="4" opacity="0.6" strokeDasharray="10 4 30 5" />
      <circle cx="70" cy="72" r="55" fill="none" stroke="#5C3A21" strokeWidth="6" opacity="0.8" />
      <circle cx="78" cy="78" r="62" fill="none" stroke="#5C3A21" strokeWidth="2" opacity="0.4" />
      <circle cx="40" cy="40" r="4" fill="#5C3A21" opacity="0.7" />
      <circle cx="110" cy="90" r="6" fill="#5C3A21" opacity="0.5" />
    </svg>
  </div>
);

const CuteEnvelope = ({ className }) => (
  <motion.div 
    whileHover={{ scale: 1.05, rotate: -5 }}
    className={`absolute z-40 w-24 h-16 bg-[#EBE3D5] shadow-md border border-[#C2B4A3] flex items-center justify-center cursor-pointer ${className}`}
  >
    <div className="absolute top-0 inset-x-0 h-0 border-t-[32px] border-x-[48px] border-t-[#D5C8B5] border-x-transparent drop-shadow-sm z-10" />
    <div className="absolute bottom-0 inset-x-0 h-0 border-b-[32px] border-x-[48px] border-b-[#EBE3D5] border-x-transparent z-20" />
    <div className="absolute z-30 text-[#D93838] text-2xl transform -translate-y-1">❤️</div>
    <span className="absolute bottom-1 left-2 font-cursive text-[10px] text-[#7A5C58] z-30 transform -rotate-6">P.S. Love you!</span>
  </motion.div>
);

const NewspaperScrap = ({ className }) => (
  <div 
    className={`absolute bg-[#F4EFE6] p-3 shadow-sm overflow-hidden mix-blend-multiply z-10 ${className}`}
    style={{ filter: 'url(#torn-edge)' }}
  >
    <div className="w-full h-full opacity-40 font-serif text-[6px] leading-tight text-[#2C241B] text-justify break-all">
      {[...Array(30)].map((_, i) => "The warm aroma of freshly ground coffee beans filled the air as the morning sun hit the cobblestone. A quiet sanctuary for those seeking a moment of peace. ").join('')}
    </div>
  </div>
);

export default function ReceiptPage() {
  const navigate = useNavigate();
  const [userReview, setUserReview] = useState(null);
  const [isCrumbling, setIsCrumbling] = useState(false);
  
  const checkNumber = useMemo(() => Math.floor(Math.random() * 900000) + 100000, []);

  // Fetch the latest memory submitted
  useEffect(() => {
    const unsubUser = onSnapshot(query(collection(db, "memories"), orderBy("createdAt", "desc"), limit(1)), (snapshot) => {
      if (!snapshot.empty) setUserReview(snapshot.docs[0].data());
    });
    return () => unsubUser();
  }, []);

  const handleCrumbleAnimation = () => {
    setIsCrumbling(true);
    // Wait for the crumble animation to finish, then navigate to the chronicle board
    setTimeout(() => {
      navigate('/chronicle');
    }, 950); 
  };

  const handleShare = (platform) => {
    const memoryText = userReview?.review || "Such a cozy spot!";
    const shareText = `Just got my guest check from Dumble' Door Cafe! ✨\n\n"${memoryText}"\n📍 Jagda, Rourkela`;
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    else if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    else if (platform === 'ig') alert("Screenshot your Guest Check and tag us on your IG Story! ✨📸");
  };

  const gridBackgroundStyle = {
    backgroundColor: '#FAF7F2',
    backgroundImage: `
      linear-gradient(rgba(200, 180, 160, 0.25) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200, 180, 160, 0.25) 1px, transparent 1px)
    `,
    backgroundSize: '24px 24px'
  };

  const paperNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;

  if (!userReview) return null; // Wait until data loads

  return (
    <div style={gridBackgroundStyle} className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 select-none font-sans">
      <ScrapbookTextures />
      
      {/* Deep Red Background Mat Accent */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[120vw] h-[60vh] bg-[#7A2021] transform -rotate-12 translate-y-12 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] opacity-90"></div>
      </div>

      {/* --- BACKGROUND COLLAGE ELEMENTS --- */}
      <NewspaperScrap className="top-[-5%] left-[-5%] w-64 h-64 rotate-12" />
      <NewspaperScrap className="bottom-[10%] right-[-10%] w-80 h-40 -rotate-6" />
      <CoffeeStain className="top-[15%] right-[10%] rotate-45 scale-150" />
      <CoffeeStain className="bottom-[5%] left-[15%] -rotate-12" />

      {/* --- CENTRAL CRUMPLED KRAFT PAPER WRAPPER --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isCrumbling ? {
          scale: [1, 0.7, 0.3, 0],
          rotate: [0, 45, 180, 360],
          x: [0, -50, 150, window.innerWidth > 768 ? 400 : 100],
          y: [0, -80, 200, 500],
          borderRadius: ["0px", "40px", "100px", "100px"],
          filter: ["blur(0px)", "blur(1px)", "blur(4px)", "blur(10px)"]
        } : { opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: isCrumbling ? 0.9 : 0.8, ease: "easeInOut" }}
        className="relative z-20 w-full max-w-md aspect-[3/4] shadow-[15px_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center"
      >
        {/* The Crumpled Texture Layer */}
        <div 
          className="absolute inset-0 bg-[#CBAE91]"
          style={{ 
            filter: 'url(#crumple)',
            clipPath: 'polygon(2% 1%, 98% 3%, 99% 97%, 3% 99%, 0% 50%)' 
          }}
        />

        <CuteEnvelope className="-bottom-6 -left-6 rotate-[-15deg]" />

        {/* --- THE DRAGGABLE GUEST CHECK (RECEIPT) --- */}
        <motion.div 
          drag={!isCrumbling}
          dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }} 
          className="relative w-[80%] max-w-[280px] drop-shadow-2xl cursor-grab active:cursor-grabbing z-30"
          whileHover={{ scale: 1.02 }}
        >
          <PushPin className="-top-4 right-4" />
          
          <div className="w-full bg-[#f3e1cb] relative text-[#173e87] flex flex-col font-sans pb-4 overflow-hidden border border-black/10 shadow-[2px_4px_15px_rgba(0,0,0,0.15)]">
            <div className="absolute inset-0 pointer-events-none z-50 opacity-20 mix-blend-multiply" style={{ backgroundImage: paperNoise }}></div>
            
            <div className="bg-[#fbd8c9] p-4 flex flex-col pt-6 relative">
              <div className="text-right font-mono text-2xl text-[#df3131] mb-1 tracking-widest opacity-80" style={{ transform: 'scaleY(1.2)' }}>
                {checkNumber}
              </div>
              
              <div className="grid grid-cols-4 border-y-2 border-[#173e87] text-[7px] font-bold text-center tracking-tighter uppercase">
                <div className="border-r-2 border-[#173e87] py-0.5">Table</div>
                <div className="border-r-2 border-[#173e87] py-0.5">Persons</div>
                <div className="border-r-2 border-[#173e87] py-0.5">Waiter</div>
                <div className="py-0.5">Amount</div>
              </div>
              <div className="grid grid-cols-4 h-5 border-b-2 border-[#173e87]">
                <div className="border-r-2 border-[#173e87]"></div>
                <div className="border-r-2 border-[#173e87]"></div>
                <div className="border-r-2 border-[#173e87]"></div>
                <div></div>
              </div>
              
              <div className="py-3 text-center">
                <h2 className="font-cursive text-5xl font-bold tracking-wider text-[#173e87]" style={{ transform: 'scaleY(1.1) rotate(-3deg)' }}>Thank You!</h2>
              </div>
              
              <div className="text-center text-[8px] font-bold tracking-widest border-b-2 border-[#173e87] pb-1 mb-1 uppercase">
                Your patronage is appreciated
              </div>
            </div>

            {/* Middle Ruled Section */}
            <div className="relative flex-1 w-full flex flex-col pt-1 bg-[#EFE0CB]">
              <div className="absolute right-[22%] top-0 bottom-0 w-[1.5px] bg-[#173e87]"></div>
              <div className="absolute right-[10%] top-0 bottom-0 w-[1.5px] bg-[#173e87]"></div>

              <div className="flex flex-col z-10 relative">
                {userReview.items?.map((item, i) => (
                  <div key={i} className="h-[40px] border-b-[1.5px] border-[#173e87] flex items-end pb-0 px-3 relative overflow-visible">
                    <span
                      className="font-cursive text-3xl text-[#df3131] font-black uppercase tracking-wider transform origin-bottom-left whitespace-nowrap absolute bottom-1 z-20 leading-none"
                      style={{ rotate: `${Math.random() * -2 - 4}deg`, mixBlendMode: 'multiply' }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
                <div className="h-[40px] border-b-[1.5px] border-[#173e87] flex items-end pb-1 relative px-3 overflow-visible">
                  <span className="font-cursive text-4xl text-[#df3131] font-black absolute bottom-1 left-20 z-20" style={{ rotate: '-12deg', mixBlendMode: 'multiply' }}>:)</span>
                </div>
              </div>
            </div>

            <div className="px-3 pt-2 relative bg-[#EFE0CB]">
              <div className="flex justify-between items-end border-b-[1.5px] border-[#173e87] pb-1 mb-1 mt-1">
                <span className="text-[10px] font-black tracking-widest uppercase">Tax</span>
                <span></span>
              </div>
              <div className="flex justify-between items-center text-[7px] font-bold pb-2">
                <div className="leading-tight tracking-widest">STYLE<br/>XX</div>
                <div className="text-[9px] tracking-wide">Thank You -- Call Again</div>
                <div className="w-8"></div>
              </div>

              {/* CUSTOMER SIGNATURE */}
              <div className="absolute top-1 right-8 z-20">
                <span className="font-cursive text-2xl text-[#df3131] font-black transform origin-bottom-right inline-block whitespace-nowrap" style={{ rotate: '-6deg', mixBlendMode: 'multiply' }}>
                  - {userReview.name || 'guest'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The Action Button sits ON the kraft paper */}
        <button 
          onClick={handleCrumbleAnimation}
          disabled={isCrumbling}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#FF9AA2] text-white font-mono font-black text-[10px] md:text-xs uppercase tracking-widest px-8 py-3.5 border-[3px] border-[#7A5C58] shadow-[4px_4px_0_#7A5C58] rounded-full hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all whitespace-nowrap z-40"
        >
          Crumble & See Chronicles 🗑️
        </button>
      </motion.div>

      {/* --- SOCIAL SHARE --- */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col items-end gap-4 z-50">
        <div className="bg-[#FDFBF7] p-3 shadow-md border border-[#D1BFAe] transform rotate-2 flex flex-col items-center gap-2">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-yellow-500/40 rotate-[-5deg]"></div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-[#7A2021] mb-1">Stash it!</p>
          <div className="flex gap-2">
            <button onClick={() => handleShare('ig')} className="w-10 h-10 rounded-none bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <InstagramIcon size={18} />
            </button>
            <button onClick={() => handleShare('whatsapp')} className="w-10 h-10 rounded-none bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <WhatsappIcon size={18} />
            </button>
            <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-none bg-[#111] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <TwitterIcon size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}