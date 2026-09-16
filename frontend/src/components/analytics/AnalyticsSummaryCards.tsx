import { Users, Vote, PieChart as PieChartIcon, MessageSquare, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryData {
  totalPolls: number;
  totalVotes: number;
  totalUsers: number;
  totalComments: number;
}

export default function AnalyticsSummaryCards({ data }: { data: SummaryData }) {
  const cards = [
    { 
      name: 'Active Community Polls', 
      value: data.totalPolls, 
      icon: PieChartIcon, 
      gradient: 'from-indigo-600 via-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/25',
      badge: 'Live Feeds',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    { 
      name: 'Consensus Votes Cast', 
      value: data.totalVotes, 
      icon: Vote, 
      gradient: 'from-purple-600 via-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/25',
      badge: 'Verified Votes',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
    { 
      name: 'Registered Participants', 
      value: data.totalUsers, 
      icon: Users, 
      gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
      shadow: 'shadow-cyan-500/25',
      badge: 'Community Nodes',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
    },
    { 
      name: 'Discussion Comments', 
      value: data.totalComments, 
      icon: MessageSquare, 
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      shadow: 'shadow-amber-500/25',
      badge: 'Active Threads',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <motion.div 
          key={card.name}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="pro-card rounded-[2rem] p-6 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl rounded-full group-hover:scale-150 transition-transform pointer-events-none" />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
              <card.icon className="w-6 h-6 stroke-[2.2]" />
            </div>
            
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor} flex items-center gap-1 shadow-sm`}>
              <Sparkles className="w-3 h-3" /> {card.badge}
            </span>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
              {card.value.toLocaleString()}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">
              {card.name}
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Telemetry
            </span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-stone-300 font-black uppercase">
              <TrendingUp className="w-3 h-3 text-indigo-500" /> Synced
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

