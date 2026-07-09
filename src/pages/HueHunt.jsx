import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Timer, Sparkles, HelpCircle } from 'lucide-react';
import BackToCafeButton from '../components/BackToCafeButton';

// FIREBASE O2 SECURE COUPLING
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const HUNT_COLORS = [
  { name: 'Chili Red 🍓', hMin: 345, hMax: 15, sMin: 50, vMin: 40, hex: '#E11D48' }, // Wraps around 360/0
  { name: 'Forest Green 🌳', hMin: 85, hMax: 150, sMin: 35, vMin: 25, hex: '#166534' },
  { name: 'Ocean Navy 🌊', hMin: 195, hMax: 250, sMin: 40, vMin: 25, hex: '#1E3A8A' },
  { name: 'Mustard Yellow 🥞', hMin: 40, hMax: 65, sMin: 40, vMin: 40, hex: '#CA8A04' },
  { name: 'Terracotta ☕', hMin: 10, hMax: 35, sMin: 45, vMin: 35, hex: '#C2410C' }
];

/* ---------------------------------------------------------------------
    Decorative critters & custom stamp/bunny assets
--------------------------------------------------------------------- */
const Bunny = ({ className = '' }) => (
  <svg viewBox="0 0 40 46" className={className}>
    <ellipse cx="14" cy="10" rx="4" ry="10" fill="#CFE0BC" transform="rotate(-8 14 10)" />
    <ellipse cx="26" cy="10" rx="4" ry="10" fill="#CFE0BC" transform="rotate(8 26 10)" />
    <circle cx="20" cy="26" r="14" fill="#EAF2DE" stroke="#CFE0BC" strokeWidth="1.5" />
    <circle cx="15" cy="25" r="1.6" fill="#7C8C6A" />
    <circle cx="25" cy="25" r="1.6" fill="#7C8C6A" />
    <path d="M17 31 Q20 33 23 31" stroke="#7C8C6A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <circle cx="11" cy="29" r="2.2" fill="#F3C6C9" opacity="0.6" />
    <circle cx="29" cy="29" r="2.2" fill="#F3C6C9" opacity="0.6" />
  </svg>
);

const Strawberry = ({ className = '' }) => (
  <svg viewBox="0 0 40 40" className={className}>
    <path d="M20 10 L14 4 L17 9 L20 6 L23 9 L26 4 L20 10Z" fill="#A9C97E" />
    <path d="M20 12 C10 12 6 22 12 30 C15 34 25 34 28 30 C34 22 30 12 20 12Z" fill="#EE8A93" />
    <circle cx="15" cy="20" r="1.1" fill="#FBE3B5" />
    <circle cx="22" cy="19" r="1.1" fill="#FBE3B5" />
    <circle cx="18" cy="26" r="1.1" fill="#FBE3B5" />
    <circle cx="24" cy="25" r="1.1" fill="#FBE3B5" />
  </svg>
);

const Balloon = ({ className = '' }) => (
  <svg viewBox="0 0 30 44" className={className}>
    <ellipse cx="15" cy="14" rx="11" ry="13" fill="#F3C6C9" />
    <path d="M15 27 L15 40" stroke="#D9A9AE" strokeWidth="1.3" />
    <path d="M13 41 L17 41 L15 44Z" fill="#D9A9AE" />
  </svg>
);

