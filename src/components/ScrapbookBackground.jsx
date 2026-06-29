import React from 'react';

const ScrapbookBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 1. THE FULL-SCREEN GRAPH PAPER GRID */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'linear-gradient(currentColor 1.5px, transparent 1.5px), linear-gradient(90deg, currentColor 1.5px, transparent 1.5px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* --- CUTE HAND-DRAWN STICKERS --- */}
      
      {/* Top Left Cluster */}
      <div className="absolute top-10 left-10 opacity-80">
        <svg width="60" height="60" viewBox="0 0 100 100" className="transform -rotate-12 drop-shadow-md text-[#472C20]">
          <path d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z" fill="#FFFDF9" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
        <svg width="35" height="35" viewBox="0 0 100 100" className="transform rotate-12 drop-shadow-sm text-[#472C20] absolute top-12 left-12">
          <path d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z" fill="#FFB6C9" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Top Right Cluster */}
      <div className="absolute top-16 right-12 opacity-80">
        <svg width="45" height="45" viewBox="0 0 100 100" className="transform rotate-45 drop-shadow-md text-[#472C20]">
          <path d="M50 0 C50 40 60 50 100 50 C60 50 50 60 50 100 C50 60 40 50 0 50 C40 50 50 40 50 0 Z" fill="#FFE08A" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Middle Left (Scattered Sparkle) */}
      <div className="absolute top-1/2 left-8 opacity-60">
        <svg width="30" height="30" viewBox="0 0 100 100" className="transform -rotate-12 drop-shadow-sm text-[#472C20]">
          <path d="M50 0 C50 40 60 50 100 50 C60 50 50 60 50 100 C50 60 40 50 0 50 C40 50 50 40 50 0 Z" fill="#FFFDF9" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Middle Right (Small Star) */}
      <div className="absolute top-1/3 right-10 opacity-50">
        <svg width="25" height="25" viewBox="0 0 100 100" className="transform rotate-12 text-[#472C20]">
          <path d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z" fill="#D4EBFF" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Bottom Left Cluster */}
      <div className="absolute bottom-20 left-12 opacity-80">
        <svg width="50" height="50" viewBox="0 0 100 100" className="transform -rotate-6 drop-shadow-md text-[#472C20]">
          <path d="M50 0 C50 40 60 50 100 50 C60 50 50 60 50 100 C50 60 40 50 0 50 C40 50 50 40 50 0 Z" fill="#A8E6CF" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Bottom Right Cluster (Behind Mascot) */}
      <div className="absolute bottom-16 right-24 opacity-80">
        <svg width="55" height="55" viewBox="0 0 100 100" className="transform rotate-12 drop-shadow-md text-[#472C20]">
          <path d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z" fill="#FFFDF9" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
        <svg width="25" height="25" viewBox="0 0 100 100" className="transform -rotate-12 drop-shadow-sm text-[#472C20] absolute -top-4 -right-4">
          <path d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z" fill="#E5D3FF" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default ScrapbookBackground;