import React from 'react';

const Barcode = () => (
  <div className="flex h-12 w-full items-center justify-center gap-[2px] opacity-80">
    {[...Array(35)].map((_, i) => (
      <div key={i} className="h-full bg-current" style={{ width: Math.random() > 0.5 ? '2px' : '4px', opacity: Math.random() > 0.8 ? 0 : 1 }}></div>
    ))}
  </div>
);

export default Barcode;