import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// --- FIREBASE IMPORTS ---
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

import { THEMES, DEFAULT_MEMORIES } from './constants/data';
import VinylPlayer from './components/VinylPlayer';
import Home from './pages/Home';
import ReviewWizard from './pages/ReviewWizard';
import ThankYou from './pages/ThankYou';
import MemoryWall from './pages/MemoryWall';
import MenuBoard from './pages/MenuBoard';
import ChronicleBoard from './pages/ChronicleBoard';
import Directory from './pages/Directory';
import OwnerPortal from './pages/OwnerPortal';

function MainLayout() {
  const [memories, setMemories] = useState([]);
  const [reviewData, setReviewData] = useState(null);
  const [theme, setTheme] = useState(THEMES.cream);
  const [twin, setTwin] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // 🔴 NEW: Fetching LIVE data from Firebase
  useEffect(() => {
    const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
    
    // onSnapshot listens to the database in real-time. If someone adds a memory, the wall updates instantly!
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liveData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (liveData.length > 0) {
        setMemories(liveData);
      } else {
        setMemories(DEFAULT_MEMORIES); // Shows the default aesthetic memories if the database is empty
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔴 NEW: Saving data directly to Firebase
  const handleSaveMemory = async (newMemory) => {
    // Vibe Twin Matcher
    const match = memories.find(m => m.vibe === newMemory.vibe || m.dish === newMemory.dish);
    if (match) setTwin(match);

    const memoryToSave = { ...newMemory, createdAt: Date.now() };
    setReviewData(memoryToSave);

    try {
      // Send it to the cloud!
      await addDoc(collection(db, "memories"), memoryToSave);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleNavigate = (page, newTheme = THEMES.cream) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTheme(newTheme);
    const route = page === 'home' ? '/' : `/${page}`;
    navigate(route);
  };

  return (
    <motion.div animate={{ backgroundColor: theme.bg, color: theme.text }} transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }} className="min-h-screen font-sans selection:bg-white/30 transition-colors">
      <VinylPlayer theme={theme} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {memories.slice(0, 5).map((m, i) => (
          <motion.div key={i} animate={{ y: [0, -30, 0], x: [0, 15, 0] }} transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }} 
            className={`absolute blur-[2px] opacity-20 border border-current p-6 rounded-3xl shadow-xl ${i===0?'top-20 left-10':i===1?'top-1/3 right-10':i===2?'bottom-40 left-1/4':i===3?'top-1/2 left-4':'bottom-20 right-1/3'}`}>
            <p className="font-cursive text-2xl">{m.vibe}</p>
          </motion.div>
        ))}
      </div>
      
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-[100]">
        <div className="cursor-pointer group flex items-center gap-4" onClick={() => handleNavigate('home', THEMES.cream)}>
          <div style={{ backgroundColor: theme.text, color: theme.bg }} className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform">🚪</div>
          <div>
            <h1 className="font-serif font-bold text-2xl tracking-tight">Dumble' Door</h1>
            <p className="font-cursive text-xl opacity-80 -mt-1">Jagda, Rourkela</p>
          </div>
        </div>
        
        <div className="flex gap-2 md:gap-4 items-center">
          {location.pathname !== '/menu' && <button onClick={() => handleNavigate('menu', THEMES.forest)} style={{ borderColor: theme.border }} className="hidden sm:block text-sm font-medium px-5 py-2 rounded-full border hover:opacity-70 transition-opacity">Menu</button>}
          {location.pathname !== '/chronicle' && <button onClick={() => handleNavigate('chronicle', THEMES.sand)} style={{ borderColor: theme.border }} className="hidden sm:block text-sm font-medium px-5 py-2 rounded-full border hover:opacity-70 transition-opacity">The Chronicle</button>}
          {location.pathname !== '/directory' && <button onClick={() => handleNavigate('directory', THEMES.charcoal)} style={{ backgroundColor: theme.text, color: theme.bg }} className="text-sm font-bold px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">Visit Us</button>}
        </div>
      </nav>

      <main className="pb-32 relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/review" element={<ReviewWizard onComplete={handleSaveMemory} onNavigate={handleNavigate} setTheme={setTheme} theme={theme} twin={twin} setTwin={setTwin} />} />
            <Route path="/thank-you" element={<ThankYou memories={memories} reviewData={reviewData} onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/wall" element={<MemoryWall memories={memories} theme={theme} />} />
            <Route path="/menu" element={<MenuBoard setTheme={setTheme} theme={theme} />} />
            <Route path="/chronicle" element={<ChronicleBoard memories={memories} theme={theme} />} />
            <Route path="/directory" element={<Directory theme={theme} />} />
            <Route path="/owner" element={<OwnerPortal memories={memories} theme={theme} onNavigate={handleNavigate} />} />
          </Routes>
        </AnimatePresence>
      </main>

      {location.pathname === '/' && (
        <div className="absolute bottom-4 right-6 z-[100] opacity-30 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-2 text-xs font-mono uppercase" onClick={() => handleNavigate('owner', THEMES.charcoal)}>
          <Lock size={12}/> Owner Portal
        </div>
      )}
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}