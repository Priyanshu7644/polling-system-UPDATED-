import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import api from '../api';
import { AuthContext } from '../App';
import TemplateNav from '../components/layout/TemplateNav';
import { Clock, Users, Zap, Trash2, Search, Filter } from 'lucide-react';

interface PollOption {
  _id: string;
  text: string;
  votes: number;
}

interface Poll {
  _id: string;
  title: string;
  description: string;
  options: PollOption[];
  creator: { _id: string, username: string };
  status: string;
  createdAt: string;
  category: string;
}

const CATEGORIES = ['All', 'Politics', 'Sports', 'Technology', 'Entertainment', 'Science', 'Health', 'Education', 'Social', 'Other'];

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveUsers, setLiveUsers] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const params: any = {};
        if (activeCategory !== 'All') params.category = activeCategory;
        if (searchQuery) params.search = searchQuery;

        const res = await api.get('/polls', { params });
        setPolls(res.data);
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();

    // Socket.io for live updates on Explore page
    const socket: Socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socket.on('liveUsers', (count) => {
      setLiveUsers(count);
    });

    socket.on('newPoll', (poll: Poll) => {
      const matchesCategory = activeCategory === 'All' || poll.category === activeCategory;
      const matchesSearch = !searchQuery || 
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (matchesCategory && matchesSearch) {
        setPolls(prev => [poll, ...prev]);
      }
    });

    socket.on('pollUpdated', (updatedPoll: Poll) => {
      setPolls(prev => {
        const matchesCategory = activeCategory === 'All' || updatedPoll.category === activeCategory;
        const matchesSearch = !searchQuery || 
          updatedPoll.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (updatedPoll.description && updatedPoll.description.toLowerCase().includes(searchQuery.toLowerCase()));

        if (matchesCategory && matchesSearch) {
          return prev.map(p => p._id === updatedPoll._id ? updatedPoll : p);
        } else {
          return prev.filter(p => p._id !== updatedPoll._id);
        }
      });
    });

    socket.on('pollDeleted', (pollId) => {
      setPolls(prev => prev.filter(p => p._id !== pollId));
    });

    return () => {
      socket.disconnect();
    };
  }, [activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-neon-pink animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-neon-blue animate-spin animation-delay-200"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-cyber-500 animate-spin animation-delay-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center relative z-10 pt-10 pb-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-pink" /> 
              Real-time interactive polling
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 rounded-full bg-cyber-500/10 border border-cyber-500/30 backdrop-blur-md"
          >
            <span className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-[0_0_10px_#0ea5e9]"></span>
              {liveUsers} Members Live
            </span>
          </motion.div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
        >
          Discover & Vote on <br />
          <span className="text-gradient">Trending Topics</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light"
        >
          Join the conversation. See instant results visualized beautifully in real-time.
        </motion.p>
      </div>

      <TemplateNav />

      {/* Filter Options */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Main Filter Toggle */}
          {user && (
            <div className="bg-dark-surface/50 p-1 rounded-xl glass border border-white/5 flex shrink-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-gradient-to-r from-neon-blue to-cyber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Explore All
              </button>
              <button
                onClick={() => setFilter('mine')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'mine' ? 'bg-gradient-to-r from-cyber-600 to-neon-pink text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                My Polls
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-dark-surface/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-blue focus:border-transparent text-white placeholder-gray-500 transition-all outline-none glass"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="w-4 h-4 text-cyber-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Categories</span>
          </div>
          <div className="flex items-center space-x-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border 
                  ${activeCategory === cat 
                    ? 'bg-cyber-500/20 border-cyber-500 text-cyber-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                    : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
          >
            <Link to="/create" className="block h-full group">
              <div className="h-full glass-card rounded-2xl p-6 border-2 border-dashed border-white/20 hover:border-cyber-400 bg-white/5 hover:bg-cyber-500/10 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] shadow-lg">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyber-500/20 group-hover:border-cyber-400 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all">
                  <span className="text-4xl font-light text-cyber-400 leading-none mb-1">+</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-cyber-300 transition-colors">Create New Poll</h3>
                <p className="text-gray-500 text-sm mt-3 font-medium uppercase tracking-widest text-center">Start a conversation</p>
              </div>
            </Link>
          </motion.div>
        )}
        {(filter === 'mine' ? polls.filter(p => p.creator._id === user?.id) : polls).map((poll, i) => {
          const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

          return (
            <motion.div
              key={poll._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="h-full"
            >
              <Link to={`/poll/${poll._id}`} className="block h-full group">
                <div className="h-full glow-border rounded-2xl relative z-0 before:rounded-2xl">
                  <div className="glass-card rounded-2xl p-6 h-full flex flex-col relative z-10 overflow-hidden">
                    {/* Subtle gradient overlay */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-500/10 rounded-full filter blur-2xl group-hover:bg-neon-pink/20 transition-all duration-500 transform translate-x-10 -translate-y-10"></div>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-cyber-500/10 border border-cyber-500/20 text-[10px] font-bold text-cyber-400 uppercase tracking-wider">
                          {poll.category || 'Other'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyber-300 group-hover:to-neon-pink transition-all">
                        {poll.title}
                      </h3>
                      {poll.description && (
                         <p className="text-gray-400 text-sm line-clamp-2">{poll.description}</p>
                      )}
                    </div>
                    
                    {/* Option preview bars */}
                    <div className="space-y-2 mb-6 flex-grow">
                      {poll.options.slice(0, 3).map((opt, idx) => {
                        const px = totalVotes === 0 ? 0 : (opt.votes / totalVotes) * 100;
                        return (
                          <div key={idx} className="relative h-6 bg-dark-bg/50 rounded-md overflow-hidden border border-white/5">
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-900 to-cyber-600/50"
                              style={{ width: `${Math.max(px, 5)}%` }}
                            ></div>
                            <div className="relative px-2 h-full flex items-center justify-between text-xs z-10 font-medium">
                              <span className="text-gray-300 truncate pr-2">{opt.text}</span>
                              <span className="text-cyber-300">{Math.round(px)}%</span>
                            </div>
                          </div>
                        );
                      })}
                      {poll.options.length > 3 && (
                        <div className="text-xs text-center text-gray-500 italic mt-1">
                          + {poll.options.length - 3} more options
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-cyber-400" />
                          <span>{totalVotes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-neon-blue" />
                          <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500">by</span>
                        <span className="ml-1 text-gray-300 font-medium">{poll.creator.username}</span>
                      </div>
                    </div>

                    {user && user.id === poll.creator._id && (
                      <div className="absolute top-4 right-4 flex space-x-2 z-20">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm('Delete this poll?')) {
                              try {
                                await api.delete(`/polls/${poll._id}`);
                                setPolls(polls.filter(p => p._id !== poll._id));
                              } catch (err) {
                                console.error('Failed to delete poll');
                              }
                            }
                          }}
                          className="bg-dark-bg/80 hover:bg-red-500/20 text-gray-400 hover:text-red-400 p-2 rounded-xl backdrop-blur-md border border-white/10 hover:border-red-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
        {polls.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-20 text-center"
          >
            <div className="inline-block p-8 border border-white/10 bg-white/5 backdrop-blur-lg rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">No polls yet</h3>
              <p className="text-gray-400 mb-6">Be the first to create one!</p>
              <Link to="/create" className="bg-cyber-600 hover:bg-cyber-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Create Poll
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
