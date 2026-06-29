import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import { AvatarProvider } from './context/AvatarContext';
import GlobalCompanion from './components/GlobalCompanion';
import VinylPlayer from './components/VinylPlayer';

// Pages
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

const PlumHeader = () => (
  <header className="w-full bg-[#5d3a5a] py-6 px-8 flex items-center justify-between text-[#FFF3E5] shrink-0 border-b-2 border-[#472C20]">
    <div className="flex items-center gap-4">
      <span className="text-3xl">🐱</span>
      <h2 className="font-serif font-black tracking-widest uppercase text-xl">Dumble' Door</h2>
    </div>
    <div className="text-3xl">🧸</div>
  </header>
);

const PlumFooter = () => (
  <footer className="w-full bg-[#5d3a5a] py-8 text-center text-[#FFF3E5] shrink-0 border-t-2 border-[#472C20]">
    <div className="flex justify-center gap-8 text-3xl opacity-80"><span>🎐</span><span>📷</span><span>🌸</span></div>
  </footer>
);

function MainLayoutContent() {
  const [memories, setMemories] = useState([]);
  const [reviewData, setReviewData] = useState(null);
  const [theme, setTheme] = useState(THEMES.cream);
  const [twin, setTwin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setMemories(DEFAULT_MEMORIES); }, []);

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
    else navigate(`/${page}`);
  };

  const isOnboarding = location.pathname === '/' || location.pathname === '/avatar-studio';

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ backgroundColor: isOnboarding ? '#FDFBF7' : theme.bg, color: isOnboarding ? '#472C20' : theme.text }}>
      {!isOnboarding && <VinylPlayer theme={theme} />}
      <GlobalCompanion />
      {!isOnboarding && <PlumHeader />}
      
      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
            <Route path="/avatar-studio" element={<AvatarCreatorPage onNavigate={handleNavigate} />} />
            <Route path="/cafe" element={<Home onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/review" element={<ReviewWizard onComplete={handleSaveMemory} onNavigate={handleNavigate} setTheme={setTheme} theme={theme} twin={twin} setTwin={setTwin} />} />
            <Route path="/thank-you" element={<ThankYou memories={memories} reviewData={reviewData} onNavigate={handleNavigate} theme={theme} />} />
            <Route path="/wall" element={<MemoryWall memories={memories} theme={theme} />} />
            <Route path="/menu" element={<MenuBoard setTheme={setTheme} theme={theme} />} />
            <Route path="/chronicle" element={<ChronicleBoard memories={memories} theme={theme} />} />
            <Route path="/directory" element={<Directory theme={theme} />} />
            <Route path="/owner" element={<ProtectedRoute><OwnerPortal /></ProtectedRoute>} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/games" element={<Games onNavigate={handleNavigate} />} />
            <Route path="/games/hue-hunt" element={<HueHunt onNavigate={handleNavigate} />} />
            <Route path="/games/icebreakers" element={<Icebreakers onNavigate={handleNavigate} />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isOnboarding && <PlumFooter />}
    </div>
  );
}

export default function App() {
  return <Router><AvatarProvider><MainLayoutContent /></AvatarProvider></Router>;
}