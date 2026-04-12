import { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import api, { exams, surveys } from '../api';
import { AuthContext } from '../App';
import TemplateNav from '../components/layout/TemplateNav';
import ShareModal from '../components/ShareModal';
import { Clock, Users, Zap, Trash2, Search, Share2, Trophy, ClipboardList, ChevronRight, LayoutGrid, List, BarChart3, ShieldCheck } from 'lucide-react';

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
  options: PollOption[];
  category: string;
  createdAt: string;
  creator: {
    _id: string;
    username: string;
  };
}

const CATEGORIES = ['All', 'Technology', 'Entertainment', 'Social', 'Politics', 'Sports', 'Other'];

export default function Home() {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [examItems, setExamItems] = useState<any[]>([]);
  const [surveyItems, setSurveyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveUsers, setLiveUsers] = useState(0);
  const [shareData, setShareData] = useState({ isOpen: false, title: '', url: '' });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'polls' | 'exams' | 'surveys') || 'polls';
  const setActiveTab = (tab: string) => setSearchParams({ tab }, { replace: true });

  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'polls') {
          const res = await api.get('/polls', { params: { category: activeCategory !== 'All' ? activeCategory : undefined, search: searchQuery } });
          setPolls(res.data);
        } else if (activeTab === 'exams') {
          const res = await exams.getAll();
          setExamItems(res.data.filter((e: any) => e.title.toLowerCase().includes(searchQuery.toLowerCase())));
        } else if (activeTab === 'surveys') {
          const res = await surveys.getAll();
          setSurveyItems(res.data.filter((s: any) => s.title.toLowerCase().includes(searchQuery.toLowerCase())));
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();

    if (activeTab === 'polls') {
      const socket: Socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
      socket.on('liveUsers', (count) => setLiveUsers(count));
      socket.on('newPoll', (poll: Poll) => {
        if (activeCategory === 'All' || poll.category === activeCategory) setPolls(prev => [poll, ...prev]);
      });
      return () => { socket.disconnect(); };
    }
  }, [activeCategory, searchQuery, activeTab]);

  const handleShare = (e: React.MouseEvent, title: string, type: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${type}/${id}${type === 'exams' ? '/take' : ''}`;
    setShareData({ isOpen: true, title, url });
  };

  const getExamStatus = (exam: any) => {
    if (exam.examType === 'anytime') return { label: 'Universal Access', color: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30' };
    const now = new Date();
    const s = new Date(exam.startTime);
    const e = new Date(exam.endTime);
    if (now < s) return { label: 'Scheduled', color: 'bg-cyber-500/10 text-cyber-400 border-cyber-500/20' };
    if (now > e) return { label: 'Concluded', color: 'bg-white/5 text-gray-500 border-white/10' };
    return { label: 'Active Now', color: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30 animate-pulse' };
  };

  return (
    <div className="container mx-auto px-4 py-32 max-w-7xl">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-pink" /> 
              Intelligence Synchronization
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-cyber-500/10 border border-cyber-500/30 backdrop-blur-md"
          >
            <span className="text-sm font-semibold text-cyber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-[0_0_10px_#0ea5e9]"></span>
              {liveUsers} Active Nodes
            </span>
          </motion.div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 -z-10 opacity-40 pointer-events-none">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            <defs>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
              </radialGradient>
            </defs>
            <motion.circle 
              cx="400" cy="200" r="100" fill="url(#hubGlow)"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i} cx="400" cy="200" r="10" fill="#0ea5e9"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  x: Math.cos(i * 60 * Math.PI/180) * 300, 
                  y: Math.sin(i * 60 * Math.PI/180) * 150,
                  opacity: [0, 1, 0] 
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "linear" }}
              />
            ))}
            <motion.path 
              d="M100,200 Q400,50 700,200" stroke="#0ea5e9" strokeWidth="0.5" fill="none" opacity="0.2"
              animate={{ pathLength: [0, 1, 1], pathOffset: [0, 0, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path 
              d="M100,200 Q400,350 700,200" stroke="#f43f5e" strokeWidth="0.5" fill="none" opacity="0.2"
              animate={{ pathLength: [0, 1, 1], pathOffset: [0, 0, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter sm:tracking-tight mb-4 md:mb-6 leading-[0.9] sm:leading-tight uppercase italic text-white relative"
        >
          Pulse <span className="text-gradient">Gallery</span>
        </motion.h1>
      </div>

      <TemplateNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="space-y-8 mt-12 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {user && (
            <div className="bg-[#11131a]/60 p-1.5 rounded-2xl glass border border-white/5 flex shrink-0">
              <button onClick={() => setFilter('all')} className={cx("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", filter === 'all' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white')}>Global</button>
              <button onClick={() => setFilter('mine')} className={cx("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", filter === 'mine' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white')}>Personal</button>
            </div>
          )}

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-[#11131a]/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-600 transition-all outline-none"
              />
            </div>
            
            <div className="hidden sm:flex bg-[#11131a]/60 p-1 rounded-2xl border border-white/5 shadow-inner shrink-0">
               <button onClick={() => setViewType('grid')} className={cx("p-3 rounded-xl transition-all", viewType === 'grid' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white")} title="Grid View">
                 <LayoutGrid className="w-5 h-5" />
               </button>
               <button onClick={() => setViewType('list')} className={cx("p-3 rounded-xl transition-all", viewType === 'list' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white")} title="List View">
                 <List className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>

        {activeTab === 'polls' && (
          <div className="flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cx("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border", activeCategory === cat ? 'bg-neon-blue border-neon-blue text-black' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white')}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-40">
           <Zap className="w-12 h-12 text-neon-blue animate-pulse" />
        </div>
      ) : (
        <div className={cx(
          "grid gap-8 transition-all duration-500",
          viewType === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl mx-auto w-full"
        )}>
          {/* Create Card */}
          {user && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Link to={activeTab === 'polls' ? '/create' : activeTab === 'exams' ? '/exams/create' : '/surveys/create'} className="block h-full group">
                <div className={cx(
                  "h-full glass-card border-2 border-dashed border-white/10 hover:border-neon-blue bg-white/5 hover:bg-neon-blue/5 transition-all duration-300 flex items-center justify-center",
                  viewType === 'grid' ? "rounded-[2.5rem] p-8 flex-col min-h-[350px]" : "rounded-3xl p-6 min-h-[100px] flex-row gap-6 text-left"
                )}>
                  <div className={cx(
                    "rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-neon-blue group-hover:text-black transition-all shadow-lg",
                    viewType === 'grid' ? "w-16 h-16 mb-6" : "w-12 h-12"
                  )}>
                    <span className={cx("font-light", viewType === 'grid' ? "text-4xl" : "text-2xl")}>+</span>
                  </div>
                  <h3 className={cx("font-black text-white uppercase tracking-tight", viewType === 'grid' ? "text-2xl" : "text-lg")}>
                    Generate {activeTab.slice(0, -1)}
                  </h3>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Dynamic Content Mapping */}
          {activeTab === 'polls' && (filter === 'mine' 
            ? polls.filter(p => (p.creator?._id || p.creator) === (user?.id || user?._id)) 
            : polls
          ).map((poll, i) => (
             <motion.div key={poll._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="h-full">
                <div className={cx(
                   "h-full glass-card relative overflow-hidden flex transition-all shadow-2xl group border border-white/5 hover:border-white/10",
                   viewType === 'grid' ? "flex-col rounded-[2.5rem] p-8" : "flex-row items-center rounded-2xl p-4 md:p-6 gap-6"
                )}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 blur-3xl pointer-events-none group-hover:bg-neon-blue/10 transition-colors"></div>
                   
                   <div className={cx("flex items-center", viewType === 'grid' ? "justify-between mb-6" : "gap-4 shrink-0")}>
                      <span className="px-3 py-1 bg-cyber-500/10 border border-cyber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-cyber-500">
                        {poll.category || 'Standard Access'}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={(e) => handleShare(e, poll.title, 'poll', poll._id)} className="p-2.5 bg-white/5 rounded-xl hover:bg-cyber-500 hover:text-black transition-all">
                          <Share2 className="w-4 h-4" />
                        </button>
                        {user && (user.id === (poll.creator?._id || poll.creator) || user._id === (poll.creator?._id || poll.creator)) && (
                          <div className="flex gap-2">
                             <Link 
                               to={`/poll/${poll._id}/analytics`}
                               className="p-2.5 bg-white/5 rounded-xl hover:bg-sky-500 hover:text-black transition-all"
                               title="View Analytics"
                             >
                               <BarChart3 className="w-4 h-4" />
                             </Link>
                             <button 
                               onClick={async (e) => {
                                 e.preventDefault();
                                 if (window.confirm('Decommission this poll node?')) {
                                   try { await api.delete(`/polls/${poll._id}`); setPolls(polls.filter(p => p._id !== poll._id)); } catch (err) {}
                                 }
                               }}
                               className="p-2.5 bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        )}
                      </div>
                   </div>

                   <Link to={`/poll/${poll._id}`} className={cx("flex-grow", viewType === 'list' && "flex items-center gap-6")}>
                      <h3 className={cx("font-black text-white tracking-tight line-clamp-2 italic uppercase", viewType === 'grid' ? "text-2xl mb-4" : "text-lg mb-0")}>{poll.title}</h3>
                      <div className={cx("space-y-3", viewType === 'grid' ? "mb-8 flex-col" : "hidden sm:flex flex-row items-center gap-4 space-y-0 shrink-0")}>
                         <div className="flex items-center gap-3 text-gray-500 text-[10px] font-bold uppercase">
                           <Clock className="w-4 h-4 text-cyber-500" /> {new Date(poll.createdAt).toLocaleDateString()}
                         </div>
                      </div>
                   </Link>

                   <div className={cx("flex items-center text-[10px] font-black uppercase text-gray-500 tracking-widest", viewType === 'grid' ? "mt-auto justify-between" : "ml-auto shrink-0 gap-6")}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyber-400" /> {poll.options.reduce((a, b) => a + b.votes, 0)}</div>
                        <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                        <div className="hidden sm:block text-[8px] opacity-70">By {(poll.creator?.username || 'SYSTEM')}</div>
                      </div>
                      <Link to={`/poll/${poll._id}`} className="p-3 bg-cyber-500/10 border border-cyber-500/20 rounded-xl hover:bg-cyber-500 hover:text-black transition-all">
                         <ChevronRight className="w-4 h-4" />
                      </Link>
                   </div>
                </div>
             </motion.div>
          ))}

          {activeTab === 'exams' && (filter === 'mine' 
            ? examItems.filter(e => (e.teacher?._id || e.teacher) === (user?.id || user?._id)) 
            : examItems
          ).map((exam, i) => {
            const status = getExamStatus(exam);
            return (
              <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="h-full">
                <div className={cx(
                  "h-full glass-card relative overflow-hidden flex transition-all shadow-2xl group border border-white/5 hover:border-white/10",
                  viewType === 'grid' ? "flex-col rounded-[2.5rem] p-8" : "flex-row items-center rounded-2xl p-4 md:p-6 gap-6"
                )}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-3xl pointer-events-none group-hover:bg-neon-pink/10 transition-colors"></div>
                    
                    <div className={cx("flex items-center", viewType === 'grid' ? "justify-between mb-6" : "gap-4 shrink-0")}>
                       <div className={cx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", status.color)}>
                         {status.label}
                       </div>
                       <div className="flex gap-2">
                        <button onClick={(e) => handleShare(e, exam.title, 'exams', exam._id)} className="p-2.5 bg-white/5 rounded-xl hover:bg-neon-pink hover:text-black transition-all">
                          <Share2 className="w-4 h-4" />
                        </button>
                        {user && (user.id === (exam.teacher?._id || exam.teacher) || user._id === (exam.teacher?._id || exam.teacher)) && (
                          <div className="flex gap-2">
                             <Link 
                               to={`/exams/${exam._id}`}
                               className="p-2.5 bg-white/5 rounded-xl hover:bg-amber-400 hover:text-black transition-all"
                               title="View Gradebook"
                             >
                               <Trophy className="w-4 h-4" />
                             </Link>
                             <button 
                               onClick={async (e) => {
                                 e.preventDefault();
                                 if (window.confirm('Decommission this exam node?')) {
                                   try { await api.delete(`/exams/${exam._id}`); setExamItems(prev => prev.filter(e => e._id !== exam._id)); } catch (err) {}
                                 }
                               }}
                               className="p-2.5 bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link to={`/exams/${exam._id}`} className={cx("flex-grow", viewType === 'list' && "flex items-center gap-6")}>
                       <h3 className={cx("font-black text-white tracking-tight line-clamp-2 italic uppercase", viewType === 'grid' ? "text-2xl mb-4" : "text-lg mb-0")}>{exam.title}</h3>
                       <div className={cx("space-y-3", viewType === 'grid' ? "mb-8 flex-col" : "hidden sm:flex flex-row items-center gap-4 space-y-0 shrink-0")}>
                         <div className="flex items-center gap-3 text-gray-500 text-[10px] font-bold uppercase">
                           <Clock className="w-4 h-4 text-neon-pink" /> {exam.duration}m
                         </div>
                       </div>
                    </Link>

                    <div className={cx("flex items-center text-[10px] font-black uppercase text-gray-500 tracking-widest", viewType === 'grid' ? "mt-auto justify-between" : "ml-auto shrink-0 gap-6")}>
                       <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5 text-cyber-400" /> {exam.questions.length} Items</div>
                       <Link to={`/exams/${exam._id}/take`} className="p-3 bg-neon-pink/10 border border-neon-pink/20 rounded-xl hover:bg-neon-pink hover:text-black transition-all">
                          <ChevronRight className="w-4 h-4" />
                       </Link>
                    </div>
                </div>
              </motion.div>
            );
          })}

          {activeTab === 'surveys' && (filter === 'mine' 
             ? surveyItems.filter(s => (s.creator?._id || s.creator) === (user?.id || user?._id)) 
             : surveyItems
          ).map((survey, i) => (
             <motion.div key={survey._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="h-full">
                <div className={cx(
                   "h-full glass-card relative overflow-hidden flex transition-all shadow-2xl group border border-white/5 hover:border-white/10",
                   viewType === 'grid' ? "flex-col rounded-[2.5rem] p-8" : "flex-row items-center rounded-2xl p-4 md:p-6 gap-6"
                )}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-500/5 blur-3xl pointer-events-none group-hover:bg-cyber-500/10 transition-colors"></div>
                                      <div className={cx("flex items-center", viewType === 'grid' ? "justify-between mb-6" : "gap-4 shrink-0")}>
                       <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">Survey Module</span>
                       <div className="flex gap-2">
                          <button onClick={(e) => handleShare(e, survey.title, 'surveys', survey._id)} className="p-2.5 bg-white/5 rounded-xl hover:bg-cyber-500 hover:text-black transition-all">
                            <Share2 className="w-4 h-4" />
                          </button>
                          {user && (user.id === (survey.creator?._id || survey.creator) || user._id === (survey.creator?._id || survey.creator)) && (
                            <div className="flex gap-2">
                               <Link 
                                 to={`/surveys/${survey._id}/results`}
                                 className="p-2.5 bg-white/5 rounded-xl hover:bg-sky-500 hover:text-black transition-all"
                                 title="View Results"
                               >
                                 <BarChart3 className="w-4 h-4" />
                               </Link>
                               <button 
                                 onClick={async (e) => {
                                   e.preventDefault();
                                   if (window.confirm('Terminate this survey cycle?')) {
                                     try { await api.delete(`/surveys/${survey._id}`); setSurveyItems(prev => prev.filter(s => s._id !== survey._id)); } catch (err) {}
                                   }
                                 }}
                                 className="p-2.5 bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          )}
                       </div>
                    </div>

                   <Link to={`/surveys/${survey._id}`} className={cx("flex-grow", viewType === 'list' && "flex items-center gap-6")}>
                      {viewType === 'grid' && (
                        <div className="p-4 w-fit rounded-2xl bg-cyber-500/10 border border-cyber-500/20 text-cyber-500 mb-4 items-center justify-center flex">
                           <ClipboardList className="w-6 h-6" />
                        </div>
                      )}
                      <h3 className={cx("font-black text-white tracking-tight line-clamp-2 italic uppercase", viewType === 'grid' ? "text-2xl mb-6" : "text-lg mb-0")}>{survey.title}</h3>
                   </Link>

                   <div className={cx("flex items-center text-[10px] font-black uppercase text-gray-500 tracking-widest", viewType === 'grid' ? "mt-auto justify-between" : "ml-auto shrink-0 gap-6")}>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Users className="w-3.5 h-3.5 text-cyber-500" /> {survey.responsesCount || 0} Nodes
                      </div>
                      <Link to={`/surveys/${survey._id}`} className="p-3 bg-cyber-500/10 border border-cyber-500/20 rounded-xl hover:bg-cyber-500 hover:text-black transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                   </div>
                </div>
             </motion.div>
          ))}
        </div>
      )}

      {!loading && polls.length === 0 && activeTab === 'polls' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-64 h-64 opacity-20 relative">
             <div className="absolute inset-0 bg-cyber-500 blur-[60px] animate-pulse"></div>
             <ShieldCheck className="w-full h-full text-white/20 relative z-10" />
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[8px] mt-4">Node search complete: Zero matches in this sector</p>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        title={shareData.title}
        url={shareData.url}
      />
    </div>
  );
}
