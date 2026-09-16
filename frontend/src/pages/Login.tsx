import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { AuthContext, ThemeContext } from '../App';
import { ArrowRight, Eye, EyeOff, Sun, Moon, ShieldCheck, Zap, Mail, Lock, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpView, setShowOtpView] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.error?.includes('not verified')) {
        setError('Account verification pending.');
        setShowOtpView(true);
        handleResendOtp();
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      }
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
      setError('');
      setShowOtpView(false);
      await handleSubmit(undefined as any);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setError('A fresh verification code has been dispatched.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to resend code right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f1f1f3] dark:bg-[#0c0b0a] flex items-center justify-center font-sans transition-colors duration-300">
      {/* Outer card — fills entire screen on mobile, framed on desktop */}
      <div className="w-full h-full lg:w-[95%] lg:h-[92%] lg:max-w-[1380px] bg-white dark:bg-[#151413] lg:rounded-[28px] overflow-hidden shadow-2xl border-0 lg:border border-stone-200/60 dark:border-stone-800/70 flex flex-col lg:flex-row transition-colors duration-300">

        {/* ── Left: Dark Showcase Panel ─────────────────────────── */}
        <div className="hidden lg:flex lg:w-[48%] relative bg-[#131211] p-10 xl:p-14 flex-col justify-between overflow-hidden select-none shrink-0">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#ff4500]/25 via-[#e6005c]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Top tagline */}
          <p className="relative z-10 text-stone-400 text-xs xl:text-sm font-medium tracking-wide">
            Make decisions that matter — live polls, real results.
          </p>

          {/* Center hero */}
          <div className="relative z-10 flex flex-col">
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
              Cast your<br />
              <span className="text-white">vote.</span>
            </h1>
            <div className="relative flex justify-center">
              <img
                src="/payoneer_mockup.jpg"
                alt="PULSE Mobile App"
                className="w-full max-w-[360px] xl:max-w-[400px] h-auto object-contain rounded-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Bottom badge */}
          <div className="relative z-10 flex items-center gap-2 text-stone-500 text-xs">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e6005c] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-stone-400 font-medium">Real-time polling infrastructure</span>
          </div>
        </div>

        {/* ── Right: Auth Form Panel ────────────────────────────── */}
        <div className="w-full lg:w-[52%] bg-white dark:bg-[#181716] flex flex-col h-full transition-colors duration-300">

          {/* Top bar */}
          <div className="flex items-center justify-between px-8 sm:px-12 xl:px-14 py-6 shrink-0">
            {/* Brand logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#ff4500] via-[#ff2a4b] to-[#e6005c] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-stone-900 dark:text-white">PULSE</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                type="button"
                aria-label="Toggle theme"
                className="p-2.5 rounded-full text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-amber-400" />
                  : <Moon className="w-4 h-4 text-stone-700" />}
              </button>
              {/* Switch to Register */}
              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white py-2 px-4 rounded-full border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900/40 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Form — vertically centred in remaining space */}
          <div className="flex-1 flex items-center justify-center px-8 sm:px-12 xl:px-14 py-4 overflow-hidden">
            <div className="w-full max-w-[400px]">
              <AnimatePresence mode="wait">

                {/* ── OTP view ─────────────────────────── */}
                {showOtpView ? (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                  >
                    <div className="mb-7">
                      <div className="w-11 h-11 rounded-2xl bg-[#ff4500]/10 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-5 h-5 text-[#ff4500]" />
                      </div>
                      <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mb-1.5">Security Code</h2>
                      <p className="text-stone-500 dark:text-stone-400 text-sm">
                        Sent to <span className="font-semibold text-stone-800 dark:text-stone-200">{email}</span>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        autoFocus
                        placeholder="000000"
                        className="w-full py-4 px-6 rounded-2xl bg-[#f4f4f6] dark:bg-[#222120] border border-transparent focus:border-stone-300 dark:focus:border-stone-700 focus:bg-white dark:focus:bg-[#1c1b1a] text-center text-3xl font-extrabold tracking-[0.4em] text-stone-900 dark:text-white outline-none transition-all"
                      />

                      {error && (
                        <p className={cx("text-xs font-semibold", error.includes('dispatched') ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {error}
                        </p>
                      )}

                      <button type="submit" disabled={loading}
                        className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff4500] via-[#ff2a4b] to-[#e6005c] hover:opacity-90 hover:shadow-lg hover:shadow-[#ff4500]/30 active:scale-[0.99] text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Verify Code</span><ArrowRight className="w-4 h-4" /></>}
                      </button>

                      <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
                        <button type="button" onClick={handleResendOtp} disabled={loading} className="hover:text-stone-900 dark:hover:text-white transition-colors">Resend code</button>
                        <button type="button" onClick={() => setShowOtpView(false)} className="hover:text-stone-900 dark:hover:text-white transition-colors">Back to Sign In</button>
                      </div>
                    </form>
                  </motion.div>

                ) : (
                  /* ── Login view ────────────────────── */
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                  >
                    <div className="mb-7">
                      <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mb-1.5">Welcome Back</h2>
                      <p className="text-stone-500 dark:text-stone-400 text-sm">Sign in to your PULSE account</p>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#f4f4f6] dark:bg-[#222120] border border-transparent focus:border-stone-300 dark:focus:border-stone-700 focus:bg-white dark:focus:bg-[#1a1918] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 text-sm font-medium outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Password</label>
                          <Link to="/forgot-password" className="text-xs font-semibold text-[#ff4500] hover:text-[#e6005c] transition-colors">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-[#f4f4f6] dark:bg-[#222120] border border-transparent focus:border-stone-300 dark:focus:border-stone-700 focus:bg-white dark:focus:bg-[#1a1918] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 text-sm font-medium outline-none transition-all"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <button type="submit" disabled={loading}
                          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff4500] via-[#ff2a4b] to-[#e6005c] hover:opacity-90 hover:shadow-lg hover:shadow-[#ff4500]/30 active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-md transition-all disabled:opacity-60"
                        >
                          {loading
                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><ArrowRight className="w-4 h-4" /><span>Sign In</span></>}
                        </button>
                      </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
                      Don't have an account?{' '}
                      <Link to="/register" className="font-bold text-[#ff4500] hover:text-[#e6005c] transition-colors">
                        Sign up free
                      </Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>


          {/* Footer */}
          <div className="px-8 sm:px-12 xl:px-14 py-5 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 shrink-0">
            <span>© 2026 PULSE Polling</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors">Contact</a>
              <span className="flex items-center gap-1 cursor-default">English <ChevronDown className="w-3 h-3" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
