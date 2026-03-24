import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layout, 
  ChevronRight, 
  ClipboardList,
  Search,
  Sparkles,
  Zap,
  Fingerprint
} from 'lucide-react';
import { surveys } from '../api';
import TemplateNav from '../components/layout/TemplateNav';
import { AuthContext } from '../App';
import { motion } from 'framer-motion';

const SurveyList: React.FC = () => {
  const [surveyItems, setSurveyItems] = useState<any[]>([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await surveys.getAll();
        setSurveyItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const filteredSurveys = surveyItems.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
       <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-b-4 border-cyber-500 animate-spin"></div>
          <Zap className="w-8 h-8 text-neon-pink animate-pulse" />
       </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center relative z-10 pt-10 pb-4">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
           >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Insights & Feedback Portal</span>
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
              Active <span className="text-gradient">Surveys</span>
           </h1>
           <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-70">
              Gather deep demographic insights and psychographic profiles through our high-engagement feedback systems.
           </p>
        </div>

        <TemplateNav />

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 px-4">
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 group-focus-within:text-sky-400 transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search feedback cycles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-6 py-5 bg-[#11131a]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/40 text-white placeholder-gray-600 transition-all outline-none"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative h-full"
            >
              <Link to="/surveys/create" className="block h-full">
                <div className="h-full glass-card rounded-[2.5rem] p-8 border-2 border-dashed border-white/20 hover:border-sky-400 bg-white/5 hover:bg-sky-400/10 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] shadow-2xl relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-400/20 group-hover:border-sky-400 group-hover:shadow-[0_0_40px_rgba(56,189,248,0.3)] transition-all">
                    <span className="text-5xl font-light text-sky-400 leading-none mb-2">+</span>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight group-hover:text-sky-400 transition-colors text-center">Create New Survey</h3>
                  <p className="text-gray-500 text-sm mt-4 font-bold uppercase tracking-widest text-center">Start discovery cycle</p>
                </div>
              </Link>
            </motion.div>
          )}
          {filteredSurveys.map((survey, i) => (
            <motion.div 
              key={survey._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-full"
            >
              <Link to={`/surveys/${survey._id}`} className="block h-full">
                <div className="h-full glass-card rounded-[2.5rem] p-8 border border-white/5 group-hover:border-sky-400/30 transition-all duration-500 relative overflow-hidden flex flex-col shadow-2xl">
                  {/* Status & Icon */}
                  <div className="flex justify-between items-center mb-8 relative z-10">
                     <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                       survey.isAnonymous ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-sky-400/10 text-sky-400 border-sky-400/20'
                     }`}>
                       {survey.isAnonymous ? 'Anonymous Mode' : 'Profile Tracked'}
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-sky-400 transition-colors">
                        <ClipboardList className="w-4 h-4" />
                     </div>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-sky-400 transition-all">
                    {survey.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 mb-8 leading-relaxed">
                    {survey.description || 'Dive into this discovery cycle and share your professional feedback.'}
                  </p>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                           <Layout className="w-3.5 h-3.5 text-sky-500" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{survey.questions.length} Questions</span>
                        </div>
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-700"></span>
                        <div className="flex items-center gap-1.5">
                           <Fingerprint className="w-3.5 h-3.5 text-cyber-500" />
                           <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest truncate max-w-[80px]">By {survey.creator.username}</span>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Backdrop flare */}
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-sky-500/5 blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-colors"></div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {filteredSurveys.length === 0 && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full py-24 text-center glass-card rounded-[3rem] border border-white/5 border-dashed"
            >
              <div className="inline-flex p-6 bg-white/5 rounded-full mb-6">
                <ClipboardList className="w-12 h-12 text-gray-600" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter mb-2 italic">The cycle is closed.</h1>
              <p className="text-gray-500 font-medium">No surveys found for your current parameters. Start a new discovery cycle.</p>
              <Link to="/surveys/create" className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-cyber-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-sky-500/20">
                 <Zap className="w-4 h-4" /> Pulse New Survey
              </Link>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default SurveyList;
