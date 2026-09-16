import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import api, { SOCKET_URL } from '../api';
import { AuthContext, ThemeContext } from '../App';
import ShareModal from '../components/ShareModal';
import { 
  Clock, Users, Trash2, Search, Share2, Trophy, 
  ChevronRight, LayoutGrid, List, BarChart3, ShieldCheck, Sparkles, 
  Plus, Flame, TrendingUp, Tag, Globe, Cpu, Award, Tv, MessagesSquare, Vote
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface PollOption {
  _id: string;
  text: string;
  votes: number;
}

interface Poll {
  _id: string;
  title: string;
  description: string;
  category: string;
  options: PollOption[];
  isPublic: boolean;
  expiresAt?: string;
  createdAt: string;
  creator: {
    _id: string;
    username: string;
  };
}

const CATEGORIES = ['All', 'Technology', 'Entertainment', 'Social', 'Politics', 'Sports', 'Other'];

export const DARK_SHOWCASE_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=85',
];

export const LIGHT_SHOWCASE_IMAGES = [
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=85',
];

export const CATEGORY_CONFIG: Record<string, { imageIndex: number; badge: string; icon: any }> = {
  All: {
    imageIndex: 0,
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    icon: Globe,
  },
  Technology: {
    imageIndex: 1,
    badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    icon: Cpu,
  },
  Sports: {
    imageIndex: 2,
    badge: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
    icon: Award,
  },
  Entertainment: {
    imageIndex: 4,
    badge: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    icon: Tv,
  },
  Social: {
    imageIndex: 0,
    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    icon: MessagesSquare,
  },
  Politics: {
    imageIndex: 3,
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: Vote,
  },
  Other: {
    imageIndex: 3,
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: Tag,
  }
};

