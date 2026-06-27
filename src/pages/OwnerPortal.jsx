import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { migrateMenu } from '../migration';

const OwnerPortal = () => {
  const [activeTab, setActiveTab] = useState('memories');
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const docSnap = await getDoc(doc(db, "settings", "fullMenu"));
      if (docSnap.exists()) setMenuData(docSnap.data().data);
    };
    fetchMenu();
  }, []);

  const updateMenuItem = (category, index, key, value) => {
    const newData = { ...menuData };
    newData[category].items[index][key] = value;
    setMenuData(newData);
  };

  const saveMenuToFirebase = async () => {
    await updateDoc(doc(db, "settings", "fullMenu"), { data: menuData });
    alert("Menu updated successfully!");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-8">
      <h1 className="text-3xl font-bold mb-8">Dumble' Door Admin</h1>
      
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('memories')} className="p-2 bg-slate-800 rounded">Memories</button>
        <button onClick={() => setActiveTab('menu')} className="p-2 bg-slate-800 rounded">Menu Editor</button>
        <button onClick={migrateMenu} className="p-2 bg-red-900 text-white rounded">RUN MIGRATION</button>
      </div>

      {activeTab === 'menu' && menuData && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Live Menu Editor</h2>
          {Object.entries(menuData).map(([category, info]) => (
            <div key={category} className="mb-8">
              <h3 className="text-emerald-400 font-mono uppercase mb-4">{category}</h3>
              {info.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 mb-2 items-center">
                  <input 
                    value={item.n} 
                    onChange={(e) => updateMenuItem(category, idx, 'n', e.target.value)}
                    className="bg-[#0F172A] p-2 rounded border border-slate-700 w-full"
                  />
                  <input 
                    value={item.p} 
                    onChange={(e) => updateMenuItem(category, idx, 'p', e.target.value)}
                    className="bg-[#0F172A] p-2 rounded border border-slate-700 w-20"
                  />
                </div>
              ))}
            </div>
          ))}
          <button onClick={saveMenuToFirebase} className="bg-emerald-600 px-6 py-2 rounded font-bold text-white mt-4">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default OwnerPortal;