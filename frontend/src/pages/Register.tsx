import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Mail, Lock, User, Zap, ArrowRight, ShieldCheck, Eye, EyeOff, Smartphone, Rocket, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpView, setShowOtpView] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score < 2) return { label: 'Weak', color: 'bg-red-500', width: '33%', text: 'text-red-500' };
    if (score < 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%', text: 'text-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%', text: 'text-green-500' };
  };

  const suggestPassword = () => {
    const specials = "!@#$%^&*()_+";
    const numbers = "0123456789";
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let enhanced = password || "";
    if (!/[A-Z]/.test(enhanced)) enhanced = (enhanced.charAt(0).toUpperCase() || "S") + enhanced.slice(1);
    if (!/[^A-Za-z0-9]/.test(enhanced)) enhanced += specials.charAt(Math.floor(Math.random() * specials.length));
    if (!/[0-9]/.test(enhanced)) enhanced += numbers.charAt(Math.floor(Math.random() * numbers.length));
    while (enhanced.length <= 7) enhanced += letters.charAt(Math.floor(Math.random() * letters.length));
    setPassword(enhanced);
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password });
      setShowOtpView(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration sequence interrupted');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      navigate('/login');
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
       await api.post('/auth/resend-otp', { email });
       setError('Fresh synchronization code dispatched.');
    } catch (err: any) {
       setError(err.response?.data?.error || 'Resend sequence interrupted');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center relative overflow-hidden px-4 font-sans border-t border-white/5">
      {/* Enhanced Pulse Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-500/20 via-transparent to-transparent"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-pink/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="mesh-bg opacity-15"></div>
      </div>

      <AnimatePresence mode="wait">
        {showOtpView ? (
          <motion.div 
            key="otp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md relative z-10 py-4"
          >
            <div className="glass-card rounded-[2.5rem] p-8 text-center border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden group">
               <motion.div 
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="w-16 h-16 bg-gradient-to-tr from-neon-blue/20 to-cyber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neon-blue/30 group-hover:scale-105 transition-all shadow-[0_0_40px_rgba(14,165,233,0.1)]"
               >
                  <Smartphone className="w-8 h-8 text-neon-blue" />
               </motion.div>

               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">Identity Check</h2>
               <p className="text-gray-400 font-bold text-[10px] leading-relaxed mb-6 uppercase tracking-[0.2em] max-w-[240px] mx-auto opacity-70">Enter code for <span className="text-neon-blue">{email}</span></p>
               
               <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-cyber-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition"></div>
                     <input
                       type="text"
                       maxLength={6}
                       value={otp}
                       onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                       required
                       autoFocus
                       className="relative w-full py-4 bg-black/60 border border-white/10 rounded-2xl text-center text-3xl font-black tracking-[0.5em] text-white focus:ring-0 outline-none"
                       placeholder="000000"
                     />
                  </div>

                  {error && <p className={cx("text-[10px] font-black uppercase tracking-widest text-center animate-pulse", error.includes('dispatched') ? 'text-green-400' : 'text-cyber-500')}>{error}</p>}

                  <div className="flex flex-col gap-3">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full relative group/btn bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-pink opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                       {loading ? (
                          <div className="w-5 h-5 border-b-2 border-black rounded-full animate-spin mx-auto"></div>
                       ) : (
                          <div className="flex items-center justify-center gap-3 text-sm">
                             <span>Validate Identity</span>
                             <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                       )}
                    </button>
                    <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[9px] font-black text-gray-500 uppercase hover:text-neon-blue transition-colors tracking-widest mx-auto">Resend Sync Code</button>
                  </div>
               </form>

                <button onClick={() => setShowOtpView(false)} className="mt-8 text-[9px] font-black text-gray-600 uppercase hover:text-white transition-colors tracking-[0.2em] block mx-auto underline underline-offset-4 decoration-white/10 hover:decoration-white/30">Back to Enlistment</button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="register"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl relative z-10 py-6"
          >
            <div className="text-center mb-6">
               <Link to="/" className="inline-flex items-center gap-4 mb-6 group">
                  <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(255,255,255,0.15)] group-hover:rotate-12 group-hover:scale-105 transition-all">
                     <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                     <span className="block text-2xl font-black text-white tracking-tighter leading-none">PULSE</span>
                     <span className="text-[9px] font-black text-neon-pink uppercase tracking-[0.4em] opacity-80">Online Polling Systems</span>
                  </div>
               </Link>
               <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2 uppercase italic">Join Network</h1>
               <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-3">Initialize Enlistment Protocol</p>
               <div className="w-16 h-1 bg-gradient-to-r from-neon-pink to-neon-blue mx-auto rounded-full opacity-40"></div>
            </div>

            <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              {/* Internal Gradients */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-neon-pink/10 blur-[100px] pointer-events-none opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-neon-blue/10 blur-[100px] pointer-events-none opacity-20"></div>

              <div className="relative z-10">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 backdrop-blur-md"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                       <User className="w-3 h-3 text-neon-pink" /> Username
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-pink to-transparent rounded-2xl blur opacity-0 group-focus-within/input:opacity-20 transition duration-500"></div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="relative w-full px-5 py-3.5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-pink focus:border-transparent text-white placeholder-gray-700 transition-all outline-none font-bold text-sm backdrop-blur-md"
                        placeholder="your_username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                       <Mail className="w-3 h-3 text-neon-blue" /> Email Address
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-transparent rounded-2xl blur opacity-0 group-focus-within/input:opacity-20 transition duration-500"></div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="relative w-full px-5 py-3.5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white placeholder-gray-700 transition-all outline-none font-bold text-sm backdrop-blur-md"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Lock className="w-3 h-3 text-white/50" /> Password
                       </label>
                       <button 
                        type="button" 
                        onClick={suggestPassword} 
                        className="text-[8px] font-black text-neon-pink uppercase hover:text-white transition-colors tracking-widest flex items-center gap-2 group/suggest"
                       >
                         <Sparkles className="w-2.5 h-2.5 group-hover:rotate-12 transition-transform" />
                         Generate
                       </button>
                    </div>
                    <div className="relative group/input">
                       <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur opacity-0 group-focus-within/input:opacity-10 transition duration-500"></div>
                       <input
                         type={showPassword ? "text" : "password"}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                         className="relative w-full px-5 py-3.5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-gray-700 transition-all outline-none font-bold text-sm backdrop-blur-md"
                         placeholder="password"
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-600 hover:text-white transition-colors z-20"
                       >
                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                    </div>
                    {password && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mb-2 px-1">
                          <span className="text-gray-500">Security Index</span>
                          <span className={cx(strength.text, "italic")}>{strength.label}</span>
                        </div>
                        <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            className={cx("h-full rounded-full transition-all duration-700", strength.color)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="md:col-span-2 w-full mt-4 group/btn bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 relative overflow-hidden text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-blue opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                    {loading ? (
                      <div className="w-5 h-5 border-b-2 border-black rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Initialize Sequence</span>
                        <Rocket className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col items-center">
                  <div className="flex items-center justify-center gap-3 mb-6 px-5 py-2 bg-white/5 rounded-full border border-white/5">
                     <ShieldCheck className="w-3 h-3 text-gray-600" />
                     <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">Secure Data Ingestion Active</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-3">
                    Already part of the network?{' '}
                    <Link to="/login" className="text-neon-pink hover:text-white transition-all font-black uppercase tracking-widest underline decoration-2 underline-offset-8 decoration-neon-pink/30 hover:decoration-neon-pink">
                      Access Portal
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
