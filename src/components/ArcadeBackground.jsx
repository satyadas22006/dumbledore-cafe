import React from 'react';

// Blocky "pixel" tree built from stacked squares — reuses the site's
// existing thick brown outline so it reads as part of the same world,
// while the chunky block shapes nod to the pixel-art road-map moodboard.
const PixelTree = ({ className, scale = 1, leafColor = '#8FBF7F', trunkColor = '#8B5E3C' }) => (
  <div className={`absolute pointer-events-none select-none ${className}`} style={{ transform: `scale(${scale})` }}>
    <div className="flex flex-col items-center">
      <div className="w-5 h-5" style={{ backgroundColor: leafColor, border: '2px solid #3C2F2F' }} />
      <div className="w-7 h-5 -mt-1" style={{ backgroundColor: leafColor, border: '2px solid #3C2F2F' }} />
      <div className="w-3 h-4" style={{ backgroundColor: trunkColor, border: '2px solid #3C2F2F' }} />
    </div>
  </div>
);

// Chunky pixel sunflower — a circle "face" ringed by petal dots
const PixelSunflower = ({ className, scale = 1 }) => (
  <div className={`absolute pointer-events-none select-none ${className}`} style={{ transform: `scale(${scale})` }}>
    <div className="relative w-7 h-7">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <div
          key={deg}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: '#FFD866',
            border: '1.5px solid #3C2F2F',
            top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translate(0, -9px) translate(-50%, -50%)`
          }}
        />
      ))}
      <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#8B5E3C', border: '1.5px solid #3C2F2F' }} />
    </div>
    <div className="w-1 h-4 mx-auto" style={{ backgroundColor: '#8FBF7F', border: '1.5px solid #3C2F2F' }} />
  </div>
);

// Sticky note doodle — same visual family as the washi-tape stickies
// already used on Home.jsx, just re-themed with arcade-flavored text.
const StickyNote = ({ className, rotate = -6, bg = '#FFF3B0', text }) => (
  <div
    className={`absolute pointer-events-none select-none bg-white px-3 py-2 shadow-[3px_3px_0_rgba(60,47,47,0.25)] border border-[#3C2F2F]/30 ${className}`}
    style={{ backgroundColor: bg, transform: `rotate(${rotate}deg)`, maxWidth: '130px' }}
  >
    <p className="font-cursive text-[13px] leading-tight text-[#3C2F2F]">{text}</p>
  </div>
);

// Tiny retro CRT monitor line-doodle — a wink to the hand-drawn "old
// computer" moodboard, kept low-opacity so it reads as texture, not focus.
const RetroMonitorDoodle = ({ className }) => (
  <svg viewBox="0 0 80 70" className={`absolute pointer-events-none select-none ${className}`} width="60" height="52">
    <rect x="6" y="6" width="60" height="44" rx="6" fill="none" stroke="#3C2F2F" strokeWidth="2.5" />
    <rect x="13" y="13" width="46" height="28" rx="2" fill="none" stroke="#3C2F2F" strokeWidth="2" />
    <line x1="26" y1="50" x2="46" y2="50" stroke="#3C2F2F" strokeWidth="2.5" />
    <line x1="20" y1="58" x2="52" y2="58" stroke="#3C2F2F" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="59" cy="45" r="1.6" fill="#3C2F2F" />
  </svg>
);

const VARIANTS = {
  hub: {
    wash: 'linear-gradient(180deg, #EAF4E2 0%, #FBF6E9 45%, #FDF9EE 100%)',
    roadStroke: '#B9AE9C',
    showSunflower: true,
    accentSticky: '#FFF3B0'
  },
  huehunt: {
    wash: 'linear-gradient(180deg, #E4F1F4 0%, #F6F8ED 45%, #FDF9EE 100%)',
    roadStroke: '#A9C6CC',
    showSunflower: false,
    accentSticky: '#D8ECEF'
  },
  icebreakers: {
    wash: 'linear-gradient(180deg, #F7E9EF 0%, #FBF3E7 45%, #FDF9EE 100%)',
    roadStroke: '#D9AFC0',
    showSunflower: false,
    accentSticky: '#FBDDE8'
  }
};

/**
 * Shared decorative backdrop for the Arcade hub + both mini-games.
 * ~70-80% of the visual language comes from a pixel/road-trip moodboard
 * (blocky trees, sunflower, a winding dashed path) and a school-locker
 * sticky-note moodboard; ~20-30% ties back to the rest of the site
 * (same brown outline color, same cursive font, same washi-tape/sticker
 * technique already used on Home.jsx) so it still feels like the same café.
 *
 * Purely decorative: fixed, pointer-events-none, negative z-index —
 * cannot intercept clicks or affect layout of the page it sits behind.
 */
const ArcadeBackground = ({ variant = 'hub' }) => {
  const cfg = VARIANTS[variant] || VARIANTS.hub;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ background: cfg.wash }}>
      {/* Winding dashed road, faint — evokes the road-map moodboard */}
      <svg viewBox="0 0 400 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-40">
        <path
          d="M 80 0 C 220 120, 40 260, 200 380 C 340 480, 60 600, 220 720 C 330 800, 120 850, 180 900"
          fill="none"
          stroke={cfg.roadStroke}
          strokeWidth="26"
          strokeLinecap="round"
        />
        <path
          d="M 80 0 C 220 120, 40 260, 200 380 C 340 480, 60 600, 220 720 C 330 800, 120 850, 180 900"
          fill="none"
          stroke="#FFFDF9"
          strokeWidth="3"
          strokeDasharray="10 14"
          strokeLinecap="round"
        />
      </svg>

      {/* Pixel trees */}
      <PixelTree className="top-[8%] left-[6%]" scale={1.1} />
      <PixelTree className="top-[38%] right-[8%]" scale={0.9} leafColor="#A3D08C" />
      <PixelTree className="bottom-[14%] left-[10%]" scale={1} leafColor="#7FB06B" />

      {/* Sunflower only on the hub, keeping the two games a touch calmer */}
      {cfg.showSunflower && (
        <>
          <PixelSunflower className="top-[20%] right-[16%]" scale={1} />
          <PixelSunflower className="bottom-[22%] right-[24%]" scale={0.85} />
        </>
      )}

      {/* Sticky notes, nodding to the locker moodboard */}
      <StickyNote className="top-[12%] right-[6%]" rotate={-8} bg={cfg.accentSticky} text="game time! ✨" />
      <StickyNote className="bottom-[10%] left-[5%]" rotate={5} bg="#FFFDF9" text="pick a table & play~" />

      {/* Tiny retro monitor doodle tucked in a corner */}
      <RetroMonitorDoodle className="top-[46%] left-[3%] opacity-30" />

      {/* Soft sparkle accents, matching the site's existing star doodles */}
      <span className="absolute top-[6%] left-[38%] text-2xl opacity-25">✦</span>
      <span className="absolute bottom-[30%] right-[10%] text-xl opacity-20">⭐</span>
    </div>
  );
};

export default ArcadeBackground;