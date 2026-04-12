import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { ArrowRight, ShieldCheck, Mail, Lock, CheckCircle, ChevronLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: OTP & New Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setSuccess('Recovery code dispatched to neural link.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Recovery sequence failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Neural link restored. Password successfully overwritten.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Identity reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center relative overflow-hidden px-4 font-sans border-t border-white/5">
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-500/20 via-transparent to-transparent"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyber-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-pink/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        <div className="mesh-bg opacity-15"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10 py-6"
      >
        <div className="text-center mb-6">
           <Link to="/login" className="inline-flex items-center gap-2 mb-4 group text-gray-500 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Entry</span>
           </Link>
           <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2 uppercase italic">Identity Recovery</h1>
           <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-3">Restore Neural Access</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOtp} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3 flex items-center gap-2">
                     <Mail className="w-3.5 h-3.5 text-cyber-500" /> Registered Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyber-500 outline-none text-white font-bold"
                    placeholder="email@example.com"
                  />
                </div>

                {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">{error}</p>}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full group/btn bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-b-2 border-black rounded-full animate-spin"></div> : (
                    <>
                      <span>Generate Recovery Code</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3">Neural Recovery Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-center text-2xl tracking-[0.5em] font-black text-white"
                      placeholder="000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3 flex items-center gap-2">
                       <Lock className="w-3.5 h-3.5 text-neon-pink" /> New Identity Key
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-pink outline-none text-white font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>}
                {success && <p className="text-[10px] font-black text-green-400 uppercase tracking-widest text-center">{success}</p>}

                <button 
                  type="submit" 
                  disabled={loading || success.includes('overwritten')}
                  className="w-full group/btn bg-gradient-to-r from-cyber-500 to-neon-pink text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div> : (
                    <>
                      <span>Re-Instate Identity</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
           <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/5">
              <ShieldCheck className="w-3 h-3 text-gray-600" />
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">Neural Encryption Active</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
