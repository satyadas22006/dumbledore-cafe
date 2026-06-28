import React from 'react';
import { motion } from 'framer-motion';
import { AVATAR_OPTIONS } from '../context/AvatarContext';

export const AvatarRenderer = ({ config, size = 200, animate = true }) => {
  if (!config) return null;

  const skinColor = AVATAR_OPTIONS.skinTones.find(s => s.id === config.skin)?.value || '#FFF5E1';
  const shape = AVATAR_OPTIONS.faceShapes.find(f => f.id === config.faceShape) || AVATAR_OPTIONS.faceShapes[0];

  // Motion Variants mirroring Cat strawberry.jpg's bouncing weight
  const bobbingAnimation = animate ? {
    animate: {
      y: [0, -6, 0],
      scaleY: [1, 1.02, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  const faceTiltAnimation = animate ? {
    animate: {
      rotate: [-1, 1, -1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  return (
    <motion.svg
      className="select-none pointer-events-none drop-shadow-sm"
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...bobbingAnimation}
    >
      {/* BACKGROUND SHADOW / CHUNKY GLOW LAYER */}
      <circle cx="150" cy="260" r="60" fill="#472C20" opacity="0.12" />

      {/* CLOTHING TOP LAYER RIG */}
      <g id="apparel-top">
        {config.top === 'hoodie' && (
          <path d="M80 230 C 80 180, 220 180, 220 230 L 230 280 L 70 280 Z" fill={config.topColor} stroke="#472C20" strokeWidth="5" strokeLinejoin="round" />
        )}
        {config.top === 'sweater' && (
          <path d="M90 220 Q 150 250 210 220 L 230 280 L 70 280 Z" fill={config.topColor} stroke="#472C20" strokeWidth="5" strokeLinejoin="round" />
        )}
        {config.top === 'shirt' && (
          <>
            <path d="M90 220 C 90 200, 210 200, 210 220 L 225 280 L 75 280 Z" fill="#FFF" stroke="#472C20" strokeWidth="5" />
            <path d="M120 210 L 150 235 L 110 240 Z" fill={config.topColor} stroke="#472C20" strokeWidth="4" />
            <path d="M180 210 L 150 235 L 190 240 Z" fill={config.topColor} stroke="#472C20" strokeWidth="4" />
          </>
        )}
      </g>

      {/* BASE BODY HEAD CONTOUR GROUP */}
      <motion.g id="head-group" {...faceTiltAnimation} className="origin-[150px_180px]">
        
        {/* HAIR REAR BACKDROP ACCENTS */}
        {config.hairStyle === 'buns' && (
          <>
            <circle cx="70" cy="90" r="30" fill={config.hairColor} stroke="#472C20" strokeWidth="5"/>
            <circle cx="230" cy="90" r="30" fill={config.hairColor} stroke="#472C20" strokeWidth="5"/>
          </>
        )}

        {/* SKIN BASE FACE */}
        <ellipse cx="150" cy="150" rx={shape.rx} ry={shape.ry} fill={skinColor} stroke="#472C20" strokeWidth="5" />

        {/* CHEEK BLUSH (Inspired by 9359111722535664.jpg) */}
        <circle cx="95" cy="165" r="12" fill="#FFB6C9" opacity="0.6" />
        <circle cx="205" cy="165" r="12" fill="#FFB6C9" opacity="0.6" />

        {/* HAIR FOREGROUND ELEMENTS */}
        <g id="hair-front" fill={config.hairColor}>
          {config.hairStyle === 'fluffy' && (
            <path d="M60 120 C 60 50, 240 50, 240 120 C 210 100, 180 110, 150 95 C 120 110, 90 100, 60 120 Z" stroke="#472C20" strokeWidth="5" strokeLinejoin="round" />
          )}
          {config.hairStyle === 'curls' && (
            <path d="M55 130 Q 40 90 70 80 Q 100 70 120 90 Q 150 60 180 90 Q 210 70 230 80 Q 260 90 245 130 Z" stroke="#472C20" strokeWidth="5" strokeLinejoin="round" />
          )}
          {config.hairStyle === 'spiky' && (
            <path d="M65 115 L 100 70 L 130 90 L 150 50 L 170 90 L 200 70 L 235 115 Z" stroke="#472C20" strokeWidth="5" strokeLinejoin="round" />
          )}
        </g>

        {/* FACIAL EXPRESSIONS LAYER */}
        <g id="expression-features" stroke="#472C20" strokeWidth="5" strokeLinecap="round" fill="none">
          {config.expression === 'happy' && (
            <>
              <path d="M100 145 Q 110 135 120 145" />
              <path d="M180 145 Q 190 135 200 145" />
              <path d="M140 170 Q 150 185 160 170" fill="#472C20" />
            </>
          )}
          {config.expression === 'laughing' && (
            <>
              <path d="M95 140 L 115 150 L 95 160" />
              <path d="M205 140 L 185 150 L 205 160" />
              <path d="M135 165 Q 150 195 165 165 Z" fill="#FFB6C9" />
            </>
          )}
          {config.expression === 'surprised' && (
            <>
              <circle cx="110" cy="145" r="4" fill="#472C20" />
              <circle cx="190" cy="145" r="4" fill="#472C20" />
              <circle cx="150" cy="175" r="8" fill="none" />
            </>
          )}
          {config.expression === 'sleepy' && (
            <>
              <path d="M95 150 L 115 150" strokeWidth="4" />
              <path d="M185 150 L 205 150" strokeWidth="4" />
              <path d="M142 168 Q 150 172 158 168" />
            </>
          )}
          {config.expression === 'grumpy' && (
            <>
              <path d="M95 140 L 115 146" />
              <path d="M205 140 L 185 146" />
              <circle cx="110" cy="152" r="4" fill="#472C20" />
              <circle cx="190" cy="152" r="4" fill="#472C20" />
              <path d="M140 175 Q 150 165 160 175" />
            </>
          )}
        </g>

        {/* GLASSES ACCESSORY RIG */}
        {config.glasses !== 'none' && (
          <g id="eyewear" stroke="#472C20" strokeWidth="5" fill="none">
            {config.glasses === 'round' && (
              <>
                <circle cx="110" cy="150" r="22" />
                <circle cx="190" cy="150" r="22" />
                <path d="M132 150 L 168 150" />
              </>
            )}
            {config.glasses === 'square' && (
              <>
                <rect x="88" y="130" width="40" height="35" rx="6" />
                <rect x="172" y="130" width="40" height="35" rx="6" />
                <path d="M128 148 L 172 148" />
              </>
            )}
          </g>
        )}

        {/* COZY HEAD GEAR OR HAT OVERLAYS */}
        {config.accessory === 'duckHat' && (
          <g id="duck-cowl">
            {/* Soft duck cap shell based on 6755468183143554_2.jpg architecture */}
            <path d="M70 90 C 70 30, 230 30, 230 90 Z" fill="#FFE08A" stroke="#472C20" strokeWidth="5" />
            <ellipse cx="150" cy="55" rx="14" ry="8" fill="#FF9F29" stroke="#472C20" strokeWidth="4" />
            <circle cx="125" cy="55" r="3" fill="#472C20" />
            <circle cx="175" cy="55" r="3" fill="#472C20" />
          </g>
        )}
        {config.accessory === 'strawberryHat' && (
          <g id="strawberry-cowl">
            <path d="M70 95 C 70 25, 230 25, 230 95 Z" fill="#D87585" stroke="#472C20" strokeWidth="5" />
            {/* Green Leaf Stem Crowns directly pointing out like Cat strawberry.jpg */}
            <path d="M150 25 L 150 10 M130 30 L 150 25 L 170 30 L 150 15 Z" fill="#A8E6CF" stroke="#472C20" strokeWidth="4" />
            <circle cx="110" cy="60" r="2" fill="#FFF7D8" />
            <circle cx="190" cy="60" r="2" fill="#FFF7D8" />
            <circle cx="150" cy="75" r="2" fill="#FFF7D8" />
          </g>
        )}
        {config.accessory === 'sprout' && (
          <path d="M150 70 Q 140 50 130 52 Q 145 42 150 60 Q 160 45 175 48 Q 155 52 150 70" fill="#A8E6CF" stroke="#472C20" strokeWidth="4" />
        )}
      </motion.g>

      {/* COMPANION ITEMS (HELD STUFF ITEMS ROW) */}
      {config.heldItem !== 'none' && (
        <g id="held-item-group" transform="translate(190, 200)">
          {config.heldItem === 'coffee' && (
            <g>
              <rect x="10" y="20" width="35" height="40" rx="10" fill="#FFF7D8" stroke="#472C20" strokeWidth="4" />
              <path d="M45 30 C 53 30, 53 45, 45 45" stroke="#472C20" strokeWidth="4" fill="none" />
              <text x="18" y="46" fontSize="16">☕</text>
            </g>
          )}
          {config.heldItem === 'knife' && (
            <g transform="rotate(-15)">
              <path d="M5 25 L 35 25 L 30 10 L 5 10 Z" fill="#D3D3D3" stroke="#472C20" strokeWidth="4" />
              <rect x="35" y="13" width="12" height="10" rx="2" fill="#FFB6C9" stroke="#472C20" strokeWidth="4" />
            </g>
          )}
          {config.heldItem === 'flower' && (
            <g transform="translate(20,20)">
              <circle cx="10" cy="10" r="14" fill="#FFB6C9" stroke="#472C20" strokeWidth="3" />
              <circle cx="10" cy="10" r="6" fill="#FFE08A" stroke="#472C20" strokeWidth="3" />
            </g>
          )}
        </g>
      )}
    </motion.svg>
  );
};