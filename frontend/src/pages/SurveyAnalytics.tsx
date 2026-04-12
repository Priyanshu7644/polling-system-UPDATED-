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
import Navbar from '../components/layout/Navbar';

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
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      <div className="mesh-bg"></div>
      <div className="relative w-24 h-24 z-10 flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border-b-4 border-sky-500 animate-spin"></div>
           <Zap className="w-8 h-8 text-sky-400 animate-pulse" />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      <div className="mesh-bg"></div>
      <div className="relative z-10 glass-card p-10 rounded-3xl text-center border border-white/10 max-w-md mx-4">
        <p className="text-red-400 font-bold text-xl mb-4">{error || 'Something went wrong'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mx-auto bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );

  const { survey, responses } = data;

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans relative overflow-x-hidden">
      <div className="mesh-bg"></div>
      
      {/* Visual Accents */}
      <div className="fixed -top-24 -left-24 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 -right-24 w-[400px] h-[400px] bg-cyber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-20 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-left">
              <Link 
                to="/?tab=surveys"
                className="inline-flex items-center gap-2 text-sky-400 hover:text-white mb-6 transition-all font-bold text-xs uppercase tracking-[0.2em] group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> All Surveys
              </Link>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tighter uppercase italic">
                Survey <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyber-400">Insights</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium max-w-2xl opacity-80">
                Detailed response analysis for "{survey.title}"
              </p>
            </div>
            
            <div className="flex gap-4">
               <div className="glass-card p-6 rounded-3xl border border-sky-500/20 flex items-center gap-6">
                  <div className="bg-sky-400/10 p-4 rounded-2xl">
                    <Users className="w-8 h-8 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{responses.length}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Responses</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {/* Detailed Response Table */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-[3rem] p-10 border border-white/5 relative overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                   <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Feedback Pipeline</h3>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Direct Participant Submissions</p>
                </div>
                <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500">
                   <Activity className="w-6 h-6 shadow-[0_0_15px_#0ea5e9]" />
                </div>
              </div>

              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/5 text-gray-600 text-[10px] uppercase font-black tracking-widest">
                         <th className="pb-6 px-4 whitespace-nowrap">Participant</th>
                         <th className="pb-6 px-4 whitespace-nowrap">Status</th>
                         <th className="pb-6 px-4 whitespace-nowrap text-right">Synchronization Time</th>
                         <th className="pb-6 px-4 whitespace-nowrap text-right">Details</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {responses.length > 0 ? responses.map((resp: any, rIdx: number) => (
                        <tr key={rIdx} className="group hover:bg-white/5 transition-colors">
                           <td className="py-6 px-4">
                              <span className="font-bold text-gray-200">
                                {survey.isAnonymous ? 'Anonymous Protocol' : (resp.user?.username || 'Redacted User')}
                              </span>
                           </td>
                           <td className="py-6 px-4">
                              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black text-green-400 uppercase tracking-widest">
                                 Confirmed
                              </span>
                           </td>
                           <td className="py-6 px-4 text-[10px] font-black text-gray-500 uppercase text-right">
                              {new Date(resp.createdAt).toLocaleString()}
                           </td>
                           <td className="py-6 px-4 text-right">
                              <button 
                                onClick={() => setSelectedResponse(resp)}
                                className="p-3 bg-white/5 hover:bg-sky-500 hover:text-black rounded-xl transition-all shadow-inner"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs italic">
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
                  className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-4xl bg-dark-bg border border-white/10 rounded-[3rem] p-8 md:p-14 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
               >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-cyber-500 to-sky-400"></div>
                  
                  <div className="flex justify-between items-center mb-12 shrink-0">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-sky-500/10 text-sky-400 rounded-3xl flex items-center justify-center border border-sky-400/20">
                          <ClipboardList className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Participant Analysis</h2>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-3">
                             {survey.isAnonymous ? 'Restricted Node' : (selectedResponse.user?.username || 'Unknown Factor')}
                           </p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedResponse(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-white/5">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-8">
                     {survey.questions.map((q: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-sky-500/20 transition-all">
                           <div className="flex items-start gap-8 relative z-10">
                              <span className="w-12 h-12 shrink-0 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-black italic text-sky-400">
                                 {idx + 1}
                              </span>
                              <div className="flex-grow">
                                 <h4 className="text-xl font-bold text-white mb-6 leading-tight">{q.text}</h4>
                                 
                                 <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 italic">Response Insight</div>
                                 <div className="p-8 bg-dark-bg/60 border border-white/10 rounded-2xl text-gray-200 text-lg leading-relaxed shadow-inner italic">
                                    {q.type === 'mcq' 
                                       ? (q.options[selectedResponse.answers[idx]] || 'Redacted or No choice') 
                                       : (selectedResponse.answers[idx] || 'Empty String.')
                                    }
                                 </div>
                              </div>
                           </div>
                           <div className="absolute top-0 right-0 p-8 opacity-5">
                              <Activity className="w-24 h-24 text-sky-400" />
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-12 shrink-0 pt-8 border-t border-white/5 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Synchronized At: {new Date(selectedResponse.createdAt).toLocaleString()}</span>
                     </div>
                     <button 
                        onClick={() => setSelectedResponse(null)}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                     >
                        Close Protocol
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
