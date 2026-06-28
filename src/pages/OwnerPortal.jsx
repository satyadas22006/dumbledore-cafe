import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { THEMES } from '../constants/data';

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
      <h1 className="text-3xl font-bold mb-8 text-white">Dumble' Door Admin</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('memories')} 
          className={`p-2 rounded ${activeTab === 'memories' ? 'bg-emerald-600' : 'bg-slate-800'}`}
        >
          Memories
        </button>
        <button 
          onClick={() => setActiveTab('menu')} 
          className={`p-2 rounded ${activeTab === 'menu' ? 'bg-emerald-600' : 'bg-slate-800'}`}
        >
          Menu Editor
        </button>
      </div>

      {activeTab === 'memories' && (
        <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400">Memory management view active.</p>
        </div>
      )}

      {activeTab === 'menu' && menuData && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Live Menu Editor</h2>
            <button 
              onClick={() => {
                const name = prompt("Enter new category name:");
                if (name) setMenuData({ ...menuData, [name]: { theme: THEMES.cream, items: [] } });
              }}
              className="bg-emerald-600 px-4 py-2 rounded text-sm font-bold hover:bg-emerald-500 transition-colors"
            >
              + Add Chapter
            </button>
          </div>

          {Object.entries(menuData).map(([category, info], catIdx) => (
            <div key={category} className="mb-8 p-4 bg-[#0F172A] rounded-lg border border-slate-700">
              <h3 className="text-emerald-400 font-mono uppercase mb-4 flex justify-between items-center">
                Chapter {catIdx + 1}: {category}
                <button 
                  onClick={() => { 
                    const newData = {...menuData}; 
                    delete newData[category]; 
                    setMenuData(newData); 
                  }} 
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Delete Category
                </button>
              </h3>
              
              {info.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input 
                    value={item.n} 
                    onChange={(e) => updateMenuItem(category, idx, 'n', e.target.value)}
                    className="bg-[#1E293B] p-2 rounded w-full border border-slate-700"
                    placeholder="Item name"
                  />
                  <input 
                    value={item.p} 
                    onChange={(e) => updateMenuItem(category, idx, 'p', e.target.value)}
                    className="bg-[#1E293B] p-2 rounded w-20 border border-slate-700"
                    placeholder="Price"
                  />
                  <button 
                    onClick={() => {
                      const newData = {...menuData};
                      newData[category].items.splice(idx, 1);
                      setMenuData(newData);
                    }} 
                    className="text-red-500 px-2 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => {
                  const newData = {...menuData};
                  newData[category].items.push({ n: "New Item", p: "0", soldOut: false });
                  setMenuData(newData);
                }} 
                className="text-emerald-400 text-sm mt-3 hover:underline"
              >
                + Add Item
              </button>
            </div>
          ))}
          
          <button 
            onClick={saveMenuToFirebase} 
            className="w-full bg-emerald-600 px-6 py-3 rounded font-bold text-white mt-4 hover:bg-emerald-500 transition-colors"
          >
            Save All Changes to Dumble' Door
          </button>
        </div>
      )}
    </div>
  );
};

export default OwnerPortal;