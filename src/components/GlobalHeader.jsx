import React from 'react';

const GlobalHeader = ({ currentTheme, onNavigate }) => {
  // Fallback defaults if no theme is passed
  const theme = currentTheme || {
    backgroundColor: '#FFFDF9',
    textColor: '#472C20',
    gridOpacity: 'rgba(71, 44, 32, 0.05)'
  };

  const headerGridStyle = {
    backgroundColor: theme.backgroundColor,
    backgroundImage: `
      linear-gradient(${theme.gridOpacity} 1px, transparent 1px),
      linear-gradient(90deg, ${theme.gridOpacity} 1px, transparent 1px)
    `,
    backgroundSize: '30px 30px',
  };

  return (
    <header 
      style={headerGridStyle} 
      className="w-full border-b-[3px] border-[#472C20] px-6 py-4 flex justify-between items-center transition-all duration-300 select-none z-50"
    >
      {/* Branding */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
        <div className="w-10 h-10 rounded-full bg-[#472C20] flex items-center justify-center border-2 border-[#472C20] shadow-sm">
          <span className="text-white text-lg">🚪</span>
        </div>
        <div>
          <h1 className="font-serif font-black text-xl leading-none" style={{ color: theme.textColor }}>
            Dumble' Door
          </h1>
          <p className="font-cursive text-xs opacity-70" style={{ color: theme.textColor }}>
            Jagda, Rourkela
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('menu')}
          className="bg-white border-2 border-[#472C20] px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-[2px_2px_0_#472C20] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#472C20] transition-all"
          style={{ color: theme.textColor }}
        >
          Menu
        </button>
        <button 
          onClick={() => console.log('Log Out')}
          className="bg-white border-2 border-[#472C20] px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-[2px_2px_0_#472C20] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#472C20] transition-all"
          style={{ color: theme.textColor }}
        >
          Log Out
        </button>
      </div>
    </header>
  );
};

export default GlobalHeader;