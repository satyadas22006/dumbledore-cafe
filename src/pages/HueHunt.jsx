import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, RotateCcw, Timer, Heart } from 'lucide-react';

const HUNT_COLORS = [
  { name: 'Chili Red 🍓', hex: '#E11D48' },
  { name: 'Forest Green 🌳', hex: '#166534' },
  { name: 'Ocean Navy 🌊', hex: '#1E3A8A' },
  { name: 'Mustard Yellow 🥞', hex: '#CA8A04' },
  { name: 'Terracotta ☕', hex: '#C2410C' }
];

const HueHunt = ({ onNavigate }) => {
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost
  const [targetColor, setTargetColor] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const prevColorRef = useRef(null);

  const REQUIRED_PHOTOS = 3;

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('lost');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    let availableColors = HUNT_COLORS;
    if (prevColorRef.current) {
      availableColors = HUNT_COLORS.filter(c => c.name !== prevColorRef.current.name);
    }
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    prevColorRef.current = randomColor;

    setTargetColor(randomColor);
    setTimeLeft(60);
    setUploadedPhotos([]);
    setGameState('playing');
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const updated = [...uploadedPhotos, imageUrl];
      setUploadedPhotos(updated);
      if (updated.length === REQUIRED_PHOTOS) setGameState('won');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 pt-12 select-none">
      <div className="mb-6">
        <button onClick={() => onNavigate('games')} className="flex items-center gap-2 text-sm font-bold text-[#4A3728] hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} className="stroke-[2.5]" /> back to selection
        </button>
      </div>

      <div className="bg-[#F9F6F0] text-[#3C2F2F] border-4 border-[#3C2F2F] rounded-[2.5rem] shadow-[6px_6px_0px_0px_#3C2F2F] p-6 relative">
        <AnimatePresence mode="wait">
          
          {/* State 1: Idle Screen */}
          {gameState === 'idle' && (
            <motion.div key="idle" className="py-8 text-center space-y-6">
              <span className="text-6xl block animate-bounce">🐥</span>
              <h2 className="text-3xl font-serif font-black">Hue Hunt Match</h2>
              <p className="text-sm font-medium opacity-80 leading-relaxed max-w-sm mx-auto">
                We'll give you a random mystery target shade. Find and take real snaps of <b>{REQUIRED_PHOTOS} matching items</b> inside the room before your clock runs out!
              </p>
              <button 
                onClick={startGame} 
                className="bg-[#3C2F2F] text-[#F9F6F0] font-bold px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-md"
              >
                Let's Find Colors!
              </button>
            </motion.div>
          )}

          {/* State 2: Active Gameplay */}
          {gameState === 'playing' && targetColor && (
            <motion.div key="playing" className="space-y-6 text-center w-full">
              {/* Stats Panel */}
              <div className="flex justify-between items-center bg-[#FFFDF9] px-5 py-2.5 border-2 border-[#3C2F2F] rounded-2xl font-bold text-xs uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                  <Timer size={16} className={timeLeft <= 10 ? "text-red-500 animate-spin" : "text-[#3C2F2F]"} />
                  <span className={timeLeft <= 10 ? "text-red-500" : ""}>Time Left: {timeLeft}s</span>
                </div>
                <div>Snaps: {uploadedPhotos.length}/{REQUIRED_PHOTOS}</div>
              </div>

              {/* Targets Goal Display */}
              <div className="p-6 border-4 border-[#3C2F2F] rounded-[2rem] text-white shadow-inner flex flex-col justify-center items-center" style={{ backgroundColor: targetColor.hex }}>
                <span className="bg-black/20 text-white rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase mb-1">Your Color Objective</span>
                <h3 className="text-3xl font-serif font-black drop-shadow-sm">{targetColor.name}</h3>
              </div>

              {/* Photo Upload Slots Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[...Array(REQUIRED_PHOTOS)].map((_, i) => (
                  <div key={i} className="aspect-square border-4 border-dashed border-[#3C2F2F]/30 bg-[#FFFDF9] rounded-2xl flex items-center justify-center overflow-hidden relative">
                    {uploadedPhotos[i] ? (
                      <img src={uploadedPhotos[i]} alt="captured item" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold opacity-30">#{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Camera Trigger Button Zone */}
              <div className="pt-4">
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="w-20 h-20 rounded-full bg-[#FFE3B3] border-4 border-[#3C2F2F] shadow-[4px_4px_0px_0px_#3C2F2F] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform text-[#3C2F2F] mx-auto"
                >
                  <Camera size={28} className="stroke-[2.5]" />
                </button>
                <p className="text-[11px] font-bold opacity-50 mt-3 uppercase tracking-wider">Tap to snap a matching object picture</p>
              </div>
            </motion.div>
          )}

          {/* State 3: Won Screen */}
          {gameState === 'won' && (
            <motion.div key="won" className="py-8 text-center space-y-6">
              <div className="text-6xl animate-pulse">🐱🍌</div>
              <h2 className="text-4xl font-serif font-black text-amber-600">You Nailed It!</h2>
              <p className="text-sm font-medium opacity-80 max-w-sm mx-auto leading-relaxed">
                All data match items perfectly logged. Show this to the cashier counter setup to grab your reward treat! 🍪
              </p>
              <button 
                onClick={startGame} 
                className="bg-[#3C2F2F] text-[#F9F6F0] font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform text-xs uppercase flex items-center gap-2 mx-auto"
              >
                <RotateCcw size={14} /> Replay Mission
              </button>
            </motion.div>
          )}

          {/* State 4: Lost Screen */}
          {gameState === 'lost' && (
            <motion.div key="lost" className="py-8 text-center space-y-6">
              <span className="text-6xl block">😿</span>
              <h2 className="text-3xl font-serif font-black text-red-600">Timer Ran Out!</h2>
              <p className="text-sm font-medium opacity-70">You grabbed {uploadedPhotos.length} out of {REQUIRED_PHOTOS} snaps. Let's give it another shot!</p>
              <button 
                onClick={startGame} 
                className="bg-[#3C2F2F] text-[#F9F6F0] font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform text-xs uppercase flex items-center gap-2 mx-auto"
              >
                <RotateCcw size={14} /> Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default HueHunt;