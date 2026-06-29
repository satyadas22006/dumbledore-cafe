import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Smile } from 'lucide-react';

const Games = ({ onNavigate }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
    className="min-h-screen py-12 px-6"
    style={{ 
      backgroundColor: '#FDFBF7',
      backgroundImage: `linear-gradient(#E8E2D5 1px, transparent 1px), linear-gradient(90deg, #E8E2D5 1px, transparent 1px)`, 
      backgroundSize: '30px 30px'
    }}
  >
    <div className="max-w-4xl mx-auto">
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 mb-8 font-bold hover:opacity-70 text-[#472C20]">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-[#FFFDF9] border-4 border-[#472C20] rounded-[2.5rem] shadow-[10px_10px_0px_0px_rgba(71,44,32,0.2)] p-10 relative">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#F1E9DB] border-2 border-[#472C20] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-500" /> Play Corner <Smile size={14} />
          </div>
          <h1 className="text-5xl font-serif font-black">The Cozy Arcade</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {[
            { id: 'hue-hunt', title: 'Hue Hunt', icon: '📸', desc: 'Find matching colors.' },
            { id: 'icebreakers', title: 'Talk Box', icon: '💬', desc: 'Spark casual chatter.' }
          ].map((game) => (
            <motion.div 
              key={game.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate(game.id)}
              className="bg-white border-4 border-[#472C20] rounded-[2rem] p-8 cursor-pointer shadow-[5px_5px_0px_0px_rgba(71,44,32,0.1)] flex flex-col items-center text-center"
            >
              <div className="text-5xl mb-4">{game.icon}</div>
              <h2 className="text-2xl font-serif font-black">{game.title}</h2>
              <p className="text-sm opacity-70 mt-2">{game.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export default Games;