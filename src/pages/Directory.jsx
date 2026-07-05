import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Navigation, ArrowLeft, Camera, Minus, Square, X } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// --- STICKERS ---
const SDCardSticker = ({ constraintsRef, className }) => (
  <motion.div 
    drag dragConstraints={constraintsRef} whileDrag={{ scale: 1.1, rotate: 5, zIndex: 60 }} whileHover={{ scale: 1.05 }}
    className={`absolute w-20 h-28 bg-[#2A2A2A] rounded-sm rounded-tr-2xl border-[3px] border-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.15)] flex flex-col p-1.5 cursor-grab active:cursor-grabbing z-40 ${className}`}
  >
    <div className="flex gap-[2px] h-4 mb-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`bg-gradient-to-b from-yellow-300 to-yellow-600 border border-[#111] ${i === 0 || i === 5 ? 'flex-1' : 'w-2'}`}></div>
      ))}
    </div>
    <div className="flex-1 border border-[#444] p-1 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:4px_4px]"></div>
      <p className="font-cursive text-white text-[10px] leading-tight text-center transform -rotate-6">taking a<br/>picture<br/>of us</p>
    </div>
  </motion.div>
);

const PixelWarningSticker = ({ constraintsRef, className }) => (
  <motion.div 
    drag dragConstraints={constraintsRef} whileDrag={{ scale: 1.1, zIndex: 60 }} whileHover={{ scale: 1.05 }}
    className={`absolute bg-white border-[3px] border-[#111] shadow-[4px_4px_0_#111] w-40 cursor-grab active:cursor-grabbing z-40 ${className}`}
  >
    <div className="bg-[#1E3A8A] text-white px-2 py-0.5 flex justify-between items-center border-b-[3px] border-[#111]">
      <span className="font-mono text-[8px] font-bold tracking-widest uppercase">WARNING.EXE</span>
      <div className="bg-white border-2 border-[#111] w-3 h-3 flex items-center justify-center"><X size={8} className="text-[#111]" strokeWidth={4} /></div>
    </div>
    <div className="p-2 text-center">
      <p className="font-mono text-[9px] font-bold text-[#111] mb-2 uppercase">Ready for coffee?</p>
      <div className="flex gap-2 justify-center">
        <div className="border-2 border-[#111] px-3 py-0.5 text-[8px] font-bold shadow-[2px_2px_0_#111] hover:bg-gray-200">YES</div>
        <div className="border-2 border-[#111] px-3 py-0.5 text-[8px] font-bold shadow-[2px_2px_0_#111] hover:bg-gray-200">YEP</div>
      </div>
    </div>
  </motion.div>
);

const Tape = ({ className, color = "bg-rose-400" }) => (
  <div 
    className={`absolute w-24 h-8 backdrop-blur-sm shadow-sm z-40 mix-blend-multiply ${color} ${className}`}
    style={{ borderLeft: '3px dashed rgba(255,255,255,0.4)', borderRight: '3px dashed rgba(255,255,255,0.4)' }} 
  />
);

