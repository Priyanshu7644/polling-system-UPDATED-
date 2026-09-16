import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { ThemeContext } from '../App';
import { ShieldCheck, XCircle, CheckCircle, Activity, ArrowRight, Loader2, Sun, Moon } from 'lucide-react';

export default function Verify() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Account verification link is invalid or has expired.');
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f1f1f3] dark:bg-[#0c0b0a] flex items-center justify-center font-sans transition-colors duration-300">
      <div className="w-full h-full lg:w-[95%] lg:h-[92%] lg:max-w-[1380px] bg-white dark:bg-[#151413] lg:rounded-[28px] overflow-hidden shadow-2xl border-0 lg:border border-stone-200/60 dark:border-stone-800/70 flex flex-col lg:flex-row transition-colors duration-300">

        {/* ── Left: Dark Showcase Panel ─────────────────────────── */}
        <div className="hidden lg:flex lg:w-[48%] relative bg-[#131211] p-10 xl:p-14 flex-col justify-between overflow-hidden select-none shrink-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <p className="relative z-10 text-stone-400 text-xs xl:text-sm font-medium tracking-wide">
            Account Verification • PULSE
          </p>

          <div className="relative z-10 flex flex-col my-auto">
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
              Account<br />
              <span className="text-white">Verification.</span>
            </h1>

            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" /> Verified Security Node
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Encrypted
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium leading-relaxed">
                Verifying your email confirms account authenticity and unlocks consensus voting & proctored exams.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-stone-800/80">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                P
              </div>
              <span className="font-extrabold text-white text-base tracking-tight uppercase italic">PULSE</span>
            </div>
            <span className="text-xs font-bold text-stone-400">Security Suite</span>
          </div>
        </div>

        {/* ── Right: Verification Status Panel ───────────────────── */}
        <div className="w-full lg:w-[52%] h-full flex flex-col justify-between p-6 sm:p-10 xl:p-14 overflow-y-auto relative">
          
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tight text-stone-900 dark:text-white uppercase italic">
                Pulse
              </span>
            </Link>

            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-indigo-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>

          <div className="my-auto max-w-md mx-auto w-full text-center py-4">
            {status === 'loading' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-500">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
                <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase italic">Verifying Email...</h2>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Connecting to PULSE Security Nodes</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-stone-900 dark:text-white uppercase italic">Access Granted</h2>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed">{message}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                  <XCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-stone-900 dark:text-white uppercase italic">Link Expired</h2>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed">{message}</p>
                <Link
                  to="/login"
                  className="btn-primary w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>

          <div className="pt-6 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>Verified PULSE Node</span>
            <Link to="/login" className="font-bold text-indigo-500 hover:underline">
              Return to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
