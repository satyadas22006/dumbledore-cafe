import React from 'react';

const GlobalGrid = () => {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(currentColor 1.5px, transparent 1.5px), linear-gradient(90deg, currentColor 1.5px, transparent 1.5px)',
        backgroundSize: '36px 36px',
        opacity: 0.06 // Very subtle so it doesn't hurt readability
      }}
    ></div>
  );
};

export default GlobalGrid;