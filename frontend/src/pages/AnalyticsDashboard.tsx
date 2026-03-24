import { useEffect, useState } from 'react';
import { analytics } from '../api';
import AnalyticsSummaryCards from '../components/analytics/AnalyticsSummaryCards';
import { EngagementTimeline, CategoryDistPie, PopularPollsBar } from '../components/analytics/AnalyticsCharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import TemplateNav from '../components/layout/TemplateNav';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analytics.getGlobalStats();
        setData(response.data);
      } catch (err: any) {
        console.error('Analytics fetching error:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <div className="relative z-10 glass-card p-10 rounded-[2.5rem] text-center border border-white/10 max-w-md mx-4">
          <p className="text-red-400 font-bold text-xl mb-6">{error || 'Network Error'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-neon-pink to-cyber-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans relative overflow-x-hidden pb-20">
      <div className="mesh-bg"></div>
      
      {/* Visual Accents */}
      <div className="fixed -top-48 -left-48 w-[600px] h-[600px] bg-cyber-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed -bottom-48 -right-48 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="relative z-20 pt-10">
        <div className="max-w-7xl mx-auto px-6">
          <TemplateNav />
          
          <div className="mt-16 flex flex-col items-center text-center">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
             >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Global Intelligence Portal</span>
             </motion.div>
             
             <motion.h1 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6"
             >
               The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 to-neon-pink">Analytics</span> Engine
             </motion.h1>
             <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl opacity-70">
               Deciphering community sentiments and engagement trends through the high-precision Pulse visualization suite.
             </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-20 relative z-10">
        <AnalyticsSummaryCards data={data.summary} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Engagement Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp className="w-48 h-48 text-white" />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-cyber-400" />
                  Growth Trajectory
                </h2>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 ml-9">30 Day Engagement Pulse</p>
              </div>
            </div>
            <EngagementTimeline data={data.votesOverTime} />
          </motion.div>

          {/* Category Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-4 glass-card p-10 rounded-[3rem] border border-white/5 flex flex-col justify-center items-center relative overflow-hidden group"
          >
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neon-pink/10 blur-[80px] rounded-full"></div>
            
            <div className="text-center mb-10 w-full relative z-10">
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Segment Split</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Topic Diversification</p>
            </div>
            
            <div className="scale-110 relative z-10">
              <CategoryDistPie data={data.categoryStats} />
            </div>
          </motion.div>
        </div>

        {/* Popular Polls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <BarChart3 className="w-64 h-64 text-white" />
          </div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-amber-400" />
                Dominant Pulses
              </h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 ml-9">Top Performing Community Topics</p>
            </div>
          </div>
          <PopularPollsBar data={data.popularPolls} />
        </motion.div>
      </main>

      {/* Floating Back Action */}
      <div className="fixed bottom-8 left-8 z-50">
         <button 
           onClick={() => navigate('/')}
           className="group flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full hover:bg-white/10 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
         >
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
               <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-300">Exit Console</span>
         </button>
      </div>
    </div>
  );
}
