import React from 'react';
import { motion } from 'framer-motion';

const Directory = ({ theme }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto px-6 py-20 text-center">
    <h1 className="text-7xl md:text-9xl font-serif mb-12">Visit Us.</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left mb-16"><div style={{ borderColor: theme.border }} className="p-12 rounded-[3rem] border border-opacity-30"><p className="font-mono opacity-60 mb-2">HOURS</p><p className="font-serif text-4xl">Tue - Sun<br/>11:30AM - 9:00PM</p></div><div style={{ borderColor: theme.border }} className="p-12 rounded-[3rem] border border-opacity-30"><p className="font-mono opacity-60 mb-2">LOCATION</p><p className="font-serif text-4xl">Shop 1 & 2,<br/>Near M.G.M School, Jagda</p></div></div>
    <div className="w-full h-96 rounded-[3rem] overflow-hidden border-8 border-current border-opacity-10">
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.651765476317!2d84.8812!3d22.2533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a201f0000000001%3A0x8b1b2c3d4e5f6g7h!2sDumble%20Door%20Cafe!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" width="100%" height="100%" style={{border:0}}></iframe>
    </div>
  </motion.div>
);

export default Directory;