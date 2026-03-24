import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Zap,
  Timer,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exams } from '../api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const ExamTaker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await exams.getById(id!);
        setExam(res.data);
        setAnswers(new Array(res.data.questions.length).fill(-1));
        
        const end = new Date(res.data.endTime).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.floor((end - now) / 1000));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await exams.submit(id!, answers);
      navigate(`/exams/${id}`);
    } catch (err) {
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-cyber-500 font-black text-xs uppercase tracking-widest"
      >
        Synchronizing Quiz Data...
      </motion.div>
    </div>
  );
  
  if (!exam) return <div className="text-center p-20 text-red-400 font-black uppercase">Quiz unavailable.</div>;

  const currentQuestion = exam.questions[currentQ];
  const progress = ((currentQ + 1) / exam.questions.length) * 100;
  const isUrgent = timeLeft < 300; // Less than 5 mins

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Participant Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-neon-blue/5 blur-[60px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-neon-blue/10 rounded-2xl border border-neon-blue/20">
            <Zap className="w-6 h-6 text-neon-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{exam.title}</h2>
            <div className="text-neon-blue font-black text-[10px] uppercase tracking-[0.2em] mt-2">
              Question {currentQ + 1} of {exam.questions.length}
            </div>
          </div>
        </div>

        <div className={cx(
          "flex items-center gap-4 px-8 py-4 rounded-2xl font-black text-2xl transition-all duration-500 relative z-10",
          isUrgent 
            ? "bg-red-500/10 border border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse" 
            : "bg-white/5 border border-white/10 text-white"
        )}>
          <Timer className={isUrgent ? "animate-spin-slow" : ""} />
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Bar Header */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
           <motion.div 
             className="h-full bg-gradient-to-r from-neon-blue via-cyber-500 to-neon-pink"
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/5 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex-grow">
          <span className="text-[10px] font-black text-cyber-500 uppercase tracking-[0.3em] mb-4 block">Current Inquiry</span>
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-14">{currentQuestion.text}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = answers[currentQ] === index;
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(index)}
                  className={cx(
                    "w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                    isSelected
                      ? "border-neon-blue bg-neon-blue/10 text-white shadow-[0_0_30px_rgba(14,165,233,0.1)]"
                      : "border-white/5 bg-white/5 hover:border-white/20 text-gray-400 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cx(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all duration-300",
                      isSelected ? "bg-neon-blue border-neon-blue text-black" : "bg-dark-bg border-white/10 group-hover:border-white/20 text-gray-500"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-bold text-lg">{option}</span>
                  </div>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10">
                       <CheckCircle2 className="w-6 h-6 text-neon-blue" />
                    </motion.div>
                  )}
                  {/* Subtle hover background effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 flex justify-between items-center relative z-10">
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
                    idx === currentQ ? "bg-neon-blue scale-125 shadow-[0_0_10px_#0ea5e9]" : 
                    ans !== -1 ? "bg-cyber-900 border border-cyber-500/50" : "bg-white/10"
                  )}
                />
             ))}
          </div>

          {currentQ === exam.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={cx(
                "px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all group flex items-center gap-3 shadow-2xl",
                submitting 
                  ? "bg-gray-800 text-gray-600" 
                  : "bg-gradient-to-r from-neon-pink to-cyber-600 text-white hover:scale-105 active:scale-95 shadow-neon-pink/20"
              )}
            >
              {submitting ? 'Transmitting...' : <><Send className="w-4 h-4" /> Finalize & Submit</>}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(prev => Math.min(exam.questions.length - 1, prev + 1))}
              className="flex items-center gap-3 px-10 py-4 bg-neon-blue hover:bg-cyber-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 group shadow-xl shadow-neon-blue/20"
            >
              Proceed <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Warning Toast */}
      <AnimatePresence>
        {answers.includes(-1) && currentQ === exam.questions.length - 1 && !submitting && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 flex items-center gap-3 text-amber-500 bg-amber-500/10 border border-amber-500/20 p-5 rounded-[2rem] font-black text-xs uppercase tracking-widest justify-center backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4" /> You still have unanswered inquiries. Recheck before finalizing.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamTaker;
