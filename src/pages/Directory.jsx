import React from 'react';
import { motion } from 'framer-motion';

const Directory = () => {
  // Soft Purple / Lavender grid background
  const gridBackground = {
    backgroundImage: 'linear-gradient(#E9D8FD 1px, transparent 1px), linear-gradient(90deg, #E9D8FD 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    backgroundColor: '#FAF5FF' // Soft lavender base
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="min-h-screen text-[#4A3B32] py-20 px-6 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto text-center mt-10">
        
        {/* Cute Header Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <h1 className="text-7xl md:text-9xl font-serif text-[#4A3B32] mb-4 tracking-tight">
            Visit Us.
          </h1>
          <p className="text-2xl md:text-3xl font-cursive italic opacity-80 mt-6 transform -rotate-2">
            "A place remembered through people."
          </p>
        </motion.div>

        {/* Retro Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 text-left">
          
          {/* Hours Card */}
          <motion.div 
            whileHover={{ y: -4, x: -4, boxShadow: "12px 12px 0px #4A3B32" }}
            className="bg-[#FFFDF8] p-10 rounded-[2.5rem] border-[4px] border-[#4A3B32] shadow-[8px_8px_0px_#4A3B32] transition-all duration-300"
          >
            {/* Cute Pastel Tag */}
            <div className="inline-block bg-[#A7F3D0] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest border-2 border-[#4A3B32] mb-8 shadow-[2px_2px_0px_#4A3B32]">
              Hours
            </div>
            <h3 className="font-serif text-4xl mb-2 text-[#4A3B32]">Tue - Sun</h3>
            <p className="font-mono text-2xl font-bold opacity-80 text-[#4A3B32]">11:30 AM - 9:00 PM</p>
            
            {/* Cute Red Monday Closed Badge */}
            <div className="mt-6 inline-block bg-[#FF9B9B] px-4 py-1.5 rounded-full border-2 border-[#4A3B32] shadow-[3px_3px_0px_#4A3B32] transform rotate-[-3deg] hover:rotate-0 transition-transform duration-300">
              <p className="font-mono font-bold text-[#4A3B32] text-sm uppercase tracking-wider">
                Monday: Closed 💤
              </p>
            </div>
          </motion.div>

          {/* Location Card */}
          <motion.div 
            whileHover={{ y: -4, x: -4, boxShadow: "12px 12px 0px #4A3B32" }}
            className="bg-[#FFFDF8] p-10 rounded-[2.5rem] border-[4px] border-[#4A3B32] shadow-[8px_8px_0px_#4A3B32] transition-all duration-300"
          >
            {/* Cute Pastel Tag */}
            <div className="inline-block bg-[#FFD1DC] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest border-2 border-[#4A3B32] mb-8 shadow-[2px_2px_0px_#4A3B32]">
              Location
            </div>
            <h3 className="font-serif text-4xl mb-2 text-[#4A3B32]">Shop 1 & 2</h3>
            <p className="font-serif text-2xl opacity-90 text-[#4A3B32]">Near M.G.M School, Jagda</p>
          </motion.div>
        </div>

        {/* Map Section with heavy retro styling */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full h-[450px] rounded-[3rem] overflow-hidden border-[4px] border-[#4A3B32] shadow-[10px_10px_0px_#4A3B32] bg-[#FFFDF8]"
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.651765476317!2d84.8812!3d22.2533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a201f0000000001%3A0x8b1b2c3d4e5f6g7h!2sDumble%20Door%20Cafe!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Directory;