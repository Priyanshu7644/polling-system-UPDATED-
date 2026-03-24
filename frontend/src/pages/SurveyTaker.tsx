import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, ChevronRight, ChevronLeft, Send, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { surveys } from '../api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const SurveyTaker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await surveys.getById(id!);
        setSurvey(res.data);
        setAnswers(new Array(res.data.questions.length).fill(''));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  const handleAnswerChange = (val: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = val;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await surveys.submit(id!, answers);
      setDone(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-sky-500 font-black text-xs uppercase tracking-widest"
      >
        Initializing Discovery Cycle...
      </motion.div>
    </div>
  );

  if (!survey) return <div className="text-center p-20 text-red-500 font-black uppercase tracking-widest">Survey Unavailable.</div>;

  if (done) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[3rem] p-12 border border-sky-500/20 shadow-[0_0_50px_rgba(56,189,248,0.2)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[80px] pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-sky-500/10 text-sky-400 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-sky-400/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Transmission Complete</h1>
          <p className="text-gray-400 text-lg mb-12 font-medium">Your insights have been recorded securely.</p>
          <button
            onClick={() => navigate('/surveys')}
            className="px-12 py-5 bg-gradient-to-r from-sky-400 to-cyber-600 text-white rounded-2xl font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-sky-500/50 shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Back to Surveys
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQ];
  const isLast = currentQ === survey.questions.length - 1;
  const progress = ((currentQ + 1) / survey.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Participant Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-sky-400/5 blur-[60px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-sky-400/10 rounded-2xl border border-sky-400/20">
            <ClipboardList className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{survey.title}</h2>
            <div className="text-sky-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2">
              Question {currentQ + 1} of {survey.questions.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 relative z-10">
          <Activity className="w-4 h-4 text-cyber-500" />
          Insight Protocol Active
        </div>
        
        {/* Progress Bar Header */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
           <motion.div 
             className="h-full bg-gradient-to-r from-sky-400 to-cyber-500"
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ type: 'spring', damping: 15 }}
           />
        </div>
      </motion.div>

      {/* Question Card */}
      <motion.div 
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card rounded-[3rem] p-8 md:p-14 min-h-[500px] flex flex-col relative overflow-hidden border border-white/10 shadow-3xl"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/5 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex-grow">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-black text-cyber-500 uppercase tracking-[0.3em] block">
              {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Free Text'}
            </span>
            {currentQuestion.required && (
               <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">Required</span>
            )}
          </div>
          
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-10">{currentQuestion.text}</h3>

          <div className="space-y-4">
            {currentQuestion.type === 'mcq' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {currentQuestion.options.map((option: string, index: number) => {
                  const isSelected = answers[currentQ] === index;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerChange(index)}
                      className={cx(
                        "w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                        isSelected
                          ? "border-sky-400 bg-sky-400/10 text-white shadow-[0_0_30px_rgba(56,189,248,0.15)]"
                          : "border-white/5 bg-white/5 hover:border-white/20 text-gray-400 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={cx(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all duration-300 shrink-0",
                          isSelected ? "bg-sky-400 border-sky-400 text-black" : "bg-dark-bg border-white/10 group-hover:border-white/20 text-gray-500"
                        )}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-bold text-lg leading-tight">{option}</span>
                      </div>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 shrink-0">
                           <CheckCircle2 className="w-6 h-6 text-sky-400" />
                        </motion.div>
                      )}
                      {/* Subtle hover background effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <textarea
                className="w-full p-6 bg-dark-bg/60 border border-white/10 focus:border-sky-400 text-white placeholder-gray-600 rounded-[2rem] outline-none transition-all min-h-[200px] text-xl font-bold shadow-inner"
                placeholder="Type your response..."
                value={answers[currentQ]}
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 flex justify-between items-center relative z-10 pt-8 border-t border-white/5">
          <button
            onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 dark:bg-dark-bg/50 text-gray-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 group border border-white/5"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Previous
          </button>

          <div className="hidden sm:flex gap-2">
             {answers.map((ans, idx) => (
                <div 
                  key={idx} 
                  className={cx(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    idx === currentQ ? "bg-sky-400 scale-125 shadow-[0_0_10px_#38bdf8]" : 
                    ans !== -1 && ans !== '' ? "bg-cyber-900 border border-cyber-500/50" : "bg-white/10"
                  )}
                />
             ))}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || (currentQuestion.required && (answers[currentQ] === '' || answers[currentQ] === -1))}
              className={cx(
                "px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all group flex items-center gap-3 shadow-2xl",
                (submitting || (currentQuestion.required && (answers[currentQ] === '' || answers[currentQ] === -1)))
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed" 
                  : "bg-gradient-to-r from-sky-400 to-cyber-600 text-white hover:scale-105 active:scale-95 shadow-sky-400/20"
              )}
            >
              {submitting ? 'Transmitting...' : <><Send className="w-4 h-4" /> Submit Feedback</>}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(prev => Math.min(survey.questions.length - 1, prev + 1))}
              disabled={currentQuestion.required && (answers[currentQ] === '' || answers[currentQ] === -1)}
              className={cx(
                "flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all group shadow-xl",
                 (currentQuestion.required && (answers[currentQ] === '' || answers[currentQ] === -1))
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-sky-400 hover:bg-cyber-500 text-black hover:scale-105 active:scale-95 shadow-sky-400/20"
              )}
            >
              Proceed <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyTaker;
