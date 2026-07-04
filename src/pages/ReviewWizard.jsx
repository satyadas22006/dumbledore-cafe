import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar } from '../context/AvatarContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { Sparkles, Heart, Coffee, Check, ArrowRight, Search, Camera, RefreshCw } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';

// Mock menu items mapping standard features
const CAFE_MENU = [
  { id: '1', name: 'Mochi Waffles', type: 'food' },
  { id: '2', name: 'Lavender Cold Brew', type: 'drink' },
  { id: '3', name: 'Garlic Butter Dumplings', type: 'food' },
  { id: '4', name: 'Matcha Affogato', type: 'drink', soldOut: true },
  { id: '5', name: 'Cozy Chai Pot', type: 'drink' }
];

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
      const timer = setTimeout(async () => {
        setIsSearchingTwin(false);
        const completeMemory = {
          rating,
          purpose,
          items: selectedItems,
          dish: favoriteDish,
          highlights: selectedHighlights,
          vibe,
          review, 
          name: anonymousName && anonymousName.trim() !== "" ? anonymousName.trim() : 'Anonymous',
          createdAt: Date.now(),
          photo: capturedImage 
        };

        try {
          await addDoc(collection(db, "memories"), completeMemory);
        } catch (error) {
          console.error("Failed to save memory to Firebase:", error);
        }
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

  // We make sure this saves everything and routes instantly!
  const handleFinalizeWizard = () => {
    const finalMemory = {
      rating,
      purpose,
      items: selectedItems,
      dish: favoriteDish,
      highlights: selectedHighlights,
      vibe,
      review, 
      name: anonymousName && anonymousName.trim() !== "" ? anonymousName.trim() : 'Anonymous',
      createdAt: Date.now(),
      photo: capturedImage
    };
    onComplete(finalMemory);
    onNavigate('thank-you'); 
  };

  const pageVariants = {
    initial: { opacity: 0, rotateY: -30, transformOrigin: "left center" },
    animate: { opacity: 1, rotateY: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, rotateY: 30, transformOrigin: "right center", transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen text-[#472C20] py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      <div className="absolute top-4 right-6 text-6xl opacity-20">⭐</div>
      <div className="absolute bottom-6 left-8 text-5xl opacity-15">⭐</div>

      {/* --- PROGRESS BAR --- */}
      {step <= totalSteps && (
        <div className="mb-8 flex flex-col items-center bg-white/60 border-2 border-[#472C20] rounded-2xl px-6 py-3 shadow-[4px_4px_0_#472C20]">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 border-2 border-[#472C20] rounded-b-xl rounded-t-sm flex items-end overflow-hidden bg-white">
              <motion.div 
                className="w-full bg-[#C19A6B]" 
                animate={{ height: `${(step / totalSteps) * 100}%` }} 
                transition={{ duration: 0.4 }}
              />
              <div className="absolute top-1 right-[-6px] w-2 h-4 border-2 border-[#472C20] rounded-r-md"></div>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">
              Filling your memory journal ({step}/{totalSteps})
            </span>
          </div>
        </div>
      )}

      {/* --- MAIN SCRAPBOOK CONTAINER --- */}
      <div className="w-full max-w-2xl min-h-[460px] bg-[#FFFDF9] border-[5px] border-[#472C20] rounded-[32px] shadow-[12px_12px_0_#472C20] p-8 flex flex-col justify-between relative">
        
        {step <= totalSteps && (
          <div className="absolute -top-12 -right-4 flex items-center gap-2 bg-[#FFE08A] border-4 border-[#472C20] rounded-full p-1 shadow-md z-20">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/50">
              <AvatarRenderer config={avatar} size={50} animate={true} />
            </div>
            <div className="bg-white border-2 border-[#472C20] rounded-xl px-2.5 py-1 text-[10px] font-black uppercase max-w-[120px]">
              {step === 1 && "Be honest! 💛"}
              {step === 3 && "Any snacks? 🥞"}
              {step === 7 && "Write nicely! 🖋️"}
              {step === 9 && "Say Cheese! 📸"}
              {step !== 1 && step !== 3 && step !== 7 && step !== 9 && "Looks neat! ✨"}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
            
            {/* --- STEP 1: RATING --- */}
            {step === 1 && (
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-serif font-black">How's your heart leaving the café today?</h2>
                <div className="flex justify-center gap-4 py-4">
                  {[
                    { val: 1, label: '🌧️ Missed' },
                    { val: 2, label: '😐 Okay' },
                    { val: 3, label: '✨ Good' },
                    { val: 4, label: '🎉 Amazing' }
                  ].map(opt => (
                    <motion.button
                      key={opt.val}
                      whileHover={{ scale: 1.05, rotate: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setRating(opt.val); handleNextStep(); }}
                      className={`px-5 py-4 rounded-2xl font-black border-4 border-[#472C20] shadow-[4px_4px_0_#472C20] text-sm ${rating === opt.val ? 'bg-[#FFE08A]' : 'bg-white'}`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* --- STEP 2: PURPOSE --- */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-black text-center mb-4">Why were you visiting us?</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'food', text: '🥟 Food Mission' },
                    { id: 'catch', text: '❤️ Catching Up' },
                    { id: 'escape', text: '🌧️ Escaping Reality' },
                    { id: 'family', text: '👨‍👩‍👧 Family Time' }
                  ].map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.03, rotate: 2 }}
                      onClick={() => { setPurpose(item.id); handleNextStep(); }}
                      className={`cursor-pointer p-5 border-4 border-[#472C20] rounded-2xl shadow-[4px_4px_0_#472C20] transition-colors ${purpose === item.id ? 'bg-[#FFB6C9]' : 'bg-white'}`}
                    >
                      <p className="font-black text-base">{item.text}</p>
                      <p className="text-[10px] uppercase opacity-60 tracking-wider mt-1">Click to stamp onto journal</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* --- STEP 3: DYNAMIC MENU --- */}
            {step === 3 && menuData && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-black text-center">What did you gather at the table?</h2>
                <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3">
                  {Object.entries(menuData).map(([category, info]) => (
                    <details key={category} className="group bg-white border-2 border-[#472C20] rounded-xl shadow-[2px_2px_0_#472C20]">
                      <summary className="cursor-pointer p-4 font-black uppercase tracking-widest text-sm flex justify-between items-center outline-none">
                        {category} 
                        <span className="group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="p-3 border-t-2 border-[#472C20] grid grid-cols-1 gap-2 bg-[#FAF6EE]">
                        {info.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleItemSelection(item.n)}
                            className={`p-3 rounded-lg border-2 border-[#472C20] flex justify-between items-center text-left font-bold text-xs transition-all ${
                              selectedItems.includes(item.n) ? 'bg-[#A8E6CF] shadow-[2px_2px_0_#472C20]' : 'bg-white'
                            }`}
                          >
                            <span>{item.n}</span>
                            {selectedItems.includes(item.n) && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleNextStep} 
                    disabled={selectedItems.length === 0} 
                    className="bg-[#472C20] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl disabled:opacity-40 flex items-center gap-1"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 4: MAIN CHARACTER --- */}
            {step === 4 && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-serif font-black">Which one was the Main Character of your meal?</h2>
                <div className="flex flex-wrap justify-center gap-3 py-2">
                  {selectedItems.map(item => (
                    <motion.button
                      key={item}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => { setFavoriteDish(item); handleNextStep(); }}
                      className={`px-5 py-3 rounded-2xl font-black border-4 border-[#472C20] text-sm transition-all ${favoriteDish === item ? 'bg-[#FFE08A] ring-4 ring-[#FF9F29]/30 scale-105' : 'bg-white'}`}
                    >
                      👑 {item}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* --- STEP 5: STICKERS --- */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-black text-center">Collect your review stickers</h2>
                <div className="flex flex-wrap justify-center gap-3 py-4">
                  {[
                    '⭐ Perfectly Cooked', '☁️ Cozy Alley', '💛 Friendly Staff', 
                    '🍴 Delicious Decor', '✨ Worth Coming Back'
                  ].map(badge => {
                    const active = selectedHighlights.includes(badge);
                    return (
                      <button
                        key={badge}
                        onClick={() => toggleHighlight(badge)}
                        className={`px-4 py-2 rounded-full border-2 border-[#472C20] font-black text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0_#472C20] ${
                          active ? 'bg-[#E9C46A] -rotate-3 translate-y-[-2px] shadow-[4px_4px_0_#472C20]' : 'bg-white'
                        }`}
                      >
                        {badge}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleNextStep} className="bg-[#472C20] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl">
                    Next Page
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 6: MOOD VIBE --- */}
            {step === 6 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-black text-center">Capture today's exact mood vibe</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    '🌧️ Rainy Day Comfort', '✨ Main Character Energy', 
                    '☕ Coffee & Conversations', '🌸 Peaceful Escape'
                  ].map(vOption => (
                    <button
                      key={vOption}
                      onClick={() => { setVibe(vOption); handleNextStep(); }}
                      className={`p-4 border-2 border-[#472C20] rounded-xl font-black text-xs uppercase tracking-wider text-left transition-transform hover:scale-[1.02] ${
                        vibe === vOption ? 'bg-[#A8DADC]' : 'bg-white'
                      }`}
                    >
                      {vOption}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- STEP 7: GUESTBOOK --- */}
            {step === 7 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-black text-center">Leave a little memory whisper...</h2>
                <div className="bg-[#FFFDF9] border-2 border-dashed border-[#472C20]/40 rounded-xl p-4 relative shadow-inner">
                  <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full border-4 border-amber-900/5 pointer-events-none"></div>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="What will you remember about today? Type inside our shared guestbook..."
                    className="w-full h-24 bg-transparent resize-none border-none focus:ring-0 text-sm font-medium outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={anonymousName}
                  onChange={(e) => setAnonymousName(e.target.value)}
                  placeholder="Sign with an anonymous handle (or leave blank for custom name)..."
                  className="w-full bg-white border-2 border-[#472C20] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
                <button
                  onClick={handleNextStep}
                  className="w-full bg-[#FF9F29] text-white border-4 border-[#472C20] rounded-2xl font-black py-3 shadow-[4px_4px_0_#472C20]"
                >
                  Seal Page into Ledger ✨
                </button>
              </div>
            )}

            {/* --- STEP 8: TWIN REVEAL --- */}
            {step === 8 && (
              <div className="text-center py-6 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {isSearchingTwin ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 flex flex-col items-center">
                      <div className="w-16 h-16 border-4 border-dashed border-[#FF9F29] rounded-full animate-spin flex items-center justify-center">
                        <Search className="text-[#472C20]" size={24} />
                      </div>
                      <h3 className="text-xl font-serif font-black mt-2 animate-pulse">Searching for someone who shared your café vibe...</h3>
                    </motion.div>
                  ) : (
                    <motion.div key="reveal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-6">
                      {twin ? (
                        <div className="space-y-4 w-full">
                          <span className="bg-[#FFB6C9] border-2 border-[#472C20] text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">✨ Cafe Twins Found</span>
                          <p className="text-sm font-medium opacity-80">Looks like someone experienced the café almost exactly like you!</p>
                          <div className="bg-white border-4 border-[#472C20] rounded-2xl p-4 shadow-[4px_4px_0_#472C20] relative text-left">
                            <h4 className="font-black text-base">👤 {twin.name || 'Cozy Wanderer'}</h4>
                            <p className="text-xs font-bold text-[#FF9F29] mt-0.5">Vibe: {twin.vibe || 'Food Adventure'}</p>
                            <p className="text-xs mt-2 italic bg-[#FAF6EE] p-2 rounded-lg border border-[#472C20]/20">"{twin.review || 'Loved the space!'}"</p>
                          </div>
                          <div className="flex justify-center text-[#FF9F29] animate-bounce my-1">
                            <Heart size={28} fill="currentColor" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 py-6">
                          <div className="text-5xl">🌱</div>
                          <h3 className="text-xl font-serif font-black">You are a complete original today!</h3>
                          <p className="text-xs font-medium opacity-70 max-w-sm mx-auto">Looks like you're the first to have this exact experience.</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-3 w-full mt-4">
                        <button
                          onClick={handleNextStep}
                          className="w-full bg-[#472C20] text-white border-4 border-[#472C20] rounded-2xl font-black py-3 shadow-[4px_4px_0_#472C20] uppercase text-sm tracking-wider transition-transform active:translate-y-1 active:shadow-none"
                        >
                          Add a Scrapbook Photo 📸
                        </button>
                        
                        {/* THE NEW SKIP BUTTON */}
                        <button
                          onClick={handleFinalizeWizard}
                          className="w-full bg-white text-[#472C20] border-4 border-[#472C20] rounded-2xl font-black py-3 shadow-[4px_4px_0_#472C20] uppercase text-sm tracking-wider transition-transform active:translate-y-1 active:shadow-none"
                        >
                          Skip & Get Receipt 🧾
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* --- STEP 9: RETRO DIGICAM CHASSIS UI --- */}
            {step === 9 && (
              <div className="space-y-6 text-center">
                <div>
                  <h2 className="text-2xl font-serif font-black">Capture your snapshot memory</h2>
                  <p className="text-xs font-medium opacity-70">Say cheese for our retro camera framework!</p>
                </div>

                {/* DIGICAM HOUSING CONTAINER */}
                <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-[#E2DDD3] via-[#D1C9BC] to-[#BCB2A1] border-4 border-[#472C20] rounded-3xl p-4 shadow-[8px_8px_0_#472C20] relative flex flex-col md:flex-row gap-4 items-center">
                  
                  {/* Decorative Camera viewfinders & lens indicators on top bar */}
                  <div className="absolute top-2 left-6 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-radial from-[#555] to-black border-2 border-[#A8A093] shadow-inner" />
                    <div className="flex flex-col gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#472C20]/40" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-28 text-[9px] font-mono font-bold tracking-widest text-[#665B4E] uppercase opacity-60">
                    DIGITAL LENS FX
                  </div>

                  {/* LEFT SIDE: CAMERA LCD DISPLAY SCREEN */}
                  <div className="w-full md:w-[65%] aspect-[4/3] bg-[#EFEFEF] border-4 border-[#5E5345] rounded-xl p-2 relative overflow-hidden shadow-inner flex flex-col justify-between">
                    
                    {/* Brand stamp tracking layout */}
                    <div className="text-[10px] font-serif font-black text-center text-[#472C20]/70 tracking-wider mb-1">
                      ✨ Cafécam Classic ✨
                    </div>

                    {/* Viewfinder Stream / Screen Frame Box */}
                    <div className="w-full flex-1 bg-black rounded-md overflow-hidden border-2 border-[#472C20] relative flex items-center justify-center">
                      {cameraStream && !capturedImage && (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      )}

                      {capturedImage && (
                        <img 
                          src={capturedImage} 
                          alt="Captured memory snapshot" 
                          className="w-full h-full object-cover" 
                        />
                      )}

                      {!cameraStream && !capturedImage && (
                        <div className="p-3 text-center space-y-2">
                          <Camera size={28} className="mx-auto text-gray-400" />
                          <p className="text-[10px] font-bold text-gray-400">LCD Preview Dark</p>
                          <button 
                            onClick={startCamera} 
                            className="bg-[#FF9F29] text-[#472C20] border-2 border-[#472C20] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                          >
                            Power Lens On
                          </button>
                        </div>
                      )}

                      {/* Display Screen Overlay Text */}
                      {(cameraStream || capturedImage) && (
                        <div className="absolute top-1 left-2 text-[9px] text-[#A8E6CF] font-mono tracking-tighter uppercase drop-shadow">
                          ● LIVE REC [AWB]
                        </div>
                      )}
                    </div>

                    {cameraError && (
                      <p className="mt-1 text-[9px] text-red-600 font-bold bg-red-100 p-1 rounded border border-red-300">
                        {cameraError}
                      </p>
                    )}
                  </div>

                  {/* RIGHT SIDE: DIGICAM CONTROL INTERFACE PANEL */}
                  <div className="w-full md:w-[35%] flex flex-col items-center justify-between py-2 space-y-4">
                    {/* Mode Slider / Slits */}
                    <div className="w-16 h-3 bg-[#B0A695] border-2 border-[#472C20] rounded-sm flex justify-around p-0.5">
                      <div className="w-2 h-full bg-[#472C20] rounded-xs" />
                      <div className="w-2 h-full bg-transparent" />
                      <div className="w-2 h-full bg-transparent" />
                    </div>

                    {/* Metallic Circular Navigation Wheel D-Pad */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#FAF8F5] via-[#D8CEBF] to-[#B5A893] border-4 border-[#5E5345] shadow-md relative flex items-center justify-center">
                      <div className="absolute top-1 text-[8px] font-bold text-[#5E5345]">▲</div>
                      <div className="absolute bottom-1 text-[8px] font-bold text-[#5E5345]">▼</div>
                      <div className="absolute left-1 text-[8px] font-bold text-[#5E5345]">◀</div>
                      <div className="absolute right-1 text-[8px] font-bold text-[#5E5345]">▶</div>
                      
                      {/* Center Action Button */}
                      {cameraStream && !capturedImage ? (
                        <button
                          onClick={capturePhoto}
                          className="w-10 h-10 rounded-full bg-[#FF9F29] border-2 border-[#472C20] shadow-inner flex items-center justify-center font-black text-[9px] text-white uppercase active:scale-95 transition-transform"
                          title="Snap Photo"
                        >
                          SNAP
                        </button>
                      ) : (
                        <button
                          onClick={startCamera}
                          className="w-10 h-10 rounded-full bg-[#FFFDF9] border-2 border-[#472C20] shadow-inner flex items-center justify-center font-black text-[9px] text-[#472C20] uppercase active:scale-95 transition-transform"
                          title={capturedImage ? "Retake Photo" : "Turn Camera On"}
                        >
                          {capturedImage ? <RefreshCw size={12} /> : 'SET'}
                        </button>
                      )}
                    </div>

                    {/* Mic Grille + Secondary Menu Buttons */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="grid grid-cols-3 gap-0.5 opacity-50">
                        {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-[#472C20]" />)}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#C4BBAE] border border-[#5E5345] shadow-sm flex items-center justify-center text-[7px] font-bold text-[#5E5345]">MENU</div>
                        <div className="w-4 h-4 rounded-full bg-[#C4BBAE] border border-[#5E5345] shadow-sm flex items-center justify-center text-[7px] font-bold text-[#5E5345]">DISP</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* --- FOOTER OPTIONS --- */}
                <div className="border-t-2 border-dashed border-[#472C20]/20 pt-4 space-y-4">
                  <div className="bg-[#A8E6CF]/30 border-2 border-[#472C20] rounded-xl p-3 text-xs font-bold">
                    ☕ Thanks for spending time with us. Your memory layout is ready for the collection ledger!
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={handleInstagramShare}
                      className="flex-1 bg-gradient-to-r from-[#8a3ab9] via-[#cd486b] to-[#fbad50] text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl border-2 border-[#472C20] flex items-center justify-center gap-2 shadow-[2px_2px_0_#472C20]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                      Share Scrapbook to Stories
                    </button>
                    <button
                      onClick={handleFinalizeWizard}
                      className="bg-[#472C20] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl border-2 border-transparent shadow-[2px_2px_0_#000]"
                    >
                      View Receipt 🧾
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}