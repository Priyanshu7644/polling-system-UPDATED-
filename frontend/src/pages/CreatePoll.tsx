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
      <div className="max-w-2xl mx-auto py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[3rem] p-12 text-center border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-neon-pink/10 border border-neon-pink/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <ShieldAlert className="w-10 h-10 text-neon-pink" />
          </div>

          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Authorization Required</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-10 opacity-70 leading-relaxed">Identity synchronization is incomplete. Verify your terminal to unlock broadcast capabilities.</p>

          <form onSubmit={handleVerifyOtp} className="space-y-6 max-w-sm mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-cyber-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                className="relative w-full py-6 bg-black border border-white/10 rounded-2xl text-center text-3xl font-black tracking-[0.5em] text-white focus:ring-0 outline-none"
                placeholder="000000"
              />
            </div>

            {error && <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{error}</p>}

            {devOtp && (
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                <span className="text-[9px] font-black text-cyber-500 uppercase tracking-widest block mb-1">Dev Sync Code</span>
                <span className="text-xl font-black text-white tracking-[0.3em]">{devOtp}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              <span>Synchronize Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[10px] font-black text-gray-500 uppercase hover:text-white transition-colors tracking-widest block mx-auto">Request New Link</button>
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
    <div className="max-w-3xl mx-auto py-12 relative">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10"
      >
        <div className="glow-border rounded-3xl">
          <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Dynamic Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
                <Zap className="w-8 h-8 text-neon-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Create Pulse</h1>
                <p className="text-gray-400 font-medium mt-1">Design a new poll and broadcast it live.</p>
              </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-sm backdrop-blur-sm flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* Basic Info */}
              <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                <div>
                  <label className="block text-sm font-bold text-cyber-300 mb-2 uppercase tracking-wider">Question *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white text-lg placeholder-gray-600 transition-all outline-none"
                    placeholder="e.g. Next.js vs Remix?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Context (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white placeholder-gray-600 transition-all outline-none resize-none"
                    placeholder="Add background info to help voters decide..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white transition-all outline-none appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-dark-surface text-white">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex items-center gap-2 mb-6">
                  <LayoutList className="w-5 h-5 text-neon-pink" />
                  <label className="block text-sm font-bold text-neon-pink uppercase tracking-wider">Poll Options *</label>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence>
                    {options.map((option, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-dark-bg/80 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 relative group">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-pink focus:border-transparent text-white placeholder-gray-600 transition-all outline-none"
                            placeholder={`Option ${index + 1}`}
                            required
                          />
                          {/* Glowing line on focus simulation */}
                          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-neon-pink to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left rounded-b-xl"></div>
                        </div>
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="p-3 text-gray-500 hover:text-red-400 bg-dark-surface hover:bg-red-500/10 border border-white/10 rounded-xl transition-all shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-6 flex items-center justify-center space-x-2 w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:border-cyber-500 hover:bg-cyber-500/10 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Another Option</span>
                </button>
              </div>

              {/* Settings & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${isPublic ? 'bg-cyber-600' : 'bg-gray-700'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPublic ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <div className="ml-4">
                    <span className="block text-sm font-bold text-white">Public Visibility</span>
                    <span className="block text-xs text-gray-400">Show on Explore page</span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto bg-gradient-to-r from-neon-blue to-cyber-600 text-white font-black py-4 px-10 rounded-xl transition-all duration-300 transform shadow-[0_0_20px_rgba(14,165,233,0.3)] 
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]'}`}
                >
                  {loading ? 'INITIALIZING...' : 'LAUNCH POLL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
