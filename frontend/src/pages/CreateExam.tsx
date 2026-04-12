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
  ArrowRight
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
      <div className="max-w-2xl mx-auto py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[3rem] p-12 text-center border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-cyber-500/10 border border-cyber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(14,165,233,0.1)]">
            <ShieldAlert className="w-10 h-10 text-cyber-500" />
          </div>

          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Verification Required</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-10 opacity-70 leading-relaxed">System protocols restrict exam hosting to verified identities. Authenticate your terminal to proceed.</p>

          <form onSubmit={handleVerifyOtp} className="space-y-6 max-w-sm mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyber-500 to-neon-blue rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
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
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center backdrop-blur-md">
                <span className="text-[9px] font-black text-cyber-500 uppercase tracking-widest block mb-1">Developer Bypass</span>
                <span className="text-xl font-black text-white tracking-[0.3em]">{devOtp}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              <span>Validate Identity</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[10px] font-black text-gray-500 uppercase hover:text-white transition-colors tracking-widest block mx-auto">Resend Sync Link</button>
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
      
      // Adjust correct answer index
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 relative">
      {/* Header section with Back button */}
      <button 
        onClick={() => navigate('/?tab=exams')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group font-bold text-sm tracking-tight"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to all exams
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="glow-border rounded-[2.5rem] overflow-hidden">
          <div className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            {/* Ambient Background Flare */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-neon-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-neon-pink/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md ring-1 ring-white/5">
                  <Zap className="w-8 h-8 text-neon-pink" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight uppercase">Exam Creator</h1>
                  <p className="text-gray-400 font-medium mt-1">Design a professional exam with objective & subjective sections.</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Exams Section</span>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
              {/* Exam Metadata */}
              <div className="space-y-8 bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="block text-xs font-black text-cyber-300 mb-3 uppercase tracking-widest">Exam Title *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white text-xl font-bold placeholder-gray-700 transition-all outline-none"
                      placeholder="e.g. Intermediate Mathematics Finals"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Description (Optional)</label>
                    <textarea
                      className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white placeholder-gray-700 transition-all outline-none resize-none"
                      rows={2}
                      placeholder="Provide some context for this exam..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-8">
                  <label className="block text-xs font-black text-gray-500 mb-4 uppercase tracking-widest">Access Protocol *</label>
                  <div className="inline-flex p-1 bg-dark-bg/80 rounded-2xl border border-white/5 mb-8">
                    <button
                      type="button"
                      onClick={() => setExamType('anytime')}
                      className={cx(
                        "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        examType === 'anytime' ? "bg-white text-black shadow-2xl" : "text-gray-500 hover:text-white"
                      )}
                    >
                      <Zap className={cx("w-4 h-4", examType === 'anytime' ? "fill-black" : "text-gray-600")} />
                      Universal Access
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamType('scheduled')}
                      className={cx(
                        "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        examType === 'scheduled' ? "bg-white text-black shadow-2xl" : "text-gray-500 hover:text-white"
                      )}
                    >
                      <Calendar className={cx("w-4 h-4", examType === 'scheduled' ? "text-black" : "text-gray-600")} />
                      Scheduled Session
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {examType === 'scheduled' && (
                      <>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Start Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            required
                            className="w-full px-5 py-3.5 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white transition-all outline-none text-sm font-bold"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> End Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            required
                            className="w-full px-5 py-3.5 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white transition-all outline-none text-sm font-bold"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </motion.div>
                      </>
                    )}
                    <div className={cx(examType === 'anytime' ? "col-span-full" : "")}>
                      <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neon-pink" /> Time Limit (Minutes)
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        className="w-full px-5 py-3.5 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-pink focus:border-transparent text-white transition-all outline-none text-sm font-bold"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Proctoring Configuration */}
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <label className="block text-xs font-black text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> Security & Proctoring Level
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setProctoringLevel('none')}
                        className={cx(
                          "px-6 py-4 rounded-[1.5rem] border text-left transition-all",
                          proctoringLevel === 'none' 
                            ? "bg-white/10 border-white/30 text-white" 
                            : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <span className="block text-xs font-black uppercase tracking-widest mb-1">Standard</span>
                        <span className="block text-[10px] font-bold">No camera required</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setProctoringLevel('primary')}
                        className={cx(
                          "px-6 py-4 rounded-[1.5rem] border text-left transition-all",
                          proctoringLevel === 'primary' 
                            ? "bg-neon-blue/20 border-neon-blue/50 text-white shadow-[0_0_20px_rgba(14,165,233,0.15)]" 
                            : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <span className="block text-xs font-black uppercase tracking-widest mb-1 text-neon-blue">Advanced</span>
                        <span className="block text-[10px] font-bold">Requires Laptop Camera (1 Cam)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProctoringLevel('both')}
                        className={cx(
                          "px-6 py-4 rounded-[1.5rem] border text-left transition-all",
                          proctoringLevel === 'both' 
                            ? "bg-neon-pink/20 border-neon-pink/50 text-white shadow-[0_0_20px_rgba(219,39,119,0.15)]" 
                            : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <span className="block text-xs font-black uppercase tracking-widest mb-1 text-neon-pink">Maximum</span>
                        <span className="block text-[10px] font-bold">Requires Laptop + Mobile (2 Cams)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-neon-pink rounded-full"></div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Questions Sheet</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neon-pink/20 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>

                <div className="space-y-8">
                  <AnimatePresence mode='popLayout'>
                    {questions.map((q, qIndex) => (
                      <motion.div 
                        key={qIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl"
                      >
                        {/* Background mesh for each question body */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-neon-blue/10 transition-all duration-500"></div>

                        <div className="flex justify-between items-center mb-8">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-dark-bg/80 border border-white/10 flex items-center justify-center text-sm font-black text-neon-blue ring-4 ring-neon-blue/5">
                                {qIndex + 1}
                              </div>
                              <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Section</span>
                            </div>

                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                              <button
                                type="button"
                                onClick={() => handleQuestionChange(qIndex, 'type', 'objective')}
                                className={cx(
                                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                  q.type === 'objective' ? "bg-neon-blue text-black shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                              >
                                Objective
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuestionChange(qIndex, 'type', 'subjective')}
                                className={cx(
                                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                  q.type === 'subjective' ? "bg-neon-pink text-black shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                              >
                                Subjective
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 mr-2">
                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Marks:</span>
                               <input 
                                 type="number"
                                 className="w-12 bg-transparent text-white text-xs font-black outline-none"
                                 value={q.marks}
                                 min={1}
                                 onChange={(e) => handleQuestionChange(qIndex, 'marks', parseInt(e.target.value))}
                               />
                             </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              className="p-2.5 text-gray-500 hover:text-red-400 bg-dark-bg/50 border border-white/10 rounded-xl transition-all"
                              title="Remove Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div>
                            <input
                              type="text"
                              required
                              className="w-full px-6 py-5 bg-dark-bg/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-pink focus:border-transparent text-white text-lg font-bold placeholder-gray-700 transition-all outline-none"
                              placeholder="Enter question text here..."
                              value={q.text}
                              onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                            />
                          </div>

                          {q.type === 'objective' ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((option, oIndex) => {
                                  const isCorrect = q.correctAnswerIndex === oIndex;
                                  return (
                                    <div key={oIndex} className="relative group/option">
                                      <div className={cx(
                                        "absolute inset-0 rounded-2xl transition-all duration-300",
                                        isCorrect ? "bg-neon-blue/20 blur-md opacity-100" : "bg-transparent opacity-0"
                                      )}></div>
                                      <div className={cx(
                                        "relative flex items-center gap-3 p-1 rounded-2xl border transition-all duration-300",
                                        isCorrect 
                                          ? "bg-dark-bg/80 border-neon-blue/50 shadow-[0_0_20px_rgba(14,165,233,0.1)]" 
                                          : "bg-dark-bg/40 border-white/5 hover:border-white/10"
                                      )}>
                                        <button
                                          type="button"
                                          onClick={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                                          className={cx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                                            isCorrect 
                                              ? "bg-neon-blue text-black" 
                                              : "bg-white/5 text-gray-500 hover:text-white"
                                          )}
                                        >
                                          {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full border border-current" />}
                                        </button>
                                        <input
                                          type="text"
                                          required
                                          className="w-full px-3 py-3 bg-transparent text-white text-sm font-bold placeholder-gray-700 outline-none"
                                          placeholder={`Option ${oIndex + 1}`}
                                          value={option}
                                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        />
                                        {q.options.length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                                            className="p-3 text-gray-500 hover:text-red-400 opacity-0 group-hover/option:opacity-100 transition-all shrink-0"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(qIndex)}
                                  className="border-2 border-dashed border-white/5 rounded-2xl p-4 flex items-center justify-center gap-2 text-gray-500 hover:border-neon-blue hover:text-neon-blue transition-all group/add"
                                >
                                  <div className="p-1.5 bg-white/5 rounded-lg group-hover/add:bg-neon-blue group-hover/add:text-black transition-all">
                                    <Plus className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest">Append Option</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Grading Reference (Optional)</label>
                              <textarea
                                className="w-full px-6 py-5 bg-dark-bg/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-pink focus:border-transparent text-white placeholder-gray-700 transition-all outline-none resize-none"
                                rows={3}
                                placeholder="Provide keywords or expected answer for subjective grading..."
                                value={q.correctAnswer}
                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-white/10 rounded-[2rem] text-sm font-black text-gray-400 uppercase tracking-[0.2em] hover:text-white hover:border-neon-pink/40 hover:bg-neon-pink/5 transition-all mt-4 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Add another question
                </button>
              </div>

              <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="flex items-center justify-center p-2 bg-white/5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest">Automatic Timer</span>
                    <span className="text-xs font-semibold">Exams will auto-submit after {duration}m</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/?tab=exams')}
                    className="flex-1 md:flex-none px-10 py-4 text-gray-400 font-black text-sm uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={cx(
                      "flex-1 md:flex-none py-4 px-12 rounded-2xl font-black text-lg shadow-2xl transition-all transform tracking-tight uppercase",
                      loading 
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                        : "bg-gradient-to-r from-neon-blue to-cyber-600 text-white hover:scale-[1.05] hover:shadow-neon-blue/30 active:scale-[0.98]"
                    )}
                  >
                    {loading ? 'Publishing...' : 'Launch Exam'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateExam;
