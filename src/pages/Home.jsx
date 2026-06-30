import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, UtensilsCrossed, Sparkles, BookOpen, Gamepad2, Layers } from 'lucide-react';
import { THEMES } from '../constants/data';

const ScrapbookCard = ({ children, onClick, className }) => (
  <motion.div 
    whileHover={{ rotate: 1, scale: 1.02 }}
    onClick={onClick}
    className={`bg-[#FFFDF9] border-4 border-[#472C20] shadow-[8px_8px_0_#472C20] rounded-3xl p-8 cursor-pointer ${className}`}
  >
    {children}
  </motion.div>
);

const Home = ({ onNavigate, theme }) => (
  <div className="min-h-screen py-20 px-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center mb-16 space-y-6">
        <h1 className="text-7xl font-cursive text-[#472C20]">Dumble' Door.</h1>
        <p className="font-serif italic text-xl opacity-70">"A place remembered through people."</p>
        
        <div className="flex flex-col items-center gap-6 pt-4">
          <button 
            onClick={() => onNavigate('review', THEMES.rose)} 
            className="px-10 py-4 bg-[#FFE08A] border-4 border-[#472C20] rounded-full font-black uppercase tracking-widest shadow-[6px_6px_0_#472C20] hover:translate-y-1 transition-transform"
          >
            Share Your Experience <Heart className="inline ml-2" />
          </button>
        </div>
      </section>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <ScrapbookCard onClick={() => onNavigate('menu', THEMES.forest)}>
          <UtensilsCrossed size={40} className="mb-4" />
          <h3 className="font-bold text-2xl">The Menu</h3>
          <p className="text-sm opacity-60">Authentic recipes.</p>
        </ScrapbookCard>

        <ScrapbookCard onClick={() => onNavigate('chronicle', THEMES.sand)}>
          <BookOpen size={40} className="mb-4" />
          <h3 className="font-bold text-2xl">Chronicle</h3>
          <p className="text-sm opacity-60">Community pulse.</p>
        </ScrapbookCard>

        <ScrapbookCard onClick={() => onNavigate('games', THEMES.cream)}>
          <Gamepad2 size={40} className="mb-4 text-purple-600" />
          <h3 className="font-bold text-2xl">Arcade</h3>
          <p className="text-sm opacity-60">Retro games.</p>
        </ScrapbookCard>

        <ScrapbookCard onClick={() => onNavigate('directory', THEMES.lavender)}>
          <MapPin size={40} className="mb-4" />
          <h3 className="font-bold text-2xl">Visit Us</h3>
          <p className="text-sm opacity-60">Maps & Directions.</p>
        </ScrapbookCard>
      </div>

      {/* Memory Wall Link - Styled as a special pinned note */}
      <motion.div 
        whileHover={{ rotate: -1 }}
        onClick={() => onNavigate('wall', THEMES.navy)}
        className="bg-[#D1EAED] border-4 border-[#472C20] shadow-[8px_8px_0_#472C20] rounded-full p-6 flex items-center justify-center gap-4 cursor-pointer hover:bg-[#bce6eb] transition-colors"
      >
        <Layers size={24} />
        <span className="font-black uppercase tracking-widest">Or browse the full Memory Wall →</span>
      </motion.div>

    </motion.div>
  </div>
);

export default Home;