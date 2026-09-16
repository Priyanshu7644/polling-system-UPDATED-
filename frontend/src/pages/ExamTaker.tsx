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
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest"
      >
        Loading Exam Data...
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="text-center p-12 pro-card mx-auto max-w-xl rounded-[2.5rem] mt-20 space-y-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl">
      <div className="text-rose-600 dark:text-rose-400 font-black uppercase tracking-wider text-2xl">{error}</div>
      <p className="text-slate-600 dark:text-slate-400 text-sm">Access to this exam session is currently invalid or restricted.</p>
      <button onClick={() => navigate('/?tab=exams')} className="btn-primary px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-md">Return to Briefing</button>
    </div>
  );
  
  if (!exam) return <div className="text-center p-20 text-rose-500 font-black uppercase">Exam unavailable.</div>;

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
           "pro-card border border-indigo-500/30 flex flex-col items-center relative overflow-hidden bg-slate-900 shadow-2xl transition-all duration-700",
           !started ? "p-3 rounded-[2rem]" : "p-2 rounded-2xl"
        )}>
           <div className={cx(
              "absolute top-2 left-3 flex items-center gap-2 z-10 bg-black/60 rounded-lg backdrop-blur-md transition-all duration-500",
              !started ? "px-2 py-1" : "px-1.5 py-0.5"
           )}>
             <div className={cx("rounded-full bg-rose-500 animate-pulse", !started ? "w-2 h-2" : "w-1.5 h-1.5")}></div>
             <span className={cx("font-black uppercase tracking-wider text-white", !started ? "text-[9px]" : "text-[6px]")}>Primary</span>
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
            <div className="pro-card p-4 rounded-[2rem] border border-indigo-200 dark:border-indigo-500/20 flex flex-col items-center justify-center relative bg-white dark:bg-slate-900 text-center pointer-events-auto shadow-md">
                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 mb-2">Secondary Device</span>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                <QRCodeSVG value={proctorQrUrl} size={64} />
                </div>
                {pairingCode && (
                <div className="mt-3 py-1.5 px-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-slate-500 block mb-0.5">Pairing Code</span>
                    <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{pairingCode}</span>
                </div>
                )}
                <p className="text-[9px] mt-2 text-slate-500">
                {window.location.hostname === 'localhost' 
                    ? <span className="text-amber-600 font-bold">⚠️ Access via Network IP (e.g. 192.168.x.x)</span> 
                    : "Scan QR or visit /connect on phone"}
                </p>
            </div>
            )}

            {/* Secondary Camera */}
            <div className={cx(
               "pro-card border border-indigo-500/30 flex flex-col items-center relative overflow-hidden bg-slate-900 shadow-2xl transition-all duration-700",
               !started ? "p-3 rounded-[2rem]" : "p-2 rounded-2xl"
            )}>
            <div className={cx(
               "absolute top-2 left-3 flex items-center gap-2 z-10 bg-black/60 rounded-lg backdrop-blur-md transition-all duration-500",
               !started ? "px-2 py-1" : "px-1.5 py-0.5"
            )}>
                <div className={cx("rounded-full bg-indigo-400", !started ? "w-2 h-2" : "w-1.5 h-1.5")}></div>
                <span className={cx("font-black uppercase tracking-wider text-white", !started ? "text-[9px]" : "text-[6px]")}>Env Cam</span>
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
         <div className="pro-card p-10 mt-10 rounded-[3rem] text-center border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-slate-950 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]"></div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white mb-4">
               {exam?.proctoringLevel === 'none' ? 'Session Pre-Flight' : 'Hardware Diagnostics'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-10 text-sm leading-relaxed font-medium">
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
                  "font-black text-sm uppercase tracking-wider py-4 px-10 rounded-2xl transition-all flex items-center justify-center mx-auto shadow-lg",
                  isReady 
                    ? "btn-primary" 
                    : cameraError
                       ? "bg-rose-50 text-rose-600 cursor-not-allowed border border-rose-300"
                       : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-gray-500 cursor-not-allowed border border-slate-300 dark:border-white/5"
               )}
            >
               {isReady ? <><Zap className="w-5 h-5 inline-block mr-2" /> Initialize Assessment</> : cameraError ? <><ShieldAlert className="w-5 h-5 inline-block mr-2" /> Hardware Blocked</> : 'Awaiting Hardware Links...'}
            </button>
            {cameraError && (
               <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl inline-block text-left">
                 <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                   Camera Access Denied by Your Browser
                 </p>
                 <p className="text-[11px] text-slate-600 dark:text-slate-300">
                   If you dismissed the popup, please click the <strong>lock icon 🔒</strong> in your address bar, set Camera to <strong>Allow</strong>, and <strong>Refresh</strong> this page.
                 </p>
               </div>
            )}
         </div>
      ) : (
         <>
            {/* Participant Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 min-h-[100px] pro-card p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-md relative overflow-hidden">
        {tabSwitches > 0 && (
          <div className="absolute top-0 left-0 w-full px-4 py-1.5 bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider z-50 text-center">
            Proctoring Warning: {tabSwitches}/3 Tab Switches
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center gap-4 relative z-10 text-center md:text-left">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-500/20">
            <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase mb-1">{exam.title}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold text-slate-500">
              <span className="text-indigo-600 dark:text-indigo-400">
                Question {currentQ + 1} of {exam.questions.length}
              </span>
              <span>•</span>
              <span>{currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="uppercase text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {currentQuestion.type}
              </span>
            </div>
          </div>
        </div>

        <div className={cx(
          "flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xl md:text-3xl transition-all duration-500 relative z-10 shadow-sm",
          isUrgent 
            ? "bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400" 
            : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
        )}>
          <Timer className={cx("w-6 h-6", isUrgent ? "animate-pulse text-rose-500" : "text-indigo-500")} />
          <span className="tabular-nums">{formatTime(timeLeft)}</span>
        </div>
        
        {/* Progress Bar Header */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-white/5">
           <motion.div 
             className="h-full bg-indigo-600"
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
        className="pro-card rounded-[2.5rem] p-8 md:p-12 min-h-[450px] flex flex-col relative overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xl"
      >
        <div className="relative z-10 flex-grow">
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 block">Question Assessment</span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-snug mb-10">{currentQuestion.text}</h3>

          {currentQuestion.type === 'objective' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option: string, index: number) => {
                const isSelected = answers[currentQ]?.objectiveAnswer === index;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOptionSelect(index)}
                    className={cx(
                      "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-white shadow-sm font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-indigo-300 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cx(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border transition-all",
                        isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-semibold text-base">{option}</span>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10">
                         <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="relative group">
              <textarea
                className="w-full min-h-[250px] p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white text-base font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                placeholder="Compose your response here..."
                value={answers[currentQ]?.subjectiveAnswer || ''}
                onChange={(e) => handleSubjectiveChange(e.target.value)}
              />
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                Section: Subjective Response
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex justify-between items-center relative z-10 pt-6 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 active:scale-95 border border-slate-200 dark:border-white/5"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="hidden sm:flex gap-2">
             {answers.map((ans, idx) => {
                const isAnswered = ans.objectiveAnswer !== undefined || (ans.subjectiveAnswer && ans.subjectiveAnswer.trim().length > 0);
                return (
                  <div 
                    key={idx} 
                    className={cx(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      idx === currentQ ? "bg-indigo-600 scale-125" : 
                      isAnswered ? "bg-indigo-400" : "bg-slate-300 dark:bg-white/20"
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
                "btn-primary px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md",
                submitting ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Finalize Exam</>}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(prev => Math.min(exam.questions.length - 1, prev + 1))}
              className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Next <ChevronRight className="w-4 h-4" />
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
            className="mt-6 flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl font-bold text-xs uppercase tracking-wider justify-center"
          >
            <AlertCircle className="w-4 h-4" /> You still have unanswered questions. Recheck before finalizing.
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
};

export default ExamTaker;
