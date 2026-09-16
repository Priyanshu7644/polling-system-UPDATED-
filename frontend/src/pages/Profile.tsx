import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { AuthContext } from '../App';
import { 
  User, Shield, CheckCircle, ArrowLeft, Save, AlertCircle, 
  Sparkles, Calendar, Mail, Key, Activity, Lock, Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

function cx(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/users/profile', { username: newUsername });
      const updatedUser = res.data.user;
      
      // Update local storage and context
      localStorage.setItem('user', JSON.stringify({ ...user, username: updatedUser.username }));
      setUser({ ...user, ...updatedUser });
      
      setMessage({ type: 'success', text: 'System identity successfully synchronized.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Synchronization failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 py-2 relative overflow-hidden z-10">
      
      {/* Return Link & Page Title */}
      <div className="flex items-center justify-between mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-stone-400 dark:hover:text-indigo-400 transition-colors font-bold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-wider">Return to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
          <Activity className="w-3 h-3 animate-pulse" /> Telemetry Active
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.2rem] p-6 sm:p-8 border border-slate-200/40 dark:border-white/10 shadow-xl shadow-indigo-500/5 dark:shadow-2xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl relative overflow-hidden"
      >
        {/* Ambient Glow Accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Feedback Alert */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cx(
              "p-3 rounded-2xl mb-4 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 border shadow-sm",
              message.type === 'success' 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400" 
                : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-400"
            )}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}

        {/* 2-Column Responsive Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: User Profile Badge & Quick Metadata */}
          <div className="md:col-span-5 flex flex-col justify-between p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 shadow-sm relative group">
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center mb-3 shadow-lg text-white font-black text-3xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-9 h-9" />}
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase mb-1">
                {user?.username || 'User Identity'}
              </h2>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/15">
                <Sparkles className="w-3 h-3" /> {user?.role || 'Verified User'}
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-3 pt-4 border-t border-slate-200/40 dark:border-white/10 text-xs font-medium">
              <div className="flex items-center justify-between text-slate-600 dark:text-stone-400">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" /> Email Address
                </span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]" title={user?.email}>
                  {user?.email || 'Registered Email'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-stone-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" /> Member Since
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-stone-400">
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-500" /> Node Status
                </span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Synchronized
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Identity Settings & Form */}
          <div className="md:col-span-7 flex flex-col justify-between p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 shadow-sm">
            <div>
              <div className="mb-5 pb-3 border-b border-slate-200/40 dark:border-white/10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-1 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" /> Identity Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-stone-400 font-medium">
                  Update your public display alias across all active polls, exams, and surveys.
                </p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-500" /> Public Display Alias / Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-stone-800 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all outline-none font-bold text-sm shadow-sm"
                    placeholder="Enter new username"
                  />
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-stone-400 tracking-wide">
                    Public username synchronization updates instantly across the global feed.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || newUsername === user?.username || !newUsername.trim()}
                  className="btn-primary w-full py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] transition-transform disabled:opacity-40"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Alias</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Security Badge Pill */}
            <div className="mt-6 pt-4 border-t border-slate-200/40 dark:border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" /> Encrypted Session
              </span>
              <span className="text-slate-400 dark:text-stone-500 font-semibold">
                ID: {user?._id?.substring(0, 10) || 'USER-NODE'}
              </span>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}

