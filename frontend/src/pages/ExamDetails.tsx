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
   Settings,
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
         <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Trash2 className="w-10 h-10 text-red-500" />
         </div>
         <div className="text-red-500 font-black uppercase tracking-widest text-3xl italic">{error}</div>
         <button onClick={() => navigate('/exams')} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white uppercase font-black tracking-[0.2em] text-xs hover:bg-white/10 transition-all font-bold">Return to Command Center</button>
      </div>
   );

   if (!exam) return (
     <div className="text-center p-20 text-red-500 font-black uppercase tracking-widest italic">
        Node Not Found in Gallery.
     </div>
   );

   const isActive = exam.examType === 'anytime' || (new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime));
   const totalSubmissions = results?.submissions?.length || 0;
   const userSubmissions = exam.userSubmissions || 0;
   const canAttempt = exam.attemptsLimit === 0 || userSubmissions < exam.attemptsLimit;

   return (
      <div className="container mx-auto px-4 py-32 max-w-7xl pb-40">
         {/* Top Navigation */}
         <div className="flex items-center justify-between mb-16">
            <button
               onClick={() => navigate('/?tab=exams')}
               className="flex items-center gap-3 text-gray-400 hover:text-neon-blue transition-all group font-black uppercase text-[10px] tracking-widest"
            >
               <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               Back to Intelligence Gallery
            </button>

            {results?.isTeacher && (
               <div className="flex items-center gap-3">
                  <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
                     <Settings className="w-5 h-5" />
                  </button>
                  <button 
                     onClick={async () => {
                        if(window.confirm('Decommission this exam node?')) {
                           try { await api.delete(`/exams/${id}`); navigate('/exams'); } catch(e){}
                        }
                     }}
                     className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-red-500 transition-all"
                  >
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
               <div className="mb-12">
                  <div className="flex items-center gap-6 mb-8">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-cyber-500 to-neon-blue flex items-center justify-center text-black shadow-[0_0_30px_#0ea5e966] group relative overflow-hidden shrink-0">
                        <BookOpen className="w-8 h-8 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                     <div>
                        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none italic uppercase mb-4">{exam.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                           <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                              <Users className="w-4 h-4 text-neon-blue" /> {totalSubmissions} Candidates
                           </span>
                           <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                              <Clock className="w-4 h-4 text-neon-pink" /> {exam.duration} Minutes
                           </span>
                           <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                              <Trophy className="w-4 h-4 text-cyber-400" /> {exam.questions.length} Items
                           </span>
                        </div>
                     </div>
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-2xl border-l-[3px] border-white/5 pl-8 italic">{exam.description || 'No specialized description provided for this node.'}</p>
               </div>

               {results?.isTeacher ? (
                  <div className="space-y-8">
                     <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-neon-pink/10 rounded-xl">
                              <BarChart3 className="text-neon-pink w-6 h-6" />
                           </div>
                           <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Curriculum Insights</h2>
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Administrator View Activated</span>
                     </div>

                     {exam.questions.map((q: any, idx: number) => (
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.08 }}
                           className="glass-card rounded-[2.5rem] p-10 border border-white/5 relative group overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 w-40 h-40 bg-neon-blue/5 blur-3xl pointer-events-none group-hover:bg-neon-blue/10 transition-colors"></div>

                           <div className="flex justify-between items-start mb-8 relative z-10">
                              <div className="flex gap-5">
                                 <span className="w-12 h-12 shrink-0 rounded-2xl bg-dark-bg/80 border border-white/10 flex items-center justify-center text-sm font-black text-neon-blue shadow-inner uppercase tracking-tighter italic">
                                    #{idx + 1}
                                 </span>
                                 <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight mb-2 leading-tight">{q.text}</h3>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                       <span className="text-neon-blue">{q.type} inquiry</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                       <span>{q.marks} Mark Component</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {q.type === 'objective' && (
                              <div className="grid grid-cols-1 gap-4 relative z-10">
                                 {q.options.map((opt: string, oIdx: number) => {
                                    const isCorrect = q.correctAnswerIndex === oIdx;
                                    return (
                                       <div key={oIdx} className={cx(
                                          "flex items-center justify-between p-5 rounded-2xl border transition-all",
                                          isCorrect ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue shadow-[0_0_15px_rgba(14,165,233,0.1)]" : "bg-white/5 border-white/5 text-gray-400"
                                       )}>
                                          <div className="flex items-center gap-4">
                                             <div className={cx(
                                                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black italic",
                                                isCorrect ? "bg-neon-blue text-black" : "bg-white/5 border border-white/10"
                                             )}>
                                                {String.fromCharCode(65 + oIdx)}
                                             </div>
                                             <span className="text-sm font-bold tracking-tight">{opt}</span>
                                          </div>
                                          {isCorrect && (
                                             <div className="flex items-center gap-2 px-4 py-1.5 bg-neon-blue/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-white ring-1 ring-neon-blue/30">
                                                <Target className="w-3 h-3" /> Target Answer
                                             </div>
                                          )}
                                       </div>
                                    );
                                 })}
                              </div>
                           )}

                           {q.type === 'subjective' && (
                              <div className="bg-neon-pink/5 border border-neon-pink/10 rounded-2xl p-6 relative z-10">
                                 <div className="flex items-center gap-3 mb-4 text-[10px] font-black text-neon-pink uppercase tracking-widest">
                                    <ClipboardCheck className="w-4 h-4" /> Assessment Benchmark
                                 </div>
                                 <p className="text-sm font-medium text-gray-300 italic leading-relaxed">{q.correctAnswer || 'No specific benchmark defined for this subjective component.'}</p>
                              </div>
                           )}
                        </motion.div>
                     ))}
                  </div>
               ) : (
                  <div className="glass-card rounded-[3rem] p-16 text-center border border-white/10 relative overflow-hidden group shadow-2xl">
                     <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-24 h-24 bg-neon-blue/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 animate-pulse text-neon-blue border border-neon-blue/20 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                        <Zap className="w-12 h-12 fill-current" />
                     </div>
                     <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-6">Prerequisites & Information</h2>
                     <p className="text-gray-500 font-bold max-w-lg mx-auto mb-12 text-sm leading-relaxed tracking-tight uppercase">Please review the following session rules and prerequisites before commencing the assessment.</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {[
                           { label: 'Temporal Limit', value: `${exam.duration} Minutes Session`, icon: <Clock className="w-5 h-5 text-neon-blue" /> },
                           { label: 'Structural Items', value: `${exam.questions.length} Total Questions`, icon: <Trophy className="w-5 h-5 text-neon-pink" /> },
                           { label: 'Proctoring System', value: '3 Tab Switches Limit', icon: <Activity className="w-5 h-5 text-amber-500" /> },
                           { label: 'Submission Protocol', value: exam.attemptsLimit === 0 ? 'Unlimited Attempts' : `${exam.attemptsLimit} Total Attempts`, icon: <Target className="w-5 h-5 text-cyber-500" /> }
                        ].map((rule, idx) => (
                           <div key={idx} className="bg-white/5 border border-white/5 p-5 rounded-[1.8rem] flex items-center gap-5 group-hover:border-white/10 transition-colors">
                              <div className="p-3 bg-white/5 rounded-xl">
                                 {rule.icon}
                              </div>
                              <div>
                                 <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{rule.label}</div>
                                 <div className="text-xs font-black text-gray-300 uppercase tracking-tight">{rule.value}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-10 lg:sticky lg:top-10 h-fit">
               <div className="glass-card rounded-[3rem] p-10 border border-white/10 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyber-500 to-neon-pink"></div>
                  
                  <div className="bg-white p-5 rounded-[2.5rem] mb-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-4 border-white/10">
                     <QRCodeSVG value={shareUrl} size={180} />
                  </div>

                  <div className="space-y-8 relative z-10 w-full">
                     <div className="text-left">
                        <h4 className="text-[10px] font-black text-cyber-500 uppercase tracking-[0.3em] mb-4 pl-1 italic">Synchronization Endpoint</h4>
                        <div className="relative group">
                           <input
                              readOnly
                              value={shareUrl}
                              className="w-full bg-dark-bg/80 border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-bold text-gray-500 focus:outline-none focus:border-cyber-600 transition-all font-mono shadow-inner"
                           />
                           <button
                              onClick={copyToClipboard}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-cyber-500 hover:text-black rounded-xl transition-all text-gray-400"
                           >
                              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-5 text-left">
                        {exam.examType === 'anytime' ? (
                           <div className="bg-neon-blue/10 p-6 rounded-[2rem] border border-neon-blue/20 flex flex-col items-center justify-center text-center gap-5 group relative overflow-hidden shadow-inner">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 blur-3xl"></div>
                              <div className="p-4 bg-neon-blue text-black rounded-2xl shadow-[0_0_25px_rgba(14,165,233,0.4)] group-hover:scale-110 transition-transform relative z-10">
                                 <Zap className="w-7 h-7 fill-current" />
                              </div>
                              <div className="relative z-10">
                                 <h5 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Universal Access</h5>
                                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest max-w-[200px] leading-relaxed italic">Global Synchronization Enabled. No temporal restrictions.</p>
                              </div>
                           </div>
                        ) : (
                           <>
                              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-5 hover:bg-white/10 transition-colors">
                                 <div className="p-3 bg-neon-blue/10 text-neon-blue rounded-[1.2rem] shadow-inner">
                                    <Calendar className="w-6 h-6" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">Activation Date</span>
                                    <span className="text-sm font-black text-white italic">{format(new Date(exam.startTime), 'PPP')}</span>
                                 </div>
                              </div>
                              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-5 hover:bg-white/10 transition-colors">
                                 <div className="p-3 bg-neon-pink/10 text-neon-pink rounded-[1.2rem] shadow-inner">
                                    <Clock className="w-6 h-6" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">Temporal Window</span>
                                    <span className="text-sm font-black text-white italic uppercase">
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
                  <div className="glass-card rounded-[3rem] p-10 border border-white/10 overflow-hidden relative shadow-2xl">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/5 blur-3xl rounded-full"></div>
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Full Gradebook</h3>
                        <Trophy className="text-amber-400 w-5 h-5 shadow-[0_0_15px_#fbbf24]" />
                     </div>
                     {totalSubmissions > 0 ? (
                        <div className="space-y-5 relative z-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                           {results.submissions.map((sub: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-amber-400/50 transition-all shadow-inner">
                                 <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center text-[10px] font-black italic tracking-tighter">#{idx + 1}</span>
                                    <div>
                                       <span className="block text-xs font-black text-white uppercase tracking-widest mb-1 leading-none">{sub.student?.username || 'Redacted'}</span>
                                       <div className="flex items-center gap-2 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                                          <Target className="w-2.5 h-2.5" /> Synchronized: {format(new Date(sub.createdAt), 'HH:mm')}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="text-[10px] font-black text-amber-400 uppercase italic">
                                       {sub.score === sub.totalMarks ? 'Perfect' : `${Math.round((sub.score / sub.totalMarks) * 100)}%`}
                                    </div>
                                    <button 
                                       onClick={() => setSelectedSubmission(sub)}
                                       className="p-2 bg-white/5 hover:bg-cyber-500 hover:text-black rounded-lg transition-all"
                                    >
                                       <Eye className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-20 relative z-10">
                           <p className="text-gray-600 font-black uppercase tracking-widest text-[10px] italic">No Candidates Detected</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Floating Action Bar */}
         <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-6">
            <div className="bg-[#11131a]/80 backdrop-blur-3xl border border-white/10 p-3 rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex items-center gap-4 ring-1 ring-white/10">
               <button
                  onClick={() => { if (isActive && canAttempt) navigate(`/exams/${id}/take`); }}
                  disabled={!isActive || !canAttempt}
                  className={cx(
                     "flex-1 flex items-center justify-center gap-4 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all italic",
                     (isActive && canAttempt)
                        ? "bg-gradient-to-r from-neon-blue to-cyber-600 text-white hover:scale-[1.02] shadow-[0_15px_30px_rgba(14,165,233,0.3)] active:scale-95"
                        : "bg-white/5 text-gray-600 cursor-not-allowed grayscale"
                  )}
               >
                  <Play className="w-6 h-6 fill-current" />
                  {!isActive ? 'Event Locked' : !canAttempt ? 'Attempts Limit Reached' : 'Start Assessment Now'}
               </button>

               {results?.isTeacher && (
                  <>
                     <div className="w-[2px] h-10 bg-white/10 rounded-full" />
                     <button
                        onClick={() => navigate(`/exams/${id}/take`)}
                        className="flex items-center justify-center gap-2 px-6 py-5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all italic"
                     >
                        <Eye className="w-5 h-5" />
                        Preview
                     </button>
                     <div className="w-[2px] h-10 bg-white/10 rounded-full" />
                     <button
                        onClick={() => setShowLogsModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all italic"
                     >
                        <Activity className="w-5 h-5" />
                        Proctor Logs
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
                     className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                  />
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     className="relative w-full max-w-4xl bg-dark-bg border border-red-500/20 rounded-[3rem] p-8 md:p-12 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
                  >
                     <div className="flex justify-between items-center mb-10 shrink-0">
                        <div>
                           <h2 className="text-3xl font-black text-red-500 uppercase italic tracking-tighter">Proctoring Telemetry</h2>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">Suspicious Events & Triggers</p>
                        </div>
                        <button onClick={() => setShowLogsModal(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                           <X className="w-6 h-6" />
                        </button>
                     </div>

                     <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-4">
                        {proctorLogs.length === 0 ? (
                           <div className="text-center p-10 text-gray-500 font-bold uppercase tracking-widest text-xs italic">No proctoring events recorded.</div>
                        ) : (
                           proctorLogs.map((log: any, idx: number) => (
                              <div key={idx} className="bg-white/5 border border-red-500/10 p-5 rounded-2xl flex flex-col gap-2">
                                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-xs font-black text-white uppercase">{log.userId?.username || 'Unknown Candidate'}</span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                                 </div>
                                 <div className="flex items-center gap-3 mt-2">
                                    <Activity className="w-5 h-5 text-red-500" />
                                    <div>
                                       <span className="text-red-500 font-bold uppercase text-xs tracking-widest block mb-1">{log.eventType}</span>
                                       <span className="text-gray-400 text-sm">{log.details || 'No additional details provided.'}</span>
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
                     className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                  />
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     className="relative w-full max-w-4xl bg-dark-bg border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
                  >
                     <div className="flex justify-between items-center mb-10 shrink-0">
                        <div>
                           <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Candidate Submission</h2>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">{selectedSubmission.student?.username}'s Assessment Log</p>
                        </div>
                        <button onClick={() => setSelectedSubmission(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                           <X className="w-6 h-6" />
                        </button>
                     </div>

                     <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-8">
                        {exam.questions.map((q: any, idx: number) => {
                           const ans = selectedSubmission.answers.find((a: any) => a.questionId === q._id);
                           const isCorrect = q.type === 'objective' && ans?.objectiveAnswer === q.correctAnswerIndex;
                           
                           return (
                              <div key={idx} className="bg-white/5 border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
                                 <div className="flex items-start gap-6 relative z-10">
                                    <span className={cx(
                                       "w-12 h-12 shrink-0 rounded-2xl border flex items-center justify-center text-xs font-black italic",
                                       q.type === 'objective' 
                                          ? (isCorrect ? "bg-neon-blue/20 border-neon-blue text-neon-blue" : "bg-red-500/20 border-red-500 text-red-500") 
                                          : "bg-cyber-500/20 border-cyber-500 text-cyber-500"
                                    )}>
                                       {idx + 1}
                                    </span>
                                    <div className="flex-grow">
                                       <h4 className="text-xl font-bold text-white mb-6 leading-tight">{q.text}</h4>
                                       
                                       {q.type === 'objective' ? (
                                          <div className="space-y-3">
                                             <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Participant Response</div>
                                             <div className={cx(
                                                "p-4 rounded-xl border flex justify-between items-center text-sm font-bold",
                                                isCorrect ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue" : "bg-red-500/10 border-red-500/30 text-red-500"
                                             )}>
                                                <span>{q.options[ans?.objectiveAnswer] || 'No response recorded'}</span>
                                                <span className="text-[10px] font-black uppercase">{isCorrect ? 'Correct Path' : 'Incorrect Path'}</span>
                                             </div>
                                             {!isCorrect && (
                                                <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-gray-500 flex justify-between items-center">
                                                   <span>Correct Path: {q.options[q.correctAnswerIndex]}</span>
                                                </div>
                                             )}
                                          </div>
                                       ) : (
                                          <div className="space-y-4">
                                             <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Participant Analysis</div>
                                             <div className="p-6 bg-dark-bg/60 border border-white/10 rounded-2xl text-gray-300 text-base italic leading-relaxed">
                                                {ans?.subjectiveAnswer || 'No descriptive synchronization provided.'}
                                             </div>
                                             <div className="text-[9px] font-black text-neon-pink uppercase tracking-[0.2em]">Benchmark Comparison</div>
                                             <div className="p-6 bg-neon-pink/5 border border-neon-pink/10 rounded-2xl text-gray-400 text-sm italic leading-relaxed">
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
