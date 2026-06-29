import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { THEMES } from '../constants/data';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const OwnerPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('memories');
  const [menuData, setMenuData] = useState(null);
  const [memories, setMemories] = useState([]);
  
  // Stats tab states
  const [itemSearch, setItemSearch] = useState('');
  const [itemSort, setItemSort] = useState('name');
  const [guestSearch, setGuestSearch] = useState('');
  const [guestSort, setGuestSort] = useState('latest');
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    // 1. Fetch Menu Data
    const fetchMenu = async () => {
      const docSnap = await getDoc(doc(db, "settings", "fullMenu"));
      if (docSnap.exists()) setMenuData(docSnap.data().data);
    };
    fetchMenu();

    // 2. Listen to Memories Live from Firebase
    const unsubscribeMemories = onSnapshot(collection(db, "memories"), (snapshot) => {
      const fetchedMemories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMemories(fetchedMemories);
    });

    return () => unsubscribeMemories();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // This destroys the Firebase session
      navigate('/admin-login'); // Sends you back to the login screen
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  // --- FIREBASE DELETE FUNCTION ---
  const handleDeleteMemory = async (memoryId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this memory from the database?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "memories", memoryId));
      } catch (error) {
        console.error("Error deleting memory:", error);
      }
    }
  };

  const updateMenuItem = (category, index, key, value) => {
    const newData = { ...menuData };
    newData[category].items[index][key] = value;
    setMenuData(newData);
  };

  const saveMenuToFirebase = async () => {
    await updateDoc(doc(db, "settings", "fullMenu"), { data: menuData });
    alert("Menu Updated!");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-8 pb-24">
      <div className="flex justify-between items-center mb-8">
  <h1 className="text-4xl font-serif font-bold text-white">Dumble' Door Admin</h1>
  
  <button 
    onClick={handleLogout}
    className="px-4 py-2 bg-slate-800 hover:bg-red-600/80 rounded-full text-sm font-bold text-white transition-colors border border-slate-600"
  >
    Log Out
  </button>
</div>
      
      <div className="flex gap-4 mb-8">
        {['memories', 'menu', 'stats'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded font-bold capitalize transition-colors ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- MEMORIES TAB --- */}
      {activeTab === 'memories' && (
        <div className="grid gap-4">
          {memories.length === 0 ? (
            <p className="text-slate-400 italic p-4 bg-[#1E293B] rounded">No memories found in the database.</p>
          ) : (
            memories.map((m) => (
              <div key={m.id} className="bg-[#1E293B] p-5 rounded-xl flex justify-between items-center border border-slate-700 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-emerald-400 text-lg">{m.name || 'Anonymous'}</p>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                  <p className="text-slate-300 italic">"{m.review || m.text || 'No review left.'}"</p>
                  {m.items && m.items.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2">
                      Picked: <span className="font-semibold text-emerald-300">{m.items.join(', ')}</span>
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleDeleteMemory(m.id)} 
                  className="text-red-400 border border-red-400/30 bg-red-400/10 px-4 py-2 rounded hover:bg-red-400/20 hover:text-red-300 transition-colors font-bold"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- MENU EDITOR TAB --- */}
      {activeTab === 'menu' && menuData && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6">
          <div className="flex gap-2 mb-8 bg-[#0F172A] p-4 rounded-lg border border-slate-700">
            <input 
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Type new chapter name (e.g., Beverages)..."
              className="bg-[#1E293B] p-2 rounded flex-1 border border-slate-600 text-white outline-none focus:border-emerald-500"
            />
            <button 
              onClick={() => { 
                if (newCategoryName.trim() !== "") {
                  setMenuData(prevMenu => ({
                    ...prevMenu, 
                    [newCategoryName.trim()]: { 
                      theme: { bg: '#FAF6EE', text: '#472C20' }, 
                      items: [] 
                    }
                  }));
                  setNewCategoryName(''); // Clear the input field after adding
                }
              }} 
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded font-bold text-white transition-colors"
            >
              + Add Chapter
            </button>
          </div>
          
          {Object.entries(menuData).map(([cat, info], index) => (
            <div key={cat} className="mb-8 p-4 bg-[#0F172A] rounded-lg border border-slate-700">
              <h3 className="text-emerald-400 font-bold mb-4 font-mono uppercase flex justify-between items-center">
                <span>Chapter {index + 1}: {cat}</span>
                <button 
                  onClick={() => { 
                    // Removed window.confirm so VS Code stops blocking the deletion!
                    const d = {...menuData}; 
                    delete d[cat]; 
                    setMenuData(d); 
                  }} 
                  className="text-red-400 text-xs hover:text-red-300 font-sans tracking-wide border border-red-400/30 px-2 py-1 rounded"
                >
                  Delete Chapter
                </button>
              </h3>
              
              {info.items && info.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input 
                    value={item.n} 
                    onChange={(e) => updateMenuItem(cat, idx, 'n', e.target.value)} 
                    placeholder="Item Name"
                    className="bg-[#1E293B] p-2 rounded w-full border border-slate-600 text-white" 
                  />
                  <input 
                    value={item.p} 
                    onChange={(e) => updateMenuItem(cat, idx, 'p', e.target.value)} 
                    placeholder="Price"
                    className="bg-[#1E293B] p-2 rounded w-24 border border-slate-600 text-white" 
                  />
                  <button 
                    onClick={() => { 
                      // Switched from .splice() to .filter() for bulletproof React state updates
                      setMenuData(prev => ({
                        ...prev,
                        [cat]: {
                          ...prev[cat],
                          items: prev[cat].items.filter((_, i) => i !== idx)
                        }
                      }));
                    }} 
                    className="text-red-500 px-3 font-bold hover:text-red-400 bg-red-500/10 rounded border border-red-500/20"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => { 
                  setMenuData(prev => ({
                    ...prev,
                    [cat]: {
                      ...prev[cat],
                      items: [...prev[cat].items, {n:'', p:''}]
                    }
                  }));
                }} 
                className="text-sm font-bold text-emerald-500 mt-2 hover:text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20"
              >
                + Add Item
              </button>
            </div>
          ))}
          
          <button 
            onClick={saveMenuToFirebase} 
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded font-bold mt-6 text-white transition-colors text-lg"
          >
            Save All Changes to Dumble' Door
          </button>
        </div>
      )}

      {/* --- STATS TAB --- */}
      {activeTab === 'stats' && (
        <div className="space-y-12">
          {/* FOOD SECTION */}
          <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-emerald-400">Food Item Popularity</h2>
              <div className="flex gap-2">
                <input placeholder="Search items..." onChange={(e) => setItemSearch(e.target.value)} className="bg-[#0F172A] px-3 py-1 rounded text-sm border border-slate-600 text-white" />
                <select onChange={(e) => setItemSort(e.target.value)} className="bg-[#0F172A] px-2 rounded text-sm border border-slate-600 text-white">
                  <option value="name">Sort: Name</option>
                  <option value="most">Popular: Most</option>
                  <option value="least">Popular: Least</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(memories.flatMap(m => m.items || []).reduce((acc, item) => ({...acc, [item]: (acc[item] || 0) + 1}), {}))
                .filter(([name]) => name.toLowerCase().includes(itemSearch.toLowerCase()))
                .sort((a, b) => itemSort === 'name' ? a[0].localeCompare(b[0]) : itemSort === 'most' ? b[1] - a[1] : a[1] - b[1])
                .map(([item, count]) => (
                  <div key={item} className="bg-[#0F172A] p-4 rounded border border-slate-700 flex justify-between items-center">
                    <span className="font-bold">{item}</span>
                    <span className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded text-sm">{count} selections</span>
                  </div>
                ))}
            </div>
          </div>

          {/* GUEST SECTION */}
          <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-emerald-400">Guest Activity Ledger</h2>
              <div className="flex gap-2">
                <input placeholder="Search guest..." onChange={(e) => setGuestSearch(e.target.value)} className="bg-[#0F172A] px-3 py-1 rounded text-sm border border-slate-600 text-white" />
                <select onChange={(e) => setGuestSort(e.target.value)} className="bg-[#0F172A] px-2 rounded text-sm border border-slate-600 text-white">
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {[...memories]
                .filter(m => (m.name || '').toLowerCase().includes(guestSearch.toLowerCase()))
                .sort((a, b) => guestSort === 'latest' ? (b.createdAt || 0) - (a.createdAt || 0) : guestSort === 'oldest' ? (a.createdAt || 0) - (b.createdAt || 0) : (a.name || '').localeCompare(b.name || ''))
                .map((m, i) => (
                  <div key={i} className="bg-[#0F172A] p-4 rounded border border-slate-700 grid md:grid-cols-3 gap-4 items-center">
                    <div>
                      <p className="font-bold text-white text-lg">{m.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400 mt-1">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'No date'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Picked:</p>
                      <p className="font-semibold text-emerald-300">{m.items ? m.items.join(', ') : 'Nothing'}</p>
                    </div>
                    <div className="italic text-slate-300 text-sm border-l pl-4 border-slate-600">
                      "{m.review || m.text || 'No review'}"
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPortal;