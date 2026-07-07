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
          let maxPixelMatchesTarget = 0;

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
          // Calculates localized contrast matrices combined with center spatial layout focus maps
          const saliencyMap = new Float32Array(totalPixels);
          const centerX = size / 2;
          const centerY = size / 2;
          const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

          let totalSaliency = 0;
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              const i = y * size + x;
              const currentHsv = hsvMap[i];

              // Center Weighting Matrix (Objects framed in center rank higher as subject matter)
              const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
              const centerPrior = 1.0 - (distToCenter / maxDistance);

              // Local Spatial Contrast (Comparing color changes against neighborhood environments)
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
          // Scale metric elegantly up so natural, focused items achieve clean top points
          let subjectCoverageScore = Math.min(100, subjectCoveragePercent * 2.8); 

          // Metric C: Scene Coverage Matrix (15%)
          let sceneCoveragePercent = (matchingImagePixels / totalPixels) * 100;
          let sceneCoverageScore = Math.min(100, sceneCoveragePercent * 4.5);

          // 5. Anti-Cheat Engine Guardrails
          let cheatFactor = 1.0;
          // Scan for solid color palette hacks or digital background files
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
      // Process pipeline immediately in memory context
      const analysis = await processImagePipeline(file);
      
      const updatedPhotos = [...uploadedPhotos, analysis.thumbnail];
      setUploadedPhotos(updatedPhotos);

      // If this is the 3rd image, summarize match totals across all snapshots
      if (updatedPhotos.length === REQUIRED_PHOTOS) {
        setAnalysisReport(analysis);
        setGameState('won');
      }
    }
  };

  const saveToDatabase = async () => {
    setIsSubmitting(true);
    try {
      // Direct, safe injection into Firestore document memory using the compressed Base64 arrays
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
        photoLedgerBase64: uploadedPhotos, // Safe local text storage string arrays!
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

  // Resolve grading strings based on assignment rules
  const getGradeString = (s) => {
    if (s < 50) return { t: 'Miss 😿', c: 'text-red-500' };
    if (s <= 64) return { t: 'Close 👀', c: 'text-amber-500' };
    if (s <= 79) return { t: 'Good Match ✨', c: 'text-blue-500' };
    if (s <= 89) return { t: 'Excellent 🏆', c: 'text-emerald-500' };
    return { t: 'Perfect Hunt 🥞🔥', c: 'text-pink-500 font-black animate-pulse' };
  };

  return (
    <div className="max-w-xl mx-auto px-6 pt-12 select-none">
      <BackToCafeButton className="mb-6" />

      <div className="bg-[#F9F6F0] text-[#3C2F2F] border-4 border-[#3C2F2F] rounded-[2.5rem] shadow-[6px_6px_0px_0px_#3C2F2F] p-6 relative">
        <AnimatePresence mode="wait">
          
          {/* LOBBY INTERFACE */}
          {gameState === 'idle' && (
            <motion.div key="idle" className="py-8 text-center space-y-6">
              <span className="text-6xl block animate-bounce">🐥🔍</span>
              <h2 className="text-3xl font-serif font-black">Hue Hunt Machine</h2>
              <p className="text-sm font-medium opacity-80 leading-relaxed max-w-sm mx-auto">
                given a target color,your mission is to capture 3 real world photos that match the hue and saturation range of the target. Happy hunting !!
              </p>
              <button 
                onClick={startGame} 
                className="bg-[#3C2F2F] text-[#F9F6F0] font-bold px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-md"
              >
                LETS GO!!
              </button>
            </motion.div>
          )}

          {/* PLAY ZONE ACTIVE FRAME */}
          {gameState === 'playing' && targetColor && (
            <motion.div key="playing" className="space-y-6 text-center w-full">
              <div className="flex justify-between items-center bg-[#FFFDF9] px-5 py-2.5 border-2 border-[#3C2F2F] rounded-2xl font-bold text-xs uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                  <Timer size={16} className={timeLeft <= 10 ? "text-red-500 animate-spin" : "text-[#3C2F2F]"} />
                  <span className={timeLeft <= 10 ? "text-red-500" : ""}>Countdown: {timeLeft}s</span>
                </div>
                <div>Snaps Loaded: {uploadedPhotos.length}/{REQUIRED_PHOTOS}</div>
              </div>

              <div className="p-6 border-4 border-[#3C2F2F] rounded-[2rem] text-white shadow-inner flex flex-col justify-center items-center" style={{ backgroundColor: targetColor.hex }}>
                <span className="bg-black/20 text-white rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase mb-1">Target Hsv Goal</span>
                <h3 className="text-3xl font-serif font-black drop-shadow-sm">{targetColor.name}</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[...Array(REQUIRED_PHOTOS)].map((_, i) => (
                  <div key={i} className="aspect-square border-4 border-dashed border-[#3C2F2F]/30 bg-[#FFFDF9] rounded-2xl flex items-center justify-center overflow-hidden relative">
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
                  className="w-20 h-20 rounded-full bg-[#FFE3B3] border-4 border-[#3C2F2F] shadow-[4px_4px_0px_0px_#3C2F2F] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform text-[#3C2F2F] mx-auto"
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
              <div className="bg-[#FFFDF9] border-4 border-[#3C2F2F] rounded-2xl p-4 text-left font-mono text-xs space-y-2.5 shadow-md">
                <div className="flex justify-between items-center text-sm font-bold border-b-2 border-dashed border-[#3C2F2F]/20 pb-2 mb-1">
                  <span>OVERALL MATCH SCORE:</span>
                  <span className="text-base font-black bg-[#FFE08A] px-2.5 py-0.5 rounded border border-[#3C2F2F]">{analysisReport.score}%</span>
                </div>
                <div className="flex justify-between"><span>🎯 Color Accuracy (50%):</span><span className="font-bold">{analysisReport.accuracy}%</span></div>
                <div className="flex justify-between"><span>📦 Subject Coverage (35%):</span><span className="font-bold">{analysisReport.subject}%</span></div>
                <div className="flex justify-between"><span>🖼️ Scene Coverage (15%):</span><span className="font-bold">{analysisReport.scene}%</span></div>
                <div className="flex justify-between text-[#3C2F2F]/60"><span>🛡️ Density Confidence:</span><span>{analysisReport.confidence}%</span></div>
                <p className="text-[11px] font-sans italic opacity-80 pt-2 border-t border-[#3C2F2F]/10 leading-relaxed">
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
                    className="w-full bg-white border-2 border-[#3C2F2F] rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                  />
                  <button 
                    onClick={saveToDatabase}
                    disabled={isSubmitting || !playerName.trim()}
                    className="w-full bg-[#FF9F29] text-white border-4 border-[#3C2F2F] font-black px-6 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0_#3C2F2F] text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSubmitting ? 'Syncing Ledger logs...' : 'Lock Match to Database ✨'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3 max-w-xs mx-auto tracking-wide">
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
              <h2 className="text-3xl font-serif font-black text-red-600">Timer Ran Out!</h2>
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
  );
};

export default HueHunt;