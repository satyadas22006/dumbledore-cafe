import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { CHART_COLORS } from '../constants/data';

const ChronicleBoard = ({ memories, theme }) => {
  const getCounts = (key) => { 
    const counts = {}; 
    memories.forEach(m => counts[m[key]] = (counts[m[key]] || 0) + 1); 
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value); 
  };
  const getTop = (key) => getCounts(key)[0]?.name || '';
  const chartOptions = { contentStyle: { borderRadius: '1rem', border: 'none', backgroundColor: theme.text, color: theme.bg, fontWeight: 'bold' }, itemStyle: { color: theme.bg } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-7xl font-serif mb-16">The Chronicle.</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div style={{ borderColor: theme.border }} className="p-12 rounded-[3rem] border border-opacity-30 flex flex-col justify-center"><p className="font-mono uppercase tracking-widest opacity-60 mb-4">The Collective Mood</p><h2 className="text-6xl font-serif">{getTop('vibe').replace(/[^a-zA-Z\s]/g, '')}</h2></div>
        <div style={{ backgroundColor: theme.text, color: theme.bg }} className="p-12 rounded-[3rem] border border-opacity-30 flex flex-col justify-center"><p className="font-mono uppercase tracking-widest opacity-60 mb-4">Current Obsession</p><h2 className="text-5xl md:text-7xl font-cursive leading-tight">{getTop('dish')}</h2></div>
        <div style={{ borderColor: theme.border }} className="p-10 rounded-[3rem] border border-opacity-30 bg-white/5 backdrop-blur-md"><p className="font-mono uppercase tracking-widest opacity-60 mb-8 text-center">Top Dishes</p><div className="h-64"><ResponsiveContainer><BarChart data={getCounts('dish').slice(0,5)} layout="vertical" margin={{left: 0, right: 0}}><XAxis type="number" hide/><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontFamily:'Playfair Display', fontSize: 14, fill: theme.text}} width={120} /><Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} {...chartOptions} /><Bar dataKey="value" fill={CHART_COLORS[0]} radius={[0,20,20,0]} barSize={24} /></BarChart></ResponsiveContainer></div></div>
        <div style={{ borderColor: theme.border }} className="p-10 rounded-[3rem] border border-opacity-30 bg-white/5 backdrop-blur-md"><p className="font-mono uppercase tracking-widest opacity-60 mb-8 text-center">Community Moods</p><div className="h-64"><ResponsiveContainer><PieChart><Pie data={getCounts('vibe')} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">{getCounts('vibe').map((e,i)=><Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}</Pie><Tooltip {...chartOptions} /></PieChart></ResponsiveContainer></div></div>
      </div>
    </motion.div>
  );
};

export default ChronicleBoard;