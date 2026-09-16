import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-stone-900/95 text-white backdrop-blur-2xl border border-indigo-500/30 p-4 rounded-2xl shadow-2xl text-xs font-bold space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{label}</p>
        <p className="text-base font-black flex items-center gap-2 text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
          {payload[0].value.toLocaleString()} {payload[0].name === 'votes' ? 'Votes' : 'Units'}
        </p>
      </div>
    );
  }
  return null;
};

export const EngagementTimeline = ({ data }: { data: any[] }) => (
  <div className="h-[300px] w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
            <stop offset="50%" stopColor="#a855f7" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="votes" 
          stroke="#6366f1" 
          strokeWidth={4}
          fillOpacity={1} 
          fill="url(#areaGradient)" 
          dot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
          activeDot={{ r: 7, fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 3 }}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const CategoryDistPie = ({ data }: { data: any[] }) => {
  const totalCategoryItems = data?.reduce((acc, curr) => acc + (curr.value || 0), 0) || 0;

  return (
    <div className="h-[300px] w-full relative flex flex-col justify-between">
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data?.map((_, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                className="hover:opacity-85 transition-opacity cursor-pointer drop-shadow-md"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Donut Center Overlay Text */}
      <div className="absolute top-[37.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block">
          {totalCategoryItems}
        </span>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-stone-400 mt-0.5 block">
          Items
        </span>
      </div>

      {/* Legend Custom Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 px-2">
        {data?.slice(0, 5).map((item, idx) => {
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          const pct = totalCategoryItems > 0 ? Math.round((item.value / totalCategoryItems) * 100) : 0;
          return (
            <div 
              key={item.name || idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[10px] font-bold text-slate-700 dark:text-stone-300"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{item.name || 'General'}</span>
              <span className="text-slate-400 dark:text-stone-500 font-black ml-0.5">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PopularPollsBar = ({ data }: { data: any[] }) => {
  const maxVotes = Math.max(...(data?.map(p => p.totalVotes) || [1]), 1);

  return (
    <div className="space-y-4 mt-2">
      {data?.map((poll, idx) => {
        const percentage = Math.round((poll.totalVotes / maxVotes) * 100);
        const rankColors = [
          'from-amber-400 to-orange-500 text-black shadow-amber-500/30',
          'from-slate-300 to-slate-400 text-black shadow-slate-400/30',
          'from-amber-700 to-amber-800 text-white shadow-amber-800/30',
          'from-indigo-600 to-purple-600 text-white shadow-indigo-500/20',
          'from-cyan-600 to-blue-600 text-white shadow-cyan-500/20',
        ];

        return (
          <div 
            key={poll._id || idx}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${rankColors[idx] || rankColors[3]} flex items-center justify-center font-black text-xs shrink-0 shadow-md`}>
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {poll.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-stone-400 uppercase tracking-widest mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {poll.category || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 dark:text-white block leading-none">
                    {poll.totalVotes.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest">
                    Votes
                  </span>
                </div>

                <Link
                  to={`/poll/${poll._id}`}
                  className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white transition-all border border-indigo-500/20"
                  title="View Poll"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Progress Bar Meter */}
            <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(percentage, 8)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

