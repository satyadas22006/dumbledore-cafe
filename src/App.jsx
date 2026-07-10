// src/App.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';

// --- CONTEXT & PERSISTENCE ---
import { AvatarProvider } from './context/AvatarContext';
import { CartProvider } from './context/CartContext'; 
import GlobalCompanion from './components/GlobalCompanion';
import VinylPlayer from './components/VinylPlayer';

// --- ANALYTICS ---
import { db } from './firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

// --- MAIN PAGES ---
import LandingPage from './pages/LandingPage';
import AvatarCreatorPage from './pages/AvatarCreatorPage';
import Home from './pages/Home';
import ReviewWizard from './pages/ReviewWizard';
import ThankYou from './pages/ThankYou';
import MemoryWall from './pages/MemoryWall';
import MenuBoard from './pages/MenuBoard';
import ChronicleBoard from './pages/ChronicleBoard';
import GameLeaderboardBoard from './pages/GameLeaderboardBoard';
import Directory from './pages/Directory';
import OwnerPortal from './pages/OwnerPortal';
import Games from './pages/Games';
import HueHunt from './pages/HueHunt';
import Icebreakers from './pages/IceBreakers';
import GlobalGrid from './components/GlobalGrid';
import { THEMES, DEFAULT_MEMORIES } from './constants/data';

