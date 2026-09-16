import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Trophy,
  Zap
} from 'lucide-react';
import { analytics } from '../api';
import { CategoryDistPie } from '../components/analytics/AnalyticsCharts';

export default function PollAnalytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchPollAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analytics.getPollStats(id!);
        setData(response.data);

        // Check if current user is creator
        const userStr = localStorage.getItem('user');
        if (userStr && response.data.poll.creator) {
          const user = JSON.parse(userStr);
          const pollCreatorId = response.data.poll.creator?._id || response.data.poll.creator;
          if (pollCreatorId.toString() === user.id || pollCreatorId.toString() === user._id) {
            setIsCreator(true);
            const votesRes = await api.get(`/polls/${id}/votes`);
            setVotes(votesRes.data);
          }
        }
      } catch (err: any) {
        console.error('Error fetching poll analytics:', err);
        setError('Failed to load analytics for this poll.');
      } finally {
        setLoading(false);
      }
    };

    fetchPollAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
        <div className="mesh-bg"></div>
        <div className="relative w-24 h-24 z-10 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-b-4 border-cyber-500 animate-spin"></div>
             <Zap className="w-8 h-8 text-neon-pink animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
        <div className="mesh-bg"></div>
        <div className="relative z-10 glass-card p-10 rounded-3xl text-center border border-white/10 max-w-md mx-4">
          <p className="text-red-400 font-bold text-xl mb-4">{error || 'Something went wrong'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Safety
          </button>
        </div>
      </div>
    );
  }

  const totalVotes = data.poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
  const sortedOptions = [...data.poll.options].sort((a: any, b: any) => b.votes - a.votes);
  const topOption = sortedOptions[0];
  const optionData = data.poll.options.map((opt: any) => ({ name: opt.text, value: opt.votes }));

  return (
    <div className="min-h-screen bg-[#f1f1f3] dark:bg-[#0c0b0a] text-slate-900 dark:text-stone-100 font-sans relative overflow-x-hidden transition-colors duration-300 pb-16">
      <div className="mesh-bg"></div>
      
      {/* Visual Accents */}
      <div className="fixed -top-24 -left-24 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 -right-24 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="container mx-auto px-4 pt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto space-y-8"
        >
          {/* Header Area */}
          <div className="text-center">
            <Link 
              to={`/poll/${id}`}
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline mb-3 transition-all font-bold text-xs uppercase tracking-[0.2em] group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Return to Poll
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight uppercase italic">
              Poll <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">Verdict</span>
            </h1>
            <p className="text-slate-600 dark:text-stone-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
              Results summary for "{data.poll.title}"
            </p>
          </div>

          {/* Unified Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Winner Spotlight Card */}
            <motion.div 
               initial={{ x: -15, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="lg:col-span-7"
            >
                <div className="pro-card rounded-[2.2rem] p-8 md:p-10 border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl shadow-xl h-full relative overflow-hidden group flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy className="w-48 h-48 text-indigo-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">
                            Current Leader
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 break-words">
                            {topOption.text}
                        </h2>
                        <div className="flex items-end gap-3">
                            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-white dark:to-white/50 leading-none">
                                {totalVotes > 0 ? Math.round((topOption.votes / totalVotes) * 100) : 0}%
                            </span>
                            <span className="text-slate-500 dark:text-stone-400 font-bold mb-1 text-xs uppercase tracking-wider">of total consensus</span>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-1.5 h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-1000"
                           style={{ width: `${totalVotes > 0 ? (topOption.votes / totalVotes) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </motion.div>

            {/* Pulse Metrics */}
            <motion.div 
               initial={{ x: 15, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="lg:col-span-5 flex flex-col gap-6"
            >
                {/* Engagement Pulse */}
                <div className="pro-card rounded-[2.2rem] p-6 border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl shadow-xl flex-grow relative overflow-hidden">
                    <h3 className="text-slate-500 dark:text-stone-400 font-black uppercase text-[10px] tracking-[0.2em] mb-6">Social Engagement</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalVotes}</p>
                                <p className="text-xs text-slate-500 dark:text-stone-400 font-bold">Total Votes Cast</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 text-purple-600 dark:text-purple-400">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{data.engagement.commentCount}</p>
                                <p className="text-xs text-slate-500 dark:text-stone-400 font-bold">Discussion Comments</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Split Mini Card */}
                <div className="pro-card rounded-[2.2rem] p-6 border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl shadow-xl h-[240px] relative overflow-hidden flex flex-col items-center justify-center">
                    <CategoryDistPie data={optionData} />
                </div>
            </motion.div>
          </div>
          
          {/* Detailed Breakdown */}
          <motion.div 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
              {sortedOptions.slice(1, 4).map((opt: any, idx: number) => (
                  <div key={idx} className="pro-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 shadow-md">
                      <p className="text-[10px] font-black text-slate-500 dark:text-stone-400 uppercase mb-1.5 truncate" title={opt.text}>{opt.text}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{opt.votes} <span className="text-[10px] text-indigo-600 dark:text-indigo-400">votes</span></p>
                  </div>
              ))}
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl backdrop-blur-sm flex flex-col justify-center items-center">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Consensus Metrics</p>
              </div>
          </motion.div>

          {/* Voter Responses (Creator Only) */}
          {isCreator && (
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pro-card rounded-[2.2rem] p-8 border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase">Voter Log</h3>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest mt-0.5">Participant Vote Verification</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                   <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-stone-400 text-[10px] uppercase font-black tracking-widest">
                         <th className="pb-3 px-4 whitespace-nowrap">Participant</th>
                         <th className="pb-3 px-4 whitespace-nowrap">Selected Choice</th>
                         <th className="pb-3 px-4 whitespace-nowrap">Time</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {votes.length > 0 ? votes.map((vote, vIdx) => {
                        const option = data.poll.options.find((o: any) => o._id === vote.optionId);
                        return (
                          <tr key={vIdx} className="group hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                             <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 dark:text-gray-200 text-xs">{vote.user?.username || 'Anonymous'}</span>
                             </td>
                             <td className="py-3 px-4">
                                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase">
                                   {option?.text || 'Selected Option'}
                                </span>
                             </td>
                             <td className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase">
                                {new Date(vote.createdAt).toLocaleString()}
                             </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={3} className="py-10 text-center text-slate-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">No responses recorded yet.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
