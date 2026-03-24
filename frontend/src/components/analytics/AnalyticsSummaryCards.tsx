import { Users, Vote, PieChart as PieChartIcon, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryData {
  totalPolls: number;
  totalVotes: number;
  totalUsers: number;
  totalComments: number;
}

export default function AnalyticsSummaryCards({ data }: { data: SummaryData }) {
  const cards = [
    { name: 'Total Polls', value: data.totalPolls, icon: PieChartIcon, color: 'text-cyber-400', glow: 'shadow-neon-blue' },
    { name: 'Total Votes', value: data.totalVotes, icon: Vote, color: 'text-neon-pink', glow: 'shadow-neon-pink' },
    { name: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-amber-400', glow: 'shadow-amber-400' },
    { name: 'Total Comments', value: data.totalComments, icon: MessageSquare, color: 'text-green-400', glow: 'shadow-green-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <motion.div 
          key={card.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-6 rounded-[2rem] border border-white/5 relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">{card.name}</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{card.value.toLocaleString()}</h3>
            </div>
            <div className={`p-4 bg-white/5 rounded-2xl border border-white/5 ${card.color} group-hover:scale-110 transition-transform`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-cyber-500 animate-pulse"></div>
             <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Pulse Live Metric</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
