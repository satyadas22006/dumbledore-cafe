import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAvatar, AVATAR_OPTIONS } from '../context/AvatarContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { Sparkles, Shuffle, Check, ArrowLeft } from 'lucide-react';

export default function AvatarCreatorPage({ onNavigate }) {
  const { saveAvatar, generateRandomAvatar, DEFAULT_MYSTERY_AVATAR } = useAvatar();
  const [currentConfig, setCurrentConfig] = useState(() => generateRandomAvatar());
  const [activeTab, setActiveTab] = useState('features');

  const handleComplete = () => {
    saveAvatar(currentConfig);
    onNavigate('home'); // Send them straight into the home system dashboards!
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#472C20] font-sans relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Background decoration elements floating row */}
      <div className="absolute top-12 left-12 text-3xl opacity-20">✨</div>
      <div className="absolute bottom-24 left-16 text-4xl opacity-20">🍄</div>

      <div className="w-full max-w-4xl bg-[#FFF7D8] border-[5px] border-[#472C20] rounded-[35px] shadow-[12px_12px_0_#472C20] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        
        {/* VIEWPORT GRAPHIC CONTROL COLUMN */}
        <div className="md:col-span-5 bg-[#FFF9E8] border-b-4 md:border-b-0 md:border-r-4 border-[#472C20] p-8 flex flex-col items-center justify-between">
          <div className="text-center w-full flex justify-between items-center">
            <button onClick={() => onNavigate('welcome')} className="flex items-center gap-1 text-xs font-black uppercase tracking-wider opacity-70 hover:opacity-100">
              <ArrowLeft size={14} className="stroke-[3]" /> exit
            </button>
            <h1 className="text-xl font-black">Avatar Studio</h1>
            <div className="w-8"></div>
          </div>

          <div className="relative my-6 h-52 flex items-center justify-center w-full">
            <AvatarRenderer config={currentConfig} size={210} animate={true} />
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => setCurrentConfig(generateRandomAvatar())}
              className="flex-1 bg-[#FFE08A] border-4 border-[#472C20] rounded-2xl font-black py-2.5 shadow-[3px_3px_0_#472C20] hover:translate-y-[-2px] active:translate-y-[2px] transition-all text-xs uppercase tracking-wider"
            >
              🎲 Chaos Mix
            </button>
            <button
              onClick={() => setCurrentConfig(DEFAULT_MYSTERY_AVATAR)}
              className="bg-white border-4 border-[#472C20] rounded-2xl font-black px-4 py-2.5 shadow-[3px_3px_0_#472C20] text-xs uppercase tracking-wider"
            >
              Reset
            </button>
          </div>
        </div>

        {/* CUSTOMIZATION CONTROLS DESIGN FIELD */}
        <div className="md:col-span-7 p-6 flex flex-col justify-between h-[480px] md:h-[540px]">
          <div className="flex gap-2 border-b-2 border-dashed border-[#472C20]/20 pb-2">
            {['features', 'apparel', 'gear'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 border-[#472C20] transition-all ${
                  activeTab === tab ? 'bg-[#FF9F29] text-white shadow-[3px_3px_0_#472C20]' : 'bg-white shadow-[2px_2px_0_#472C20]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto my-4 space-y-5">
            {activeTab === 'features' && (
              <>
                <div>
                  <label className="text-xs font-black uppercase block mb-1.5">Skin Tone</label>
                  <div className="flex gap-2">
                    {AVATAR_OPTIONS.skinTones.map(s => (
                      <button key={s.id} onClick={() => setCurrentConfig({...currentConfig, skin: s.id})} className="w-10 h-10 rounded-full border-4 border-[#472C20] relative" style={{ backgroundColor: s.value }}>
                        {currentConfig.skin === s.id && <Check size={16} className="absolute inset-0 m-auto stroke-[4]" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase block mb-1.5">Expression</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_OPTIONS.expressions.map(e => (
                      <button key={e.id} onClick={() => setCurrentConfig({...currentConfig, expression: e.id})} className={`p-2 rounded-xl border-2 font-bold text-xs border-[#472C20] text-left ${currentConfig.expression === e.id ? 'bg-[#FFB6C9]' : 'bg-white'}`}>
                        {e.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'apparel' && (
              <>
                <div>
                  <label className="text-xs font-black uppercase block mb-1.5">Hair Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_OPTIONS.hairStyles.map(h => (
                      <button key={h.id} onClick={() => setCurrentConfig({...currentConfig, hairStyle: h.id})} className={`p-2 rounded-xl border-2 font-bold text-xs border-[#472C20] text-left ${currentConfig.hairStyle === h.id ? 'bg-[#FFB6C9]' : 'bg-white'}`}>
                        {h.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase block mb-1.5">Outfit Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVATAR_OPTIONS.tops.map(t => (
                      <button key={t.id} onClick={() => setCurrentConfig({...currentConfig, top: t.id, topColor: t.color})} className={`p-2 rounded-xl border-2 font-bold text-xs border-[#472C20] ${currentConfig.top === t.id ? 'bg-[#A8E6CF]' : 'bg-white'}`}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'gear' && (
              <>
                <div>
                  <label className="text-xs font-black uppercase block mb-1.5">Hats & Headgear</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_OPTIONS.accessories.map(a => (
                      <button key={a.id} onClick={() => setCurrentConfig({...currentConfig, accessory: a.id})} className={`p-2 rounded-xl border-2 font-bold text-xs border-[#472C20] ${currentConfig.accessory === a.id ? 'bg-[#FFE08A]' : 'bg-white'}`}>
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase block mb-1.5">Held Object Props</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_OPTIONS.heldItems.map(i => (
                      <button key={i.id} onClick={() => setCurrentConfig({...currentConfig, heldItem: i.id})} className={`p-2 rounded-xl border-2 font-bold text-xs border-[#472C20] ${currentConfig.heldItem === i.id ? 'bg-[#FFE08A]' : 'bg-white'}`}>
                        {i.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleComplete}
            className="w-full bg-[#FF9F29] text-white border-4 border-[#472C20] rounded-2xl font-black text-base py-3.5 shadow-[5px_5px_0_#472C20] hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
          >
            Lock Character & Enter Café <Sparkles size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}