import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Plus, Trash2, Zap, LayoutList, ShieldAlert, ArrowRight } from 'lucide-react';
import { AuthContext } from '../App';

export default function CreatePoll() {
  const { user, setUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [category, setCategory] = useState('Other');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const navigate = useNavigate();

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email: user.email, otp });
      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Neural link validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/resend-otp', { email: user.email });
      setDevOtp(res.data.otp);
      setError('Fresh synchronization code dispatched.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Resend sequence interrupted');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] p-10 sm:p-12 text-center border border-slate-200 dark:border-stone-800 bg-white/90 dark:bg-[#121110]/95 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg text-indigo-500">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-3">Authorization Required</h1>
          <p className="text-slate-600 dark:text-stone-300 font-semibold text-xs uppercase tracking-wider mb-8 leading-relaxed max-w-md mx-auto">Identity verification is incomplete. Verify your account to broadcast live polls.</p>

          <form onSubmit={handleVerifyOtp} className="space-y-6 max-w-sm mx-auto">
            <div className="relative group">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                className="relative w-full py-4 bg-slate-50 dark:bg-stone-900 border border-slate-300 dark:border-stone-800 rounded-2xl text-center text-3xl font-black tracking-[0.4em] text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-inner transition-all"
                placeholder="000000"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{error}</p>}

            {devOtp && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">Dev Sync Code</span>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-[0.3em]">{devOtp}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 hover:scale-[1.02] transition-transform"
            >
              <span>Synchronize Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-xs font-bold text-slate-400 uppercase hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors tracking-widest block mx-auto">Request New Link</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const categories = [
    'Politics', 'Sports', 'Technology', 'Entertainment', 
    'Science', 'Health', 'Education', 'Social', 'Other'
  ];

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/polls', {
        title,
        description,
        category,
        options: validOptions,
        isPublic
      });
      navigate(`/poll/${res.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 relative px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="rounded-[2.5rem] border border-slate-200 dark:border-stone-800/80 shadow-2xl bg-white/90 dark:bg-[#121110]/95 backdrop-blur-xl p-7 sm:p-12 relative overflow-hidden">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Create Pulse Node</h1>
              <p className="text-slate-600 dark:text-stone-300 font-semibold text-xs sm:text-sm mt-0.5">Design a new real-time poll and gather community votes.</p>
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-2xl mb-8 text-xs font-bold flex items-center gap-3 shadow-md"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Basic Info */}
            <div className="space-y-6 bg-slate-50 dark:bg-stone-900/60 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-stone-800 shadow-inner">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Question / Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white text-sm sm:text-base font-bold placeholder-slate-400 dark:placeholder-stone-500 transition-all outline-none shadow-sm"
                  placeholder="e.g. Which programming language is best for Web3?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Context (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-stone-500 transition-all outline-none resize-none shadow-sm text-xs sm:text-sm font-medium"
                  placeholder="Provide brief background context for your audience..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white transition-all outline-none shadow-sm text-xs sm:text-sm font-bold"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-white dark:bg-stone-900 text-slate-900 dark:text-white">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Options */}
            <div className="bg-slate-50 dark:bg-stone-900/60 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-stone-800 shadow-inner">
              <div className="flex items-center gap-2 mb-5">
                <LayoutList className="w-5 h-5 text-indigo-500" />
                <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Poll Options (Min 2) *</label>
              </div>
              
              <div className="space-y-3.5">
                <AnimatePresence>
                  {options.map((option, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -15, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 15, height: 0 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-500 shrink-0 shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="w-full px-4 py-3.5 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-stone-500 transition-all outline-none shadow-sm text-xs sm:text-sm font-bold"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                      </div>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-3 text-slate-400 hover:text-rose-600 bg-white dark:bg-stone-900 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-stone-800 rounded-2xl transition-all shrink-0 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-5 flex items-center justify-center space-x-2 w-full py-4 border-2 border-dashed border-indigo-500/30 rounded-2xl text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-300 uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add Choice Option</span>
              </button>
            </div>

            {/* Settings & Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block w-13 h-7 rounded-full transition-colors ${isPublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-stone-800'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform shadow-md ${isPublic ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3.5">
                  <span className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Public Visibility</span>
                  <span className="block text-[11px] text-slate-500 dark:text-stone-400 font-medium">Show on community explore feed</span>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-9 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {loading ? 'PUBLISHING...' : 'LAUNCH POLL NODE'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