// Inspired by your cute bouquet-holding pink bunny image
const MelodyBunny = ({ className = '' }) => (
  <svg viewBox="0 0 100 110" className={className}>
    {/* Left Drooping/Tilted Ear */}
    <path d="M35 35 C15 10 45 -5 52 25 Z" fill="#FBCFE8" />
    {/* Right Straight Ear */}
    <path d="M55 30 C65 -10 95 5 75 40 Z" fill="#FBCFE8" />
    {/* Main Hooded Head */}
    <ellipse cx="55" cy="55" rx="32" ry="26" fill="#FBCFE8" />
    {/* Inner White Face Frame */}
    <ellipse cx="53" cy="59" rx="22" ry="17" fill="#FFFFFF" />
    {/* Big Pink Bow */}
    <circle cx="36" cy="36" r="7" fill="#F472B6" />
    <path d="M24 30 Q34 36 26 44 Z" fill="#F472B6" />
    <path d="M46 32 Q36 38 42 46 Z" fill="#F472B6" />
    {/* Eyes & Nose */}
    <ellipse cx="44" cy="58" rx="2.5" ry="3.5" fill="#5B3E31" />
    <ellipse cx="64" cy="58" rx="2.5" ry="3.5" fill="#5B3E31" />
    <ellipse cx="54" cy="61" rx="2.5" ry="1.8" fill="#FBBF24" />
    {/* Soft Cheeks */}
    <circle cx="38" cy="63" r="3" fill="#FECDD3" opacity="0.8" />
    <circle cx="69" cy="63" r="3" fill="#FECDD3" opacity="0.8" />
    {/* Body */}
    <path d="M35 78 C35 74 72 74 72 78 L68 95 C68 100 38 100 38 95 Z" fill="#FFFFFF" />
    <circle cx="42" cy="95" r="7" fill="#FFFFFF" />
    <circle cx="65" cy="95" r="7" fill="#FFFFFF" />
    {/* Bouquet of Pink Lilies/Tulips */}
    <path d="M24 74 Q32 85 42 76" stroke="#4ADE80" strokeWidth="3" fill="none" />
    <path d="M26 68 Q24 78 40 78" stroke="#4ADE80" strokeWidth="2.5" fill="none" />
    <path d="M20 62 C15 54 28 54 24 64 Z" fill="#FB923C" />
    <path d="M25 60 C22 50 35 52 29 62 Z" fill="#F472B6" />
    <path d="M31 64 C29 55 42 56 35 66 Z" fill="#F472B6" />
    {/* Hands wrapping bouquet */}
    <ellipse cx="34" cy="74" rx="5" ry="4" fill="#FFFFFF" />
    <ellipse cx="46" cy="74" rx="5" ry="4" fill="#FFFFFF" />
  </svg>
);

// Inspired by your vintage postage stamp lily image
const FlowerStamp = ({ className = '' }) => (
  <svg viewBox="0 0 120 90" className={className} filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.09))">
    {/* Perforated Jagged Background edges */}
    <rect x="4" y="4" width="112" height="82" rx="4" fill="#E2E8F0" />
    <rect x="6" y="6" width="108" height="78" rx="2" fill="#F8FAFC" />
    {/* Inner Photo Frame Grid */}
    <rect x="12" y="12" width="96" height="66" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
    {/* Stamp Typography details */}
    <text x="18" y="26" fontSize="11" fontFamily="serif" fontWeight="900" fill="#334155">150</text>
    <text x="18" y="34" fontSize="6" fontFamily="sans-serif" fontWeight="bold" fill="#64748B">cents</text>
    <text x="96" y="55" fontSize="7" fontFamily="sans-serif" fontWeight="bold" fill="#64748B" transform="rotate(-90 96 55)" letterSpacing="2">LOVELY</text>
    {/* Detailed Lily Petals */}
    <g transform="translate(20, 15)">
      {/* Stem */}
      <path d="M38 52 Q40 32 45 20" stroke="#65A30D" strokeWidth="2" fill="none" />
      {/* Flower petals */}
      <path d="M38 24 C22 26 24 10 38 18 C52 10 54 26 38 24 Z" fill="#F472B6" opacity="0.9" />
      <path d="M38 24 C44 38 58 32 46 18 C34 32 32 38 38 24 Z" fill="#EC4899" opacity="0.85" />
      <path d="M38 24 C25 20 20 35 34 34 C48 35 43 20 38 24 Z" fill="#FB7185" opacity="0.9" />
      {/* Pistils / Center Stamens */}
      <circle cx="35" cy="16" r="1" fill="#334155" /><line x1="38" y1="24" x2="35" y2="17" stroke="#334155" strokeWidth="0.7" />
      <circle cx="41" cy="15" r="1" fill="#334155" /><line x1="38" y1="24" x2="41" y2="16" stroke="#334155" strokeWidth="0.7" />
      <circle cx="38" cy="13" r="1" fill="#334155" /><line x1="38" y1="24" x2="38" y2="14" stroke="#334155" strokeWidth="0.7" />
    </g>
    {/* Cancellation Postmark Overlay */}
    <circle cx="84" cy="64" r="16" stroke="#475569" strokeWidth="1" fill="none" strokeDasharray="4 2" opacity="0.4" />
    <path d="M62 76 Q84 66 104 74 M65 81 Q84 71 98 80" stroke="#475569" strokeWidth="1" fill="none" opacity="0.4" />
  </svg>
);

