import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, UtensilsCrossed, Sparkles, BookOpen } from 'lucide-react';
import { THEMES } from '../constants/data';

const Home = ({ onNavigate, theme }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto px-6 pt-16">
    <section className="text-center space-y-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 border bg-white/5 backdrop-blur-md" style={{ borderColor: theme.border }}>
        <Sparkles size={16} /> Welcome to the Cafe
      </div>
      <h1 className="text-6xl md:text-8xl font-serif leading-tight">
        A Place Remembered <br/> <span className="font-cursive text-7xl md:text-9xl relative -top-4 opacity-90">Through People.</span>
      </h1>
      <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-80 font-serif italic">
        More than just food. This is a digital canvas of our favorite memories, rainy-day cravings, and late-night laughs.
      </p>
      <div className="pt-12 flex flex-col items-center gap-6">
        <button onClick={() => onNavigate('review', THEMES.rose)} style={{ backgroundColor: theme.text, color: theme.bg }} className="px-12 py-6 text-2xl font-serif font-bold rounded-full shadow-2xl hover:scale-105 transition-all btn-pulse flex items-center gap-3">
          Share Your Experience <Heart fill="currentColor" size={24} />
        </button>
        <button onClick={() => onNavigate('wall', THEMES.navy)} className="opacity-70 hover:opacity-100 border-b border-current pb-1 transition-opacity">Or browse the Memory Wall →</button>
      </div>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
      <div style={{ borderColor: theme.border }} className="p-10 rounded-[2rem] border border-opacity-20 flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform cursor-pointer bg-white/5 backdrop-blur-sm" onClick={() => onNavigate('menu', THEMES.forest)}>
        <UtensilsCrossed size={48} />
        <h3 className="font-serif text-3xl">The Menu</h3>
        <p className="opacity-70">Authentic recipes. Made fresh.</p>
      </div>
      <div style={{ borderColor: theme.border }} className="p-10 rounded-[2rem] border border-opacity-20 flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform cursor-pointer bg-white/5 backdrop-blur-sm" onClick={() => onNavigate('chronicle', THEMES.sand)}>
        <BookOpen size={48} />
        <h3 className="font-serif text-3xl">The Chronicle</h3>
        <p className="opacity-70">See the pulse of our community.</p>
      </div>
      <div style={{ borderColor: theme.border }} className="p-10 rounded-[2rem] border border-opacity-20 flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform cursor-pointer bg-white/5 backdrop-blur-sm" onClick={() => onNavigate('directory', THEMES.charcoal)}>
        <MapPin size={48} />
        <h3 className="font-serif text-3xl">Visit Us</h3>
        <p className="opacity-70">Timings, maps, and directions.</p>
      </div>
    </div>
  </motion.div>
);

export default Home;