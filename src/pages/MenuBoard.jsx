import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ShoppingBag, Plus, Minus, X, Trash2 } from 'lucide-react';
import { db } from '../firebase'; 
import { doc, onSnapshot } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import BackToCafeButton from '../components/BackToCafeButton';

// --- SMOOTH SCROLLING SECTION COMPONENT ---
const MenuSection = ({ title, info, idx, setTheme, activeFilter }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px", once: false });

  const palettes = [
    { bg: '#A8E6CF', text: '#2D5A4D' }, // Mint
    { bg: '#FFB6C9', text: '#5D2E3A' }, // Rose
    { bg: '#FFE08A', text: '#5D4A25' }, // Cream
    { bg: '#D4EBFF', text: '#2A4B66' }, // Sky
    { bg: '#E5D3FF', text: '#4B3A66' }, // Lavender
    { bg: '#FFD3B6', text: '#664A35' }, // Peach
    { bg: '#D4F1F4', text: '#2A5D5A' }, // Aqua
    { bg: '#FADADD', text: '#663A40' }  // Pale Pink
  ];

  const currentPalette = palettes[idx % palettes.length];

  useEffect(() => {
    if (isInView) {
      setTheme(currentPalette);
    }
  }, [isInView, currentPalette, setTheme]);

  const filteredItems = (info.items || []).filter(item => {
    if (activeFilter === 'all') return true;
    const itemType = item.type ? item.type.toLowerCase() : 'veg';
    return itemType === activeFilter;
  });

  if (filteredItems.length === 0) return null;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 min-h-[70vh] py-16`}
    >
      <div className="w-full md:w-5/12 text-center md:text-left flex flex-col items-center md:items-start">
        <div 
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border-2 border-[#472C20] font-black text-[10px] text-[#472C20] uppercase tracking-widest shadow-[3px_3px_0_#472C20] mb-6"
          style={{ backgroundColor: currentPalette.bg }}
        >
          <Sparkles size={12} /> Chapter {idx + 1}
        </div>
        <h2 className="text-6xl md:text-8xl font-cursive transform -rotate-3 drop-shadow-sm text-[#472C20]">
          {title}
        </h2>
      </div>

      <div className="w-full md:w-7/12 bg-[#FFFDF9] border-[4px] border-[#472C20] rounded-[2.5rem] p-6 md:p-8 shadow-[8px_8px_0_#472C20]">
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item, i) => (
            <FoodCard key={i} item={item} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- INTERACTIVE FOOD CARD COMPONENT ---
const FoodCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  const description = item.desc || "A house-special cozy recipe prepared fresh today.";
  const isNonVeg = item.type?.toLowerCase() === 'non-veg';

  return (
    <div className="relative">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 5, scale: 0.95, x: '-50%' }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-16 left-1/2 z-30 w-64 bg-white border-2 border-[#472C20] p-3 rounded-2xl text-center text-xs font-medium shadow-[4px_4px_0_#472C20] text-[#472C20] pointer-events-none"
            style={{ borderRadius: '24px 24px 24px 8px' }}
          >
            <div className="absolute -bottom-[7px] left-6 w-3 h-3 bg-white border-b-2 border-r-2 border-[#472C20] rotate-45"></div>
            <p className="leading-relaxed font-serif italic">"{description}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.01 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex justify-between items-center p-4 bg-[#FAF6EE] rounded-2xl border-2 border-[#472C20] transition-all relative ${
          item.soldOut ? 'opacity-50 grayscale pointer-events-none' : 'hover:bg-white hover:shadow-[4px_4px_0_#472C20]'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-base select-none">{isNonVeg ? '🍗' : '🌱'}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className={`font-serif text-xl md:text-2xl font-black text-[#472C20] ${item.soldOut ? 'line-through decoration-[3px] decoration-[#472C20]/60' : ''}`}>
                {item.n}
              </span>
              {item.soldOut && (
                <span className="font-cursive text-lg text-rose-500 transform -rotate-6 font-bold tracking-wide">
                  *all gone!*
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`font-mono font-black text-lg bg-white border-2 border-[#472C20] px-3 py-1 rounded-xl shadow-[3px_3px_0_#472C20] ${item.soldOut ? 'text-[#472C20]/50 line-through decoration-2' : 'text-[#FF9F29]'}`}>
            ₹{item.p}
          </span>
          
          {!item.soldOut && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item, e);
              }}
              className="bg-[#FFE08A] hover:bg-[#FFD3B6] text-[#472C20] border-2 border-[#472C20] font-black font-mono text-xs px-3 py-1.5 rounded-xl shadow-[2px_2px_0_#472C20] hover:shadow-[1px_1px_0_#472C20] transition-all"
            >
              + Add
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN MENU BOARD COMPONENT ---
export default function MenuBoard({ setTheme, theme }) {
  const [menuData, setMenuData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cartItems, notifications, updateQuantity, removeFromCart, cartCount, subtotal } = useCart();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "fullMenu"), (docSnap) => {
      if (docSnap.exists()) {
        setMenuData(docSnap.data().data);
      } else {
        setMenuData({});
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden select-none pb-24 transition-colors duration-700">
      
      {/* --- LIVE AESTHETIC FLOATING NOTIFICATIONS LAYER --- */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {notifications && notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, scale: 0.8, x: notif.x - 50, y: notif.y - 30 }}
              animate={{ opacity: 1, scale: 1, y: notif.y - 90 }}
              exit={{ opacity: 0, scale: 0.9, y: notif.y - 120 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute bg-[#472C20] text-[#FFFDF9] font-mono border border-black/20 font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-1 min-w-[100px] whitespace-nowrap"
            >
              {notif.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-16">
          <BackToCafeButton />
          
          {/* Floating Cart Launcher Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-4 bg-[#FFFDF9] border-4 border-[#472C20] shadow-[4px_4px_0_#472C20] rounded-2xl text-[#472C20] flex items-center justify-center cursor-pointer"
          >
            <ShoppingBag size={24} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white border-2 border-[#472C20] font-mono font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Big Header Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-24 h-8 bg-white/20 backdrop-blur-sm rotate-[-2deg] shadow-sm z-20 border border-white/40"></div>
          <h1 className="text-8xl md:text-[9rem] font-serif font-black tracking-tighter text-[#472C20]">The Menu.</h1>
          <p className="font-cursive text-3xl opacity-80 mt-2 transform rotate-2 text-[#472C20]">Freshly cooked, just for you.</p>
        </motion.div>

        {/* Filter Chips */}
        <div className="flex justify-center items-center gap-3 mb-16">
          {[
            { id: 'all', label: '✨ All Dishes' },
            { id: 'veg', label: '🌱 Pure Veg' },
            { id: 'non-veg', label: '🍗 Non-Veg' }
          ].map((chip) => {
            const active = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-4 py-2 border-2 border-[#472C20] rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                  active 
                    ? 'bg-[#FF9F29] text-white shadow-[3px_3px_0_#472C20] -translate-y-[2px]' 
                    : 'bg-white text-[#472C20] shadow-[1px_1px_0_#472C20] hover:shadow-[3px_3px_0_#472C20]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        
        {/* Render Menu Sections */}
        <div className="space-y-12 min-h-[50vh]">
          {!menuData ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60 text-[#472C20]">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-mono font-bold tracking-widest uppercase">Brewing the menu...</p>
            </div>
          ) : Object.keys(menuData).length === 0 ? (
            <div className="text-center font-mono font-bold tracking-widest uppercase opacity-60 text-[#472C20]">
              The menu is currently being rewritten. Check back soon!
            </div>
          ) : (
            Object.entries(menuData).map(([category, info], idx) => (
              <MenuSection key={category} title={category} info={info} idx={idx} setTheme={setTheme} activeFilter={activeFilter} />
            ))
          )}
        </div>
      </div>

      {/* --- LIVE CAFE SIDEBAR DRAWER PANEL --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sidebar Ledger Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-[#FFFDF9] border-l-[6px] border-[#472C20] shadow-[-10px_0_30px_rgba(0,0,0,0.15)] z-50 flex flex-col p-6 text-[#472C20]"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b-4 border-[#472C20]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-[#FF9F29]" />
                  <h3 className="font-serif font-black text-2xl tracking-tight">Your Tray</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="p-1.5 border-2 border-[#472C20] rounded-xl bg-white hover:bg-[#FADADD] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List (Scrolled Container) */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-2">
                    <span className="text-4xl">☕</span>
                    <p className="font-cursive text-xl">Your tray is empty right now.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.n}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#FAF6EE] border-2 border-[#472C20] rounded-xl p-3 shadow-[3px_3px_0_#472C20] flex items-center justify-between overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 max-w-[50%]">
                          <span className="font-serif font-black text-sm truncate">{item.n}</span>
                          <span className="font-mono text-xs opacity-60">₹{item.p} each</span>
                        </div>

                        {/* Controls System */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border-2 border-[#472C20] bg-white rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.n, -1)}
                              className="p-1 hover:bg-[#FAF6EE] border-r border-[#472C20] transition-colors"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="font-mono font-black text-xs px-2.5 min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.n, 1)}
                              className="p-1 hover:bg-[#FAF6EE] border-l border-[#472C20] transition-colors"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>

                          <span className="font-mono font-black text-sm w-16 text-right">
                            ₹{item.p * item.quantity}
                          </span>

                          <button 
                            onClick={() => removeFromCart(item.n)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Drawer Ledger Bill Footer */}
              {/* Drawer Ledger Bill Footer */}
              {cartItems.length > 0 && (
                <div className="border-t-4 border-dashed border-[#472C20]/40 pt-4 bg-[#FFFDF9] space-y-3">
                  <div className="space-y-1 text-sm font-medium">
                    <div className="flex justify-between font-mono">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs opacity-60">
                      
                    </div>
                  </div>

                  <div className="border-t-2 border-[#472C20] pt-3 flex justify-between items-end">
                    <span className="font-serif font-black text-xl">Total</span>
                    <span className="font-mono font-black text-2xl text-[#FF9F29]">₹{subtotal}</span>
                  </div>

                  {/* "Place Kitchen Order" button has been removed from here */}
                </div>
              )}
              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}