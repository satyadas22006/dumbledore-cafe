import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Trash2, LogOut, ShieldAlert, Database, Utensils, PowerOff } from 'lucide-react';
import { FULL_MENU } from '../constants/data';

export default function OwnerPortal({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('memories');
  const [liveMemories, setLiveMemories] = useState([]);
  const [soldOutItems, setSoldOutItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAdminData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Memories
      const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
      const memorySnap = await getDocs(q);
      setLiveMemories(memorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 2. Fetch Menu Availability State
      const menuRef = doc(db, "settings", "menuState");
      const menuSnap = await getDoc(menuRef);
      if (menuSnap.exists() && menuSnap.data().soldOut) {
        setSoldOutItems(menuSnap.data().soldOut);
      }
    } catch (error) {
      console.error("Error fetching admin data: ", error);
    }
    setLoading(false);
  };

  // Auth Handlers
  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Firebase Login Error:", error.code, error.message);
      
      // Let's print the EXACT error Firebase is throwing to the screen
      if (error.code === 'auth/invalid-credential') {
        setLoginError('Incorrect email or password. Please double-check.');
      } else if (error.code === 'auth/user-not-found') {
        setLoginError('This email is not registered in Firebase.');
      } else if (error.code === 'auth/wrong-password') {
        setLoginError('Wrong password.');
      } else {
        setLoginError(`Error: ${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setLiveMemories([]);
  };

  // Memory Deletion
  const handleDeleteMemory = async (id) => {
    if (window.confirm("PERMANENTLY DELETE this memory from the public wall?")) {
      await deleteDoc(doc(db, "memories", id));
      setLiveMemories(liveMemories.filter(m => m.id !== id));
    }
  };

  // Menu Availability Toggle
  const toggleItemStatus = async (itemName) => {
    const isCurrentlySoldOut = soldOutItems.includes(itemName);
    const updatedList = isCurrentlySoldOut 
      ? soldOutItems.filter(item => item !== itemName) // Remove from sold out
      : [...soldOutItems, itemName]; // Add to sold out

    setSoldOutItems(updatedList);
    // Save to Firebase instantly
    await setDoc(doc(db, "settings", "menuState"), { soldOut: updatedList }, { merge: true });
  };

  // Flatten the menu for easy mapping
  const allMenuItems = Object.values(FULL_MENU).flatMap(category => category.items);

  // --- STRICT DARK MODE LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-200 flex items-center justify-center p-6 absolute inset-0 z-[999]">
        <div className="w-full max-w-md bg-[#1E293B] p-10 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="flex flex-col items-center gap-4 mb-10 text-emerald-400">
            <ShieldAlert size={48} />
            <h2 className="text-2xl font-mono font-bold tracking-widest uppercase">Admin Terminal</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase font-mono mb-2 text-slate-400 tracking-wider">Clearance Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono" />
            </div>
            <div>
              <label className="block text-xs uppercase font-mono mb-2 text-slate-400 tracking-wider">Passcode</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono" />
            </div>
            {loginError && <p className="text-xs text-rose-400 font-mono text-center">{loginError}</p>}
            <button type="submit" className="w-full py-4 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-colors uppercase tracking-widest font-mono mt-4">Initialize Access</button>
          </form>
          <button onClick={() => onNavigate('home')} className="w-full text-center mt-6 text-xs font-mono text-slate-500 hover:text-slate-300">← Return to Public Site</button>
        </div>
      </div>
    );
  }

  // --- STRICT DARK MODE DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 absolute inset-0 z-[999] overflow-y-auto">
      {/* Admin Header */}
      <header className="bg-[#1E293B] border-b border-slate-800 p-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-emerald-400" size={28} />
          <div>
            <h1 className="text-xl font-mono font-bold text-white uppercase tracking-widest">Dumble' Door System</h1>
            <p className="text-xs font-mono text-emerald-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> SYSTEM ONLINE</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('home')} className="px-4 py-2 text-xs font-mono border border-slate-600 rounded hover:bg-slate-800 transition-colors flex items-center gap-2"><PowerOff size={14}/> Exit Portal</button>
          <button onClick={handleLogout} className="px-4 py-2 text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors flex items-center gap-2"><LogOut size={14}/> Sign Out</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button onClick={() => setActiveTab('memories')} className={`w-full flex items-center gap-3 p-4 rounded-lg font-mono text-sm transition-all ${activeTab === 'memories' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'}`}>
            <Database size={18} /> Manage Memories
          </button>
          <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 p-4 rounded-lg font-mono text-sm transition-all ${activeTab === 'menu' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'}`}>
            <Utensils size={18} /> Menu Availability
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="p-12 text-center font-mono text-emerald-400 animate-pulse">Syncing with cloud database...</div>
          ) : activeTab === 'memories' ? (
            <div className="bg-[#1E293B] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h2 className="font-mono text-lg font-bold text-white">Public Memory Vault ({liveMemories.length})</h2>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-mono text-slate-500 uppercase bg-[#0F172A]">
                    <th className="p-4">Author</th>
                    <th className="p-4">Memory Text</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans text-sm">
                  {liveMemories.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono text-emerald-400">{m.name || 'Anonymous'}</td>
                      <td className="p-4 text-slate-300 max-w-md truncate">"{m.text || m.highlights?.[0]}"</td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDeleteMemory(m.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#1E293B] border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-6">
              <div className="mb-6">
                <h2 className="font-mono text-lg font-bold text-white mb-2">Live Menu Availability</h2>
                <p className="text-slate-400 text-sm">Toggle items here to instantly mark them as "Sold Out" on the public cafe menu.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allMenuItems.map(item => {
                  const isSoldOut = soldOutItems.includes(item.n);
                  return (
                    <div key={item.n} className="flex justify-between items-center p-4 rounded-lg bg-[#0F172A] border border-slate-800">
                      <div>
                        <p className={`font-serif text-lg ${isSoldOut ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{item.n}</p>
                        <p className="font-mono text-xs text-slate-500">₹{item.p}</p>
                      </div>
                      <button 
                        onClick={() => toggleItemStatus(item.n)} 
                        className={`px-4 py-2 font-mono text-xs font-bold rounded uppercase tracking-wider transition-colors ${isSoldOut ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}
                      >
                        {isSoldOut ? 'Sold Out' : 'In Stock'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}