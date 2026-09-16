import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  ArrowLeft, 
  Users, 
  Clock, 
  X,
  Activity,
  Zap,
  Eye
} from 'lucide-react';
import { surveys } from '../api';

const SurveyAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await surveys.getResults(id!);
        setData(res.data);
      } catch (err: any) {
        console.error('Error fetching survey results:', err);
        setError(err.response?.data?.error || 'Failed to fetch survey results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f1f1f3] dark:bg-[#0c0b0a] flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      <div className="mesh-bg"></div>
      <div className="relative w-20 h-20 z-10 flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border-b-4 border-sky-500 animate-spin"></div>
           <Zap className="w-8 h-8 text-sky-500 animate-pulse" />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#f1f1f3] dark:bg-[#0c0b0a] flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      <div className="mesh-bg"></div>
      <div className="relative z-10 pro-card p-10 rounded-3xl text-center border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 max-w-md mx-4 shadow-2xl">
        <p className="text-rose-500 font-bold text-xl mb-4">{error || 'Something went wrong'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn-primary px-6 py-2 rounded-full transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );

  const { survey, responses } = data;

  return (
    <div className="min-h-screen bg-[#f1f1f3] dark:bg-[#0c0b0a] text-slate-900 dark:text-stone-100 font-sans relative overflow-x-hidden transition-colors duration-300 pb-16">
      <div className="mesh-bg"></div>
      
      {/* Visual Accents */}
      <div className="fixed -top-24 -left-24 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 -right-24 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="container mx-auto px-4 pt-4 pb-16 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="text-left">
              <Link 
                to="/surveys"
                className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:underline mb-3 transition-all font-bold text-xs uppercase tracking-[0.2em] group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> All Surveys
              </Link>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight uppercase italic">
                Survey <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400">Insights</span>
              </h1>
              <p className="text-slate-600 dark:text-stone-400 text-sm font-medium max-w-2xl">
                Detailed response analysis for "{survey.title}"
              </p>
            </div>
            
            <div className="flex gap-4">
               <div className="pro-card p-5 rounded-2xl border border-slate-200/80 dark:border-sky-500/20 bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl shadow-xl flex items-center gap-4">
                  <div className="bg-sky-400/10 p-3.5 rounded-xl text-sky-600 dark:text-sky-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{responses.length}</p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest leading-none">Total Responses</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Detailed Response Table */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pro-card rounded-[2.2rem] p-8 border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase">Feedback Submissions</h3>
                   <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest mt-0.5">Participant Responses</p>
                </div>
                <div className="p-3 bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400 border border-sky-500/20">
                   <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-stone-400 text-[10px] uppercase font-black tracking-widest">
                         <th className="pb-4 px-4 whitespace-nowrap">Participant</th>
                         <th className="pb-4 px-4 whitespace-nowrap">Status</th>
                         <th className="pb-4 px-4 whitespace-nowrap text-right">Synchronization Time</th>
                         <th className="pb-4 px-4 whitespace-nowrap text-right">Details</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {responses.length > 0 ? responses.map((resp: any, rIdx: number) => (
                        <tr key={rIdx} className="group hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                           <td className="py-4 px-4">
                              <span className="font-bold text-slate-900 dark:text-gray-200">
                                {survey.isAnonymous ? 'Anonymous Protocol' : (resp.user?.username || 'Redacted User')}
                              </span>
                           </td>
                           <td className="py-4 px-4">
                              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                 Confirmed
                              </span>
                           </td>
                           <td className="py-4 px-4 text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase text-right">
                              {new Date(resp.createdAt).toLocaleString()}
                           </td>
                           <td className="py-4 px-4 text-right">
                              <button 
                                onClick={() => setSelectedResponse(resp)}
                                className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-sky-500 hover:text-white dark:hover:text-black rounded-xl transition-all shadow-sm"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-slate-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs italic">
                            No response transmission detected.
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Response Detail Modal */}
      <AnimatePresence>
         {selectedResponse && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedResponse(null)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-xl"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-4xl bg-white dark:bg-[#151413] border border-slate-200 dark:border-stone-800 rounded-[2.5rem] p-8 md:p-12 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col z-10"
               >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500"></div>
                  
                  <div className="flex justify-between items-center mb-8 shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center border border-sky-400/20">
                          <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">Participant Analysis</h2>
                           <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest mt-1">
                             {survey.isAnonymous ? 'Anonymous Protocol' : (selectedResponse.user?.username || 'Unknown Factor')}
                           </p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedResponse(null)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-slate-200 dark:border-white/5">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6">
                     {survey.questions.map((q: any, idx: number) => (
                        <div key={idx} className="pro-card border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden bg-slate-50/50 dark:bg-stone-900/50">
                           <div className="flex items-start gap-4 relative z-10">
                              <span className="w-8 h-8 shrink-0 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-black italic text-sky-600 dark:text-sky-400">
                                 {idx + 1}
                              </span>
                              <div className="flex-grow">
                                 <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 leading-tight">{q.text}</h4>
                                 
                                 <div className="text-[10px] font-bold text-slate-400 dark:text-stone-400 uppercase tracking-wider mb-2">Response Insight</div>
                                 <div className="p-4 bg-white dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-slate-800 dark:text-stone-200 text-sm leading-relaxed shadow-inner">
                                    {q.type === 'mcq' 
                                       ? (q.options[selectedResponse.answers[idx]] || 'No choice selected') 
                                       : (selectedResponse.answers[idx] || 'Empty String.')
                                    }
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-8 shrink-0 pt-6 border-t border-slate-200 dark:border-stone-800/80 flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 dark:text-stone-400" />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Submitted: {new Date(selectedResponse.createdAt).toLocaleString()}</span>
                     </div>
                     <button 
                        onClick={() => setSelectedResponse(null)}
                        className="px-6 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                     >
                        Close Details
                      </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default SurveyAnalytics;
