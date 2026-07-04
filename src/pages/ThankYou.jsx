import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { InstagramIcon, WhatsappIcon, TwitterIcon } from '../components/Icons';
import { THEMES, CHART_COLORS } from '../constants/data';

const ThankYou = ({ memories, reviewData, onNavigate, theme }) => {
  // SAFELY map data (checks for both old string formats and new number/id formats!)
  const chartDataReason = [
    { name: 'Food', value: memories.filter(m => String(m.reason || '').includes('Food') || String(m.reason || '').includes('Craving') || m.purpose === 'food').length },
    { name: 'People', value: memories.filter(m => String(m.reason || '').includes('People') || m.purpose === 'catch').length },
    { name: 'Comfort', value: memories.filter(m => String(m.reason || '').includes('Comfort') || m.purpose === 'escape').length },
    { name: 'Family', value: memories.filter(m => String(m.reason || '').includes('Friends') || String(m.reason || '').includes('Family') || m.purpose === 'family').length }
  ].filter(d => d.value > 0).map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }));

  const chartDataRating = [
    { name: 'Amazing', value: memories.filter(m => String(m.rating || '').includes('Amazing') || m.rating === 4).length },
    { name: 'Good', value: memories.filter(m => String(m.rating || '').includes('Good') || m.rating === 3).length },
    { name: 'Okay/Missed', value: memories.filter(m => String(m.rating || '').includes('Okay') || String(m.rating || '').includes('Missed') || m.rating === 2 || m.rating === 1).length },
  ].filter(d => d.value > 0).map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }));

  const handleShare = async (platform) => {
    const memoryText = reviewData?.text || reviewData?.review || "Such a cozy spot!";
    const shareText = `Just left a memory at Dumble' Door Cafe! ✨\n\n"${memoryText}"\n\nMy Vibe: ${reviewData?.vibe}\n📍 Jagda, Rourkela`;
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    else if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    else if (platform === 'ig') {
      if (navigator.share) {
        try { await navigator.share({ title: "Dumble' Door", text: shareText }); } catch (err) {}
      } else { alert("Screenshot your Guest Check and tag us on your IG Story! ✨📸"); }
    }
  };

  // Generate a random 6 digit check number
  const checkNumber = React.useMemo(() => Math.floor(Math.random() * 900000) + 100000, []);

  // --- TEXTURE ASSETS ---
  // 1. General paper grain
  const paperNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;
  
  // 2. The dark paper inclusions / crumbs
  const paperCrumbs = `
    radial-gradient(circle at 15% 25%, #2c1a1a 0.5px, transparent 1px),
    radial-gradient(circle at 85% 12%, #4a3b32 1px, transparent 1.5px),
    radial-gradient(circle at 45% 65%, #2c1a1a 0.5px, transparent 1px),
    radial-gradient(circle at 75% 80%, #1a1a1a 1.5px, transparent 2px),
    radial-gradient(circle at 25% 90%, #4a3b32 0.5px, transparent 1px),
    radial-gradient(circle at 60% 35%, #1a1a1a 1px, transparent 1.5px),
    radial-gradient(circle at 90% 55%, #2c1a1a 0.5px, transparent 1px),
    radial-gradient(circle at 10% 70%, #4a3b32 1px, transparent 1.5px)
  `;

  // Check if a real name was provided
  const hasCustomName = reviewData?.name && reviewData.name.toLowerCase() !== 'anonymous' && reviewData.name.trim() !== '';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
      <div className="text-center w-full mb-12">
        <h1 className="text-7xl font-serif mb-6">Memory Saved.</h1>
        <p className="text-2xl font-serif italic opacity-80 mb-6">Screenshot to save your Guest Check.</p>
        <button onClick={() => onNavigate('wall', THEMES.navy)} style={{ backgroundColor: theme.text, color: theme.bg }} className="px-12 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-2xl">Take me to the Wall →</button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-16 w-full items-start justify-center">
        
        {/* RECEIPT & SOCIAL SHARE COLUMN */}
        <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0 z-20 w-full max-w-[320px]">
          {reviewData && (
            <motion.div drag dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }} className="relative w-full drop-shadow-2xl cursor-grab active:cursor-grabbing">
              
              {/* --- VINTAGE GUEST CHECK UI --- */}
              <div className="w-full bg-[#f3e1cb] shadow-2xl relative text-[#173e87] flex flex-col font-sans select-none pb-4 overflow-hidden border border-black/5">
                
                {/* --- 🌟 THE PAPER TEXTURE OVERLAYS 🌟 --- */}
                {/* 1. The SVG Fractal Noise for grain */}
                <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.25] mix-blend-multiply" style={{ backgroundImage: paperNoise }}></div>
                
                {/* 2. The woven fibers pattern */}
                <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-color-burn" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
                
                {/* 3. The scattered paper crumbs/dirt inclusions */}
                <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.25] mix-blend-color-burn" style={{ backgroundImage: paperCrumbs, backgroundSize: '130px 130px' }}></div>
                <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.15] mix-blend-multiply" style={{ backgroundImage: paperCrumbs, backgroundSize: '200px 200px', backgroundPosition: '50px 30px' }}></div>
                
                {/* 4. The aged/burnt paper edge shadow */}
                <div className="absolute inset-0 pointer-events-none z-[100] shadow-[inset_0_0_50px_rgba(139,69,19,0.15)]"></div>

                {/* 5. 🌟 THE FOLD & CREASE EFFECT 🌟 */}
                {/* Dented top edge shadow */}
                <div className="absolute top-0 left-0 w-full h-16 pointer-events-none z-[101] opacity-70" style={{ backgroundImage: 'radial-gradient(ellipse at 35% 0%, rgba(0,0,0,0.1) 0%, transparent 60%)' }}></div>
                {/* Diagonal Highlight & Shadow Crease */}
                <div className="absolute inset-0 pointer-events-none z-[102] mix-blend-overlay opacity-60" style={{
                  backgroundImage: 'linear-gradient(168deg, transparent 10%, rgba(255,255,255,0.6) 12%, rgba(0,0,0,0.15) 14%, transparent 18%)'
                }}></div>
                {/* -------------------------------------- */}


                {/* Top Pink Section */}
                <div className="bg-[#fbd8c9] p-4 flex flex-col pt-8 relative">
                  <div className="text-right font-mono text-3xl text-[#df3131] mb-2 tracking-widest opacity-80" style={{ transform: 'scaleY(1.2)' }}>
                    {checkNumber}
                  </div>
                  
                  {/* Top Grid 1 */}
                  <div className="grid grid-cols-4 border-y-2 border-[#173e87] text-[8px] font-bold text-center tracking-tighter uppercase">
                    <div className="border-r-2 border-[#173e87] py-0.5">Table</div>
                    <div className="border-r-2 border-[#173e87] py-0.5">No. Persons</div>
                    <div className="border-r-2 border-[#173e87] py-0.5">Waiter</div>
                    <div className="py-0.5">Amount of Check</div>
                  </div>
                  <div className="grid grid-cols-4 h-6 border-b-2 border-[#173e87]">
                    <div className="border-r-2 border-[#173e87]"></div>
                    <div className="border-r-2 border-[#173e87]"></div>
                    <div className="border-r-2 border-[#173e87]"></div>
                    <div></div>
                  </div>
                  
                  {/* Logo Text */}
                  <div className="py-4 text-center">
                    <h2 className="font-cursive text-6xl font-bold tracking-wider text-[#173e87]" style={{ transform: 'scaleY(1.1) rotate(-2deg)' }}>Thank You!</h2>
                  </div>
                  
                  <div className="text-center text-[10px] font-bold tracking-widest border-b-2 border-[#173e87] pb-1 mb-1">
                    YOUR PATRONAGE IS APPRECIATED
                  </div>
                  
                  {/* Top Grid 2 */}
                  <div className="grid grid-cols-4 border-b-2 border-[#173e87] text-[8px] font-bold text-center tracking-tighter uppercase">
                    <div className="border-r-2 border-[#173e87] py-0.5">Table</div>
                    <div className="border-r-2 border-[#173e87] py-0.5">No. Persons</div>
                    <div className="border-r-2 border-[#173e87] py-0.5">Waiter</div>
                    <div className="py-0.5">Check No.</div>
                  </div>
                  <div className="grid grid-cols-4 h-8 border-b-2 border-[#173e87]">
                    <div className="border-r-2 border-[#173e87]"></div>
                    <div className="border-r-2 border-[#173e87]"></div>
                    <div className="border-r-2 border-[#173e87]"></div>
                    <div className="flex items-center justify-center font-mono text-lg text-[#df3131] opacity-80 tracking-widest" style={{ transform: 'scaleY(1.2)' }}>
                      {checkNumber}
                    </div>
                  </div>
                </div>

                {/* Middle Ruled Section (Expands dynamically based on items) */}
                <div className="relative flex-1 w-full flex flex-col pt-1">
                  {/* Vertical blue pricing columns */}
                  <div className="absolute right-[22%] top-0 bottom-0 w-[2px] bg-[#173e87]"></div>
                  <div className="absolute right-[10%] top-0 bottom-0 w-[2px] bg-[#173e87]"></div>

                  {/* Red Marker Items mapped line-by-line */}
                  <div className="flex flex-col z-10 relative">
                    
                    {/* Dynamically maps exactly the amount of items ordered */}
                    {reviewData.items?.map((item, i) => (
                      <div key={i} className="h-[46px] border-b-[1.5px] border-[#173e87] flex items-end pb-0 px-4 relative overflow-visible">
                        <span
                          className="font-cursive text-5xl text-[#df3131] font-black uppercase tracking-wider transform origin-bottom-left whitespace-nowrap absolute bottom-1.5 z-20 leading-none"
                          style={{ 
                            rotate: `${Math.random() * -3 - 6}deg`, // Stronger slant
                            textShadow: '1.5px 1.5px 0px rgba(223, 49, 49, 0.12)',
                            mixBlendMode: 'multiply' 
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                    
                    {/* The friendly smiley face line! */}
                    <div className="h-[46px] border-b-[1.5px] border-[#173e87] flex items-end pb-1 relative px-4 overflow-visible">
                      <span 
                        className="font-cursive text-6xl text-[#df3131] font-black transform origin-bottom-left absolute bottom-1 left-28 z-20"
                        style={{ rotate: '-12deg', mixBlendMode: 'multiply' }}
                      >
                        :)
                      </span>
                    </div>
                    
                    {/* Buffer line */}
                    <div className="h-[46px] border-b-[1.5px] border-[#173e87]"></div>
                  </div>
                </div>

                {/* Bottom Footer Section */}
                <div className="px-3 pt-2 relative">
                  <div className="flex justify-between items-end border-b-[1.5px] border-[#173e87] pb-1 mb-1 mt-1">
                    <span className="text-xs font-black tracking-widest">TAX</span>
                    <span></span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold pb-2">
                    <div className="leading-tight tracking-widest">STYLE<br/>XX</div>
                    <div className="text-xs tracking-wide">Thank You -- Call Again</div>
                    <div className="w-10"></div>
                  </div>

                  {/* 🌟 CUSTOMER SIGNATURE (Aligned to TAX level and pushed left) 🌟 */}
                  {hasCustomName && (
                    <div className="absolute top-1 right-10 z-20">
                      <span 
                        className="font-cursive text-3xl text-[#df3131] font-black transform origin-bottom-right inline-block whitespace-nowrap"
                        style={{ 
                          rotate: '-4deg',
                          textShadow: '1px 1px 0px rgba(223, 49, 49, 0.1)',
                          mixBlendMode: 'multiply'
                        }}
                      >
                        - {reviewData.name}
                      </span>
                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          )}

          {/* SOCIAL SHARE */}
          <div className="flex flex-col items-center gap-3 w-full mt-4">
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