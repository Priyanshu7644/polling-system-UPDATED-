import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Zap,
  Timer,
  Send,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exams } from '../api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QRCodeSVG } from 'qrcode.react';
import { useProctoring } from '../hooks/useProctoring';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const ExamTaker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]); // Array of { questionId, objectiveAnswer?, subjectiveAnswer? }
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [started, setStarted] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Custom proctoring hook
  const { 
     localVideoRef, 
     remoteVideoRef, 
     logEvent, 
     pairingCode, 
     isPrimaryConnected, 
     isSecondaryConnected,
     cameraError
  } = useProctoring(id as string, false, exam?.proctoringLevel);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await exams.getById(id!);
        setExam(res.data);
        
        // Initialize answers
        const initialAnswers = res.data.questions.map((q: any) => ({
          questionId: q._id,
          objectiveAnswer: undefined,
          subjectiveAnswer: ''
        }));
        setAnswers(initialAnswers);
        
        const end = new Date(res.data.endTime).getTime();
        const now = new Date().getTime();
        const durationSeconds = res.data.duration * 60;
        const availableTillEnd = Math.floor((end - now) / 1000);
        
        // If anytime, use full duration. If scheduled, min of duration or time until end.
        if (res.data.examType === 'anytime') {
           setTimeLeft(durationSeconds);
        } else {
           setTimeLeft(Math.max(0, Math.min(durationSeconds, availableTillEnd)));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to fetch exam');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  // Proctoring logic
  useEffect(() => {
     if (!started || submitting) return;

     const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
           setTabSwitches(prev => {
              const newVal = prev + 1;
              logEvent('tab-switch', `Switched away from tab. Total: ${newVal}`);
              if (newVal >= 3) {
                 alert('Proctoring Violation: You have switched tabs more than 3 times. Your exam will be submitted automatically.');
                 handleSubmit();
              } else {
                 alert(`Proctoring Warning (${newVal}/3): Do not switch tabs or windows. Doing so again will result in automatic submission.`);
              }
              return newVal;
           });
        }
     };

     document.addEventListener('visibilitychange', handleVisibilityChange);
     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [started, submitting, logEvent]);

  // Robust Timer
  useEffect(() => {
    if (!started || submitting || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [started, submitting, timeLeft > 0]);

  // Auto-submit on time up
  useEffect(() => {
    if (started && timeLeft === 0 && !loading && !submitting && exam) {
       handleSubmit();
    }
  }, [timeLeft, started, loading, submitting, exam]);

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = {
      ...newAnswers[currentQ],
      objectiveAnswer: optionIndex
    };
    setAnswers(newAnswers);
  };

  const handleSubjectiveChange = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = {
      ...newAnswers[currentQ],
      subjectiveAnswer: text
    };
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await exams.submit(id!, { answers });
      navigate(`/exams/${id}`);
    } catch (err) {
      alert('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-cyber-500 font-black text-xs uppercase tracking-widest"
      >
        Synchronizing Exam Data...
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="text-center p-20 glass-card mx-auto max-w-xl rounded-[3rem] mt-20 space-y-8 animate-pulse">
      <div className="text-red-500 font-black uppercase tracking-widest text-3xl">{error}</div>
      <p className="text-gray-400">Access to this exam session is currently invalid or restricted by the proctoring engine.</p>
      <button onClick={() => navigate('/exams')} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">Return to Briefing</button>
    </div>
  );
  
  if (!exam) return <div className="text-center p-20 text-red-400 font-black uppercase">Exam unavailable.</div>;

  const currentQuestion = exam.questions[currentQ];
  const progress = ((currentQ + 1) / exam.questions.length) * 100;
  const isUrgent = timeLeft < 300; // Less than 5 mins

  const proctorQrUrl = `${window.location.origin}/exams/${id}/proctor-mobile`;

  const isReady = exam?.proctoringLevel === 'none' 
    ? true 
    : exam?.proctoringLevel === 'primary'
      ? isPrimaryConnected
      : (isPrimaryConnected && isSecondaryConnected);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      
      {/* Proctoring Hub Viewer (Always Visible to keep cameras running) */}
      {exam?.proctoringLevel !== 'none' && (
      <div className={cx(
        "grid gap-4 transition-all duration-700 pointer-events-none",
        !started 
          ? cx("mb-6 relative pointer-events-auto", exam?.proctoringLevel === 'both' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-sm mx-auto")
          : cx("fixed bottom-6 right-6 z-50", exam?.proctoringLevel === 'both' ? "grid-cols-2 w-[280px] md:w-[350px]" : "grid-cols-1 w-[140px] md:w-[175px]")
      )}>
        {/* Primary Camera */}
        <div className={cx(
           "glass-card border border-neon-blue/20 flex flex-col items-center relative overflow-hidden bg-black/40 shadow-2xl transition-all duration-700",
           !started ? "p-3 rounded-[2rem]" : "p-2 rounded-2xl"
        )}>
           <div className={cx(
              "absolute top-2 left-3 flex items-center gap-2 z-10 bg-black/50 rounded-lg backdrop-blur-md transition-all duration-500",
              !started ? "px-2 py-1" : "px-1.5 py-0.5"
           )}>
             <div className={cx("rounded-full bg-red-500 animate-pulse", !started ? "w-2 h-2" : "w-1.5 h-1.5")}></div>
             <span className={cx("font-black uppercase tracking-[0.2em] text-white", !started ? "text-[9px]" : "text-[6px]")}>Primary</span>
           </div>
           <video 
              ref={localVideoRef as any}
              autoPlay 
              playsInline 
              muted 
              className={cx(
                 "w-full aspect-video object-contain bg-black/40 border border-white/5 transition-all duration-700",
                 !started ? "mt-6 rounded-xl" : "mt-4 rounded-lg"
              )}
           />
        </div>

        {exam?.proctoringLevel === 'both' && (
        <>
            {/* Action / QR Code (Hidden when started) */}
            {!started && (
            <div className="glass-card p-4 rounded-[2rem] border border-neon-pink/20 flex flex-col items-center justify-center relative bg-black/40 text-center pointer-events-auto">
                <span className="text-[10px] font-black uppercase text-cyber-500 mb-2">Secondary Device</span>
                <div className="bg-white p-2 rounded-xl">
                <QRCodeSVG value={proctorQrUrl} size={64} />
                </div>
                {pairingCode && (
                <div className="mt-3 py-1.5 px-4 bg-neon-pink/10 border border-neon-pink/30 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Pairing Code</span>
                    <span className="text-sm font-mono font-bold text-neon-pink tracking-widest">{pairingCode}</span>
                </div>
                )}
                <p className="text-[8px] mt-2 text-gray-400">
                {window.location.hostname === 'localhost' 
                    ? <span className="text-amber-500 font-bold">⚠️ Access via Network IP (e.g. 192.168.x.x) to scan</span> 
                    : "Scan QR or visit /connect on phone"}
                </p>
            </div>
            )}

            {/* Secondary Camera */}
            <div className={cx(
               "glass-card border border-cyber-500/20 flex flex-col items-center relative overflow-hidden bg-black/40 shadow-2xl transition-all duration-700",
               !started ? "p-3 rounded-[2rem]" : "p-2 rounded-2xl"
            )}>
            <div className={cx(
               "absolute top-2 left-3 flex items-center gap-2 z-10 bg-black/50 rounded-lg backdrop-blur-md transition-all duration-500",
               !started ? "px-2 py-1" : "px-1.5 py-0.5"
            )}>
                <div className={cx("rounded-full bg-cyber-500", !started ? "w-2 h-2" : "w-1.5 h-1.5")}></div>
                <span className={cx("font-black uppercase tracking-[0.2em] text-white", !started ? "text-[9px]" : "text-[6px]")}>Env Cam</span>
            </div>
            <video 
                ref={remoteVideoRef as any}
                autoPlay 
                playsInline 
                className={cx(
                   "w-full aspect-video object-contain bg-black/40 border border-white/5 transition-all duration-700",
                   !started ? "mt-6 rounded-xl" : "mt-4 rounded-lg"
                )}
            />
            </div>
        </>
        )}
      </div>
      )}

      {!started ? (
         <div className="glass-card p-10 mt-10 rounded-[3rem] text-center border-neon-blue/30 shadow-[0_0_50px_rgba(14,165,233,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 blur-[100px]"></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4">
               {exam?.proctoringLevel === 'none' ? 'Session Pre-Flight' : 'Hardware Diagnostics'}
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-10">
               {exam?.proctoringLevel === 'none' 
                  ? "This session does not require active camera telemetry. Initialize the assessment when ready."
                  : exam?.proctoringLevel === 'primary' 
                     ? "Confirm your Primary Face Camera is visible overhead. The secure session will only unlock once hardware is connected. The timer will commence upon entry."
                     : "Confirm that both your Primary Face Camera and Secondary Environment Camera are communicating. Once your setup is fully verified, initialize the assessment."
               }
            </p>
            <button 
               onClick={() => setStarted(true)}
               disabled={!isReady}
               className={cx(
                  "font-black text-sm uppercase tracking-[0.2em] py-5 px-12 rounded-[2rem] transition-all flex items-center justify-center mx-auto",
                  isReady 
                    ? "bg-gradient-to-r from-neon-blue to-cyber-600 text-white shadow-2xl shadow-neon-blue/20 hover:scale-105 active:scale-95" 
                    : cameraError
                       ? "bg-red-500/20 text-red-400 cursor-not-allowed border border-red-500/50"
                       : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
               )}
            >
               {isReady ? <><Zap className="w-5 h-5 inline-block mr-3" /> Initialize Assessment</> : cameraError ? <><ShieldAlert className="w-5 h-5 inline-block mr-3" /> Hardware Blocked</> : 'Awaiting Hardware Links...'}
            </button>
            {cameraError && (
               <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl inline-block">
                 <p className="text-xs font-bold text-red-400 mb-2">
                   Camera Access Denied by Your Browser
                 </p>
                 <p className="text-[10px] text-red-300">
                   If you previously clicked "Block" or dismissed the popup, your browser will not ask again. 
                   <br/>To fix: Click the <strong>lock icon 🔒</strong> in your address bar, change Camera to <strong>Allow</strong>, and <strong>Refresh</strong> this page.
                 </p>
               </div>
            )}
         </div>
      ) : (
         <>
            {/* Participant Header */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-8 min-h-[120px] glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        {tabSwitches > 0 && (
          <div className="absolute top-0 left-0 w-full px-4 py-1.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-[0.3em] z-50 text-center">
            Proctoring Violation: {tabSwitches}/3
          </div>
        )}
        <div className="absolute top-0 left-0 w-32 h-32 bg-neon-blue/5 blur-[60px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
          <div className="p-4 bg-neon-blue/10 rounded-2xl border border-neon-blue/20">
            <Zap className="w-8 h-8 text-neon-blue" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase italic">{exam.title}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 mt-3">
              <div className="text-neon-blue font-black text-[9px] uppercase tracking-[0.2em]">
                {currentQ + 1} / {exam.questions.length}
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-700"></div>
              <div className="text-gray-400 font-black text-[9px] uppercase tracking-[0.2em]">
                {currentQuestion.marks} Marks
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-700"></div>
              <div className={cx(
                "text-[7px] px-2.5 py-0.5 rounded-full font-black uppercase border",
                currentQuestion.type === 'objective' ? "text-neon-blue border-neon-blue/10 bg-neon-blue/5" : "text-neon-pink border-neon-pink/10 bg-neon-pink/5"
              )}>
                {currentQuestion.type}
              </div>
            </div>
          </div>
        </div>

        <div className={cx(
          "flex items-center gap-4 px-8 py-5 rounded-3xl font-black text-xl md:text-4xl transition-all duration-500 relative z-10",
          isUrgent 
            ? "bg-red-500/10 border border-red-500/30 text-red-500 shadow-[20px_0_60px_rgba(239,68,68,0.1)]" 
            : "bg-white/5 border border-white/10 text-white"
        )}>
          <Timer className={cx("w-6 h-6 md:w-8 md:h-8", isUrgent ? "animate-pulse" : "text-gray-500")} />
          <span className="tabular-nums">{formatTime(timeLeft)}</span>
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
      </div>

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
          <span className="text-[10px] font-black text-cyber-500 uppercase tracking-[0.3em] mb-4 block">Question Assessment</span>
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-14">{currentQuestion.text}</h3>

          {currentQuestion.type === 'objective' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentQuestion.options.map((option: string, index: number) => {
                const isSelected = answers[currentQ]?.objectiveAnswer === index;
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
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-cyber-600 rounded-[2.2rem] blur opacity-10 group-focus-within:opacity-25 transition-opacity"></div>
              <textarea
                className="relative w-full min-h-[300px] p-8 bg-dark-bg/60 border border-white/10 rounded-[2rem] text-white text-lg font-medium placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-neon-pink/50 transition-all resize-none"
                placeholder="Compose your detailed response here..."
                value={answers[currentQ]?.subjectiveAnswer || ''}
                onChange={(e) => handleSubjectiveChange(e.target.value)}
              />
              <div className="absolute bottom-6 right-8 text-[10px] font-black text-gray-600 uppercase tracking-widest mt-4">
                Section: Subjective Analysis
              </div>
            </div>
          )}
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
             {answers.map((ans, idx) => {
                const isSelected = ans.type === 'objective' ? ans.objectiveAnswer !== undefined : ans.subjectiveAnswer?.length > 0;
                return (
                  <div 
                    key={idx} 
                    className={cx(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      idx === currentQ ? "bg-neon-blue scale-125 shadow-[0_0_10px_#0ea5e9]" : 
                      isSelected ? "bg-cyber-900 border border-cyber-500/50" : "bg-white/10"
                    )}
                  />
                );
             })}
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
              {submitting ? 'Transmitting...' : <><Send className="w-4 h-4" /> Finalize Exam</>}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(prev => Math.min(exam.questions.length - 1, prev + 1))}
              className="flex items-center gap-3 px-10 py-4 bg-neon-blue hover:bg-cyber-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 group shadow-xl shadow-neon-blue/20"
            >
              Next Section <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Warning Toast */}
      <AnimatePresence>
        {answers.some(a => a.objectiveAnswer === undefined && a.subjectiveAnswer === '') && currentQ === exam.questions.length - 1 && !submitting && (
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
      </>
      )}
    </div>
  );
};

export default ExamTaker;
