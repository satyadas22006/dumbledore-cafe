import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// --- CONTEXT & PERSISTENCE ---
import { AvatarProvider } from './context/AvatarContext';
import GlobalCompanion from './components/GlobalCompanion';
import VinylPlayer from './components/VinylPlayer';

// --- MAIN PAGES ---
import LandingPage from './pages/LandingPage';
import AvatarCreatorPage from './pages/AvatarCreatorPage';
import Home from './pages/Home';
import ReviewWizard from './pages/ReviewWizard';
import ThankYou from './pages/ThankYou';
import MemoryWall from './pages/MemoryWall';
import MenuBoard from './pages/MenuBoard';
import ChronicleBoard from './pages/ChronicleBoard';
import Directory from './pages/Directory';
import OwnerPortal from './pages/OwnerPortal';
import Games from './pages/Games';
import HueHunt from './pages/HueHunt';
import Icebreakers from './pages/IceBreakers';

import { THEMES, DEFAULT_MEMORIES } from './constants/data';

function MainLayoutContent() {
  const [memories, setMemories] = useState([]);
  const [reviewData, setReviewData] = useState(null);
  const [theme, setTheme] = useState(THEMES.cream);
  const [twin, setTwin] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMemories(DEFAULT_MEMORIES);
  }, []);

  const handleSaveMemory = async (newMemory) => {
    const match = memories.find(m => m.vibe === newMemory.vibe || m.dish === newMemory.dish);
    if (match) setTwin(match);
    const memoryToSave = { ...newMemory, createdAt: Date.now() };
    setReviewData(memoryToSave);
    setMemories(prev => [memoryToSave, ...prev]);
  };

  const handleNavigate = (page, newTheme = THEMES.cream) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTheme(newTheme);
    if (page === 'welcome') navigate('/');
    else if (page === 'avatar-studio') navigate('/avatar-studio');
    else if (page === 'home') navigate('/cafe');
    else if (page === 'hue-hunt') navigate('/games/hue-hunt');
    else if (page === 'icebreakers') navigate('/games/icebreakers');
    else navigate(`/${page}`);
  };

  // The landing page and avatar creator do not show the regular cafe navbar
  const isOnboarding = location.pathname === '/' || location.pathname === '/avatar-studio';

  return (
    <motion.div 
      animate={{ 
        backgroundColor: isOnboarding ? '#FDFBF7' : theme.bg, 
        color: isOnboarding ? '#472C20' : theme.text 
      }} 
      transition={{ duration: 0.5 }} 
      className="min-h-screen font-sans selection:bg-white/30 relative"
    >
      {!isOnboarding && <VinylPlayer theme={theme} />}
      
      {/* PERSISTENT FLOATING AVATAR MASCOT */}
      <GlobalCompanion />

      {/* Main Cafe App Header */}
      {!isOnboarding && (
        <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-[100]">
          <div className="cursor-pointer group flex items-center gap-4" onClick={() => handleNavigate('home', THEMES.cream)}>
            <div style={{ backgroundColor: theme.text, color: theme.bg }} className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform">🚪</div>
            <div>
              <h1 className="font-serif font-bold text-2xl tracking-tight">Dumble' Door</h1>
              <p className="font-cursive text-xl opacity-80 -mt-1">Jagda, Rourkela</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {location.pathname !== '/menu' && <button onClick={() => handleNavigate('menu', THEMES.forest)} style={{ borderColor: theme.border }} className="hidden sm:block text-sm font-medium px-5 py-2 rounded-full border hover:opacity-70 transition-opacity">Menu</button>}
            <button onClick={() => handleNavigate('welcome')} className="text-xs font-black border-2 border-current px-4 py-1.5 rounded-full shadow hover:bg-white/10 transition-colors">Log Out</button>
          </div>
        </nav>
      )}

      <main className={isOnboarding ? "" : "pb-32 relative z-10"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Onboarding Entries - Landing page is now perfectly locked at "/" */}
            <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
            <Route path="/avatar-studio" element={<AvatarCreatorPage onNavigate={handleNavigate} />} />

            {/* Core Cafe Internal App Dashboard pages */}
            <Route path="/cafe" element={<Home onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/review" element={<ReviewWizard onComplete={handleSaveMemory} onNavigate={handleNavigate} setTheme={setTheme} theme={theme} twin={twin} setTwin={setTwin} />} />
            <Route path="/thank-you" element={<ThankYou memories={memories} reviewData={reviewData} onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/wall" element={<MemoryWall memories={memories} theme={theme} />} />
            <Route path="/menu" element={<MenuBoard setTheme={setTheme} theme={theme} />} />
            <Route path="/chronicle" element={<ChronicleBoard memories={memories} theme={theme} />} />
            <Route path="/directory" element={<Directory theme={theme} />} />
            <Route path="/owner" element={<OwnerPortal memories={memories} theme={theme} onNavigate={handleNavigate} />} />
            
            {/* Mini Games Cluster */}
            <Route path="/games" element={<Games onNavigate={handleNavigate} />} />
            <Route path="/games/hue-hunt" element={<HueHunt onNavigate={handleNavigate} />} />
            <Route path="/games/icebreakers" element={<Icebreakers onNavigate={handleNavigate} />} />
          </Routes>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <AvatarProvider>
        <MainLayoutContent />
      </AvatarProvider>
    </Router>
  );
}