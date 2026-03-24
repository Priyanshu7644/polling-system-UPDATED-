import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { AuthContext } from '../App';
import { LogIn, Mail, Lock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication sequence failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center relative overflow-hidden px-4">
      <div className="mesh-bg opacity-30"></div>
      
      {/* Dynamic Background Accents */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-1/4 -left-24 w-96 h-96 bg-cyber-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-1/4 -right-24 w-[500px] h-[500px] bg-neon-pink/10 rounded-full blur-[150px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
           <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                 <Zap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">PULSE</span>
           </Link>
           <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">Access Console</h1>
           <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Initialize Identity Sequence</p>
        </div>

        <div className="glass-card rounded-[3rem] p-10 border border-white/5 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
          {/* Internal Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-500/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-xs font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Terminal ID (Email)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-600 group-focus-within:text-cyber-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-14 pr-6 py-4 bg-dark-bg/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyber-500 focus:border-transparent text-white placeholder-gray-700 transition-all outline-none font-bold"
                    placeholder="name@matrix.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Secure Passcode</label>
                  <a href="#" className="text-[10px] font-black text-cyber-500 uppercase tracking-widest hover:text-white transition-colors">Recover</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-600 group-focus-within:text-cyber-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-14 pr-6 py-4 bg-dark-bg/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyber-500 focus:border-transparent text-white placeholder-gray-700 transition-all outline-none font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 group bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-b-2 border-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authenticate Identity</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                 <ShieldCheck className="w-4 h-4 text-gray-600" />
                 <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">End-to-End Encrypted Auth</span>
              </div>
              <p className="text-xs font-bold text-gray-500">
                New participant?{' '}
                <Link to="/register" className="text-cyber-400 hover:text-white transition-colors font-black uppercase tracking-widest ml-1">
                  Enlist Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
