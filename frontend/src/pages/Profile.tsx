import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { AuthContext } from '../App';
import { User, Shield, CheckCircle, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/users/profile', { username: newUsername });
      const updatedUser = res.data.user;
      
      // Update local storage and context
      localStorage.setItem('user', JSON.stringify({ ...user, username: updatedUser.username }));
      setUser({ ...user, ...updatedUser });
      
      setMessage({ type: 'success', text: 'Neural identity successfully synchronized.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Synchronization failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Pulse */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-pink/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Console</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[3rem] p-12 border border-white/5 shadow-2xl backdrop-blur-3xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center mb-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-20 -z-10">
               <motion.div
                 animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ duration: 3, repeat: Infinity }}
                 className="w-full h-full bg-cyber-500 rounded-full blur-[40px]"
               />
            </div>
            <div className="w-24 h-24 bg-gradient-to-tr from-cyber-500 to-neon-pink p-1 rounded-[2.5rem] mb-6 shadow-2xl">
               <div className="w-full h-full bg-black rounded-[2.4rem] flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-white" />
               </div>
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Neural Profile</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Manage Identity Parameters</p>
          </div>

          {message.text && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cx(
                "p-5 rounded-2xl mb-10 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 backdrop-blur-md border",
                message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
              )}
            >
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </motion.div>
          )}

          <form onSubmit={handleUpdate} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                 <Shield className="w-3 h-3" /> Identity Alias
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyber-500 focus:border-transparent text-white placeholder-gray-700 transition-all outline-none font-bold"
                  placeholder="New Alias"
                />
              </div>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-4 leading-relaxed">Changing your alias will update your identity across all past polls and exams within the network.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading || newUsername === user?.username}
              className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:hover:scale-100"
            >
              {loading ? <div className="w-6 h-6 border-b-2 border-black rounded-full animate-spin"></div> : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Synchronize Identity</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-10 border-t border-white/5">
             <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Enlistment Date</p>
                   <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Access Role</p>
                   <p className="text-[8px] font-bold text-cyber-500 uppercase tracking-[0.3em]">{user?.role || 'User'}</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function cx(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
