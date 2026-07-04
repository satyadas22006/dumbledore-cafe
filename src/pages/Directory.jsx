import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Navigation, ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const WashiTape = ({ className, color = "bg-white/60" }) => (
  <div 
    className={`absolute w-24 h-8 backdrop-blur-sm shadow-sm z-20 mix-blend-overlay ${color} ${className}`}
    style={{ borderLeft: '3px dashed rgba(71, 44, 32, 0.2)', borderRight: '3px dashed rgba(71, 44, 32, 0.2)' }} 
  />
);

const Directory = ({ onNavigate }) => {
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
      if (docSnap.exists()) {
        setCafeInfo(docSnap.data());
      }
    });
    return () => unsubInfo();
  }, []);

  const notebookBackgroundStyle = {
    backgroundColor: '#FDFBF7',
    backgroundImage: `
      linear-gradient(transparent 95%, #E8E2D5 95%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")
    `,
    backgroundSize: '100% 32px, 150px 150px',
  };

  const handleDirections = () => {
    if (cafeInfo.mapLink) {
      window.open(cafeInfo.mapLink, '_blank');
    } else {
      alert("Oops! The cafe hasn't set their Google Maps location yet.");
    }
  };

  return (
    <div style={notebookBackgroundStyle} className="min-h-screen py-10 px-6 relative overflow-hidden select-none">
      
      {/* Top Nav */}
      <div className="max-w-4xl mx-auto relative z-20 mb-8">
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2 bg-[#FDFBF7] border-2 border-[#472C20] px-5 py-2.5 rounded-full font-bold uppercase text-sm tracking-wider text-[#472C20] shadow-[3px_3px_0_#472C20] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#472C20] transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.5} /> BACK TO CAFE
        </button>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 relative z-10">
        
        {/* LEFT SIDE: Big Polaroid Map Card */}
        <motion.div 
          initial={{ opacity: 0, rotate: -5, x: -50 }}
          animate={{ opacity: 1, rotate: -2, x: 0 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="flex-1 bg-white p-4 pb-12 border-2 border-[#472C20]/20 shadow-[8px_12px_20px_rgba(71,44,32,0.15)] relative transform -rotate-2 group"
        >
          <WashiTape className="-top-4 left-1/2 -translate-x-1/2 rotate-2 bg-[#B4C5E4]/80" />
          
          <div className="w-full aspect-square bg-[#E8E2D5] border border-[#472C20]/10 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-[#E2D5CA] transition-colors cursor-pointer" onClick={handleDirections}>
            
            {/* Conditional Map Rendering */}
            {cafeInfo.mapLink ? (
              <>
                {/* Real Google Map Embed using location text */}
                <iframe
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-80 filter contrast-125 saturate-50 sepia-[0.3]"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(cafeInfo.name + ' ' + cafeInfo.locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                ></iframe>
                {/* Vintage overlay tint */}
                <div className="absolute inset-0 bg-[#E8E2D5]/20 group-hover:bg-transparent transition-colors z-0 pointer-events-none"></div>
              </>
            ) : (
              /* Fallback Geometric Pattern */
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#472C20_25%,transparent_25%,transparent_75%,#472C20_75%,#472C20)] bg-[length:20px_20px] z-0"></div>
            )}

            <MapPin size={64} fill="white" className="text-[#D97757] relative z-10 mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]" />
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-[#472C20] relative z-10 border-2 border-[#472C20] px-4 py-2 bg-white/90 backdrop-blur-sm shadow-[3px_3px_0_#472C20]">Click for Map</span>
          </div>

          <p className="font-cursive text-center text-2xl text-[#472C20] mt-6 opacity-80">where the magic happens</p>
        </motion.div>

        {/* RIGHT SIDE: Taped Info Details */}
        <div className="flex-1 flex flex-col justify-center gap-8">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-[#472C20] leading-none mb-2">
              Come <span className="font-cursive text-[#D97757] font-normal transform -rotate-2 inline-block">say hi!</span>
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest text-[#8D5B4C] border-b border-[#8D5B4C]/20 pb-2 inline-block">
              {cafeInfo.name} Directory
            </p>
          </motion.div>

          {/* Info Card - Torn Paper Look */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[#FEF6E4] p-8 border border-[#472C20]/10 shadow-[4px_4px_0_rgba(71,44,32,0.1)] relative transform rotate-1"
          >
            <WashiTape className="-top-4 right-8 rotate-[15deg] bg-[#E2C7C0]/80" />
            
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[#472C20]/20 flex items-center justify-center flex-shrink-0 text-[#472C20]">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8D5B4C] mb-1">Location</p>
                  <p className="font-serif text-2xl font-bold text-[#472C20]">{cafeInfo.locationText}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[#472C20]/20 flex items-center justify-center flex-shrink-0 text-[#472C20]">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8D5B4C] mb-1">Hours</p>
                  <p className="font-serif text-2xl font-bold text-[#472C20]">{cafeInfo.startDay} – {cafeInfo.endDay}</p>
                  <p className="font-cursive text-xl text-[#D97757]">{cafeInfo.hours}</p>
                </div>
              </div>

              {cafeInfo.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#472C20]/20 flex items-center justify-center flex-shrink-0 text-[#472C20]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8D5B4C] mb-1">Ring Us</p>
                    <p className="font-mono font-bold text-lg text-[#472C20]">{cafeInfo.phone}</p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>

          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            onClick={handleDirections}
            className="bg-[#472C20] text-[#FDFBF7] font-mono font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-xl shadow-[6px_6px_0_#D97757] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#D97757] transition-all flex items-center justify-center gap-3 w-fit"
          >
            <Navigation size={18} /> Get Directions
          </motion.button>

        </div>
      </div>
    </div>
  );
};

export default Directory;