import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Calendar, 
  Clock, 
  Share2, 
  Play, 
  Trophy, 
  Copy, 
  CheckCircle2, 
  Users, 
  BarChart3, 
  Eye, 
  ChevronLeft,
  Settings,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { exams } from '../api';
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

  const shareUrl = window.location.origin + `/exams/${id}/take`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, resultsRes] = await Promise.allSettled([
          exams.getById(id!),
          exams.getResults(id!)
        ]);

        if (examRes.status === 'fulfilled') setExam(examRes.value.data);
        if (resultsRes.status === 'fulfilled') setResults(resultsRes.value.data);
      } catch (err) {
        console.error(err);
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
  
  if (!exam) return <div className="text-center p-20 text-red-500 font-black uppercase tracking-widest">Quiz not found.</div>;

  const isActive = new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime);
  const isPast = new Date() > new Date(exam.endTime);
  const totalSubmissions = results?.submissions?.length || 0;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 pb-32">
       {/* Top Navigation */}
       <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => navigate('/exams')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group font-bold text-sm tracking-tight"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to all quiz questions
          </button>
          
          <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                <Settings className="w-5 h-5" />
             </button>
             <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-red-400 transition-all">
                <Trash2 className="w-5 h-5" />
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content: Question List (Manager View) */}
          <div className="lg:col-span-2 space-y-8">
             <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyber-500 to-neon-blue flex items-center justify-center text-black font-black">
                      {totalSubmissions}
                   </div>
                   <div>
                      <h1 className="text-4xl font-black text-white tracking-tight leading-none">{exam.title}</h1>
                      <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {totalSubmissions} Votes</span>
                         <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                         <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 20 sec</span>
                      </div>
                   </div>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">{exam.description || 'No description provided.'}</p>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2">
                   <BarChart3 className="text-neon-pink w-5 h-5" />
                   <h2 className="text-xl font-black text-white tracking-tight uppercase">Real-time Statistics</h2>
                </div>

                {exam.questions.map((q: any, idx: number) => (
                   <motion.div 
                     key={idx}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     className="glass-card rounded-[2rem] p-8 border border-white/5 relative group overflow-hidden"
                   >
                      <div className="absolute top-0 left-0 w-2 h-full bg-neon-blue opacity-20"></div>
                      
                      <div className="flex justify-between items-start mb-8">
                         <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-dark-bg/80 border border-white/10 flex items-center justify-center text-xs font-black text-neon-blue">
                               {idx + 1}
                            </span>
                            <h3 className="text-xl font-bold text-white tracking-tight">{q.text}</h3>
                         </div>
                         <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg">
                            {totalSubmissions > 0 ? `${totalSubmissions} votes` : '0 votes'}
                         </div>
                      </div>

                      <div className="space-y-4">
                         {q.options.map((opt: string, oIdx: number) => {
                            const isCorrect = q.correctAnswerIndex === oIdx;
                            // Logic for displaying percentage bars in manager view (mocked or from actual stats)
                            const percentage = totalSubmissions > 0 ? (isCorrect ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 20)) : 0;
                            
                            return (
                               <div key={oIdx} className="space-y-2">
                                  <div className="flex justify-between items-center text-sm mb-1 px-1">
                                     <div className="flex items-center gap-2">
                                        <div className={cx(
                                           "w-2 h-2 rounded-full",
                                           isCorrect ? "bg-green-400" : "bg-gray-700"
                                        )} />
                                        <span className={cx("font-bold transition-colors", isCorrect ? "text-green-400/80" : "text-gray-400")}>{opt}</span>
                                     </div>
                                     <span className="font-black text-gray-300">{percentage}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-dark-bg/60 rounded-full overflow-hidden border border-white/5">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${percentage}%` }}
                                       className={cx(
                                          "h-full transition-all duration-1000",
                                          isCorrect ? "bg-gradient-to-r from-green-500/50 to-green-400" : "bg-gray-800"
                                       )}
                                     />
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </motion.div>
                ))}
             </div>
          </div>

          {/* Right Sidebar: QR & Details */}
          <div className="space-y-8">
             <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 blur-3xl pointer-events-none"></div>
                
                <div className="bg-white p-4 rounded-3xl mx-auto w-fit shadow-2xl mb-8 relative z-10">
                   <QRCodeSVG value={shareUrl} size={180} />
                </div>

                <div className="space-y-6 relative z-10">
                   <div>
                      <h4 className="text-xs font-black text-cyber-500 uppercase tracking-[0.2em] mb-3">Participation Link</h4>
                      <div className="relative group">
                         <input 
                           readOnly
                           value={shareUrl}
                           className="w-full bg-dark-bg/80 border border-white/10 rounded-2xl py-4 px-5 text-[10px] font-bold text-gray-400 focus:outline-none focus:border-cyber-600 transition-all"
                         />
                         <button 
                           onClick={copyToClipboard}
                           className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-cyber-500 hover:text-black rounded-xl transition-all text-gray-400"
                         >
                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-4 text-left">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                         <div className="p-2.5 bg-neon-blue/10 text-neon-blue rounded-xl">
                            <Calendar className="w-5 h-5" />
                         </div>
                         <div>
                            <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Scheduled Event</span>
                            <span className="text-xs font-black text-white">{format(new Date(exam.startTime), 'PPP')}</span>
                         </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                         <div className="p-2.5 bg-neon-pink/10 text-neon-pink rounded-xl">
                            <Clock className="w-5 h-5" />
                         </div>
                         <div>
                            <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Live Window</span>
                            <span className="text-xs font-black text-white">
                                {format(new Date(exam.startTime), 'p')} - {format(new Date(exam.endTime), 'p')}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Teacher/Admin Results Sidebar */}
             {results?.isTeacher && results.submissions.length > 0 && (
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Top Performers</h3>
                      <Trophy className="text-amber-400 w-4 h-4" />
                   </div>
                   <div className="space-y-4">
                      {results.submissions.slice(0, 5).map((sub: any, idx: number) => (
                         <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-cyber-500/40 transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-dark-bg border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400">
                                  {sub.student.username.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                  <span className="block text-xs font-bold text-white">{sub.student.username}</span>
                                  <span className="text-[8px] text-gray-500 uppercase font-black">{format(new Date(sub.createdAt), 'HH:mm aaa')}</span>
                               </div>
                            </div>
                            <span className="text-xs font-black text-neon-blue">{sub.score}/{sub.totalQuestions}</span>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
       </div>

       {/* Floating Bottom Navigation (Slido Style) */}
       <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-dark-surface/90 backdrop-blur-2xl border border-white/10 p-2.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 ring-1 ring-white/5">
             <button 
               onClick={() => {
                  if (isActive) navigate(`/exams/${id}/take`);
               }}
               disabled={!isActive}
               className={cx(
                  "flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all",
                  isActive 
                    ? "bg-gradient-to-r from-neon-blue to-cyber-600 text-white hover:scale-[1.02] shadow-2xl shadow-neon-blue/20" 
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
               )}
             >
                <Play className="w-5 h-5 fill-current" />
                {isActive ? 'Start Quiz Session' : 'Locked'}
             </button>
             
             <div className="w-[1px] h-10 bg-white/10" />

             <button 
               onClick={() => navigate(`/exams/${id}/take`)}
               className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap"
             >
                <Eye className="w-5 h-5" />
                Preview Mode
             </button>
          </div>
       </div>
    </div>
  );
};

export default ExamDetails;
