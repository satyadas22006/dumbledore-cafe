import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing when you hit enter
    setError('');
    setLoading(true);
    
    const auth = getAuth();

    try {
      // 1. Ask Firebase if these credentials are valid
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. If valid, send them to the Owner Portal
      navigate('/owner'); 
    } catch (err) {
      // 3. If invalid, show a red error message
      setError('Invalid email or password. Access Denied.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="bg-[#1E293B] p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h1 className="text-3xl font-serif font-black mb-6 text-emerald-400 text-center">Admin Access</h1>

        {/* Error Message Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Enter admin email..."
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Verifying Credentials...' : 'Unlock Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;