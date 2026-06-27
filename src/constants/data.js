// src/constants/data.js
export const THEMES = {
  cream: { bg: '#FDFBF7', text: '#2C241B', btn: '#2C241B', btnText: '#FDFBF7', border: 'rgba(44,36,27,0.1)' },
  forest: { bg: '#112A22', text: '#FDFBF7', btn: '#FDFBF7', btnText: '#112A22', border: 'rgba(253,251,247,0.1)' },
  terra: { bg: '#A64226', text: '#FDFBF7', btn: '#FDFBF7', btnText: '#A64226', border: 'rgba(253,251,247,0.1)' },
  navy: { bg: '#1E293B', text: '#FDFBF7', btn: '#FDFBF7', btnText: '#1E293B', border: 'rgba(253,251,247,0.1)' },
  rose: { bg: '#E2C7C0', text: '#2C241B', btn: '#2C241B', btnText: '#E2C7C0', border: 'rgba(44,36,27,0.1)' },
  sand: { bg: '#D1C7BD', text: '#2C241B', btn: '#2C241B', btnText: '#D1C7BD', border: 'rgba(44,36,27,0.1)' },
  charcoal: { bg: '#222222', text: '#FDFBF7', btn: '#FDFBF7', btnText: '#222222', border: 'rgba(253,251,247,0.1)' }
};

export const FULL_MENU = {
  "Sliders": { theme: THEMES.forest, items: [{n: "Green Day", p: 69}, {n: "Egg-Splosive", p: 79}, {n: "BBQ Chickenizer", p: 99}, {n: "Peppy Paneer", p: 99}] },
  "Burgers": { theme: THEMES.terra, items: [{n: "Big Crunch Tikki", p: 119}, {n: "The Big Brown", p: 149}, {n: "The Mexican Dominator", p: 159}] },
  "Pasta": { theme: THEMES.navy, items: [{n: "Fusilli Arrabiata", p: 149}, {n: "Spaghetti Meatball", p: 179}, {n: "Baked Mac & Cheese", p: 189}] },
  "Chinese": { theme: THEMES.rose, items: [{n: "Veg Steamed Momos", p: 60}, {n: "Chicken Steamed Momos", p: 70}, {n: "Paneer Steamed Bao", p: 80}] },
  "Beverages": { theme: THEMES.cream, items: [{n: "Cold Coffee", p: 79}, {n: "Virgin Mojito", p: 99}, {n: "Kit-Kat Milkshake", p: 119}] }
};

export const DEFAULT_MEMORIES = [
  { id: 1, name: "Local Student", text: "The chutney keeps bringing me back. Best momos in Jagda!", dish: "Chicken Steamed Momos", vibe: "🥟 Foodie", highlights: ["Authentic Taste"], reason: "🥟 The Cravings", rating: "😍 Amazing", createdAt: Date.now() - 86400000, items: ["Chicken Steamed Momos"] },
  { id: 2, name: "Anonymous Enjoyer", text: "Still my favorite rainy-day meal.", dish: "Spaghetti Meatball", vibe: "🌧 Comfort Seeker", highlights: ["Comforting"], reason: "🌧 Comfort", rating: "😍 Amazing", createdAt: Date.now() - 172800000, items: ["Spaghetti Meatball"] },
  { id: 3, name: "Midnight Wanderer", text: "Came here for a birthday treat. Made it so special.", dish: "Kit-Kat Milkshake", vibe: "👥 Family Time", highlights: ["Friendly Service"], reason: "👥 Friends/Family", rating: "😊 Good", createdAt: Date.now() - 400000000, items: ["Kit-Kat Milkshake"] }
];

export const CHART_COLORS = ['#D97757', '#E8B059', '#7E9C8A', '#D1C7BD', '#6B7280'];