export default function Polls() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [polls, setPolls] = useState<Poll[]>(() => {
    try {
      const cached = localStorage.getItem('pulse_cached_polls');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('pulse_cached_polls');
      return !cached || JSON.parse(cached).length === 0;
    } catch { return true; }
  });

  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveUsers, setLiveUsers] = useState(0);
  const [shareData, setShareData] = useState({ isOpen: false, title: '', url: '' });
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await api.get('/polls', { 
          params: { 
            category: activeCategory !== 'All' ? activeCategory : undefined, 
            search: searchQuery 
          } 
        });
        setPolls(res.data);
        if (!searchQuery && activeCategory === 'All') {
          localStorage.setItem('pulse_cached_polls', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error('Fetch polls error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();

    const socket: Socket = io(SOCKET_URL);
    socket.on('liveUsers', (count) => setLiveUsers(count));
    socket.on('newPoll', (poll: Poll) => {
      if (activeCategory === 'All' || poll.category === activeCategory) {
        setPolls(prev => {
          const next = [poll, ...prev];
          localStorage.setItem('pulse_cached_polls', JSON.stringify(next));
          return next;
        });
      }
    });

    return () => { socket.disconnect(); };
  }, [activeCategory, searchQuery]);

  const handleShare = (e: React.MouseEvent, title: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const baseUrl = window.location.origin;
    setShareData({ isOpen: true, title, url: `${baseUrl}/poll/${id}` });
  };

  const filteredPolls = activeCategory === 'All' 
    ? polls 
    : polls.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  const topPolls = [...filteredPolls].sort((a, b) => {
    const votesA = a.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
    const votesB = b.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
    return votesB - votesA;
  });

  const featuredPoll = topPolls[0];
  const featuredTotalVotes = featuredPoll ? featuredPoll.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0 : 0;
  const runnerUpPolls = topPolls.slice(1, 3);

  const categoryMeta = CATEGORY_CONFIG[activeCategory] || CATEGORY_CONFIG['All'];
  const activeShowcaseImages = theme === 'dark' ? DARK_SHOWCASE_IMAGES : LIGHT_SHOWCASE_IMAGES;
  const spotlightImageUrl = activeShowcaseImages[categoryMeta.imageIndex] || activeShowcaseImages[0];

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl relative">
      <ShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ isOpen: false, title: '', url: '' })}
        title={shareData.title}
        url={shareData.url}
      />

      {/* Hero Header */}
      <div className="flex flex-col items-center text-center mb-10 relative">
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full pro-card border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
          >
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 
              Pulse Community Polls Hub
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full pro-card border border-blue-200 dark:border-blue-500/30 shadow-sm"
          >
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {liveUsers > 0 ? liveUsers : 1} Realtime Node{liveUsers > 1 ? 's' : ''} Online
            </span>
          </motion.div>
        </div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-3 leading-tight uppercase italic text-slate-900 dark:text-white"
        >
          Community <span className="text-brand-gradient">Polls</span>
        </motion.h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl font-medium">
          Cast your vote, track real-time results, and participate in community consensus.
        </p>
      </div>

      {/* Featured Spotlight Section */}
      {featuredPoll && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Featured Spotlight • {activeCategory}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500">Highest Engagement</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Primary Featured Banner */}
            <div className="lg:col-span-8 pro-card rounded-[30px] overflow-hidden relative border border-slate-200 dark:border-white/10 shadow-md dark:shadow-2xl flex flex-col justify-between group min-h-[380px] bg-white dark:bg-slate-950">
              
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={spotlightImageUrl} 
                  alt={featuredPoll.category || 'Spotlight'} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-45 dark:opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/65 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent"></div>
              </div>

              <div className="relative z-10 p-6 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> #1 Most Voted
                  </span>
                  <span className={cx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border", CATEGORY_CONFIG[featuredPoll.category]?.badge || categoryMeta.badge)}>
                    {featuredPoll.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold backdrop-blur-md shadow-sm">
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{featuredTotalVotes} Total Votes</span>
                </div>
              </div>

              <div className="relative z-10 px-6 md:px-8 py-2">
                <Link to={`/poll/${featuredPoll._id}`}>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-4 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {featuredPoll.title}
                  </h2>
                </Link>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mb-6">
                  {featuredPoll.options.slice(0, 4).map((opt, idx) => {
                    const pct = featuredTotalVotes > 0 ? Math.round((opt.votes / featuredTotalVotes) * 100) : 0;
                    return (
                      <div key={idx} className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl p-3 backdrop-blur-md shadow-sm">
                        <div 
                          className="absolute inset-y-0 left-0 bg-indigo-500/15 dark:bg-indigo-500/25 transition-all duration-500 rounded-2xl" 
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative z-10 flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800 dark:text-slate-100 truncate pr-2">{opt.text}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 shrink-0 font-extrabold">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative z-10 p-6 md:p-8 pt-2 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Created {new Date(featuredPoll.createdAt).toLocaleDateString()}</span>
                  <span className="opacity-40">•</span>
                  <span>By {featuredPoll.creator?.username || 'Community'}</span>
                </div>

                <Link 
                  to={`/poll/${featuredPoll._id}`} 
                  className="btn-primary px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-500/25 hover:scale-105 transition-all"
                >
                  Cast Your Vote <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Runners Up Side Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {runnerUpPolls.map((rp, idx) => {
                const rpVotes = rp.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
                return (
                  <div key={rp._id} className="pro-card rounded-[26px] p-5 relative overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col justify-between group bg-white dark:bg-slate-900/60 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> Ranking #{idx + 2}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-500" /> {rpVotes} votes
                      </span>
                    </div>

                    <Link to={`/poll/${rp._id}`}>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-3">
                        {rp.title}
                      </h4>
                    </Link>

                    <div className="flex items-center justify-between text-xs pt-1 mt-auto">
                      <span className={cx("text-[10px] font-bold px-2.5 py-0.5 rounded-full border", CATEGORY_CONFIG[rp.category]?.badge || categoryMeta.badge)}>
                        {rp.category || 'General'}
                      </span>
                      <Link to={`/poll/${rp._id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-0.5 text-xs">
                        Vote <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Create Poll Banner Card */}
              <div className="pro-card rounded-[26px] p-5 border border-indigo-200 dark:border-indigo-500/30 flex-grow flex flex-col justify-between bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/90 dark:from-slate-900/90 dark:to-indigo-950/40 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Start a Consensus
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-4">
                  Create a public or private poll in seconds with instant live vote tracking.
                </p>
                <Link 
                  to={user ? '/create' : '/login'} 
                  className="btn-primary w-full py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25"
                >
                  <Plus className="w-4 h-4" /> Create New Poll
                </Link>
              </div>

            </div>
          </div>
        </motion.div>
      )}

      {/* Filter and Category Controls */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {user && (
            <div className="pro-card p-1 rounded-2xl flex shrink-0 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/60">
              <button 
                onClick={() => setFilter('all')} 
                className={cx(
                  "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", 
                  filter === 'all' ? 'bg-indigo-600 text-white font-black shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                Global
              </button>
              <button 
                onClick={() => setFilter('mine')} 
                className={cx(
                  "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", 
                  filter === 'mine' ? 'bg-indigo-600 text-white font-black shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                My Polls
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 w-full md:w-auto ml-auto">
            <div className="relative flex-grow md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-all outline-none shadow-sm"
              />
            </div>
            
            <div className="hidden sm:flex pro-card p-1 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-900/60">
               <button 
                onClick={() => setViewType('grid')} 
                className={cx("p-2 rounded-xl transition-all", viewType === 'grid' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")} 
                title="Grid View"
               >
                 <LayoutGrid className="w-4 h-4" />
               </button>
               <button 
                onClick={() => setViewType('list')} 
                className={cx("p-2 rounded-xl transition-all", viewType === 'list' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")} 
                title="List View"
               >
                 <List className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const IconComponent = CATEGORY_CONFIG[cat]?.icon || Tag;
            const isCatActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cx(
                  "px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5", 
                  isCatActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25' 
                    : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500/30'
                )}
              >
                <IconComponent className={cx("w-3.5 h-3.5", isCatActive ? "text-white" : "text-indigo-500")} />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Poll Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-600 animate-spin"></div>
           <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">Loading Polls...</span>
        </div>
      ) : (
        <div className={cx(
          "grid gap-6 transition-all duration-300",
          viewType === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl mx-auto w-full"
        )}>
          
          {/* Create Poll Card */}
          {user && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Link to="/create" className="block h-full group">
                <div className={cx(
                  "h-full pro-card border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500 bg-indigo-50/30 dark:bg-slate-900/30 hover:bg-indigo-50/60 dark:hover:bg-slate-900/60 transition-all duration-300 flex items-center justify-center relative overflow-hidden",
                  viewType === 'grid' ? "rounded-3xl p-8 flex-col min-h-[220px]" : "rounded-2xl p-5 min-h-[85px] flex-row gap-5 text-left"
                )}>
                  <div className={cx(
                    "rounded-2xl bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm",
                    viewType === 'grid' ? "w-12 h-12 mb-3" : "w-10 h-10 shrink-0"
                  )}>
                    <Plus className={cx(viewType === 'grid' ? "w-6 h-6" : "w-5 h-5")} />
                  </div>
                  <h3 className={cx("font-black text-slate-900 dark:text-white uppercase tracking-wide", viewType === 'grid' ? "text-lg" : "text-base")}>
                    Create New Poll
                  </h3>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Poll Cards */}
          {(filter === 'mine' 
            ? filteredPolls.filter(p => (p.creator?._id || p.creator) === (user?.id || user?._id)) 
            : filteredPolls
          ).map((poll, i) => {
            const catConfig = CATEGORY_CONFIG[poll.category] || CATEGORY_CONFIG['All'];
            const totalV = poll.options?.reduce((a, b) => a + (b.votes || 0), 0) || 0;

            return (
              <motion.div key={poll._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="h-full">
                <div className={cx(
                   "h-full pro-card relative overflow-hidden flex transition-all group border border-slate-200 dark:border-white/10 hover:border-indigo-400/50 shadow-sm hover:shadow-md bg-white dark:bg-slate-900/60",
                   viewType === 'grid' ? "flex-col rounded-3xl p-6" : "flex-row items-center rounded-2xl p-4 md:p-5 gap-5"
                )}>
                   <div className={cx("flex items-center justify-between mb-3 w-full", viewType === 'list' && "w-auto shrink-0")}>
                      <span className={cx("px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border", catConfig.badge)}>
                        {poll.category || 'General'}
                      </span>
                      <div className="flex gap-1.5 ml-auto">
                        <button 
                          onClick={(e) => handleShare(e, poll.title, poll._id)} 
                          title="Share Poll"
                          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-300"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {user && (user.id === (poll.creator?._id || poll.creator) || user._id === (poll.creator?._id || poll.creator)) && (
                          <div className="flex gap-1.5">
                             <Link 
                               to={`/poll/${poll._id}/analytics`}
                               className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-300"
                               title="Poll Analytics"
                             >
                               <BarChart3 className="w-3.5 h-3.5" />
                             </Link>
                             <button 
                               onClick={async (e) => {
                                 e.preventDefault();
                                 if (window.confirm('Delete this poll?')) {
                                   try { await api.delete(`/polls/${poll._id}`); setPolls(polls.filter(p => p._id !== poll._id)); } catch (err) {}
                                 }
                               }}
                               className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white transition-all text-slate-500"
                               title="Delete Poll"
                             >
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        )}
                      </div>
                   </div>

                   <Link to={`/poll/${poll._id}`} className={cx("flex-grow block", viewType === 'list' && "flex items-center gap-6")}>
                      <h3 className={cx("font-bold text-slate-900 dark:text-white tracking-tight line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors", viewType === 'grid' ? "text-lg mb-2" : "text-base mb-0")}>
                        {poll.title}
                      </h3>
                      <div className={cx("space-y-1.5", viewType === 'grid' ? "mb-4 flex-col" : "hidden sm:flex flex-row items-center gap-4 space-y-0 shrink-0")}>
                         <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                           <Clock className="w-3.5 h-3.5 text-indigo-500" /> {new Date(poll.createdAt).toLocaleDateString()}
                         </div>
                      </div>
                   </Link>

                   <div className={cx("flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400", viewType === 'grid' ? "mt-auto justify-between pt-3 border-t border-slate-100 dark:border-white/5" : "ml-auto shrink-0 gap-5")}>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-500" /> 
                        <span>{totalV} votes</span>
                      </div>
                      <Link 
                        to={`/poll/${poll._id}`} 
                        className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 rounded-xl text-indigo-700 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 text-xs shadow-sm"
                      >
                        Vote <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filteredPolls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-40 h-40 opacity-20 relative">
             <div className="absolute inset-0 bg-indigo-500 blur-[40px] animate-pulse"></div>
             <ShieldCheck className="w-full h-full text-indigo-500 relative z-10" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-4">No active polls found in category "{activeCategory}".</p>
        </div>
      )}
    </div>
  );
}