// --- VISIT TRACKING HELPER ---
// Logs one visit per browser tab session (sessionStorage-gated so page
// navigation within the SPA doesn't inflate the count) to two docs:
//   analytics/summary        -> all-time total
//   analytics/daily_YYYY-MM-DD -> per-day breakdown for the trend chart
const trackSiteVisit = async () => {
  try {
    if (sessionStorage.getItem('dumble_visit_tracked')) return;
    sessionStorage.setItem('dumble_visit_tracked', '1');

    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    await Promise.all([
      setDoc(doc(db, 'analytics', 'summary'), { totalVisits: increment(1) }, { merge: true }),
      setDoc(doc(db, 'analytics', `daily_${todayKey}`), { date: todayKey, visits: increment(1) }, { merge: true })
    ]);
  } catch (err) {
    // Never let analytics failures affect the actual site experience
    console.error('Visit tracking failed:', err);
  }
};

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

  // Fire once per session, on first mount of the app shell
  useEffect(() => {
    trackSiteVisit();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/cafe' || path === '/games' || path === '/') setTheme(THEMES.cream);
    else if (path === '/menu') setTheme(THEMES.forest);
    else if (path === '/chronicle') setTheme({ bg: '#FFF0F5', text: '#7A5C58', border: 'transparent' });
    else if (path === '/wall') setTheme(THEMES.navy);
    else if (path === '/game-leaderboard') setTheme({ bg: '#C5B4E3', text: '#472C20', border: 'transparent' });
    else if (path === '/directory') setTheme({ bg: '#D8C7F5', text: '#472C20', border: 'transparent' });
    else if (path === '/review') setTheme(THEMES.rose);
  }, [location.pathname]);

  const handleSaveMemory = async (newMemory) => {
    const match = memories.find(m => m.vibe === newMemory.vibe || m.dish === newMemory.dish);
    if (match) setTwin(match);
    const memoryToSave = { ...newMemory, createdAt: Date.now() };
    setReviewData(memoryToSave);
  };

  const handleNavigate = (page, newTheme = THEMES.cream) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTheme(newTheme);
    
    if (page === 'welcome') navigate('/');
    else if (page === 'avatar-studio') navigate('/avatar-studio');
    else if (page === 'home') navigate('/cafe');
    else if (page === 'hue-hunt') navigate('/games/hue-hunt');
    else if (page === 'icebreakers') navigate('/games/icebreakers');
    else if (page === 'memory-wall' || page === 'wall') navigate('/wall');
    else if (page === 'chronicles' || page === 'chronicle') {
      navigate('/chronicle', { state: { theme: THEMES.sand } });
    } 
    else navigate(`/${page}`);
  };

  const isOnboarding = location.pathname === '/' || location.pathname === '/avatar-studio';
  const isCafeRoute = location.pathname === '/cafe';

  // Pages that should render without the global top nav bar
  const hideGlobalNav = isOnboarding || ['/review', '/games/icebreakers', '/games/hue-hunt'].includes(location.pathname);

  const layoutBackgroundStyle = isCafeRoute 
    ? {
        backgroundColor: '#FDFBF7',
        backgroundImage: `
          linear-gradient(transparent 95%, #E8E2D5 95%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")
        `,
        backgroundSize: '100% 32px, 150px 150px',
      }
    : {};

  return (
    <motion.div 
      style={{
        // NOTE: background/color used to be driven by framer-motion's
        // `animate` prop, which interpolates asynchronously. On a fresh
        // client-side nav the very first paint could land before that
        // interpolation kicked in, briefly showing the old (often
        // cream/white) color instead of the new theme. Setting it
        // directly via `style` makes it correct on every single render,
        // with a plain CSS transition standing in for the fade.
        ...layoutBackgroundStyle,
        backgroundColor: isOnboarding ? '#FDFBF7' : theme.bg,
        color: isOnboarding ? '#472C20' : theme.text,
        transition: 'background-color 0.5s ease, color 0.5s ease'
      }}
      className="min-h-screen font-sans selection:bg-white/30 relative overflow-x-hidden select-none flex flex-col items-stretch"
    >
      {!isCafeRoute && <GlobalGrid />}
      {!isOnboarding && <VinylPlayer theme={theme} />}
      <GlobalCompanion />

      {!hideGlobalNav && (
        <nav className="w-full px-6 pt-6 pb-2 flex justify-between items-center relative z-[100] bg-transparent transition-colors duration-500">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div className="cursor-pointer group flex items-center gap-4" onClick={() => handleNavigate('home', THEMES.cream)}>
              <div style={{ backgroundColor: theme.text, color: theme.bg }} className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md group-hover:rotate-12 transition-transform border border-transparent">
                🚪
              </div>
              <div>
                <h1 className="font-serif font-black text-xl tracking-tight leading-none" style={{ color: theme.text }}>Dumble' Door</h1>
                <p className="font-cursive text-sm opacity-80 mt-0.5" style={{ color: theme.text }}>Jagda, Rourkela</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              {location.pathname !== '/menu' && (
                <button onClick={() => handleNavigate('menu', THEMES.forest)} style={{ borderColor: theme.text, color: theme.text }} className="bg-white/80 backdrop-blur-sm border-2 px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-[2px_2px_0_currentColor] hover:translate-y-[1px] hover:shadow-[1px_1px_0_currentColor] transition-all">
                  Menu
                </button>
              )}
              <button onClick={() => handleNavigate('welcome')} style={{ borderColor: theme.text, color: theme.text }} className="bg-white/80 backdrop-blur-sm border-2 px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-[2px_2px_0_currentColor] hover:translate-y-[1px] hover:shadow-[1px_1px_0_currentColor] transition-all">
                Log Out
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 w-full relative z-10 flex flex-col items-stretch">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
            <Route path="/avatar-studio" element={<AvatarCreatorPage onNavigate={handleNavigate} />} />
            <Route path="/cafe" element={<Home onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/review" element={<ReviewWizard onComplete={handleSaveMemory} onNavigate={handleNavigate} setTheme={setTheme} theme={theme} twin={twin} setTwin={setTwin} />} />
            <Route path="/thank-you" element={<ThankYou memories={memories} reviewData={reviewData} onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/wall" element={<MemoryWall memories={memories} theme={theme} />} />
            <Route path="/menu" element={<MenuBoard setTheme={setTheme} theme={theme} />} />
            <Route path="/chronicle" element={<ChronicleBoard reviewData={reviewData} />} />
            <Route path="/game-leaderboard" element={<GameLeaderboardBoard />} />
            <Route path="/directory" element={<Directory theme={theme} onNavigate={handleNavigate} />} />
            <Route path="/owner" element={<ProtectedRoute><OwnerPortal /></ProtectedRoute>} />
            <Route path="/admin-login" element={<AdminLogin />} />
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
      <CartProvider>
        <AvatarProvider>
          <MainLayoutContent />
        </AvatarProvider>
      </CartProvider>
    </Router>
  );
}