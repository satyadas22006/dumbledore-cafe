import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { THEMES, FULL_MENU } from '../constants/data';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ReviewWizard = ({ onComplete, onNavigate, setTheme, theme, twin, setTwin }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ rating: '', reason: '', highlights: [], selectedItems: [], dish: '', vibe: '', text: '', name: '' });
  const [soldOutItems, setSoldOutItems] = useState([]);
  
  const wizardThemes = { 1: THEMES.rose, 2: THEMES.navy, 3: THEMES.cream, 4: THEMES.terra, 5: THEMES.forest, 6: THEMES.sand, 7: THEMES.charcoal };
  
  useEffect(() => { 
    setTheme(wizardThemes[step]); 
  }, [step, setTheme]);

  // Fetch live sold-out items from Firebase so customers can't review unavailable dishes
  useEffect(() => {
    const fetchMenuState = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "menuState"));
        if (snap.exists() && snap.data().soldOut) {
          setSoldOutItems(snap.data().soldOut);
        }
      } catch (error) {
        console.error("Error fetching menu state for wizard:", error);
      }
    };
    fetchMenuState();
  }, []);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const handleSelect = (key, val, auto) => { setData(prev => ({ ...prev, [key]: val })); if (auto) setTimeout(nextStep, 500); };
  const toggleArray = (key, val) => setData(prev => ({ ...prev, [key]: prev[key].includes(val) ? prev[key].filter(i => i !== val) : [...prev[key], val] }));

  const handleSubmit = () => {
    const aestheticNames = ["Anonymous Enjoyer", "Midnight Wanderer", "Aesthetic Soul", "Quiet Regular", "Rainy Day Friend"];
    const finalName = data.name.trim() || aestheticNames[Math.floor(Math.random() * aestheticNames.length)];
    onComplete({...data, name: finalName, items: data.selectedItems});
  };

  const anim = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.05 }, transition: { duration: 0.5, ease: "easeInOut" }};

  if (twin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[9999] bg-[#1E293B] text-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl md:text-6xl font-serif mb-6">You're not alone.</h2>
        <p className="text-xl mb-12 opacity-80">We found your Cafe Twin. Someone else who loved the exact same vibe.</p>
        <div className="bg-[#FDFBF7] text-[#1E293B] p-8 rounded-[2rem] max-w-md w-full shadow-2xl rotate-2">
          <p className="font-cursive text-3xl mb-4 leading-tight">"{twin.text || twin.dish}"</p>
          <div className="flex justify-between items-center opacity-70 font-mono text-sm uppercase">
             <span>— {twin.name}</span><span>{twin.vibe}</span>
          </div>
        </div>
        <button onClick={() => { setTwin(null); onNavigate('thank-you', THEMES.cream); }} className="mt-16 px-12 py-4 bg-[#FDFBF7] text-[#1E293B] rounded-full font-bold hover:scale-105 transition-transform text-xl">See your Receipt →</button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-48 min-h-[75vh] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        
        {step === 1 && (
          <motion.div key="1" {...anim} className="space-y-12 text-center">
            <h2 className="text-6xl md:text-8xl font-serif">How was it?</h2>
            <div className="grid grid-cols-2 gap-6">
              {['😍 Amazing', '😊 Good', '😐 Okay', '😕 Missed the mark'].map(opt => (
                <button key={opt} onClick={() => handleSelect('rating', opt, true)} style={{ borderColor: theme.border, backgroundColor: data.rating === opt ? theme.text : 'transparent', color: data.rating === opt ? theme.bg : theme.text }} className="p-8 md:p-12 text-2xl md:text-3xl font-serif rounded-[3rem] border transition-all hover:scale-105">{opt}</button>
              ))}
            </div>
          </motion.div>
        )}
        
        {step === 2 && (
          <motion.div key="2" {...anim} className="space-y-12 text-center">
            <h2 className="text-6xl md:text-8xl font-serif">What brought you?</h2>
            <div className="grid grid-cols-2 gap-6 text-left">
              {['🥟 The Cravings', '❤️ The People', '🌧 Comfort', '👥 Friends/Family'].map(opt => (
                <button key={opt} onClick={() => handleSelect('reason', opt, true)} style={{ borderColor: theme.border, backgroundColor: data.reason === opt ? theme.text : 'transparent', color: data.reason === opt ? theme.bg : theme.text }} className="p-8 text-2xl font-serif rounded-[3rem] border transition-all hover:scale-105">{opt}</button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" {...anim} className="space-y-12">
            <h2 className="text-6xl md:text-8xl font-serif text-center">Your Order.</h2>
            <div className="space-y-8">
              {Object.entries(FULL_MENU).map(([cat, info]) => (
                <div key={cat} className="p-6 rounded-[2rem] border" style={{ borderColor: theme.border }}>
                  <p className="font-serif text-3xl mb-4 italic">{cat}</p>
                  <div className="flex flex-wrap gap-3">
                    {info.items.map(item => {
                      const sel = data.selectedItems.includes(item.n);
                      const isSoldOut = soldOutItems.includes(item.n);
                      
                      if (isSoldOut) {
                        return (
                          <button key={item.n} disabled className="px-6 py-3 rounded-full text-lg border opacity-30 cursor-not-allowed border-current line-through">
                            {item.n}
                          </button>
                        );
                      }
                      
                      return (
                        <button key={item.n} onClick={() => toggleArray('selectedItems', item.n)} style={{ backgroundColor: sel ? theme.text : 'transparent', color: sel ? theme.bg : theme.text, borderColor: theme.text }} className="px-6 py-3 rounded-full text-lg border transition-all hover:scale-105">
                          {item.n} {sel && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <AnimatePresence>
              {data.selectedItems.length > 0 && (
                <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-8 left-0 right-0 flex justify-center z-[100]">
                  <button onClick={nextStep} style={{ backgroundColor: theme.text, color: theme.bg }} className="px-16 py-6 rounded-full shadow-2xl text-2xl font-bold hover:scale-110 transition-transform flex items-center gap-4">
                    Continue ({data.selectedItems.length}) <ArrowRight />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="4" {...anim} className="space-y-12 text-center">
            <h2 className="text-6xl md:text-8xl font-serif">The Showstealer?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.selectedItems.map(item => (
                <button key={item} onClick={() => handleSelect('dish', item, true)} style={{ borderColor: theme.border, backgroundColor: data.dish === item ? theme.text : 'transparent', color: data.dish === item ? theme.bg : theme.text }} className="p-8 text-2xl font-serif rounded-[3rem] border transition-all hover:scale-105">✨ {item}</button>
              ))}
              <button onClick={() => handleSelect('dish', 'Honestly, none', true)} style={{ borderColor: theme.border }} className="p-8 text-2xl font-serif rounded-[3rem] border transition-all hover:scale-105 opacity-70">Honestly, none</button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="5" {...anim} className="space-y-12 text-center">
            <h2 className="text-6xl md:text-8xl font-serif">What stood out?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['Authentic Taste', 'Perfectly Cooked', 'Friendly Service', 'Cozy Vibe', 'Quick Service', 'Needs Improvement'].map(opt => (
                <button key={opt} onClick={() => toggleArray('highlights', opt)} style={{ borderColor: theme.border, backgroundColor: data.highlights.includes(opt) ? theme.text : 'transparent', color: data.highlights.includes(opt) ? theme.bg : theme.text }} className="px-8 py-4 rounded-full text-xl border transition-all hover:scale-105">{opt}</button>
              ))}
            </div>
            <button onClick={nextStep} disabled={data.highlights.length === 0} style={{ backgroundColor: theme.text, color: theme.bg }} className="px-16 py-6 mt-12 rounded-full text-2xl font-bold disabled:opacity-50 hover:scale-105 transition-transform">Continue</button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="6" {...anim} className="space-y-12 text-center">
            <h2 className="text-6xl md:text-8xl font-serif">Choose Your Vibe</h2>
            <div className="grid grid-cols-2 gap-6 text-left">
              {['😍 Loved It', '🥟 Foodie', '🌧 Comfort Seeker', '👥 Family Time', '❤️ Regular Visitor', '✨ First Visit'].map(opt => (
                <button key={opt} onClick={() => handleSelect('vibe', opt, true)} style={{ borderColor: theme.border, backgroundColor: data.vibe === opt ? theme.text : 'transparent', color: data.vibe === opt ? theme.bg : theme.text }} className="p-8 text-2xl font-serif rounded-[3rem] border transition-all hover:scale-105">{opt}</button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="7" {...anim} className="space-y-8 text-center flex flex-col items-center">
            <h2 className="text-6xl font-serif">Leave a Whisper.</h2>
            <p className="opacity-70 font-serif italic text-xl mb-8">Write a note for the wall. (Or just leave it blank).</p>
            
            <div className="cafe-napkin w-full max-w-lg p-10 transform -rotate-2 rounded-sm text-left flex flex-col gap-6">
               <input 
                 type="text" 
                 placeholder="Your Name (Optional)" 
                 className="bg-transparent border-b border-blue-900/20 pb-2 text-xl font-cursive text-blue-900 outline-none placeholder-blue-900/40"
                 value={data.name} 
                 onChange={(e) => setData({...data, name: e.target.value})}
               />
               <textarea 
                 rows="4" 
                 className="w-full bg-transparent outline-none resize-none text-4xl font-cursive leading-tight text-blue-900 placeholder-blue-900/30" 
                 placeholder="The pasta was so good..." 
                 value={data.text} 
                 onChange={(e) => setData({...data, text: e.target.value})} 
               />
            </div>
            
            <button onClick={handleSubmit} style={{ backgroundColor: theme.text, color: theme.bg }} className="px-16 py-6 mt-12 rounded-full text-2xl font-bold hover:scale-105 transition-transform shadow-2xl">
              Pin to Wall
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {step > 1 && <button onClick={prevStep} className="mt-16 mx-auto flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity text-xl"><ArrowLeft /> Go Back</button>}
    </div>
  );
};

export default ReviewWizard;