const CritterRow = () => {
  const items = [Strawberry, Bunny, Bunny, Balloon, Bunny, Bunny, Balloon, Bunny];
  return (
    <div className="w-full bg-white/90 border-b border-[#F3D9DC] py-2.5 flex items-center justify-center gap-6 md:gap-10 overflow-hidden">
      {items.map((Icon, i) => (
        <Icon key={i} className="w-6 h-7 md:w-7 md:h-8 shrink-0 opacity-90" />
      ))}
    </div>
  );
};

const HueHunt = ({ onNavigate }) => {
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost
  const [targetColor, setTargetColor] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // Base64 thumbnail strings for client viewing
  
  // Game metrics & feedback state
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);

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
    setAnalysisReport(null);
    setPlayerName('');
    setIsSubmitting(false);
    setIsSaved(false);
    setGameState('playing');
  };

  // --- COMPUTER VISION CORE PIPELINE (OPTION 2) ---
  const processImagePipeline = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // 1. Resize image to 200x200 downsampled grid to drastically save CPU cycles
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 200;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imgData = ctx.getImageData(0, 0, size, size);
          const data = imgData.data; // Flat RGBA array [r,g,b,a, r,g,b,a...]
          const totalPixels = size * size;

          // 2. Pre-calculate HSV map and color histograms to optimize memory speeds
          const hsvMap = new Array(totalPixels);
          let uniqueColorMap = {};

          for (let i = 0; i < totalPixels; i++) {
            const idx = i * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Core RGB to HSV transformation matrix
            let h = 0, s = 0, v = 0;
            const min = Math.min(r, g, b);
            const max = Math.max(r, g, b);
            const delta = max - min;
            v = max / 255 * 100;

            if (max !== 0) s = (delta / max) * 100;
            else s = 0;

            if (delta !== 0) {
              if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
              else if (max === g) h = (b - r) / delta + 2;
              else h = (r - g) / delta + 4;
              h = Math.round(h * 60);
            } else h = 0;

            hsvMap[i] = { h, s, v };

            // Anti-cheat verification rule: Track identical pixel signatures
            const colorKey = `${Math.floor(r/16)},${Math.floor(g/16)},${Math.floor(b/16)}`;
            uniqueColorMap[colorKey] = (uniqueColorMap[colorKey] || 0) + 1;
          }

          // 3. Advanced Saliency Field Vector Mapping (Object Detection Simulation)
          const saliencyMap = new Float32Array(totalPixels);
          const centerX = size / 2;
          const centerY = size / 2;
          const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

          let totalSaliency = 0;
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              const i = y * size + x;
              const currentHsv = hsvMap[i];

              // Center Weighting Matrix
              const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
              const centerPrior = 1.0 - (distToCenter / maxDistance);

              // Local Spatial Contrast
              let colorContrast = 0;
              const sampleOffsets = [-4, 4, -size * 4, size * 4];
              sampleOffsets.forEach(offset => {
                const neighborIdx = i + offset;
                if (neighborIdx >= 0 && neighborIdx < totalPixels) {
                  colorContrast += Math.abs(currentHsv.v - hsvMap[neighborIdx].v);
                }
              });

              saliencyMap[i] = (colorContrast / 4) * 0.4 + (centerPrior * 100) * 0.6;
              totalSaliency += saliencyMap[i];
            }
          }

          // Isolate segmented main subject boundary thresholds
          const saliencyThreshold = totalSaliency / totalPixels * 1.15;
          let subjectPixelCount = 0;

          // 4. Multi-Metric Vector Calculations
          let matchingImagePixels = 0;
          let matchingSubjectPixels = 0;
          let hueErrorAccumulator = 0;

          // Target boundaries matching color constraints
          const { hMin, hMax, sMin, vMin } = targetColor;

          for (let i = 0; i < totalPixels; i++) {
            const { h, s, v } = hsvMap[i];
            const isSubject = saliencyMap[i] >= saliencyThreshold;
            if (isSubject) subjectPixelCount++;

            // Evaluate if pixel properties fall inside target color tolerances
            let matchesColor = false;
            if (hMin > hMax) { // Handles Red wrapping threshold rules across 360° boundary
              matchesColor = (h >= hMin || h <= hMax);
            } else {
              matchesColor = (h >= hMin && h <= hMax);
            }
            const meetsTolerances = matchesColor && s >= sMin && v >= vMin;

            if (meetsTolerances) {
              matchingImagePixels++;
              if (isSubject) matchingSubjectPixels++;

              // Accumulate accurate hue deviations for score weighting
              let midTargetHue = hMin > hMax ? ((hMin + hMax + 360) / 2) % 360 : (hMin + hMax) / 2;
              let error = Math.abs(h - midTargetHue);
              if (error > 180) error = 360 - error;
              hueErrorAccumulator += error;
            }
          }

          // Metric A: Color Accuracy Matrix (50%)
          let averageHueError = matchingImagePixels > 0 ? (hueErrorAccumulator / matchingImagePixels) : 30;
          let colorAccuracyScore = 100;
          if (averageHueError <= 5) colorAccuracyScore = 100;
          else if (averageHueError <= 10) colorAccuracyScore = 95 - (averageHueError - 5) * 1;
          else if (averageHueError <= 20) colorAccuracyScore = 90 - (averageHueError - 10) * 1;
          else if (averageHueError <= 30) colorAccuracyScore = 80 - (averageHueError - 20) * 1.5;
          else colorAccuracyScore = Math.max(10, 65 - (averageHueError - 30) * 2);

          // Metric B: Subject Coverage Matrix (35%)
          let subjectCoveragePercent = subjectPixelCount > 0 ? (matchingSubjectPixels / subjectPixelCount) * 100 : 0;
          let subjectCoverageScore = Math.min(100, subjectCoveragePercent * 2.8); 

          // Metric C: Scene Coverage Matrix (15%)
          let sceneCoveragePercent = (matchingImagePixels / totalPixels) * 100;
          let sceneCoverageScore = Math.min(100, sceneCoveragePercent * 4.5);

          // 5. Anti-Cheat Engine Guardrails
          let cheatFactor = 1.0;
          const totalUniqueSignatures = Object.keys(uniqueColorMap).length;
          const dominantColorValue = Math.max(...Object.values(uniqueColorMap));
          const colorConcentrationRatio = dominantColorValue / totalPixels;

          if (colorConcentrationRatio > 0.82 || totalUniqueSignatures < 18) {
            cheatFactor = 0.15; // Heavy execution penalty for single flat colors/screenshots
          }

          // Minimum match confidence thresholds
          const MIN_REQUIRED_PIXELS = totalPixels * 0.025; // 2% minimal coverage required
          let confidenceScore = Math.min(1.0, matchingImagePixels / MIN_REQUIRED_PIXELS);
          if (matchingImagePixels < totalPixels * 0.005) confidenceScore = 0.1; // Total drop-off anchor

          // Compute finalized score products
          let baseScore = (0.50 * colorAccuracyScore) + (0.35 * subjectCoverageScore) + (0.15 * sceneCoverageScore);
          let finalizedCalculatedScore = Math.round(baseScore * confidenceScore * cheatFactor);

          // Generate detailed context explanation notes dynamically
          let explanationString = `Great hunting! Found beautiful shades matching ${targetColor.name} focused directly inside your center view frame.`;
          if (cheatFactor < 1.0) explanationString = "🚫 Match Rejected. The camera system detected a flat, uniform digital display or a flat surface color grid palette instead of a real subject object asset environment.";
          else if (confidenceScore < 0.5) explanationString = "The target color matching signature was parsed, but it represents too small a focal space to register cleanly. Try getting closer or widening your focus framework.";
          else if (colorAccuracyScore < 75) explanationString = "Good camera framing, but the hue signature drifts slightly outside the authentic color tint array.";

          // Downsample base64 size drastically to fit under Firestore document memory constraints
          const base64Thumbnail = canvas.toDataURL('image/jpeg', 0.5);

          resolve({
            score: finalizedCalculatedScore,
            accuracy: Math.round(colorAccuracyScore),
            subject: Math.round(subjectCoverageScore),
            scene: Math.round(sceneCoverageScore),
            confidence: Math.round(confidenceScore * 100),
            explanation: explanationString,
            thumbnail: base64Thumbnail
          });
        };
      };
    });
  };

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const analysis = await processImagePipeline(file);
      const updatedPhotos = [...uploadedPhotos, analysis.thumbnail];
      setUploadedPhotos(updatedPhotos);

      if (updatedPhotos.length === REQUIRED_PHOTOS) {
        setAnalysisReport(analysis);
        setGameState('won');
      }
    }
  };

  const saveToDatabase = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "hue_hunt_matches"), {
        playerName: playerName.trim() || "Anonymous Hunter",
        targetColor: targetColor.name,
        colorHex: targetColor.hex,
        finalScore: analysisReport.score,
        accuracyMetric: analysisReport.accuracy,
        subjectMetric: analysisReport.subject,
        sceneMetric: analysisReport.scene,
        confidenceRating: analysisReport.confidence,
        explanationLog: analysisReport.explanation,
        photoLedgerBase64: uploadedPhotos,
        playedAt: Date.now()
      });

      setIsSaved(true);
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Database error saving. Try re-executing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradeString = (s) => {
    if (s < 50) return { t: 'Miss 😿', c: 'text-red-500' };
    if (s <= 64) return { t: 'Close 👀', c: 'text-amber-500' };
    if (s <= 79) return { t: 'Good Match ✨', c: 'text-blue-500' };
    if (s <= 89) return { t: 'Excellent 🏆', c: 'text-emerald-500' };
    return { t: 'Perfect Hunt 🥞🔥', c: 'text-pink-500 font-black animate-pulse' };
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: '#F9D9DE' }}
    >
      {/* Decorative critter header strip */}
      <CritterRow />

      {/* Gingham-patterned page body */}
      <div
        className="w-full flex-1 flex justify-center px-4 py-10 md:py-14"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.75) 12px, transparent 12px),
            linear-gradient(rgba(255,255,255,0.75) 12px, transparent 12px),
            linear-gradient(#DCE8CB, #DCE8CB)
          `,
          backgroundSize: '32px 32px, 32px 32px, 100% 100%',
        }}
      >
        {/* Main interactive container */}
        <div className="max-w-2xl w-full select-none relative">
          
          {/* Cute Bunny Bouquet Icon (Swapped to Left Side Base) */}
          <div className="absolute -bottom-10 -left-10 w-28 h-32 transform -rotate-6 hidden sm:block z-10 pointer-events-none">
            <MelodyBunny className="w-full h-full" />
          </div>

          {/* Expanded & Resized FlowerStamp (Moved to Right Side Header) */}
          <div className="absolute -top-14 -right-10 w-32 h-26 transform rotate-12 hidden sm:block z-10 pointer-events-none">
            <FlowerStamp className="w-full h-full" />
          </div>

          <BackToCafeButton className="mb-6" />

          <div className="bg-[#FFFDF9] text-[#3C2F2F] border-2 border-[#F3D9DC] rounded-[2.5rem] shadow-[0_10px_30px_rgba(60,47,47,0.12)] p-8 relative">
            <AnimatePresence mode="wait">
              
              {/* LOBBY INTERFACE */}
              {gameState === 'idle' && (
                <motion.div key="idle" className="py-8 text-center space-y-6">
                  <span className="text-6xl block animate-bounce">🐥🔍</span>
                  <h2 className="text-3xl font-serif font-black">Hue Hunt Machine</h2>
                  <p className="text-sm font-medium opacity-80 leading-relaxed max-w-sm mx-auto">
                    Given a target color, your mission is to capture 3 real world photos that match the hue and saturation range of the target. Happy hunting !!
                  </p>
                  <button 
                    onClick={startGame} 
                    className="bg-[#EE8A93] text-white font-bold px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-md"
                  >
                    LETS GO!!
                  </button>
                </motion.div>
              )}

              {/* PLAY ZONE ACTIVE FRAME */}
              {gameState === 'playing' && targetColor && (
                <motion.div key="playing" className="space-y-6 text-center w-full">
                  <div className="flex justify-between items-center bg-[#FBF3F4] px-5 py-2.5 border border-[#F3D9DC] rounded-2xl font-bold text-xs uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <Timer size={16} className={timeLeft <= 10 ? "text-red-500 animate-spin" : "text-[#3C2F2F]"} />
                      <span className={timeLeft <= 10 ? "text-red-500" : ""}>Countdown: {timeLeft}s</span>
                    </div>
                    <div>Snaps Loaded: {uploadedPhotos.length}/{REQUIRED_PHOTOS}</div>
                  </div>

                  <div className="p-6 border-2 border-white rounded-[2rem] text-white shadow-inner flex flex-col justify-center items-center" style={{ backgroundColor: targetColor.hex }}>
                    <span className="bg-black/20 text-white rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase mb-1">Target Hsv Goal</span>
                    <h3 className="text-3xl font-serif font-black drop-shadow-sm">{targetColor.name}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(REQUIRED_PHOTOS)].map((_, i) => (
                      <div key={i} className="aspect-square border-2 border-dashed border-[#E5C7CB] bg-[#FBF3F4] rounded-2xl flex items-center justify-center overflow-hidden relative shadow-sm">
                        {uploadedPhotos[i] ? (
                          <img src={uploadedPhotos[i]} alt="Canvas Thumbnail data" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold opacity-30">#{i + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />
                    <button 
                      onClick={() => fileInputRef.current.click()} 
                      className="w-20 h-20 rounded-full bg-[#EAF2DE] border-2 border-[#CFE0BC] shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform text-[#5B6B4A] mx-auto"
                    >
                      <Camera size={28} className="stroke-[2.5]" />
                    </button>
                    <p className="text-[11px] font-bold opacity-50 mt-3 uppercase tracking-wider">Fire Camera Lens</p>
                  </div>
                </motion.div>
              )}

              {/* REPORT SUMMARY CONTAINER */}
              {gameState === 'won' && analysisReport && (
                <motion.div key="won" className="py-4 space-y-5 text-center">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest opacity-60">Calculated Hunt Rating</span>
                    <h2 className={`text-4xl font-serif font-black mt-1 ${getGradeString(analysisReport.score).c}`}>
                      {getGradeString(analysisReport.score).t}
                    </h2>
                  </div>

                  {/* Matrix Scoring Dashboard */}
                  <div className="bg-[#FBF3F4] border border-[#F3D9DC] rounded-2xl p-5 text-left font-mono text-xs space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-center text-sm font-bold border-b border-dashed border-[#E5C7CB] pb-2 mb-1">
                      <span>OVERALL MATCH SCORE:</span>
                      <span className="text-base font-black bg-[#FBE3B5] px-2.5 py-0.5 rounded border border-[#EAD3A0]">{analysisReport.score}%</span>
                    </div>
                    <div className="flex justify-between"><span>🎯 Color Accuracy (50%):</span><span className="font-bold">{analysisReport.accuracy}%</span></div>
                    <div className="flex justify-between"><span>📦 Subject Coverage (35%):</span><span className="font-bold">{analysisReport.subject}%</span></div>
                    <div className="flex justify-between"><span>🖼️ Scene Coverage (15%):</span><span className="font-bold">{analysisReport.scene}%</span></div>
                    <div className="flex justify-between text-[#3C2F2F]/60"><span>🛡️ Density Confidence:</span><span>{analysisReport.confidence}%</span></div>
                    <p className="text-[11px] font-sans italic opacity-80 pt-2 border-t border-[#E5C7CB] leading-relaxed">
                      <b>Analysis Remark:</b> {analysisReport.explanation}
                    </p>
                  </div>

                  {/* Submission Management Flow */}
                  {!isSaved ? (
                    <div className="space-y-3 max-w-xs mx-auto pt-2">
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter Name for Ledger..."
                        className="w-full bg-white border border-[#E5C7CB] rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[#EE8A93]"
                      />
                      <button 
                        onClick={saveToDatabase}
                        disabled={isSubmitting || !playerName.trim()}
                        className="w-full bg-[#F3A94A] text-white font-black px-6 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md text-xs uppercase tracking-wider disabled:opacity-50"
                      >
                        {isSubmitting ? 'Syncing Ledger logs...' : 'Lock Match to Database ✨'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-xl p-3 max-w-xs mx-auto tracking-wide">
                        🎉 Match logs and downsampled photo data are safely locked into Firestore collections. Show this score board to your counter!
                      </p>
                      <button 
                        onClick={startGame} 
                        className="bg-[#3C2F2F] text-[#F9F6F0] font-bold px-5 py-2.5 rounded-full hover:scale-105 transition-transform text-xs uppercase flex items-center gap-1.5 mx-auto"
                      >
                        <RotateCcw size={12} /> Play Another Run
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TIMEOUT LOSE WINDOW */}
              {gameState === 'lost' && (
                <motion.div key="lost" className="py-8 text-center space-y-6">
                  <span className="text-6xl block">😿🕰️</span>
                  <h2 className="text-3xl font-serif font-black text-red-500">Timer Ran Out!</h2>
                  <p className="text-sm font-medium opacity-70">The downsample clock timed out before all 3 targets logged. Let's try again!</p>
                  <button 
                    onClick={startGame} 
                    className="bg-[#3C2F2F] text-[#F9F6F0] font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform text-xs uppercase flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw size={14} /> Reset Match
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HueHunt;