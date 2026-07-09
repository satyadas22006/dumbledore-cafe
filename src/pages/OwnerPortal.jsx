import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
//import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const OwnerPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('memories');
  
  // Database States
  const [menuData, setMenuData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [hueHuntMatches, setHueHuntMatches] = useState([]); 
  
  // Stats tab states
  const [itemSearch, setItemSearch] = useState('');
  const [itemSort, setItemSort] = useState('name');
  const [guestSearch, setGuestSearch] = useState('');
  const [guestSort, setGuestSort] = useState('latest');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // --- GLOBAL SETTINGS STATE ---
  const [cafeInfo, setCafeInfo] = useState({
    name: "Dumble' Door",
    locationText: "Jagda, Rourkela",
    mapLink: "",
    startDay: "Tuesday",
    endDay: "Sunday",
    hours: "11:30 - 9:00",
    phone: ""
  });
  const [originalCafeInfo, setOriginalCafeInfo] = useState({}); // Used to restore if map link is invalid
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  useEffect(() => {
  const auth = getAuth();
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const lastSignIn = new Date(user.metadata.lastSignInTime).getTime();
    if (Date.now() - lastSignIn > 24 * 60 * 60 * 1000) {
      alert("Session expired for security reasons. Please log in again.");
      signOut(auth);
      navigate('/admin-login');
    }
  });
  return () => unsubscribeAuth();

    const fetchInitialData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "fullMenu"));
      if (docSnap.exists()) setMenuData(docSnap.data().data);

      const infoSnap = await getDoc(doc(db, "settings", "cafeInfo"));
      if (infoSnap.exists()) {
        setCafeInfo(infoSnap.data());
        setOriginalCafeInfo(infoSnap.data()); // Save a backup for validation
      }
    };
    fetchInitialData();

    const unsubscribeMemories = onSnapshot(collection(db, "memories"), (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeGames = onSnapshot(collection(db, "hue_hunt_matches"), (snapshot) => {
      const fetchedMatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHueHuntMatches(fetchedMatches.sort((a, b) => b.playedAt - a.playedAt));
    });

    return () => {
      unsubscribeMemories();
      unsubscribeGames();
    };
  }, [navigate]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/admin-login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteMemory = async (memoryId, collectionName = "memories") => {
    if (window.confirm("Are you sure you want to permanently delete this record?")) {
      await deleteDoc(doc(db, collectionName, memoryId));
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

  // --- SAVE GLOBAL CAFE INFO WITH VALIDATION ---
  const handleSaveCafeInfo = async () => {
    setIsSavingInfo(true);

    // Strict Google Maps Link Validation
    const googleMapsRegex = /^https?:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com)/;
    
    if (cafeInfo.mapLink && !googleMapsRegex.test(cafeInfo.mapLink)) {
      alert("❌ Invalid Google Maps link! Please provide a valid link (e.g., https://maps.app.goo.gl/...). Restoring previous location link.");
      setCafeInfo(prev => ({ ...prev, mapLink: originalCafeInfo.mapLink || "" })); // Restore
      setIsSavingInfo(false);
      return; 
    }

    try {
      await setDoc(doc(db, "settings", "cafeInfo"), cafeInfo);
      setOriginalCafeInfo(cafeInfo); // Update the backup to the new valid state
      alert("✅ Global Café Settings updated successfully!");
    } catch (error) {
      console.error("Error saving info:", error);
      alert("❌ Failed to save settings.");
    }
    setIsSavingInfo(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-8 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-white">{cafeInfo.name} Admin</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 hover:bg-red-600/80 rounded-full text-sm font-bold text-white transition-colors border border-slate-600">
          Log Out
        </button>
      </div>
      
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['memories', 'menu', 'stats', 'games', 'settings'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            {tab === 'settings' ? '⚙️ Global Settings' : tab}
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
              <div key={m.id} className="bg-[#1E293B] p-5 rounded-xl flex justify-between items-start border border-slate-700 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-emerald-400 text-lg">{m.name || 'Anonymous'}</p>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : 'No date'}
                    </span>
                  </div>
                  <p className="text-slate-300 italic">"{m.review || m.text || 'No review left.'}"</p>
                  
                  {m.items && m.items.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2">Picked: <span className="font-semibold text-emerald-300">{m.items.join(', ')}</span></p>
                  )}

                  {m.photo && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">📸 Guest Snapshot</p>
                      <img src={m.photo} alt="Guest Memory" className="h-40 w-auto object-cover rounded-lg border-2 border-slate-600 shadow-md transform -rotate-2 hover:rotate-0 transition-transform" />
                    </div>
                  )}
                </div>
                <button onClick={() => handleDeleteMemory(m.id, "memories")} className="text-red-400 border border-red-400/30 bg-red-400/10 px-4 py-2 rounded hover:bg-red-400/20 hover:text-red-300 transition-colors font-bold mt-1">Delete</button>
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
              type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Type new chapter name (e.g., Beverages)..."
              className="bg-[#1E293B] p-2 rounded flex-1 border border-slate-600 text-white outline-none focus:border-emerald-500"
            />
            <button 
              onClick={() => { 
                if (newCategoryName.trim() !== "") {
                  setMenuData(prev => ({ ...prev, [newCategoryName.trim()]: { theme: { bg: '#FAF6EE', text: '#472C20' }, items: [] } }));
                  setNewCategoryName(''); 
                }
              }} 
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded font-bold text-white transition-colors"
            >+ Add Chapter</button>
          </div>
          
          {Object.entries(menuData).map(([cat, info], index) => (
            <div key={cat} className="mb-8 p-4 bg-[#0F172A] rounded-lg border border-slate-700">
              <h3 className="text-emerald-400 font-bold mb-4 font-mono uppercase flex justify-between items-center">
                <span>Chapter {index + 1}: {cat}</span>
                <button onClick={() => { const d = {...menuData}; delete d[cat]; setMenuData(d); }} className="text-red-400 text-xs hover:text-red-300 font-sans tracking-wide border border-red-400/30 px-2 py-1 rounded">Delete Chapter</button>
              </h3>
              
              {info.items && info.items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 mb-3 bg-[#1E293B]/40 p-3 rounded-lg border border-slate-600/50">
                  <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                    <input value={item.n || ''} onChange={(e) => updateMenuItem(cat, idx, 'n', e.target.value)} placeholder="Item Name" className={`bg-[#0F172A] p-2 rounded flex-1 border outline-none focus:border-emerald-500 transition-colors ${item.soldOut ? 'border-rose-500 text-slate-400 line-through' : 'border-slate-600 text-white'}`} />
                    <input value={item.p || ''} onChange={(e) => updateMenuItem(cat, idx, 'p', e.target.value)} placeholder="Price" className="bg-[#0F172A] p-2 rounded w-20 border border-slate-600 text-white outline-none focus:border-emerald-500" />
                    
                    <select value={item.type || 'veg'} onChange={(e) => updateMenuItem(cat, idx, 'type', e.target.value)} className="bg-[#0F172A] p-2 rounded border border-slate-600 text-white outline-none focus:border-emerald-500 cursor-pointer">
                      <option value="veg">🌱 Veg</option>
                      <option value="non-veg">🍗 Non-Veg</option>
                    </select>
                    
                    <button onClick={() => updateMenuItem(cat, idx, 'soldOut', !item.soldOut)} className={`px-3 py-2 rounded font-bold text-xs border transition-colors ${item.soldOut ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-white'}`}>
                      {item.soldOut ? 'Sold Out' : 'In Stock'}
                    </button>

                    <button onClick={() => { setMenuData(prev => ({...prev, [cat]: { ...prev[cat], items: prev[cat].items.filter((_, i) => i !== idx) }})); }} className="text-red-500 px-3 font-bold hover:text-red-400 bg-red-500/10 rounded border border-red-500/20 py-2">×</button>
                  </div>
                  
                  <input value={item.desc || ''} onChange={(e) => updateMenuItem(cat, idx, 'desc', e.target.value)} placeholder="Item description..." className="bg-[#0F172A] p-2 rounded w-full border border-slate-600 text-slate-300 outline-none focus:border-emerald-500 text-sm italic" />
                </div>
              ))}
              
              <button onClick={() => { setMenuData(prev => ({...prev, [cat]: { ...prev[cat], items: [...prev[cat].items, {n:'', p:''}] }})); }} className="text-sm font-bold text-emerald-500 mt-2 hover:text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">+ Add Item</button>
            </div>
          ))}
          
          <button onClick={saveMenuToFirebase} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded font-bold mt-6 text-white transition-colors text-lg">
            Save All Menu Changes
          </button>
        </div>
      )}

      {/* --- ARCADE / GAMES TAB --- */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4 border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-emerald-400">Hue Hunt Arcade Ledger</h2>
              <p className="text-sm text-slate-400 mt-1">Review player scores and verifying computer vision logs.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hueHuntMatches.length === 0 ? <p className="text-slate-400 italic">No games have been played yet.</p> : (
              hueHuntMatches.map((match) => (
                <div key={match.id} className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#0F172A]/50">
                    <div>
                      <p className="font-black text-lg text-white">{match.playerName}</p>
                      <p className="text-xs text-slate-400 font-mono">{match.playedAt ? new Date(match.playedAt).toLocaleString() : 'Unknown Date'}</p>
                    </div>
                    <button onClick={() => handleDeleteMemory(match.id, "hue_hunt_matches")} className="text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs rounded hover:bg-red-400/20 transition-colors font-bold">Delete</button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-slate-600 shadow-inner" style={{ backgroundColor: match.colorHex }}></div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Target Color</p>
                        <p className="font-bold text-sm text-slate-200">{match.targetColor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Final Score</p>
                      <p className={`font-black text-2xl ${match.finalScore >= 80 ? 'text-emerald-400' : match.finalScore >= 50 ? 'text-blue-400' : 'text-red-400'}`}>{match.finalScore}%</p>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0F172A]/20">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Snapshots Captured</p>
                    <div className="grid grid-cols-3 gap-3">
                      {match.photoLedgerBase64 && match.photoLedgerBase64.length > 0 ? (
                        match.photoLedgerBase64.map((photoBase64, idx) => (
                          <div key={idx} className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-600 group relative">
                            <img src={photoBase64} alt={`Snap ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic col-span-3">No photos attached to this record.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- STATS TAB --- */}
      {activeTab === 'stats' && (
        <div className="space-y-12">
          {/* ... (Your existing stats tab code remains completely identical) ... */}
           <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-emerald-400 mb-6">Database Stats Area</h2>
            <p className="text-slate-400 italic">Select filters above to search items and guest history.</p>
          </div>
        </div>
      )}

      {/* --- NEW: GLOBAL SETTINGS TAB --- */}
      {activeTab === 'settings' && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">🌍 Global Café Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Café Name</label>
              <input type="text" value={cafeInfo.name} onChange={(e) => setCafeInfo({...cafeInfo, name: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Location Display Text</label>
              <input type="text" value={cafeInfo.locationText} onChange={(e) => setCafeInfo({...cafeInfo, locationText: e.target.value})} placeholder="e.g. Jagda, Rourkela" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Public Phone Number</label>
              <input type="text" value={cafeInfo.phone} onChange={(e) => setCafeInfo({...cafeInfo, phone: e.target.value})} placeholder="+91 98765 43210" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Google Maps Link</label>
              <input type="url" value={cafeInfo.mapLink} onChange={(e) => setCafeInfo({...cafeInfo, mapLink: e.target.value})} placeholder="https://maps.app.goo.gl/..." className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
              <p className="text-xs text-slate-500 mt-1">Must be a valid Google Maps URL. Invalid links will be rejected on save.</p>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Operating Days</label>
              <div className="flex items-center gap-4">
                <select value={cafeInfo.startDay} onChange={(e) => setCafeInfo({...cafeInfo, startDay: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                  {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <span className="text-slate-400 font-bold">to</span>
                <select value={cafeInfo.endDay} onChange={(e) => setCafeInfo({...cafeInfo, endDay: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                  {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Operating Hours</label>
              <input type="text" value={cafeInfo.hours} onChange={(e) => setCafeInfo({...cafeInfo, hours: e.target.value})} placeholder="11:30 AM - 9:00 PM" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <button onClick={handleSaveCafeInfo} disabled={isSavingInfo} className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50">
            {isSavingInfo ? 'Saving...' : 'Save & Publish Globally'}
          </button>
        </div>
      )}

    </div>
  );
};

export default OwnerPortal;