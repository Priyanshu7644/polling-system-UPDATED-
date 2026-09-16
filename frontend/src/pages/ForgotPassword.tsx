import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { ThemeContext } from '../App';
import { ArrowRight, Mail, Lock, CheckCircle, ChevronLeft, Sun, Moon, Activity, ShieldCheck, KeyRound, Check, RefreshCw } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Step 1: Request OTP to Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setSuccess(`A 6-digit verification code has been sent to ${email}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Account recovery failed. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code state & move to step 3
  const handleVerifyOtpStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }
    setError('');
    setSuccess('Code accepted. Please enter your new password.');
    setStep(3);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(`A fresh verification code was sent to ${email}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to resend code right now.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Final Password Reset submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password successfully reset! Redirecting to Sign In...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Password reset failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f1f1f3] dark:bg-[#0c0b0a] flex items-center justify-center font-sans transition-colors duration-300">
      {/* Outer Container */}
      <div className="w-full h-full lg:w-[95%] lg:h-[92%] lg:max-w-[1380px] bg-white dark:bg-[#151413] lg:rounded-[28px] overflow-hidden shadow-2xl border-0 lg:border border-stone-200/60 dark:border-stone-800/70 flex flex-col lg:flex-row transition-colors duration-300">

        {/* ── Left: Visually Rich Showcase Panel ─────────────────────────── */}
        <div className="hidden lg:flex lg:w-[46%] relative bg-gradient-to-br from-[#121026] via-[#0d0c18] to-[#090810] p-10 xl:p-14 flex-col justify-between overflow-hidden select-none shrink-0 border-r border-indigo-950/40">
          
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-[#ff4500]/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-[#e6005c]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#ff4500]/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Top Tagline */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-stone-400 text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-[#ff4500]" /> Account Recovery • PULSE
            </span>
            <span className="text-[10px] font-bold text-[#ff4500] bg-[#ff4500]/20 px-3 py-1 rounded-full border border-[#ff4500]/30 backdrop-blur-md">
              Step {step} of 3
            </span>
          </div>

          {/* Center Dynamic Content */}
          <div className="relative z-10 flex flex-col my-auto space-y-6">
            <div>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-3">
                Recover Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ff2a4b] to-[#e6005c]">
                  Account Access.
                </span>
              </h1>
              <p className="text-stone-400 text-xs xl:text-sm font-medium leading-relaxed max-w-sm">
                Follow our 3-step encrypted security protocol to reset your password safely.
              </p>
            </div>

            {/* Interactive Step Timeline Card */}
            <div className="relative rounded-2xl border border-[#ff4500]/20 bg-stone-950/60 p-6 shadow-2xl backdrop-blur-xl space-y-4">
              
              {/* Step 1 Item */}
              <div className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step > 1 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : step === 1 
                    ? 'bg-gradient-to-r from-[#ff4500] to-[#e6005c] text-white ring-4 ring-[#ff4500]/30' 
                    : 'bg-stone-800 text-stone-500'
                }`}>
                  {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${step === 1 ? 'text-white' : 'text-stone-300'}`}>
                    Provide Email Address
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {email ? email : 'Enter your registered identity mail'}
                  </span>
                </div>
              </div>

              {/* Connector line */}
              <div className="ml-4 w-0.5 h-4 bg-stone-800" />

              {/* Step 2 Item */}
              <div className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step > 2 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : step === 2 
                    ? 'bg-gradient-to-r from-[#ff4500] to-[#e6005c] text-white ring-4 ring-[#ff4500]/30' 
                    : 'bg-stone-800 text-stone-500'
                }`}>
                  {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${step === 2 ? 'text-white' : 'text-stone-400'}`}>
                    Enter 6-Digit OTP Code
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {step >= 2 ? (otp ? `Code: ${otp}` : 'Awaiting OTP input...') : 'Dispatched via secure email'}
                  </span>
                </div>
              </div>

              {/* Connector line */}
              <div className="ml-4 w-0.5 h-4 bg-stone-800" />

              {/* Step 3 Item */}
              <div className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === 3 
                    ? 'bg-gradient-to-r from-[#ff4500] to-[#e6005c] text-white ring-4 ring-[#ff4500]/30' 
                    : 'bg-stone-800 text-stone-500'
                }`}>
                  3
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${step === 3 ? 'text-white' : 'text-stone-400'}`}>
                    Create & Confirm New Password
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Set a fresh encrypted password
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Branding Bar */}
          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-indigo-950/60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff4500] to-[#e6005c] flex items-center justify-center text-white font-black text-xs shadow-md">
                P
              </div>
              <span className="font-extrabold text-white text-base tracking-tight uppercase italic">PULSE</span>
            </div>
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Encrypted Vault 2.0
            </span>
          </div>
        </div>

        {/* ── Right: Recovery Form Panel ───────────────────────────── */}
        <div className="w-full lg:w-[54%] h-full flex flex-col justify-between p-6 sm:p-10 xl:p-14 overflow-y-auto relative">
          
          {/* Top Navigation Row */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#ff4500] via-[#ff2a4b] to-[#e6005c] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tight text-stone-900 dark:text-white uppercase italic">
                Pulse
              </span>
            </Link>

            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-[#ff4500] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#ff4500]" />}
            </button>
          </div>

          {/* Form Area */}
          <div className="my-auto max-w-md mx-auto w-full py-2">
            
            <Link to="/login" className="inline-flex items-center gap-1.5 mb-6 text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-[#ff4500] transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Sign In
            </Link>

            {/* Step Progress Indicator Bar */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#ff4500]' : 'bg-stone-200 dark:bg-stone-800'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#ff4500]' : 'bg-stone-200 dark:bg-stone-800'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-[#ff4500]' : 'bg-stone-200 dark:bg-stone-800'}`} />
            </div>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Enter Email ───────────────────────────────── */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleRequestOtp}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight leading-tight mb-2 uppercase italic">
                      Forgot Password
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-medium">
                      Enter your registered email address to receive a 6-digit recovery code.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#ff4500]" /> Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white font-medium text-sm focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20 outline-none transition-all shadow-sm"
                    />
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-wider">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-transform disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* ── STEP 2: Enter OTP Code ───────────────────────────── */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtpStep}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight leading-tight mb-2 uppercase italic">
                      Verify OTP Code
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-medium">
                      We sent a 6-digit code to <span className="font-bold text-[#ff4500]">{email}</span>. Enter it below to proceed.
                    </p>
                  </div>

                  {success && (
                    <div className="p-3 rounded-2xl bg-[#ff4500]/10 border border-[#ff4500]/20 text-[#ff4500] text-xs font-bold text-center">
                      {success}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#ff4500]" /> Verification Code (6 Digits)
                      </span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-[11px] font-bold text-[#ff4500] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend Code
                      </button>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="000000"
                      className="w-full px-4 py-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center text-3xl tracking-[0.6em] font-black text-stone-900 dark:text-white focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20 outline-none transition-all shadow-sm"
                    />
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-wider">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); }}
                      className="w-1/3 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="btn-primary w-2/3 py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-transform disabled:opacity-50"
                    >
                      <span>Continue to New Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 3: Set & Repeat New Password ─────────────────── */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight leading-tight mb-2 uppercase italic">
                      New Password
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-medium">
                      Create a strong new password for your account.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#ff4500]" /> New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white font-medium text-sm focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20 outline-none transition-all shadow-sm"
                      />
                    </div>

                    {/* Confirm / Repeat Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#ff4500]" /> Repeat New Password
                        </label>
                        {confirmPassword && (
                          <span className={`text-[11px] font-bold ${newPassword === confirmPassword ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {newPassword === confirmPassword ? '✓ Passwords Match' : '✗ Do Not Match'}
                          </span>
                        )}
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className={`w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border text-stone-900 dark:text-white font-medium text-sm outline-none transition-all shadow-sm ${
                          confirmPassword && newPassword !== confirmPassword 
                            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                            : 'border-stone-200 dark:border-stone-800 focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20'
                        }`}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-wider">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center uppercase tracking-wider">
                      {success}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setStep(2); setError(''); }}
                      className="w-1/3 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success.includes('Redirecting') || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
                      className="btn-primary w-2/3 py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-transform disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Update Password & Sign In</span>
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>Remember your password?</span>
            <Link to="/login" className="font-bold text-[#ff4500] hover:underline">
              Sign In Now
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

