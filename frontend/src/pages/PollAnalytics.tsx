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
import Navbar from '../components/layout/Navbar';
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
          const pollCreatorId = response.data.poll.creator._id || response.data.poll.creator;
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
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans relative overflow-x-hidden">
      <div className="mesh-bg"></div>
      
      {/* Visual Accents */}
      <div className="fixed -top-24 -left-24 w-[500px] h-[500px] bg-cyber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 -right-24 w-[400px] h-[400px] bg-neon-pink/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header Area */}
          <div className="text-center mb-16">
            <Link 
              to={`/poll/${id}`}
              className="inline-flex items-center gap-2 text-cyber-400 hover:text-white mb-6 transition-all font-bold text-xs uppercase tracking-[0.2em] group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Return to Poll
            </Link>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tighter">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 to-neon-pink">Verdict</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto opacity-80">
              Results summary for "{data.poll.title}"
            </p>
          </div>

          {/* Unified Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Winner Spotlight Card */}
            <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="lg:col-span-7"
            >
                <div className="glass-card rounded-[3rem] p-10 md:p-12 border border-white/5 h-full relative overflow-hidden group flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy className="w-64 h-64 text-white" />
                    </div>
                    
                    <div className="relative z-10">
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 inline-block">
                            Current Leader
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 break-words">
                            {topOption.text}
                        </h2>
                        <div className="flex items-end gap-3">
                            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 leading-none">
                                {totalVotes > 0 ? Math.round((topOption.votes / totalVotes) * 100) : 0}%
                            </span>
                            <span className="text-gray-500 font-bold mb-2">of total consensus</span>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-1.5 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-gradient-to-r from-cyber-400 to-neon-pink rounded-full transition-all duration-1000"
                           style={{ width: `${totalVotes > 0 ? (topOption.votes / totalVotes) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </motion.div>

            {/* Pulse Metrics */}
            <motion.div 
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="lg:col-span-5 flex flex-col gap-8"
            >
                {/* Engagement Pulse */}
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 flex-grow relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-pink/10 blur-[50px] rounded-full"></div>
                    
                    <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] mb-8">Social Pulse</h3>
                    
                    <div className="space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="bg-cyber-500/10 p-5 rounded-2xl">
                                <Users className="w-8 h-8 text-cyber-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">{totalVotes}</p>
                                <p className="text-sm text-gray-500 font-bold">Consensus Points</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="bg-neon-pink/10 p-5 rounded-2xl">
                                <MessageSquare className="w-8 h-8 text-neon-pink" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">{data.engagement.commentCount}</p>
                                <p className="text-sm text-gray-500 font-bold">Discussion Threads</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Split Mini Card */}
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 h-[300px] relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="scale-125">
                        <CategoryDistPie data={optionData} />
                    </div>
                </div>
            </motion.div>
          </div>
          
          {/* Detailed Breakdown (Optional/Simplified) */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
              {sortedOptions.slice(1, 4).map((opt: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2 truncate" title={opt.text}>{opt.text}</p>
                      <p className="text-xl font-black text-white">{opt.votes} <span className="text-[10px] text-cyber-400">votes</span></p>
                  </div>
              ))}
              <div className="bg-cyber-500/5 border border-cyber-500/10 p-6 rounded-3xl backdrop-blur-sm flex flex-col justify-center items-center">
                    <BarChart3 className="w-5 h-5 text-cyber-400 mb-1" />
                    <p className="text-[10px] font-black text-cyber-400 uppercase">View All</p>
              </div>
          </motion.div>

          {/* Voter Responses (Creator Only) */}
          {isCreator && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 glass-card rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Voter Responses</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Detailed Consensus Breakdown</p>
                </div>
                <div className="p-3 bg-neon-blue/10 rounded-xl text-neon-blue">
                   <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/5 text-gray-600 text-[10px] uppercase font-black tracking-widest">
                         <th className="pb-4 px-4 whitespace-nowrap">Participant</th>
                         <th className="pb-4 px-4 whitespace-nowrap">Selected Choice</th>
                         <th className="pb-4 px-4 whitespace-nowrap">Synchronization Time</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {votes.length > 0 ? votes.map((vote, vIdx) => {
                        const option = data.poll.options.find((o: any) => o._id === vote.optionId);
                        return (
                          <tr key={vIdx} className="group hover:bg-white/5 transition-colors">
                             <td className="py-4 px-4">
                                <span className="font-bold text-gray-200">{vote.user?.username || 'Redacted'}</span>
                             </td>
                             <td className="py-4 px-4">
                                <span className="px-3 py-1 bg-cyber-500/10 border border-cyber-500/20 rounded-full text-[9px] font-black text-cyber-400 uppercase">
                                   {option?.text || 'Invalid Selection'}
                                </span>
                             </td>
                             <td className="py-4 px-4 text-[10px] font-black text-gray-500 uppercase">
                                {new Date(vote.createdAt).toLocaleString()}
                             </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={3} className="py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">No responses recorded yet.</td>
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
