import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Layout, 
  Type, 
  List, 
  ChevronLeft,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import api, { surveys } from '../api';
import { AuthContext } from '../App';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SurveyQuestion {
  type: 'mcq' | 'text';
  text: string;
  options?: string[];
  required: boolean;
}

const CreateSurvey: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { type: 'mcq', text: '', options: ['', '', ''], required: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[3rem] p-12 text-center border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-sky-400/10 border border-sky-400/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(56,189,248,0.1)]">
            <ShieldAlert className="w-10 h-10 text-sky-400" />
          </div>

          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">Authorization Required</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-10 opacity-70 leading-relaxed">System protocols restrict discovery cycles to verified identities. Synchronize your neural link to proceed.</p>

          <form onSubmit={handleVerifyOtp} className="space-y-6 max-w-sm mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-cyber-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
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
                <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest block mb-1">Developer Bypass</span>
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

            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[10px] font-black text-gray-500 uppercase hover:text-white transition-colors tracking-widest block mx-auto">Resend Sync Code</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleAddQuestion = (type: 'mcq' | 'text') => {
    setQuestions([...questions, { 
      type, 
      text: '', 
      options: type === 'mcq' ? ['', '', ''] : undefined, 
      required: true 
    }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: keyof SurveyQuestion, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      const newOptions = [...newQuestions[qIndex].options!];
      newOptions[oIndex] = value;
      newQuestions[qIndex].options = newOptions;
    }
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = [...(newQuestions[qIndex].options || []), ''];
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      newQuestions[qIndex].options = newQuestions[qIndex].options!.filter((_, i) => i !== oIndex);
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await surveys.create({ title, description, questions, isAnonymous });
      navigate('/?tab=surveys');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 relative">
      <button 
        onClick={() => navigate('/?tab=surveys')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group font-bold text-sm tracking-tight"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to all surveys
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="glow-border rounded-[2.5rem] overflow-hidden">
          <div className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            {/* Ambient Background Flare */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-neon-purple/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md ring-1 ring-white/5">
                  <Layout className="w-8 h-8 text-sky-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight uppercase">Survey Builder</h1>
                  <p className="text-gray-400 font-medium mt-1">Design a comprehensive discovery cycle.</p>
                </div>
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
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                <div>
                  <label className="block text-xs font-black text-sky-400 mb-3 uppercase tracking-widest">Survey Title *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-sky-400 focus:border-transparent text-white text-xl font-bold placeholder-gray-700 transition-all outline-none"
                    placeholder="e.g. User Experience Feedback"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Description</label>
                  <textarea
                    className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-sky-400 focus:border-transparent text-white placeholder-gray-700 transition-all outline-none resize-none"
                    rows={3}
                    placeholder="Tell your participants what this survey is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cx(
                        "block w-14 h-8 rounded-full transition-colors",
                         isAnonymous ? "bg-sky-500" : "bg-gray-700"
                      )}></div>
                      <div className={cx(
                        "dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform",
                         isAnonymous ? "transform translate-x-6" : ""
                      )}></div>
                    </div>
                    <div className="ml-4">
                      <span className="block text-sm font-bold text-white uppercase tracking-widest">Anonymous Mode</span>
                      <span className="block text-xs text-gray-400 font-medium">Participants identity will be hidden</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-sky-400 rounded-full"></div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Structure Protocol</h2>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('mcq')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-sky-400/10 border border-sky-400/20 text-sky-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sky-400/20 transition-all active:scale-95"
                    >
                      <List className="w-4 h-4" /> Add MCQ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('text')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-cyber-500/10 border border-cyber-500/20 text-cyber-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyber-500/20 transition-all active:scale-95"
                    >
                      <Type className="w-4 h-4" /> Add Text
                    </button>
                  </div>
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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-400/10 transition-all duration-500"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-dark-bg/80 border border-white/10 flex items-center justify-center text-sm font-black text-sky-400 ring-4 ring-sky-400/5">
                              {qIndex + 1}
                            </div>
                            <span className={cx(
                              "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border",
                              q.type === 'mcq' ? "bg-sky-400/10 text-sky-400 border-sky-400/20" : "bg-cyber-500/10 text-cyber-500 border-cyber-500/20"
                            )}>
                              {q.type === 'mcq' ? 'Multiple Choice' : 'Free Text'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group/req">
                               <input type="checkbox" className="w-4 h-4 rounded bg-dark-bg border-white/20 text-sky-500 focus:ring-sky-500" checked={q.required} onChange={(e) => handleQuestionChange(qIndex, 'required', e.target.checked)} />
                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/req:text-gray-300">Required</span>
                            </label>
                            {questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="p-2.5 text-gray-500 hover:text-red-400 bg-dark-bg/50 border border-white/10 rounded-xl transition-all"
                                title="Remove Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                          <input
                            type="text"
                            required
                            className="w-full px-6 py-5 bg-dark-bg/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-sky-400 focus:border-transparent text-white text-lg font-bold placeholder-gray-700 transition-all outline-none"
                            placeholder="Ask your question..."
                            value={q.text}
                            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                          />

                          {q.type === 'mcq' && (
                            <div className="space-y-4 pl-4 border-l-2 border-sky-500/30">
                              {q.options?.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-sky-500/50"></div>
                                  <input
                                    type="text"
                                    required
                                    className="flex-1 px-4 py-3 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-transparent text-white font-bold placeholder-gray-700 transition-all outline-none"
                                    placeholder={`Option ${oIndex + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                  />
                                  {q.options!.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeOption(qIndex, oIndex)}
                                      className="p-3 text-gray-500 hover:text-red-400 bg-dark-bg/50 border border-white/10 rounded-xl transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(qIndex)}
                                className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest hover:text-white hover:border-sky-400/40 hover:bg-sky-400/5 transition-all mt-4"
                              >
                                <Plus className="w-4 h-4" /> Add Option
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="flex items-center justify-center p-2 bg-white/5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                    <span className="text-xs font-semibold">Survey will be live immediately</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/?tab=surveys')}
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
                        : "bg-gradient-to-r from-sky-400 to-cyber-600 text-white hover:scale-[1.05] hover:shadow-sky-400/30 active:scale-[0.98]"
                    )}
                  >
                    {loading ? 'Initializing...' : 'Launch Survey'}
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

export default CreateSurvey;
