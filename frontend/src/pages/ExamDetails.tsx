import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
   Calendar,
   Clock,
   Play,
   Trophy,
   Copy,
   CheckCircle2,
   Users,
   BarChart3,
   Eye,
   ChevronLeft,
   Trash2,
   Zap,
   BookOpen,
   Target,
   ClipboardCheck,
   Activity,
   X
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import api, { exams } from '../api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
   return twMerge(clsx(inputs));
}

const ExamDetails: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const [exam, setExam] = useState<any>(null);
   const [results, setResults] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [copied, setCopied] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
   const [proctorLogs, setProctorLogs] = useState<any[]>([]);
   const [showLogsModal, setShowLogsModal] = useState(false);

   const shareUrl = window.location.origin + `/exams/${id}/take`;

   useEffect(() => {
      const fetchData = async () => {
         try {
            const hasToken = !!localStorage.getItem('token');
            const requests: Promise<any>[] = [exams.getById(id!)];
            
            if (hasToken) {
               requests.push(exams.getResults(id!));
            }

            const results = await Promise.allSettled(requests);
            const examRes = results[0];
            const resultsRes = hasToken ? results[1] : null;

            if (examRes.status === 'fulfilled') {
               setExam(examRes.value.data);
            } else {
               setError((examRes.reason as any).response?.data?.error || 'Failed to fetch exam node.');
            }

            if (resultsRes && resultsRes.status === 'fulfilled') {
               setResults(resultsRes.value.data);
               if (resultsRes.value.data.isTeacher) {
                  try {
                     const logsRes = await exams.getProctorLogs(id!);
                     setProctorLogs(logsRes.data);
                  } catch (e) {
                     console.error("Failed to fetch logs", e);
                  }
               }
            }
         } catch (err) {
            console.error('Data synchronization failure:', err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [id]);

   const copyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   if (loading) return (
      <div className="flex justify-center items-center min-h-[60vh]">
         <div className="w-12 h-12 border-4 border-cyber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
   );

   if (error) return (
      <div className="text-center p-20 space-y-8">
         <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/20">
            <Trash2 className="w-10 h-10 text-rose-500" />
         </div>
         <div className="text-rose-600 dark:text-rose-400 font-black uppercase tracking-wider text-2xl">{error}</div>
         <button onClick={() => navigate('/?tab=exams')} className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl uppercase font-black tracking-wider text-xs shadow-md">Return to Intelligence Gallery</button>
      </div>
   );

   if (!exam) return (
     <div className="text-center p-20 text-rose-500 font-black uppercase tracking-wider">
        Exam Not Found in Gallery.
     </div>
   );

   const isActive = exam.examType === 'anytime' || (new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime));
   const totalSubmissions = results?.submissions?.length || 0;
   const userSubmissions = exam.userSubmissions || 0;
   const canAttempt = exam.attemptsLimit === 0 || userSubmissions < exam.attemptsLimit;

   return (
      <div className="container mx-auto px-4 py-24 max-w-7xl pb-40">
         {/* Top Navigation */}
         <div className="flex items-center justify-between mb-10">
            <button
               onClick={() => navigate('/?tab=exams')}
               className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all group font-bold uppercase text-xs tracking-wider"
            >
               <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               Back to Intelligence Gallery
            </button>

            {results?.isTeacher && (
               <div className="flex items-center gap-3">
                  <button 
                     onClick={async () => {
                        if(window.confirm('Delete this exam?')) {
                           try { await api.delete(`/exams/${id}`); navigate('/?tab=exams'); } catch(e){}
                        }
                     }}
                     className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-rose-500 transition-all shadow-sm"
                     title="Delete Exam"
                  >
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
               <div className="mb-8">
                  <div className="flex items-center gap-6 mb-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                        <BookOpen className="w-8 h-8" />
                     </div>
                     <div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase mb-3">{exam.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                           <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                              <Users className="w-4 h-4" /> {totalSubmissions} Candidates
                           </span>
                           <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                              <Clock className="w-4 h-4" /> {exam.duration} Minutes
                           </span>
                           <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                              <Trophy className="w-4 h-4" /> {exam.questions.length} Items
                           </span>
                        </div>
                     </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed border-l-4 border-indigo-500 pl-6">{exam.description || 'No specialized description provided for this exam.'}</p>
               </div>

               {results?.isTeacher ? (
                  <div className="space-y-6">
                     <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                              <BarChart3 className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
                           </div>
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Curriculum Insights</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher Mode</span>
                     </div>

                     {exam.questions.map((q: any, idx: number) => (
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           className="pro-card rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm relative group overflow-hidden"
                        >
                           <div className="flex justify-between items-start mb-6 relative z-10">
                              <div className="flex gap-4">
                                 <span className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400">
                                    #{idx + 1}
                                 </span>
                                 <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1 leading-snug">{q.text}</h3>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                       <span className="text-indigo-600 dark:text-indigo-400">{q.type} inquiry</span>
                                       <span>•</span>
                                       <span>{q.marks} Mark Component</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {q.type === 'objective' && (
                              <div className="grid grid-cols-1 gap-3 relative z-10">
                                 {q.options.map((opt: string, oIdx: number) => {
                                    const isCorrect = q.correctAnswerIndex === oIdx;
                                    return (
                                       <div key={oIdx} className={cx(
                                          "flex items-center justify-between p-4 rounded-xl border transition-all",
                                          isCorrect 
                                             ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-white shadow-sm font-bold" 
                                             : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300"
                                       )}>
                                          <div className="flex items-center gap-3">
                                             <div className={cx(
                                                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black",
                                                isCorrect ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                                             )}>
                                                {String.fromCharCode(65 + oIdx)}
                                             </div>
                                             <span className="text-sm font-semibold">{opt}</span>
                                          </div>
                                          {isCorrect && (
                                             <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                <Target className="w-3 h-3" /> Correct Answer
                                             </div>
                                          )}
                                       </div>
                                    );
                                 })}
                              </div>
                           )}

                           {q.type === 'subjective' && (
                              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-5 relative z-10">
                                 <div className="flex items-center gap-2 mb-2 text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                                    <ClipboardCheck className="w-4 h-4" /> Assessment Benchmark
                                 </div>
                                 <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{q.correctAnswer || 'No specific benchmark defined.'}</p>
                              </div>
                           )}
                        </motion.div>
                     ))}
                  </div>
               ) : (
                  <div className="pro-card rounded-[2.5rem] p-12 text-center border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-md">
                     <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                        <Zap className="w-10 h-10 fill-current" />
                     </div>
                     <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Prerequisites & Information</h2>
                     <p className="text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto mb-10 text-sm leading-relaxed">Please review the following session rules and prerequisites before commencing the assessment.</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {[
                           { label: 'Time Limit', value: `${exam.duration} Minutes Session`, icon: <Clock className="w-5 h-5 text-indigo-500" /> },
                           { label: 'Questions Count', value: `${exam.questions.length} Total Questions`, icon: <Trophy className="w-5 h-5 text-indigo-500" /> },
                           { label: 'Proctoring Protection', value: '3 Tab Switches Limit', icon: <Activity className="w-5 h-5 text-amber-500" /> },
                           { label: 'Attempts Allowed', value: exam.attemptsLimit === 0 ? 'Unlimited Attempts' : `${exam.attemptsLimit} Total Attempts`, icon: <Target className="w-5 h-5 text-blue-500" /> }
                        ].map((rule, idx) => (
                           <div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                              <div className="p-2.5 bg-white dark:bg-white/5 rounded-xl shadow-sm">
                                 {rule.icon}
                              </div>
                              <div>
                                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">{rule.label}</div>
                                 <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{rule.value}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8 lg:sticky lg:top-10 h-fit">
               <div className="pro-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-md flex flex-col items-center text-center">
                  <div className="bg-white p-4 rounded-3xl mb-8 shadow-md border border-slate-200">
                     <QRCodeSVG value={shareUrl} size={160} />
                  </div>

                  <div className="space-y-6 relative z-10 w-full">
                     <div className="text-left">
                        <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">Share Exam Link</h4>
                        <div className="relative group">
                           <input
                              readOnly
                              value={shareUrl}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                           />
                           <button
                              onClick={copyToClipboard}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 dark:bg-white/5 hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-indigo-600 dark:text-slate-300"
                           >
                              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-4 text-left">
                        {exam.examType === 'anytime' ? (
                           <div className="bg-indigo-50 dark:bg-indigo-950/30 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 flex flex-col items-center justify-center text-center gap-3">
                              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
                                 <Zap className="w-6 h-6 fill-current" />
                              </div>
                              <div>
                                 <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Universal Access</h5>
                                 <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Available anytime without scheduling constraints.</p>
                              </div>
                           </div>
                        ) : (
                           <>
                              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-4">
                                 <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <Calendar className="w-5 h-5" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Date</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-white">{format(new Date(exam.startTime), 'PPP')}</span>
                                 </div>
                              </div>
                              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-4">
                                 <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <Clock className="w-5 h-5" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Time Window</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase">
                                       {format(new Date(exam.startTime), 'p')} - {format(new Date(exam.endTime), 'p')}
                                    </span>
                                 </div>
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               </div>

               {results?.isTeacher && (
                  <div className="pro-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-md">
                     <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Full Gradebook</h3>
                        <Trophy className="text-amber-500 w-5 h-5" />
                     </div>
                     {totalSubmissions > 0 ? (
                        <div className="space-y-3 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {results.submissions.map((sub: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                 <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-black">#{idx + 1}</span>
                                    <div>
                                       <span className="block text-xs font-bold text-slate-900 dark:text-white mb-0.5">{sub.student?.username || 'Candidate'}</span>
                                       <div className="text-[10px] font-medium text-slate-500">
                                          {format(new Date(sub.createdAt), 'HH:mm')}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                                       {sub.score === sub.totalMarks ? '100%' : `${Math.round((sub.score / sub.totalMarks) * 100)}%`}
                                    </div>
                                    <button 
                                       onClick={() => setSelectedSubmission(sub)}
                                       className="p-1.5 bg-white dark:bg-white/10 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-lg transition-all shadow-sm"
                                       title="View Details"
                                    >
                                       <Eye className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-10">
                           <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">No Candidates Yet</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Floating Action Bar */}
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2.5 rounded-[2.5rem] shadow-2xl flex items-center gap-3">
               <button
                  onClick={() => { if (isActive && canAttempt) navigate(`/exams/${id}/take`); }}
                  disabled={!isActive || !canAttempt}
                  className={cx(
                     "flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] font-black text-sm uppercase tracking-wider transition-all",
                     (isActive && canAttempt)
                        ? "btn-primary shadow-md"
                        : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-gray-600 cursor-not-allowed"
                  )}
               >
                  <Play className="w-5 h-5 fill-current" />
                  {!isActive ? 'Event Locked' : !canAttempt ? 'Attempts Limit Reached' : 'Start Assessment Now'}
               </button>

               {results?.isTeacher && (
                  <>
                     <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10" />
                     <button
                        onClick={() => navigate(`/exams/${id}/take`)}
                        className="flex items-center justify-center gap-1.5 px-5 py-4 bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-[2rem] font-bold text-xs uppercase tracking-wider transition-all"
                     >
                        <Eye className="w-4 h-4" />
                        Preview
                     </button>
                     <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10" />
                     <button
                        onClick={() => setShowLogsModal(true)}
                        className="flex items-center justify-center gap-1.5 px-5 py-4 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-[2rem] font-bold text-xs uppercase tracking-wider transition-all"
                     >
                        <Activity className="w-4 h-4" />
                        Logs
                     </button>
                  </>
               )}
            </div>
         </div>
 
         {/* Proctoring Logs Modal */}
         <AnimatePresence>
            {showLogsModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowLogsModal(false)}
                     className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 15 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 15 }}
                     className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                  >
                     <div className="flex justify-between items-center mb-6 shrink-0">
                        <div>
                           <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">Proctoring Telemetry</h2>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Suspicious Events & Triggers</p>
                        </div>
                        <button onClick={() => setShowLogsModal(false)} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-300 transition-all">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {proctorLogs.length === 0 ? (
                           <div className="text-center p-10 text-slate-500 font-bold uppercase tracking-wider text-xs">No proctoring events recorded.</div>
                        ) : (
                           proctorLogs.map((log: any, idx: number) => (
                              <div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-rose-500/10 p-4 rounded-2xl flex flex-col gap-2">
                                 <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{log.userId?.username || 'Unknown Candidate'}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                                 </div>
                                 <div className="flex items-center gap-3 mt-1">
                                    <Activity className="w-5 h-5 text-rose-500 shrink-0" />
                                    <div>
                                       <span className="text-rose-600 dark:text-rose-400 font-bold uppercase text-xs tracking-wider block mb-0.5">{log.eventType}</span>
                                       <span className="text-slate-600 dark:text-slate-300 text-sm">{log.details || 'No additional details provided.'}</span>
                                    </div>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Submission Modal */}
         <AnimatePresence>
            {selectedSubmission && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setSelectedSubmission(null)}
                     className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 15 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 15 }}
                     className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                  >
                     <div className="flex justify-between items-center mb-6 shrink-0">
                        <div>
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Candidate Submission</h2>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{selectedSubmission.student?.username}'s Assessment Log</p>
                        </div>
                        <button onClick={() => setSelectedSubmission(null)} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-300 transition-all">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        {exam.questions.map((q: any, idx: number) => {
                           const ans = selectedSubmission.answers.find((a: any) => a.questionId === q._id);
                           const isCorrect = q.type === 'objective' && ans?.objectiveAnswer === q.correctAnswerIndex;
                           
                           return (
                              <div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                 <div className="flex items-start gap-4 relative z-10">
                                    <span className={cx(
                                       "w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center text-xs font-black",
                                       q.type === 'objective' 
                                          ? (isCorrect ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-400" : "bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-400") 
                                          : "bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400"
                                    )}>
                                       {idx + 1}
                                    </span>
                                    <div className="flex-grow">
                                       <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 leading-snug">{q.text}</h4>
                                       
                                       {q.type === 'objective' ? (
                                          <div className="space-y-2.5">
                                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Candidate Answer</div>
                                             <div className={cx(
                                                "p-3.5 rounded-xl border flex justify-between items-center text-sm font-bold",
                                                isCorrect ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-white" : "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300"
                                             )}>
                                                <span>{q.options[ans?.objectiveAnswer] || 'No response recorded'}</span>
                                                <span className="text-[10px] font-black uppercase">{isCorrect ? 'Correct' : 'Incorrect'}</span>
                                             </div>
                                             {!isCorrect && (
                                                <div className="mt-2 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-600 dark:text-slate-400 flex justify-between items-center">
                                                   <span>Correct: {q.options[q.correctAnswerIndex]}</span>
                                                </div>
                                             )}
                                          </div>
                                       ) : (
                                          <div className="space-y-3">
                                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Candidate Response</div>
                                             <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                                                {ans?.subjectiveAnswer || 'No descriptive answer provided.'}
                                             </div>
                                             <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Benchmark Benchmark</div>
                                             <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                                                {q.correctAnswer || 'No specific benchmark defined.'}
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default ExamDetails;
