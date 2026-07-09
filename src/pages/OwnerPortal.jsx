import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CHART_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6'];

const RATING_LABELS = { 1: '🌧️ Missed', 2: '😐 Okay', 3: '✨ Good', 4: '🎉 Amazing' };

/* ---------------------------------------------------------------------
   Small reusable stat card
--------------------------------------------------------------------- */
const StatCard = ({ label, value, sub, accent = '#10B981' }) => (
  <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 flex flex-col gap-1 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent }} />
    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</span>
    <span className="text-3xl font-black text-white">{value}</span>
    {sub && <span className="text-xs text-slate-500">{sub}</span>}
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-lg font-bold text-white">{title}</h3>
    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

const OwnerPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('memories');

  // Live database state
  const [menuData, setMenuData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [hueHuntMatches, setHueHuntMatches] = useState([]);

  // Stats tab controls
  const [itemSearch, setItemSearch] = useState('');
  const [itemSort, setItemSort] = useState('count'); // 'count' | 'name'
  const [playerSearch, setPlayerSearch] = useState('');

  // Menu editor controls
  const [newCategoryName, setNewCategoryName] = useState('');

  // Global settings
  const [cafeInfo, setCafeInfo] = useState({
    name: "Dumble' Door",
    locationText: "Jagda, Rourkela",
    mapLink: "",
    startDay: "Tuesday",
    endDay: "Sunday",
    hours: "11:30 - 9:00",
    phone: ""
  });
  const [originalCafeInfo, setOriginalCafeInfo] = useState({});
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  // --- AUTH + LIVE DATA SUBSCRIPTIONS ---
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

    const fetchInitialData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "fullMenu"));
      if (docSnap.exists()) setMenuData(docSnap.data().data);

      const infoSnap = await getDoc(doc(db, "settings", "cafeInfo"));
      if (infoSnap.exists()) {
        setCafeInfo(infoSnap.data());
        setOriginalCafeInfo(infoSnap.data());
      }
    };
    fetchInitialData();

    // Real-time listeners — Stats tab is derived entirely from these,
    // so it's always live Firebase data, never mocked/placeholder numbers.
    const unsubscribeMemories = onSnapshot(collection(db, "memories"), (snapshot) => {
      setMemories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubscribeGames = onSnapshot(collection(db, "hue_hunt_matches"), (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setHueHuntMatches(fetched.sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0)));
    });

    return () => {
      unsubscribeAuth();
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

  const handleDeleteRecord = async (id, collectionName) => {
    if (window.confirm("Are you sure you want to permanently delete this record?")) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  // --- MENU EDITOR HELPERS (schema: settings/fullMenu.data = { [category]: { theme, items[] } }) ---
  const updateMenuItem = (category, index, key, value) => {
    const newData = { ...menuData };
    newData[category].items[index][key] = value;
    setMenuData(newData);
  };

  const saveMenuToFirebase = async () => {
    setIsSavingMenu(true);
    try {
      await updateDoc(doc(db, "settings", "fullMenu"), { data: menuData });
      alert("Menu Updated!");
    } catch (e) {
      console.error(e);
      alert("Failed to save menu changes.");
    }
    setIsSavingMenu(false);
  };

  const handleSaveCafeInfo = async () => {
    setIsSavingInfo(true);
    const googleMapsRegex = /^https?:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com)/;

    if (cafeInfo.mapLink && !googleMapsRegex.test(cafeInfo.mapLink)) {
      alert("❌ Invalid Google Maps link! Please provide a valid link (e.g., https://maps.app.goo.gl/...). Restoring previous location link.");
      setCafeInfo(prev => ({ ...prev, mapLink: originalCafeInfo.mapLink || "" }));
      setIsSavingInfo(false);
      return;
    }

    try {
      await setDoc(doc(db, "settings", "cafeInfo"), cafeInfo);
      setOriginalCafeInfo(cafeInfo);
      alert("✅ Global Café Settings updated successfully!");
    } catch (error) {
      console.error("Error saving info:", error);
      alert("❌ Failed to save settings.");
    }
    setIsSavingInfo(false);
  };

  /* =====================================================================
     STATS — everything below is computed live from `memories` and
     `hueHuntMatches`, which are the real onSnapshot-subscribed Firestore
     collections above. No mock/placeholder data anywhere in this tab.
  ===================================================================== */

  const reviewStats = useMemo(() => {
    const total = memories.length;
    if (total === 0) {
      return { total: 0, avgRating: 0, ratingBuckets: [], topDishes: [], topVibes: [], topPurposes: [] };
    }

    const sumRating = memories.reduce((sum, m) => sum + (Number(m.rating) || 0), 0);
    const avgRating = (sumRating / total).toFixed(2);

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    memories.forEach(m => {
      const r = Number(m.rating);
      if (ratingCounts[r] !== undefined) ratingCounts[r] += 1;
    });
    const ratingBuckets = Object.entries(ratingCounts).map(([r, count]) => ({
      name: RATING_LABELS[r] || r,
      count
    }));

    const countBy = (field) => {
      const counts = {};
      memories.forEach(m => {
        const key = m[field];
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    };

    const topVibes = countBy('vibe').slice(0, 6);
    const topPurposes = countBy('purpose').slice(0, 6);

    // Dishes / items — flatten the `items` array across every memory doc
    const dishCounts = {};
    memories.forEach(m => {
      (m.items || []).forEach(item => {
        dishCounts[item] = (dishCounts[item] || 0) + 1;
      });
      if (m.dish) dishCounts[m.dish] = (dishCounts[m.dish] || 0) + 0; // ensure favorite dish is tracked even if items missing
    });
    const topDishes = Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { total, avgRating, ratingBuckets, topDishes, topVibes, topPurposes };
  }, [memories]);

  const gameStats = useMemo(() => {
    const total = hueHuntMatches.length;
    if (total === 0) {
      return { total: 0, avgScore: 0, topPlayers: [], scoreBuckets: [] };
    }

    const sumScore = hueHuntMatches.reduce((sum, m) => sum + (Number(m.finalScore) || 0), 0);
    const avgScore = (sumScore / total).toFixed(1);

    // Best score per player, ranked descending
    const bestPerPlayer = {};
    hueHuntMatches.forEach(m => {
      const name = m.playerName || 'Anonymous Hunter';
      const score = Number(m.finalScore) || 0;
      if (!bestPerPlayer[name] || score > bestPerPlayer[name].finalScore) {
        bestPerPlayer[name] = m;
      }
    });
    const topPlayers = Object.values(bestPerPlayer).sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

    const scoreBuckets = [
      { name: '0-49%', count: 0 },
      { name: '50-64%', count: 0 },
      { name: '65-79%', count: 0 },
      { name: '80-100%', count: 0 }
    ];
    hueHuntMatches.forEach(m => {
      const s = Number(m.finalScore) || 0;
      if (s < 50) scoreBuckets[0].count++;
      else if (s < 65) scoreBuckets[1].count++;
      else if (s < 80) scoreBuckets[2].count++;
      else scoreBuckets[3].count++;
    });

    return { total, avgScore, topPlayers, scoreBuckets };
  }, [hueHuntMatches]);

  const filteredTopDishes = useMemo(() => {
    let list = reviewStats.topDishes.filter(d =>
      d.name.toLowerCase().includes(itemSearch.toLowerCase())
    );
    if (itemSort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [reviewStats.topDishes, itemSearch, itemSort]);

  const filteredPlayers = useMemo(() => {
    return gameStats.topPlayers.filter(p =>
      (p.playerName || '').toLowerCase().includes(playerSearch.toLowerCase())
    );
  }, [gameStats.topPlayers, playerSearch]);

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
                    {m.rating && (
                      <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-bold">
                        {RATING_LABELS[m.rating] || `Rating ${m.rating}`}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 italic">"{m.review || m.text || 'No review left.'}"</p>

                  {m.items && m.items.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2">Picked: <span className="font-semibold text-emerald-300">{m.items.join(', ')}</span></p>
                  )}

                  {(m.photo || m.photoURL) && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">📸 Guest Snapshot</p>
                      <img src={m.photo || m.photoURL} alt="Guest Memory" className="h-40 w-auto object-cover rounded-lg border-2 border-slate-600 shadow-md transform -rotate-2 hover:rotate-0 transition-transform" />
                    </div>
                  )}
                </div>
                <button onClick={() => handleDeleteRecord(m.id, "memories")} className="text-red-400 border border-red-400/30 bg-red-400/10 px-4 py-2 rounded hover:bg-red-400/20 hover:text-red-300 transition-colors font-bold mt-1">Delete</button>
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
                <button onClick={() => { const d = { ...menuData }; delete d[cat]; setMenuData(d); }} className="text-red-400 text-xs hover:text-red-300 font-sans tracking-wide border border-red-400/30 px-2 py-1 rounded">Delete Chapter</button>
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

                    <button onClick={() => { setMenuData(prev => ({ ...prev, [cat]: { ...prev[cat], items: prev[cat].items.filter((_, i) => i !== idx) } })); }} className="text-red-500 px-3 font-bold hover:text-red-400 bg-red-500/10 rounded border border-red-500/20 py-2">×</button>
                  </div>

                  <input value={item.desc || ''} onChange={(e) => updateMenuItem(cat, idx, 'desc', e.target.value)} placeholder="Item description..." className="bg-[#0F172A] p-2 rounded w-full border border-slate-600 text-slate-300 outline-none focus:border-emerald-500 text-sm italic" />
                </div>
              ))}

              <button onClick={() => { setMenuData(prev => ({ ...prev, [cat]: { ...prev[cat], items: [...prev[cat].items, { n: '', p: '' }] } })); }} className="text-sm font-bold text-emerald-500 mt-2 hover:text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">+ Add Item</button>
            </div>
          ))}

          <button onClick={saveMenuToFirebase} disabled={isSavingMenu} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded font-bold mt-6 text-white transition-colors text-lg disabled:opacity-50">
            {isSavingMenu ? 'Saving...' : 'Save All Menu Changes'}
          </button>
        </div>
      )}

      {/* --- STATS TAB (100% live Firebase data, no placeholders) --- */}
      {activeTab === 'stats' && (
        <div className="space-y-10">

          {/* Top-level metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Reviews" value={reviewStats.total} accent="#10B981" />
            <StatCard label="Avg. Rating" value={reviewStats.total ? `${reviewStats.avgRating} / 4` : '—'} accent="#F59E0B" />
            <StatCard label="Games Played" value={gameStats.total} accent="#3B82F6" />
            <StatCard label="Avg. Hunt Score" value={gameStats.total ? `${gameStats.avgScore}%` : '—'} accent="#EC4899" />
          </div>

          {/* Rating distribution + purpose breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
              <SectionHeader title="Guest Satisfaction Breakdown" subtitle="Ratings collected from the review wizard" />
              {reviewStats.total === 0 ? (
                <p className="text-slate-500 italic text-sm">No reviews yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reviewStats.ratingBuckets}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                      <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
              <SectionHeader title="Why Guests Visit" subtitle="Purpose selected in the review wizard" />
              {reviewStats.topPurposes.length === 0 ? (
                <p className="text-slate-500 italic text-sm">No purpose data yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reviewStats.topPurposes}
                        dataKey="count"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {reviewStats.topPurposes.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Hue Hunt score distribution */}
          <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
            <SectionHeader title="Hue Hunt Score Distribution" subtitle="All submitted match results" />
            {gameStats.total === 0 ? (
              <p className="text-slate-500 italic text-sm">No games played yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gameStats.scoreBuckets} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94A3B8" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#94A3B8" width={80} fontSize={12} />
                    <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Popular items — searchable/sortable */}
          <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <SectionHeader title="Most Ordered Items" subtitle="Counted from every guestbook entry" />
              <div className="flex gap-2">
                <input
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search dish..."
                  className="bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
                <select
                  value={itemSort}
                  onChange={(e) => setItemSort(e.target.value)}
                  className="bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="count">Sort: Most Popular</option>
                  <option value="name">Sort: A–Z</option>
                </select>
              </div>
            </div>

            {filteredTopDishes.length === 0 ? (
              <p className="text-slate-500 italic text-sm">No matching items.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredTopDishes.slice(0, 30).map((d, i) => (
                  <div key={d.name} className="flex justify-between items-center bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2">
                    <span className="text-sm font-semibold text-slate-200 truncate">{i < 3 ? ['🥇', '🥈', '🥉'][i] : ''} {d.name}</span>
                    <span className="text-emerald-400 font-black text-sm">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- GAMES TAB — leaderboard with player name + score front and center --- */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-emerald-400">Hue Hunt Arcade Ledger</h2>
              <p className="text-sm text-slate-400 mt-1">Best score per player, ranked — plus the full match log below.</p>
            </div>
            <input
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder="Search player..."
              className="bg-[#1E293B] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 w-full md:w-64"
            />
          </div>

          {/* --- LEADERBOARD: name + score, ranked --- */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_6rem] gap-2 px-5 py-3 bg-[#0F172A]/60 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Score</span>
            </div>
            {filteredPlayers.length === 0 ? (
              <p className="text-slate-400 italic p-5">No matching players.</p>
            ) : (
              filteredPlayers.map((p, i) => (
                <div
                  key={p.playerName + i}
                  className={`grid grid-cols-[3rem_1fr_6rem] gap-2 px-5 py-3 items-center border-t border-slate-800 ${i === 0 ? 'bg-amber-400/5' : ''}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="font-bold text-white truncate">{p.playerName || 'Anonymous Hunter'}</span>
                  <span className={`text-right font-black ${p.finalScore >= 80 ? 'text-emerald-400' : p.finalScore >= 50 ? 'text-blue-400' : 'text-red-400'}`}>
                    {p.finalScore ?? 0}%
                  </span>
                </div>
              ))
            )}
          </div>

          {/* --- FULL MATCH LOG (with photos, per-match detail) --- */}
          <div>
            <SectionHeader title="Full Match Log" subtitle="Every submitted attempt, most recent first" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hueHuntMatches.length === 0 ? <p className="text-slate-400 italic">No games have been played yet.</p> : (
                hueHuntMatches
                  .filter(m => (m.playerName || '').toLowerCase().includes(playerSearch.toLowerCase()))
                  .map((match) => (
                    <div key={match.id} className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
                      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#0F172A]/50">
                        <div>
                          <p className="font-black text-lg text-white">{match.playerName || 'Anonymous Hunter'}</p>
                          <p className="text-xs text-slate-400 font-mono">{match.playedAt ? new Date(match.playedAt).toLocaleString() : 'Unknown Date'}</p>
                        </div>
                        <button onClick={() => handleDeleteRecord(match.id, "hue_hunt_matches")} className="text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs rounded hover:bg-red-400/20 transition-colors font-bold">Delete</button>
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
        </div>
      )}

      {/* --- GLOBAL SETTINGS TAB --- */}
      {activeTab === 'settings' && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">🌍 Global Café Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Café Name</label>
              <input type="text" value={cafeInfo.name} onChange={(e) => setCafeInfo({ ...cafeInfo, name: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Location Display Text</label>
              <input type="text" value={cafeInfo.locationText} onChange={(e) => setCafeInfo({ ...cafeInfo, locationText: e.target.value })} placeholder="e.g. Jagda, Rourkela" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Public Phone Number</label>
              <input type="text" value={cafeInfo.phone} onChange={(e) => setCafeInfo({ ...cafeInfo, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Google Maps Link</label>
              <input type="url" value={cafeInfo.mapLink} onChange={(e) => setCafeInfo({ ...cafeInfo, mapLink: e.target.value })} placeholder="https://maps.app.goo.gl/..." className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
              <p className="text-xs text-slate-500 mt-1">Must be a valid Google Maps URL. Invalid links will be rejected on save.</p>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Operating Days</label>
              <div className="flex items-center gap-4">
                <select value={cafeInfo.startDay} onChange={(e) => setCafeInfo({ ...cafeInfo, startDay: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                  {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <span className="text-slate-400 font-bold">to</span>
                <select value={cafeInfo.endDay} onChange={(e) => setCafeInfo({ ...cafeInfo, endDay: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                  {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Operating Hours</label>
              <input type="text" value={cafeInfo.hours} onChange={(e) => setCafeInfo({ ...cafeInfo, hours: e.target.value })} placeholder="11:30 AM - 9:00 PM" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
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