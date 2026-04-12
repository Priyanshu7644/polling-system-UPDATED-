import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { ShieldCheck, XCircle, CheckCircle, Zap, ArrowRight, Loader2 } from 'lucide-react';

export default function Verify() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification sequence failed');
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="mesh-bg opacity-30"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <div className="mb-12">
           <div className="w-16 h-16 bg-white text-black rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Zap className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Pulse Verification</h1>
        </div>

        <div className="glass-card rounded-[3rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-40 h-40 bg-neon-blue/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {status === 'loading' && (
              <div className="space-y-6">
                <Loader2 className="w-16 h-16 text-neon-blue animate-spin mx-auto opacity-50" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Synchronizing Neural Link...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-8">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                   <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Access Granted</h2>
                   <p className="text-gray-400 font-bold text-xs uppercase tracking-tight leading-relaxed">{message}</p>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                >
                  <span>Enter Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-8">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                   <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Link Severed</h2>
                   <p className="text-gray-400 font-bold text-xs uppercase tracking-tight leading-relaxed">{message}</p>
                </div>
                <Link 
                  to="/register"
                  className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-bold"
                >
                  Retry Enlistment
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2">
           <ShieldCheck className="w-4 h-4 text-gray-700" />
           <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">Encrypted Identity Validation</span>
        </div>
      </motion.div>
    </div>
  );
}
