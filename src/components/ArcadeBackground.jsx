import React from 'react';

// Blocky "pixel" tree built from stacked squares — reuses the site's
// existing thick brown outline so it reads as part of the same world.
const PixelTree = ({ className, scale = 1, leafColor = '#8FAF8A', trunkColor = '#8B5E3C' }) => (
  <div className={`absolute pointer-events-none select-none ${className}`} style={{ transform: `scale(${scale})` }}>
    <div className="flex flex-col items-center">
      <div className="w-5 h-5" style={{ backgroundColor: leafColor, border: '2px solid #3C2F2F' }} />
      <div className="w-7 h-5 -mt-1" style={{ backgroundColor: leafColor, border: '2px solid #3C2F2F' }} />
      <div className="w-3 h-4" style={{ backgroundColor: trunkColor, border: '2px solid #3C2F2F' }} />
    </div>
  </div>
);

// Chunky pixel sunflower
const PixelSunflower = ({ className, scale = 1 }) => (
  <div className={`absolute pointer-events-none select-none ${className}`} style={{ transform: `scale(${scale})` }}>
    <div className="relative w-7 h-7">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <div
          key={deg}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: '#F0B860',
            border: '1.5px solid #3C2F2F',
            top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translate(0, -9px) translate(-50%, -50%)`
          }}
        />
      ))}
      <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#8B5E3C', border: '1.5px solid #3C2F2F' }} />
    </div>
    <div className="w-1 h-4 mx-auto" style={{ backgroundColor: '#8FAF8A', border: '1.5px solid #3C2F2F' }} />
  </div>
);

// Sticky note doodle — same family as the washi-tape stickies on Home.jsx
const StickyNote = ({ className, rotate = -6, bg = '#FFE3C2', text }) => (
  <div
    className={`absolute pointer-events-none select-none bg-white px-3 py-2 shadow-[3px_3px_0_rgba(60,47,47,0.2)] border border-[#3C2F2F]/25 ${className}`}
    style={{ backgroundColor: bg, transform: `rotate(${rotate}deg)`, maxWidth: '130px' }}
  >
    <p className="font-cursive text-[13px] leading-tight text-[#3C2F2F]">{text}</p>
  </div>
);

// Tiny retro CRT monitor line-doodle
const RetroMonitorDoodle = ({ className }) => (
  <svg viewBox="0 0 80 70" className={`absolute pointer-events-none select-none ${className}`} width="60" height="52">
    <rect x="6" y="6" width="60" height="44" rx="6" fill="none" stroke="#3C2F2F" strokeWidth="2.5" />
    <rect x="13" y="13" width="46" height="28" rx="2" fill="none" stroke="#3C2F2F" strokeWidth="2" />
    <line x1="26" y1="50" x2="46" y2="50" stroke="#3C2F2F" strokeWidth="2.5" />
    <line x1="20" y1="58" x2="52" y2="58" stroke="#3C2F2F" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="59" cy="45" r="1.6" fill="#3C2F2F" />
  </svg>
);

// Complementary duo: warm coral/terracotta ↔ cool sage/teal, with cream
// as the shared neutral base. Each variant is ~80% identical structure,
// ~20% tint shift — hub leans warm, huehunt leans teal, icebreakers leans rose.
const VARIANTS = {
  hub: {
    wash: 'linear-gradient(165deg, #FBF3E4 0%, #FCE9DA 55%, #F7DFCF 100%)',
    roadStroke: '#E8B79A',
    showSunflower: true,
    accentSticky: '#FFE3C2'
  },
  huehunt: {
    wash: 'linear-gradient(165deg, #FBF3E4 0%, #E5F1EC 55%, #D9ECE4 100%)',
    roadStroke: '#9FC9BC',
    showSunflower: false,
    accentSticky: '#D3EEE5'
  },
  icebreakers: {
    wash: 'linear-gradient(165deg, #FBF3E4 0%, #FBE3E9 55%, #F7D6DF 100%)',
    roadStroke: '#E3A9BC',
    showSunflower: false,
    accentSticky: '#FAD7E2'
  }
};

/**
 * Shared decorative backdrop for the Arcade hub + both mini-games.
 * Purely decorative: fixed, pointer-events-none, negative z-index —
 * cannot intercept clicks or affect layout of the page it sits behind.
 */
const ArcadeBackground = ({ variant = 'hub' }) => {
  const cfg = VARIANTS[variant] || VARIANTS.hub;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ background: cfg.wash }}>
      <svg viewBox="0 0 400 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-30">
        <path
          d="M 80 0 C 220 120, 40 260, 200 380 C 340 480, 60 600, 220 720 C 330 800, 120 850, 180 900"
          fill="none" stroke={cfg.roadStroke} strokeWidth="26" strokeLinecap="round"
        />
        <path
          d="M 80 0 C 220 120, 40 260, 200 380 C 340 480, 60 600, 220 720 C 330 800, 120 850, 180 900"
          fill="none" stroke="#FFFDF9" strokeWidth="3" strokeDasharray="10 14" strokeLinecap="round"
        />
      </svg>

      <PixelTree className="top-[8%] left-[6%]" scale={1.1} />
      <PixelTree className="top-[38%] right-[8%]" scale={0.9} leafColor="#9FBF97" />
      <PixelTree className="bottom-[14%] left-[10%]" scale={1} leafColor="#7FAE79" />

      {cfg.showSunflower && (
        <>
          <PixelSunflower className="top-[20%] right-[16%]" scale={1} />
          <PixelSunflower className="bottom-[22%] right-[24%]" scale={0.85} />
        </>
      )}

      <StickyNote className="top-[12%] right-[6%]" rotate={-8} bg={cfg.accentSticky} text="game time! ✨" />
      <StickyNote className="bottom-[10%] left-[5%]" rotate={5} bg="#FFFDF9" text="pick a table & play~" />

      <RetroMonitorDoodle className="top-[46%] left-[3%] opacity-25" />

      <span className="absolute top-[6%] left-[38%] text-2xl opacity-20">✦</span>
      <span className="absolute bottom-[30%] right-[10%] text-xl opacity-15">⭐</span>
    </div>
  );
};

export default ArcadeBackground;