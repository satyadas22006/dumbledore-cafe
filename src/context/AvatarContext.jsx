import React, { createContext, useContext, useState, useEffect } from 'react';

const AvatarContext = createContext();

export const AVATAR_OPTIONS = {
  skinTones: [
    { id: 'cream', value: '#FFF5E1', name: 'Cream' },
    { id: 'peach', value: '#FFD8B3', name: 'Peach' },
    { id: 'honey', value: '#E6A15C', name: 'Honey' },
    { id: 'cocoa', value: '#8D5B4C', name: 'Cocoa' }
  ],
  faceShapes: [
    { id: 'round', rx: '110', ry: '100', name: 'Round Mochi' },
    { id: 'oval', rx: '95', ry: '110', name: 'Tall Melon' }
  ],
  hairStyles: [
    { id: 'none', name: 'Smooth/Bald' },
    { id: 'fluffy', name: 'Fluffy Bangs' },
    { id: 'curls', name: 'Cozy Curls' },
    { id: 'spiky', name: 'Spiky Tuft' },
    { id: 'buns', name: 'Mochi Buns' }
  ],
  hairColors: [
    { id: 'brown', value: '#472C20' },
    { id: 'berry', value: '#D87585' },
    { id: 'gold', value: '#FFE08A' },
    { id: 'mint', value: '#A8E6CF' }
  ],
  expressions: [
    { id: 'happy', name: 'Happy Beam' },
    { id: 'laughing', name: 'Big Laugh' },
    { id: 'sleepy', name: 'Sleepy Blink' },
    { id: 'grumpy', name: 'Mild Grump' }
  ],
  glasses: [
    { id: 'none', name: 'No Glasses' },
    { id: 'round', name: 'Classic Round' }
  ],
  accessories: [
    { id: 'none', name: 'No Hat' },
    { id: 'duckHat', name: 'Crime Duck Cap 🐥' },
    { id: 'strawberryHat', name: 'Berry Cowl 🍓' },
    { id: 'sprout', name: 'Tiny Sprout 🌱' }
  ],
  tops: [
    { id: 'hoodie', name: 'Oversized Hoodie', color: '#FFB6C9' },
    { id: 'sweater', name: 'Cable Sweater', color: '#A8DADC' },
    { id: 'shirt', name: 'Tea Apron Apron', color: '#E9C46A' }
  ],
  heldItems: [
    { id: 'none', name: 'Free Hands' },
    { id: 'coffee', name: 'Warm Mug ☕' },
    { id: 'knife', name: 'Mischievous Blade 🔪' },
    { id: 'flower', name: 'Star Flower 🌸' }
  ]
};

// Default cute fallback setup if they click "Enter Cafe" directly
const DEFAULT_MYSTERY_AVATAR = {
  skin: 'cream',
  faceShape: 'round',
  hairStyle: 'none',
  hairColor: '#472C20',
  expression: 'happy',
  glasses: 'none',
  accessory: 'duckHat', // Give them the duck hat automatically!
  top: 'hoodie',
  topColor: '#FFE08A',
  heldItem: 'knife' // Unhinged fallback
};

export const AvatarProvider = ({ children }) => {
  const [avatar, setAvatar] = useState(DEFAULT_MYSTERY_AVATAR);
  const [isCustomized, setIsCustomized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cafe_user_avatar');
    if (saved) {
      setAvatar(JSON.parse(saved));
      setIsCustomized(true);
    }
  }, []);

  const saveAvatar = (newAvatar) => {
    setAvatar(newAvatar);
    setIsCustomized(true);
    localStorage.setItem('cafe_user_avatar', JSON.stringify(newAvatar));
  };

  const clearAvatar = () => {
    setAvatar(DEFAULT_MYSTERY_AVATAR);
    setIsCustomized(false);
    localStorage.removeItem('cafe_user_avatar');
  };

  const generateRandomAvatar = () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return {
      skin: pick(AVATAR_OPTIONS.skinTones).id,
      faceShape: pick(AVATAR_OPTIONS.faceShapes).id,
      hairStyle: pick(AVATAR_OPTIONS.hairStyles).id,
      hairColor: pick(AVATAR_OPTIONS.hairColors).value,
      expression: pick(AVATAR_OPTIONS.expressions).id,
      glasses: pick(AVATAR_OPTIONS.glasses).id,
      accessory: pick(AVATAR_OPTIONS.accessories).id,
      top: pick(AVATAR_OPTIONS.tops).id,
      topColor: pick(AVATAR_OPTIONS.hairColors).value,
      heldItem: pick(AVATAR_OPTIONS.heldItems).id
    };
  };

  return (
    <AvatarContext.Provider value={{ avatar, isCustomized, saveAvatar, clearAvatar, generateRandomAvatar, DEFAULT_MYSTERY_AVATAR }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);