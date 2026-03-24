import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Trophy,
  Users,
  Search,
  Zap,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { exams } from '../api';
import TemplateNav from '../components/layout/TemplateNav';
import { AuthContext } from '../App';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const ExamList: React.FC = () => {
  const [examItems, setExamItems] = useState<any[]>([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await exams.getAll();
        setExamItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const getStatus = (start: string, end: string) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    if (now < s) return { label: 'Scheduled', color: 'bg-cyber-500/10 text-cyber-400 border-cyber-500/20' };
    if (now > e) return { label: 'Concluded', color: 'bg-white/5 text-gray-500 border-white/10' };
    return { label: 'Active Now', color: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30 animate-pulse' };
  };

  const filteredExams = examItems.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
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
              <Sparkles className="w-3.5 h-3.5 text-neon-blue" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Quiz Intelligence Gallery</span>
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
              Live <span className="text-gradient">Challenges</span>
           </h1>
           <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-70">
              Battle for supremacy in real-time. Join active quiz sessions or review concluded results.
           </p>
        </div>

        <TemplateNav />

        {/* Search Bar - Pulse Themed */}
        <div className="max-w-2xl mx-auto mb-16 px-4">
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 group-focus-within:text-neon-blue transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search by quiz title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-6 py-5 bg-[#11131a]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] focus:ring-2 focus:ring-neon-blue/40 focus:border-neon-blue/40 text-white placeholder-gray-600 transition-all outline-none"
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
              <Link to="/exams/create" className="block h-full">
                <div className="h-full glass-card rounded-[2.5rem] p-8 border-2 border-dashed border-white/20 hover:border-neon-blue bg-white/5 hover:bg-neon-blue/10 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] shadow-2xl relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-neon-blue/20 group-hover:border-neon-blue group-hover:shadow-[0_0_40px_rgba(14,165,233,0.3)] transition-all">
                    <span className="text-5xl font-light text-neon-blue leading-none mb-2">+</span>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight group-hover:text-neon-blue transition-colors text-center">Create New Quiz</h3>
                  <p className="text-gray-500 text-sm mt-4 font-bold uppercase tracking-widest text-center">Launch new intelligence session</p>
                </div>
              </Link>
            </motion.div>
          )}
          {filteredExams.map((exam, i) => {
            const status = getStatus(exam.startTime, exam.endTime);
            return (
              <motion.div 
                key={exam._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <Link to={`/exams/${exam._id}`} className="block h-full">
                  <div className="h-full glass-card rounded-[2.5rem] p-8 border border-white/5 group-hover:border-white/20 transition-all duration-500 relative overflow-hidden flex flex-col shadow-2xl">
                    {/* Header: Status & Icon */}
                    <div className="flex justify-between items-center mb-8 relative z-10">
                       <div className={cx(
                         "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                         status.color
                       )}>
                         {status.label}
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-neon-blue transition-colors">
                          <Trophy className="w-4 h-4" />
                       </div>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:translate-x-1 transition-transform leading-tight">
                      {exam.title}
                    </h3>
                    
                    <div className="space-y-4 mb-8 flex-grow">
                      <div className="flex items-center gap-3 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold">{format(new Date(exam.startTime), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold">
                           {format(new Date(exam.startTime), 'p')} - {format(new Date(exam.endTime), 'p')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-cyber-400">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">{exam.questions.length} Metrics Defined</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                       <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Open Challenge</span>
                       </div>
                       <div className="flex items-center gap-1 text-neon-blue group/link">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Enter Room</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>

                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-500/5 blur-3xl pointer-events-none group-hover:bg-cyber-500/10 transition-colors"></div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          
          {filteredExams.length === 0 && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full py-24 text-center glass-card rounded-[3rem] border border-white/5 border-dashed bg-white/5"
            >
              <div className="inline-flex p-6 bg-white/5 rounded-full mb-6">
                <FileText className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">The arena is silent.</h3>
              <p className="text-gray-500 font-medium">No quiz sessions found. Try a different query or start a new challenge.</p>
              <Link to="/exams/create" className="mt-8 inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
                 <Zap className="w-4 h-4" /> Launch First Session
              </Link>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default ExamList;
