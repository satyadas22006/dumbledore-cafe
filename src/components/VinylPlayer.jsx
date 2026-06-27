import React, { useState, useEffect, useRef } from 'react';
import { Disc3 } from 'lucide-react';

const VinylPlayer = ({ theme }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
  }, []);

  const toggle = () => {
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[999]">
      <button onClick={toggle} style={{ backgroundColor: theme.text, color: theme.bg }} className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform group relative overflow-hidden">
        <Disc3 size={28} className={playing ? 'vinyl-spin' : ''} />
        <div className={`absolute top-2 right-2 w-1 h-4 bg-current origin-top transition-transform duration-500 ${playing ? 'rotate-[25deg]' : 'rotate-0'}`} />
      </button>
    </div>
  );
};

export default VinylPlayer;