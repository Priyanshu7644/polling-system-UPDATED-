import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Zap, 
  ChevronLeft,
  CheckCircle2,
  X,
  ShieldAlert,
  ArrowRight,
  FileText,
  Shield,
  HelpCircle,
  Check,
  ChevronRight,
  Award
} from 'lucide-react';
import api, { exams } from '../api';
import { AuthContext } from '../App';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CreateExam: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Active Wizard Step (1: Basic Info, 2: Security & Proctoring, 3: Questions)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([{ 
    text: '', 
    type: 'objective' as 'objective' | 'subjective',
    options: ['', '', '', ''], 
    correctAnswerIndex: 0,
    correctAnswer: '',
    marks: 1
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [examType, setExamType] = useState<'anytime' | 'scheduled'>('anytime');
  const [proctoringLevel, setProctoringLevel] = useState<'none' | 'primary' | 'both'>('none');

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
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-card rounded-[3rem] p-10 text-center border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden bg-white dark:bg-slate-950"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <ShieldAlert className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-3">Verification Required</h1>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mb-8 leading-relaxed">System protocols restrict exam hosting to verified identities. Authenticate your account to proceed.</p>

          <form onSubmit={handleVerifyOtp} className="space-y-5 max-w-sm mx-auto">
            <div className="relative group">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-center text-2xl font-black tracking-[0.5em] text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                placeholder="000000"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>}

            {devOtp && (
              <div className="bg-indigo-50 dark:bg-white/5 border border-indigo-200 dark:border-white/5 p-3 rounded-xl text-center backdrop-blur-md">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">Developer Bypass</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-[0.3em]">{devOtp}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg disabled:opacity-50 text-xs"
            >
              <span>Validate Identity</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-white transition-colors block mx-auto">Resend Sync Code</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      text: '', 
      type: 'objective',
      options: ['', '', '', ''], 
      correctAnswerIndex: 0, 
      correctAnswer: '',
      marks: 1
    }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      newQuestions[qIndex].options!.push('');
      setQuestions(newQuestions);
    }
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options && newQuestions[qIndex].options!.length > 2) {
      newQuestions[qIndex].options!.splice(oIndex, 1);
      
      if (newQuestions[qIndex].correctAnswerIndex === oIndex) {
        newQuestions[qIndex].correctAnswerIndex = 0;
      } else if (newQuestions[qIndex].correctAnswerIndex! > oIndex) {
        newQuestions[qIndex].correctAnswerIndex!--;
      }
      
      setQuestions(newQuestions);
    }
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      newQuestions[qIndex].options![oIndex] = value;
    }
    setQuestions(newQuestions);
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      setError('Please provide an exam title before proceeding.');
      return false;
    }
    if (examType === 'scheduled' && (!startTime || !endTime)) {
      setError('Please select both start and end times for scheduled session.');
      return false;
    }
    if (duration <= 0) {
      setError('Duration must be greater than 0 minutes.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setError('');
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await exams.create({
        title,
        description,
        examType,
        startTime: examType === 'anytime' ? new Date('2024-01-01').toISOString() : startTime,
        endTime: examType === 'anytime' ? new Date('2030-01-01').toISOString() : endTime,
        duration,
        attemptsLimit: 1,
        proctoringLevel,
        questions: questions.map(q => ({
          ...q,
          options: q.type === 'objective' ? q.options : undefined,
          correctAnswerIndex: q.type === 'objective' ? q.correctAnswerIndex : undefined,
          correctAnswer: q.type === 'subjective' ? q.correctAnswer : undefined
        }))
      });
      navigate('/?tab=exams');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 relative">
      {/* Back button */}
      <button 
        onClick={() => navigate('/?tab=exams')}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 group font-bold text-xs tracking-tight"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to all exams
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="pro-card rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 relative overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl">
          {/* Ambient Flare */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 shadow-sm backdrop-blur-md shrink-0">
                <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Exam Creator</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Design objective & subjective proctored assessment sessions.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Step {currentStep} of 3
              </span>
            </div>
          </div>

          {/* Section Wizard Navigation Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 relative z-10">
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1 || validateStep1()) setCurrentStep(1);
              }}
              className={cx(
                "p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between",
                currentStep === 1 
                  ? "bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-700 dark:text-white shadow-md" 
                  : currentStep > 1 
                  ? "bg-slate-100 dark:bg-slate-900/80 border-emerald-500/40 text-slate-700 dark:text-slate-300 hover:border-indigo-400" 
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Step 1
                </span>
                {currentStep > 1 && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <span className="text-xs font-bold truncate">Details & Protocol</span>
            </button>

            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className={cx(
                "p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between",
                currentStep === 2 
                  ? "bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-700 dark:text-white shadow-md" 
                  : currentStep > 2 
                  ? "bg-slate-100 dark:bg-slate-900/80 border-emerald-500/40 text-slate-700 dark:text-slate-300 hover:border-indigo-400" 
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Step 2
                </span>
                {currentStep > 2 && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <span className="text-xs font-bold truncate">Security & Proctoring</span>
            </button>

            {/* Step 3 Tab */}
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setCurrentStep(3);
              }}
              className={cx(
                "p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between",
                currentStep === 3 
                  ? "bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-700 dark:text-white shadow-md" 
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Step 3
                </span>
              </div>
              <span className="text-xs font-bold truncate">Questions Sheet ({questions.length})</span>
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 p-3.5 rounded-2xl mb-5 flex items-center gap-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-xs font-bold">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10">
            <AnimatePresence mode="wait">
              {/* STEP 1: Basic Information & Timing */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-50/80 dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-5">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">
                        Exam Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-base font-bold placeholder-slate-400 transition-all outline-none"
                        placeholder="e.g. Intermediate Mathematics Finals"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest">
                        Description (Optional)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none resize-none text-xs sm:text-sm font-medium"
                        rows={2}
                        placeholder="Provide background context or instructions for test candidates..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/5 pt-5">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-400 mb-3 uppercase tracking-widest">
                        Access Protocol *
                      </label>
                      <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl border border-slate-300/60 dark:border-white/5 mb-5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setExamType('anytime')}
                          className={cx(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            examType === 'anytime' ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <Zap className={cx("w-3.5 h-3.5", examType === 'anytime' ? "fill-white" : "")} />
                          Universal Access
                        </button>
                        <button
                          type="button"
                          onClick={() => setExamType('scheduled')}
                          className={cx(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            examType === 'scheduled' ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Scheduled Session
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {examType === 'scheduled' && (
                          <>
                            <div>
                              <label className="block text-[11px] font-black text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Start Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                required
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all outline-none text-xs font-bold"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-black text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" /> End Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                required
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all outline-none text-xs font-bold"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                              />
                            </div>
                          </>
                        )}
                        <div className={cx(examType === 'anytime' ? "sm:col-span-2" : "")}>
                          <label className="block text-[11px] font-black text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time Limit (Minutes)
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all outline-none text-xs font-bold"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Footer Navigation */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate('/?tab=exams')}
                      className="px-6 py-2.5 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-primary px-7 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                    >
                      <span>Proceed to Security</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Security & Proctoring Level */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-50/80 dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-5">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-500" /> Choose Security Protocol
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
                        Select automated proctoring & camera validation requirements for candidate sessions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <button
                        type="button"
                        onClick={() => setProctoringLevel('none')}
                        className={cx(
                          "px-5 py-4 rounded-2xl border text-left transition-all relative",
                          proctoringLevel === 'none' 
                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-700 dark:text-white shadow-sm" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
                        )}
                      >
                        <span className="block text-xs font-black uppercase tracking-widest mb-1">Standard</span>
                        <span className="block text-[11px] font-bold text-slate-500">No camera required</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setProctoringLevel('primary')}
                        className={cx(
                          "px-5 py-4 rounded-2xl border text-left transition-all relative",
                          proctoringLevel === 'primary' 
                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-700 dark:text-white shadow-sm" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
                        )}
                      >
                        <span className="block text-xs font-black uppercase tracking-widest mb-1 text-indigo-600 dark:text-indigo-400">Advanced</span>
                        <span className="block text-[11px] font-bold text-slate-500">Laptop Webcam (1 Cam)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProctoringLevel('both')}
                        className={cx(
                          "px-5 py-4 rounded-2xl border text-left transition-all relative",
                          proctoringLevel === 'both' 
                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-700 dark:text-white shadow-sm" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
                        )}
                      >
                        <span className="block text-xs font-black uppercase tracking-widest mb-1 text-indigo-600 dark:text-indigo-400">Maximum</span>
                        <span className="block text-[11px] font-bold text-slate-500">Laptop + Mobile (2 Cams)</span>
                      </button>
                    </div>

                    {/* Feature Details Card */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Included Safeguards</span>
                      </div>
                      <ul className="text-slate-500 dark:text-slate-400 space-y-1 pl-6 list-disc text-[11px] font-medium">
                        <li>Automated fullscreen detection & tab-switching tracking.</li>
                        <li>Proctor log generation for suspicious movements or window blur events.</li>
                        {proctoringLevel !== 'none' && <li>Realtime camera stream validation during assessment window.</li>}
                        {proctoringLevel === 'both' && <li>Secondary mobile camera QR connection active.</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Step 2 Footer Navigation */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-primary px-7 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                    >
                      <span>Build Questions Sheet</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Questions Sheet & Launch */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Questions Sheet</h2>
                      <span className="text-xs font-bold text-slate-500">({questions.length} Questions · {totalMarks} Total Marks)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-5">
                    <AnimatePresence mode="popLayout">
                      {questions.map((q, qIndex) => (
                        <motion.div 
                          key={qIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden group shadow-sm space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-sm">
                                  {qIndex + 1}
                                </div>
                                <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Question</span>
                              </div>

                              <div className="flex bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-white/10">
                                <button
                                  type="button"
                                  onClick={() => handleQuestionChange(qIndex, 'type', 'objective')}
                                  className={cx(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                    q.type === 'objective' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  )}
                                >
                                  Objective
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuestionChange(qIndex, 'type', 'subjective')}
                                  className={cx(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                    q.type === 'subjective' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  )}
                                >
                                  Subjective
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marks:</span>
                                <input 
                                  type="number"
                                  className="w-10 bg-transparent text-slate-900 dark:text-white text-xs font-black outline-none"
                                  value={q.marks}
                                  min={1}
                                  onChange={(e) => handleQuestionChange(qIndex, 'marks', parseInt(e.target.value) || 1)}
                                />
                              </div>
                              {questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(qIndex)}
                                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl transition-all shadow-sm"
                                  title="Remove Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm font-bold placeholder-slate-400 transition-all outline-none"
                              placeholder="Enter question prompt..."
                              value={q.text}
                              onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                            />
                          </div>

                          {q.type === 'objective' ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((option, oIndex) => {
                                  const isCorrect = q.correctAnswerIndex === oIndex;
                                  return (
                                    <div key={oIndex} className="relative group/option">
                                      <div className={cx(
                                        "relative flex items-center gap-2 p-1 rounded-2xl border transition-all duration-300",
                                        isCorrect 
                                          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm" 
                                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                                      )}>
                                        <button
                                          type="button"
                                          onClick={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                                          className={cx(
                                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
                                            isCorrect 
                                              ? "bg-indigo-600 text-white shadow-sm" 
                                              : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                          )}
                                        >
                                          {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full border border-current" />}
                                        </button>
                                        <input
                                          type="text"
                                          required
                                          className="w-full px-2 py-2 bg-transparent text-slate-900 dark:text-white text-xs font-bold placeholder-slate-400 outline-none"
                                          placeholder={`Option ${oIndex + 1}`}
                                          value={option}
                                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        />
                                        {q.options.length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                                            className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover/option:opacity-100 transition-all shrink-0"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(qIndex)}
                                  className="border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-3 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group/add bg-white/50 dark:bg-transparent"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span className="text-[11px] font-black uppercase tracking-wider">Append Option</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="block text-[11px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">Grading Reference (Optional)</label>
                              <textarea
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none resize-none text-xs font-medium"
                                rows={2}
                                placeholder="Provide keywords or expected answer for subjective grading..."
                                value={q.correctAnswer}
                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform text-indigo-500" />
                    Add Another Question
                  </button>

                  {/* Step 3 Footer Navigation */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Security</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary py-3 px-8 rounded-2xl font-black text-xs shadow-xl transition-all uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{loading ? 'Publishing...' : 'Launch Exam'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateExam;
