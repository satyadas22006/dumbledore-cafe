import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackToCafeButton = ({ className = "mb-8" }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex justify-start w-full relative z-50 ${className}`}>
      <button 
        onClick={() => navigate('/cafe')} 
        className="flex items-center gap-2 text-sm font-black tracking-wider uppercase hover:opacity-70 transition-opacity bg-white border-2 border-[#472C20] text-[#472C20] px-4 py-2 rounded-full shadow-[3px_3px_0_#472C20]"
      >
        <ArrowLeft size={16} className="stroke-[3]" /> Back to Cafe
      </button>
    </div>
  );
};

export default BackToCafeButton;