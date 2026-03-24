import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1c24]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl ring-1 ring-white/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-black text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
          {payload[0].value} {payload[0].name === 'votes' ? 'Votes' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export const EngagementTimeline = ({ data }: { data: any[] }) => (
  <div className="h-[300px] w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="votes" 
          stroke="#0ea5e9" 
          strokeWidth={4}
          fillOpacity={1} 
          fill="url(#colorVotes)" 
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const CategoryDistPie = ({ data }: { data: any[] }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={8}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index: number) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:opacity-80 transition-opacity"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          content={({ payload }) => (
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {payload?.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const PopularPollsBar = ({ data }: { data: any[] }) => (
  <div className="h-[350px] w-full mt-6">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="title" 
          type="category" 
          axisLine={false} 
          tickLine={false}
          width={140}
          tick={({ x, y, payload }) => (
            <g transform={`translate(${x},${y})`}>
              <text x={-10} y={0} dy={4} textAnchor="end" fill="#9CA3AF" fontSize={10} fontWeight="bold" className="uppercase tracking-tighter">
                {payload.value.length > 20 ? `${payload.value.substring(0, 18)}...` : payload.value}
              </text>
            </g>
          )}
        />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
        <Bar 
          dataKey="totalVotes" 
          fill="url(#barGradient)" 
          radius={[0, 12, 12, 0]} 
          barSize={24}
        >
          <defs>
             <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#ec4899" />
             </linearGradient>
          </defs>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
