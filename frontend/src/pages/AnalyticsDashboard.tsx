import { useEffect, useState } from 'react';
import { analytics } from '../api';
import AnalyticsSummaryCards from '../components/analytics/AnalyticsSummaryCards';
import { EngagementTimeline, CategoryDistPie, PopularPollsBar } from '../components/analytics/AnalyticsCharts';
import { BarChart3, TrendingUp, Zap, Sparkles, Activity, Layers, Award, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'leaderboard'>('overview');

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
      <div className="py-24 flex items-center justify-center relative overflow-hidden">
        <div className="relative w-16 h-16 z-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-b-4 border-indigo-600 dark:border-indigo-400 animate-spin" />
          <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 flex items-center justify-center px-4">
        <div className="pro-card rounded-3xl p-8 text-center border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl max-w-md mx-auto shadow-xl">
          <p className="text-rose-500 font-bold text-lg mb-4">{error || 'Network Telemetry Error'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-2.5 rounded-2xl font-black uppercase tracking-wider shadow-lg text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-10 pb-12">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-2 border-b border-slate-200/60 dark:border-white/10">
        <div className="text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2"
          >
             <Radio className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
             <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Global Telemetry Node</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic leading-none"
          >
            Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">Intelligence</span>
          </motion.h1>
          <p className="text-slate-600 dark:text-stone-400 text-xs md:text-sm font-medium mt-1.5">
            Real-time community voting velocity, participant volume, and category distribution.
          </p>
        </div>

        {/* View Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'trends'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Velocity
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Leaderboard
          </button>
        </div>
      </div>

      {/* Top 4 Summary Metric Cards */}
      <AnalyticsSummaryCards data={data.summary} />

      {/* Main Charts Grid */}
      {(activeTab === 'overview' || activeTab === 'trends') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Engagement Trajectory Chart (8 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 rounded-[2.2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl relative group overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center gap-2.5">
                  <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Voting Engagement Velocity
                </h2>
                <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest mt-0.5 ml-7">30-Day Activity Stream</p>
              </div>
              
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Feed
              </div>
            </div>

            <EngagementTimeline data={data.votesOverTime} />
          </motion.div>

          {/* Category Share Donut Chart (4 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 rounded-[2.2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl flex flex-col justify-between items-center relative group overflow-hidden"
          >
            <div className="text-center w-full relative z-10">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Topic Share</h2>
              <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest mt-0.5">Category Distribution</p>
            </div>
            
            <div className="w-full relative z-10 flex-grow flex items-center justify-center my-2">
              <CategoryDistPie data={data.categoryStats} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Popular Community Polls Leaderboard */}
      {(activeTab === 'overview' || activeTab === 'leaderboard') && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[2.2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl relative group overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center gap-2.5">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Dominant Community Feeds
              </h2>
              <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest mt-0.5 ml-7">Top Voted Feeds Leaderboard</p>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3 h-3" /> Top Rankings
            </div>
          </div>

          <PopularPollsBar data={data.popularPolls} />
        </motion.div>
      )}

    </div>
  );
}



