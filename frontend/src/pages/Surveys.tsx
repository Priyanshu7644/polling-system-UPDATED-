import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { surveys } from '../api';
import { AuthContext } from '../App';
import { 
  ClipboardList, Users, Search, Share2, Trash2, BarChart3, 
  ChevronRight, LayoutGrid, List, Sparkles, Plus 
} from 'lucide-react';
import ShareModal from '../components/ShareModal';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Surveys() {
  const { user } = useContext(AuthContext);
  const [surveyItems, setSurveyItems] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('pulse_cached_surveys');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('pulse_cached_surveys');
      return !cached || JSON.parse(cached).length === 0;
    } catch { return true; }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [shareData, setShareData] = useState({ isOpen: false, title: '', url: '' });

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await surveys.getAll();
        setSurveyItems(res.data);
        localStorage.setItem('pulse_cached_surveys', JSON.stringify(res.data));
      } catch (err) {
        console.error('Fetch surveys error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const handleShare = (e: React.MouseEvent, title: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const baseUrl = window.location.origin;
    setShareData({ isOpen: true, title, url: `${baseUrl}/surveys/${id}` });
  };

  // Filter surveys
  const filteredSurveys = surveyItems.filter(survey => {
    const matchesSearch = survey.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = filter === 'mine' ? (survey.creator?._id || survey.creator) === (user?.id || user?._id) : true;
    return matchesSearch && matchesOwner;
  });

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
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full pro-card border border-blue-200 dark:border-blue-500/30 shadow-sm mb-4"
        >
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 
            Feedback & Insights Network
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-3 leading-tight uppercase italic text-slate-900 dark:text-white"
        >
          Pulse <span className="text-brand-gradient">Surveys</span>
        </motion.h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl font-medium">
          Gather comprehensive multi-question feedback, audience insights, and analytics.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {user && (
            <div className="pro-card p-1 rounded-2xl flex shrink-0 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/60">
              <button 
                onClick={() => setFilter('all')} 
                className={cx(
                  "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", 
                  filter === 'all' ? 'bg-blue-600 text-white font-black shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                All Surveys
              </button>
              <button 
                onClick={() => setFilter('mine')} 
                className={cx(
                  "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", 
                  filter === 'mine' ? 'bg-blue-600 text-white font-black shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                My Surveys
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 w-full md:w-auto ml-auto">
            <div className="relative flex-grow md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-all outline-none shadow-sm"
              />
            </div>
            
            <div className="hidden sm:flex pro-card p-1 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-900/60">
               <button 
                onClick={() => setViewType('grid')} 
                className={cx("p-2 rounded-xl transition-all", viewType === 'grid' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")} 
                title="Grid View"
               >
                 <LayoutGrid className="w-4 h-4" />
               </button>
               <button 
                onClick={() => setViewType('list')} 
                className={cx("p-2 rounded-xl transition-all", viewType === 'list' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")} 
                title="List View"
               >
                 <List className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin"></div>
           <span className="text-xs uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400">Loading Surveys...</span>
        </div>
      ) : (
        <div className={cx(
          "grid gap-6 transition-all duration-300",
          viewType === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl mx-auto w-full"
        )}>
          {/* Create Survey Action Card */}
          {user && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Link to="/surveys/create" className="block h-full group">
                <div className={cx(
                  "h-full pro-card border-2 border-dashed border-blue-300 dark:border-blue-500/30 hover:border-blue-500 bg-blue-50/30 dark:bg-slate-900/30 hover:bg-blue-50/60 dark:hover:bg-slate-900/60 transition-all duration-300 flex items-center justify-center relative overflow-hidden",
                  viewType === 'grid' ? "rounded-3xl p-8 flex-col min-h-[220px]" : "rounded-2xl p-5 min-h-[85px] flex-row gap-5 text-left"
                )}>
                  <div className={cx(
                    "rounded-2xl bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm",
                    viewType === 'grid' ? "w-12 h-12 mb-3" : "w-10 h-10 shrink-0"
                  )}>
                    <Plus className={cx(viewType === 'grid' ? "w-6 h-6" : "w-5 h-5")} />
                  </div>
                  <h3 className={cx("font-black text-slate-900 dark:text-white uppercase tracking-wide", viewType === 'grid' ? "text-lg" : "text-base")}>
                    Create New Survey
                  </h3>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Survey Items */}
          {filteredSurveys.map((survey, i) => (
             <motion.div key={survey._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="h-full">
                <div className={cx(
                   "h-full pro-card relative overflow-hidden flex transition-all group border border-slate-200 dark:border-white/10 hover:border-blue-400/50 shadow-sm hover:shadow-md bg-white dark:bg-slate-900/60",
                   viewType === 'grid' ? "flex-col rounded-3xl p-6" : "flex-row items-center rounded-2xl p-4 md:p-5 gap-5"
                )}>
                   <div className={cx("flex items-center justify-between mb-3 w-full", viewType === 'list' && "w-auto shrink-0")}>
                       <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                        Survey
                       </span>
                       <div className="flex gap-1.5 ml-auto">
                          <button 
                            onClick={(e) => handleShare(e, survey.title, survey._id)} 
                            title="Share Survey Link"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-600 dark:text-slate-300"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {user && (user.id === (survey.creator?._id || survey.creator) || user._id === (survey.creator?._id || survey.creator)) && (
                            <div className="flex gap-1.5">
                               <Link 
                                 to={`/surveys/${survey._id}/results`}
                                 className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-600 dark:text-slate-300"
                                 title="Survey Results Analytics"
                               >
                                 <BarChart3 className="w-3.5 h-3.5" />
                               </Link>
                               <button 
                                 onClick={async (e) => {
                                   e.preventDefault();
                                   if (window.confirm('Delete this survey?')) {
                                     try { await api.delete(`/surveys/${survey._id}`); setSurveyItems(prev => prev.filter(s => s._id !== survey._id)); } catch (err) {}
                                   }
                                 }}
                                 className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white transition-all text-slate-500"
                                 title="Delete Survey"
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </div>
                          )}
                       </div>
                    </div>

                   <Link to={`/surveys/${survey._id}`} className={cx("flex-grow block", viewType === 'list' && "flex items-center gap-6")}>
                      <h3 className={cx("font-bold text-slate-900 dark:text-white tracking-tight line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors", viewType === 'grid' ? "text-lg mb-4" : "text-base mb-0")}>
                        {survey.title}
                      </h3>
                   </Link>

                   <div className={cx("flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400", viewType === 'grid' ? "mt-auto justify-between pt-3 border-t border-slate-100 dark:border-white/5" : "ml-auto shrink-0 gap-5")}>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" /> {survey.responsesCount || 0} Responses
                      </div>
                      <Link 
                        to={`/surveys/${survey._id}`} 
                        className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 rounded-xl text-blue-700 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 text-xs shadow-sm"
                      >
                        Participate <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                   </div>
                </div>
             </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredSurveys.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4">
             <ClipboardList className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">No Surveys Found</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1 max-w-sm">
            Try adjusting your search query or filter settings, or create a new survey.
          </p>
        </div>
      )}
    </div>
  );
}