const FloatingSketch = ({ src, className, animateVals, style, duration }) => (
  <motion.div 
    animate={animateVals}
    transition={{ duration: duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    className={`absolute pointer-events-none z-30 ${className}`}
    style={style}
  >
    <img src={src} alt="" className="w-full h-full object-contain opacity-35" style={{ filter: 'grayscale(100%) contrast(140%)', mixBlendMode: 'multiply' }} />
  </motion.div>
);

const SketchBackground = ({ src, className, animateVals }) => (
  <motion.div 
    animate={animateVals}
    transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    className={`absolute pointer-events-none z-0 ${className}`}
  >
    <img src={src} alt="" className="w-full h-full object-contain" style={{ filter: 'grayscale(100%) contrast(120%) brightness(105%) opacity(0.25)', mixBlendMode: 'multiply' }} />
  </motion.div>
);

const Directory = ({ onNavigate, theme }) => {
  const constraintsRef = useRef(null);
  const [cafeInfo, setCafeInfo] = useState({
    name: "Dumble' Door",
    locationText: "Jagda, Rourkela",
    mapLink: "",
    startDay: "Tuesday",
    endDay: "Sunday",
    hours: "11:30 - 9:00",
    phone: ""
  });

  useEffect(() => {
    const unsubInfo = onSnapshot(doc(db, "settings", "cafeInfo"), (docSnap) => {
      if (docSnap.exists()) setCafeInfo(docSnap.data());
    });
    return () => unsubInfo();
  }, []);

  const handleDirections = () => {
    if (cafeInfo.mapLink) {
      window.open(cafeInfo.mapLink, '_blank');
    } else {
      alert("Oops! The cafe hasn't set their Google Maps location yet.");
    }
  };

  const randomizedSketchConfig = useMemo(() => {
    const images = ['/split_1.png', '/split_2.png', '/split_3.png', '/split_4.png', '/split_5.png', '/split_6.png', '/split_7.png', '/split_8.png', '/split_9.png'];
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }
    const zones = [
        { top: '3%', left: '2%' }, { top: '5%', right: '2%' }, { top: '22%', left: '-4%' },
        { top: '32%', right: '-4%' }, { top: '50%', left: '0%' }, { top: '65%', right: '2%' },
        { top: '78%', left: '-2%' }, { top: '88%', right: '0%' }, { top: '12%', left: '45%' }
    ];
    return images.map((src, i) => ({
        src,
        style: zones[i],
        anim: {
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
            rotate: [Math.random() * -5, Math.random() * 5, Math.random() * -5]
        },
        duration: 15 + Math.random() * 10
    }));
  }, []);

  return (
    <div ref={constraintsRef} className="py-6 px-4 relative overflow-hidden flex flex-col justify-center min-h-[calc(100vh-100px)]">
      
      {/* LAYER 1: Deep Background Sketches */}
      <SketchBackground src="/image_9d2e2e.jpg" className="top-0 left-0 w-96 h-96" animateVals={{ y: [0, 20, 0], rotate: [-2, 2, -2] }} />
      <SketchBackground src="/image_9d2e66.jpg" className="bottom-0 right-0 w-[30rem] h-[30rem]" animateVals={{ y: [0, -25, 0], rotate: [2, -2, 2] }} />
      <SketchBackground src="/image_9d2ea4.jpg" className="top-10 right-[15%] w-80 h-80" animateVals={{ x: [0, -15, 0], rotate: [-1, 1, -1] }} />

      {/* 
        NOTE: The localized grid layer that caused the double-line seam from image_2be3bc.png has been removed. 
        The layout lines are now fully driven by the underlying <GlobalGrid /> canvas from App.jsx!
      */}

      {/* LAYER 2: Forefront Floating Split Sketches */}
      {randomizedSketchConfig.map((config, i) => (
        <FloatingSketch key={i} src={config.src} className="w-32 h-32 md:w-56 md:h-56" animateVals={config.anim} style={config.style} duration={config.duration} />
      ))}

      {/* LAYER 3: Interactive Draggable Stickers & Badges */}
      <SDCardSticker constraintsRef={constraintsRef} className="top-[12%] left-[4%] rotate-[-12deg] hidden md:flex" />
      <PixelWarningSticker constraintsRef={constraintsRef} className="bottom-[15%] right-[5%] rotate-[8deg] hidden md:block" />

      {/* Main Layout Content Area */}
      <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-6 md:gap-16 relative z-30 items-center md:items-stretch">
        
        {/* LEFT SIDE: Polaroid Map Frame */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}
          className="flex-1 w-full max-w-md relative flex flex-col items-center self-center z-10"
        >
          <div className="bg-white p-4 pb-16 border-[3px] border-[#472C20] shadow-[12px_12px_0_rgba(71,44,32,0.15)] relative transform rotate-2 group w-full">
            
            {/* Native Back Navigation Badge */}
            {onNavigate && (
              <button 
                onClick={() => onNavigate('home')}
                className="absolute -top-5 left-4 bg-white border-[3px] border-[#472C20] px-4 py-1.5 rounded-full font-mono font-black text-xs text-[#472C20] shadow-[3px_3px_0_#472C20] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#472C20] transition-all z-50 flex items-center gap-1"
              >
                <ArrowLeft size={12} strokeWidth={3} /> BACK
              </button>
            )}

            <Tape className="-top-4 right-[15%] rotate-[3deg] bg-[#F4A896]" />
            <Tape className="bottom-16 -left-8 rotate-[-5deg] bg-[#FACC15]" />
            
            <div className="w-full aspect-square bg-[#E8E2D5] border-[3px] border-[#472C20] flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-[#E2D5CA] transition-colors cursor-pointer" onClick={handleDirections}>
              {cafeInfo.mapLink ? (
                <>
                  <iframe
                    className="absolute inset-0 w-full h-full pointer-events-none filter contrast-125 saturate-50 sepia-[0.2]"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(cafeInfo.name + ' ' + cafeInfo.locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                  ></iframe>
                  <div className="absolute inset-0 bg-[#A78BFA]/10 group-hover:bg-transparent transition-colors z-0 pointer-events-none mix-blend-multiply"></div>
                </>
              ) : (
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#472C20_25%,transparent_25%,transparent_75%,#472C20_75%,#472C20)] bg-[length:20px_20px] z-0"></div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white border-[3px] border-[#472C20] px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0_#472C20] transform scale-110">
                  <MapPin size={18} className="text-[#D97757] animate-bounce" />
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-[#472C20]">Click to Open</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-[3px] border-[#472C20] rounded-full flex items-center justify-center shadow-[4px_4px_0_#472C20] z-20">
              <Camera size={28} className="text-[#D97757]" />
            </div>
            
            <p className="font-cursive text-center text-2xl text-[#472C20] mt-8 opacity-80">where the magic happens</p>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Information Console Window */}
        <div className="flex-1 flex flex-col justify-center w-full z-10 mt-10 md:mt-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 text-center md:text-left">
            <h1 className="text-6xl md:text-7xl font-serif font-black text-[#472C20] leading-[0.9]">
              Come <span className="font-cursive text-[#5581DB] font-normal transform -rotate-3 inline-block ml-2 drop-shadow-sm">say hi!</span>
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#FFFDF9] border-[4px] border-[#472C20] shadow-[12px_12px_0_rgba(71,44,32,1)] relative flex flex-col overflow-visible">
            <div className="bg-[#472C20] text-white px-4 py-2 flex justify-between items-center border-b-[4px] border-[#472C20]">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Navigation size={14}/> directory.exe
              </span>
              <div className="flex gap-2">
                <div className="w-3 h-3 border-2 border-white rounded-full bg-transparent flex items-center justify-center"><Minus size={8} /></div>
                <div className="w-3 h-3 border-2 border-white rounded-full bg-transparent flex items-center justify-center"><Square size={6} /></div>
                <div className="w-3 h-3 border-2 border-white rounded-full bg-[#D97757] flex items-center justify-center"><X size={8} /></div>
              </div>
            </div>
            
            <div className="absolute -top-3 right-8 w-16 h-6 bg-red-900/80 backdrop-blur-sm shadow-sm rounded-t-md z-[-1]"></div>

            <div className="p-8 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-none bg-[#C2DCFF] border-[3px] border-[#472C20] shadow-[3px_3px_0_#472C20] flex items-center justify-center flex-shrink-0 text-[#472C20] transform -rotate-3">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#5581DB] mb-1">Location</p>
                  <p className="font-serif text-xl md:text-2xl font-bold text-[#472C20] leading-snug">{cafeInfo.locationText}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-none bg-[#D97757] border-[3px] border-[#472C20] shadow-[3px_3px_0_#472C20] flex items-center justify-center flex-shrink-0 text-white transform rotate-2">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#D97757] mb-1">Hours</p>
                  <p className="font-serif text-xl md:text-2xl font-bold text-[#472C20]">{cafeInfo.startDay} – {cafeInfo.endDay}</p>
                  <p className="font-mono font-bold text-lg text-[#8D5B4C] mt-1 bg-white border-2 border-[#472C20] inline-block px-2 shadow-sm">{cafeInfo.hours}</p>
                </div>
              </div>

              {cafeInfo.phone && (
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-none bg-emerald-400 border-[3px] border-[#472C20] shadow-[3px_3px_0_#472C20] flex items-center justify-center flex-shrink-0 text-white transform -rotate-1">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Ring Us</p>
                    <p className="font-mono font-bold text-xl text-[#472C20]">{cafeInfo.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            onClick={handleDirections}
            className="mt-6 mx-auto md:mx-0 bg-[#C2DCFF] text-[#472C20] font-mono font-bold uppercase tracking-[0.15em] text-sm px-10 py-5 border-[4px] border-[#472C20] shadow-[6px_6px_0_#472C20] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#472C20] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-3 w-fit relative overflow-hidden group"
          >
            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-12 group-hover:animate-[shine_1s_ease-in-out]"></div>
            <Navigation size={20} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
            LAUNCH MAPS
          </motion.button>
        </div>

      </div>
    </div>
  );
};

export default Directory;