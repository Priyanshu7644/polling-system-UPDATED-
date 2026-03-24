import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  Zap, 
  Settings2, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exams } from '../api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
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

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
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
        startTime,
        endTime,
        questions
      });
      navigate('/exams');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 relative">
      {/* Header section with Back button */}
      <button 
        onClick={() => navigate('/exams')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group font-bold text-sm tracking-tight"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to all quiz questions
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
                  <h1 className="text-3xl font-black text-white tracking-tight uppercase">Quiz Creator</h1>
                  <p className="text-gray-400 font-medium mt-1">Design an interactive session for your participants.</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Session Mode</span>
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
              {/* Quiz Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="col-span-full">
                  <label className="block text-xs font-black text-cyber-300 mb-3 uppercase tracking-widest">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white text-xl font-bold placeholder-gray-700 transition-all outline-none"
                    placeholder="e.g. Weekly Product Sync Trivia"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="col-span-full">
                  <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Description (Optional)</label>
                  <textarea
                    className="w-full px-5 py-4 bg-dark-bg/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white placeholder-gray-700 transition-all outline-none resize-none"
                    rows={2}
                    placeholder="Provide some context for your quiz..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-5 py-3.5 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white transition-all outline-none text-sm font-bold"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> End Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-5 py-3.5 bg-dark-bg/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white transition-all outline-none text-sm font-bold"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-neon-pink rounded-full"></div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Curate Questions</h2>
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
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-dark-bg/80 border border-white/10 flex items-center justify-center text-sm font-black text-neon-blue ring-4 ring-neon-blue/5">
                              {qIndex + 1}
                            </div>
                            <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Quiz Question</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              className="p-2.5 text-gray-500 hover:text-white bg-dark-bg/50 border border-white/10 rounded-xl transition-all"
                              title="Quiz Settings"
                            >
                              <Settings2 className="w-4 h-4" />
                            </button>
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
                              placeholder="What would you like to ask?"
                              value={q.text}
                              onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                            />
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyber-500/80 bg-cyber-500/5 px-3 py-1.5 rounded-lg w-fit border border-cyber-500/10">
                              <AlertCircle className="w-3 h-3" /> Don't forget to mark the correct answer
                            </div>
                          </div>

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
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
                  Add another quiz question
                </button>
              </div>

              <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="flex items-center justify-center p-2 bg-white/5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest">Auto-validation</span>
                    <span className="text-xs font-semibold">Answers will be verified instantly</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/exams')}
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
                    {loading ? 'Initializing...' : 'Launch Session'}
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
