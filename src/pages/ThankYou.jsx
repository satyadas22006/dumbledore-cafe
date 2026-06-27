import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Barcode from '../components/Barcode';
import { InstagramIcon, WhatsappIcon, TwitterIcon } from '../components/Icons';
import { THEMES, CHART_COLORS } from '../constants/data';

const ThankYou = ({ memories, reviewData, onNavigate, theme }) => {
  const chartDataReason = [
    { name: 'Food', value: memories.filter(m => m.reason?.includes('Food') || m.reason?.includes('Craving')).length },
    { name: 'People', value: memories.filter(m => m.reason?.includes('People')).length },
    { name: 'Comfort', value: memories.filter(m => m.reason?.includes('Comfort')).length },
    { name: 'Family', value: memories.filter(m => m.reason?.includes('Friends') || m.reason?.includes('Family')).length }
  ].filter(d => d.value > 0).map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }));

  const chartDataRating = [
    { name: 'Amazing', value: memories.filter(m => m.rating?.includes('Amazing')).length },
    { name: 'Good', value: memories.filter(m => m.rating?.includes('Good')).length },
    { name: 'Okay/Missed', value: memories.filter(m => m.rating?.includes('Okay') || m.rating?.includes('Missed')).length },
  ].filter(d => d.value > 0).map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }));

  const handleShare = async (platform) => {
    const memoryText = reviewData?.text || reviewData?.highlights?.[0] || "Such a cozy spot!";
    const shareText = `Just left a memory at Dumble' Door Cafe! ✨\n\n"${memoryText}"\n\nMy Vibe: ${reviewData?.vibe}\n📍 Jagda, Rourkela`;
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    else if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    else if (platform === 'ig') {
      if (navigator.share) {
        try { await navigator.share({ title: "Dumble' Door", text: shareText }); } catch (err) {}
      } else { alert("Screenshot your Golden Ticket and tag us on your IG Story! ✨📸"); }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
      <div className="text-center w-full mb-12">
        <h1 className="text-7xl font-serif mb-6">Memory Saved.</h1>
        <p className="text-2xl font-serif italic opacity-80 mb-6">Screenshot to save your Golden Ticket.</p>
        <button onClick={() => onNavigate('wall', THEMES.navy)} style={{ backgroundColor: theme.text, color: theme.bg }} className="px-12 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-2xl">Take me to the Wall →</button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-16 w-full items-start justify-center">
        
        {/* RECEIPT & SOCIAL SHARE COLUMN */}
        <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0 z-20 w-full max-w-sm">
          {reviewData && (
            <motion.div drag dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }} className="relative w-full drop-shadow-2xl cursor-grab active:cursor-grabbing">
              <div className="bg-[#FDFBF7] text-[#2C241B] p-8 pb-12 font-mono flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-1 uppercase tracking-widest text-center">DUMBLE' DOOR</h2>
                <p className="mb-6 opacity-60 uppercase text-xs">JAGDA, ROURKELA</p>
                
                <div className="w-full space-y-2 mb-6 font-bold text-sm">
                  <div className="flex justify-between"><span>ORDER</span><span>#{Math.floor(Math.random() * 9000) + 1000}</span></div>
                  <div className="flex justify-between"><span>NAME</span><span>{reviewData.name}</span></div>
                  <div className="flex justify-between"><span>VIBE</span><span>{reviewData.vibe}</span></div>
                </div>
                
                <div className="w-full border-t border-dashed border-[#2C241B]/20 mb-6"></div>
                
                <div className="w-full space-y-2 mb-6 font-bold">
                  {reviewData.items && reviewData.items.map((item, i) => (
                    <div key={i} className="flex justify-between"><span className="truncate pr-4">1x {item.toUpperCase()}</span></div>
                  ))}
                </div>
                
                {reviewData.text && (
                  <>
                    <div className="w-full border-t border-dashed border-[#2C241B]/20 mb-6"></div>
                    <p className="font-cursive text-3xl text-center leading-tight">"{reviewData.text}"</p>
                  </>
                )}
                
                <div className="w-full border-t border-dashed border-[#2C241B]/20 mt-6 pt-6 flex flex-col items-center text-center">
                   <p className="uppercase font-bold text-xs tracking-wider mb-2">⭐ Golden Ticket ⭐</p>
                   <p className="text-[10px] opacity-70 mb-4">Screenshot this receipt. Show it on your next visit for 10% off your order.</p>
                   <Barcode />
                   <p className="text-[8px] mt-2 font-sans tracking-widest">{Math.floor(Math.random() * 10000000000)}</p>
                </div>
                <div className="absolute -bottom-2 left-0 right-0 h-4 receipt-edge text-[#FDFBF7]"></div>
              </div>
            </motion.div>
          )}

          {/* SOCIAL SHARE */}
          <div className="flex flex-col items-center gap-3 w-full mt-2">
            <p className="font-mono uppercase tracking-widest text-xs opacity-70 mb-1">Share your ticket</p>
            <div className="flex items-center gap-4">
              <button onClick={() => handleShare('ig')} className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-lg">
                <InstagramIcon size={22} />
              </button>
              <button onClick={() => handleShare('whatsapp')} className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform bg-green-500 text-white shadow-lg">
                <WhatsappIcon size={22} />
              </button>
              <button onClick={() => handleShare('twitter')} className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform bg-black text-white shadow-lg border border-white/20">
                <TwitterIcon size={22} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div style={{ borderColor: theme.border }} className="p-8 rounded-[3rem] border border-opacity-30 bg-white/5 backdrop-blur-md">
            <h3 className="font-serif text-2xl text-center mb-6">Why they visit</h3>
            <div className="h-48"><ResponsiveContainer><PieChart><Pie data={chartDataReason} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">{chartDataReason.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{borderRadius: '1rem', border: 'none', backgroundColor: theme.text, color: theme.bg}} itemStyle={{color: theme.bg}} /></PieChart></ResponsiveContainer></div>
          </div>
          <div style={{ borderColor: theme.border }} className="p-8 rounded-[3rem] border border-opacity-30 bg-white/5 backdrop-blur-md">
            <h3 className="font-serif text-2xl text-center mb-6">Overall Ratings</h3>
            <div className="h-48"><ResponsiveContainer><PieChart><Pie data={chartDataRating} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">{chartDataRating.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{borderRadius: '1rem', border: 'none', backgroundColor: theme.text, color: theme.bg}} itemStyle={{color: theme.bg}} /></PieChart></ResponsiveContainer></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThankYou;