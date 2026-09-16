import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import api, { exams, SOCKET_URL } from '../api';
import { AuthContext } from '../App';
import {
  Zap, BookOpen, ClipboardList, BarChart3, ChevronRight,
  Sparkles, ShieldCheck, Flame, Users, Clock, Award,
  ArrowRight, Activity, ChevronDown
} from 'lucide-react';

export default function Home() {
  const { user } = useContext(AuthContext);

  const [topPolls, setTopPolls] = useState<any[]>([]);
  const [topExams, setTopExams] = useState<any[]>([]);
  const [liveUsers, setLiveUsers] = useState(1);

  useEffect(() => {
    const fetchBestItems = async () => {
      try {
        const [pollsRes, examsRes] = await Promise.all([
          api.get('/polls'),
          exams.getAll()
        ]);

        const sortedPolls = [...pollsRes.data].sort((a, b) => {
          const vA = a.options?.reduce((s: number, o: any) => s + (o.votes || 0), 0) || 0;
          const vB = b.options?.reduce((s: number, o: any) => s + (o.votes || 0), 0) || 0;
          return vB - vA;
        });

        setTopPolls(sortedPolls.slice(0, 2));
        setTopExams(examsRes.data.slice(0, 2));
      } catch (err) {
        console.error('Home data fetch error:', err);
      }
    };

    fetchBestItems();

    const socket: Socket = io(SOCKET_URL);
    socket.on('liveUsers', (count) => setLiveUsers(count));

    return () => {
      socket.disconnect();
    };
  }, []);

  const scrollToModules = () => {
    const element = document.getElementById('hub-modules');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 100% Reliable, HD Unsplash Photos with Fallback Styling
  const HUB_CARDS = [
    {
      title: 'Polls Hub',
      subtitle: 'Real-time consensus & community voting feed',
      path: '/polls',
      badge: 'Hub 01',
      icon: Zap,
      color: 'from-indigo-600 to-purple-600',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      gradientFallback: 'from-amber-950/80 via-rose-950/70 to-slate-950',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85'
    },
    {
      title: 'Exams Hub',
      subtitle: 'AI-proctored test suite & instant gradebook',
      path: '/exams',
      badge: 'Hub 02',
      icon: BookOpen,
      color: 'from-indigo-600 to-purple-600',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      gradientFallback: 'from-indigo-950/80 via-purple-950/70 to-slate-950',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85'
    },
    {
      title: 'Surveys Hub',
      subtitle: 'Multi-question feedback & audience insights',
      path: '/surveys',
      badge: 'Hub 03',
      icon: ClipboardList,
      color: 'from-blue-600 to-sky-600',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      gradientFallback: 'from-blue-950/80 via-sky-950/70 to-slate-950',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85'
    },
    {
      title: 'Analytics Hub',
      subtitle: 'Data visualization, trends & report export',
      path: '/analytics',
      badge: 'Hub 04',
      icon: BarChart3,
      color: 'from-emerald-600 to-teal-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      gradientFallback: 'from-emerald-950/80 via-teal-950/70 to-slate-950',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative space-y-16">

      {/* ========================================================================= */}
      {/* 🚀 1. HERO SPLIT SHOWCASE WITH DOWN SCROLL ARROW                          */}
      {/* ========================================================================= */}
      <div className="pro-card rounded-[2.8rem] overflow-hidden border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#151413] shadow-2xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">

          {/* Left Column: Headline & Call To Actions */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> PULSE 2.0 SUITE
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {liveUsers} Active Nodes
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-6">
                Next-Gen <span className="text-brand-gradient">Consensus & Testing</span> Platform
              </h1>

              <p className="text-slate-600 dark:text-stone-300 text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-xl">
                Create real-time community polls, proctored AI examinations, multi-question audience surveys, and export deep analytical metrics.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/polls"
                  className="btn-primary px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all"
                >
                  <Zap className="w-4 h-4 fill-white" /> Explore All Polls
                </Link>
                <Link
                  to={user ? "/create" : "/register"}
                  className="px-8 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-stone-900 text-slate-900 dark:text-stone-100 border border-slate-200 dark:border-stone-800 hover:border-indigo-500/50 transition-all flex items-center gap-2 shadow-sm"
                >
                  Create Now <ArrowRight className="w-4 h-4 text-indigo-500" />
                </Link>
              </div>
            </div>

            {/* Down Arrow Scroll Button inside Hero */}
            <div className="mt-10 pt-4 flex items-center gap-3 text-slate-500 dark:text-stone-400 text-xs font-extrabold uppercase tracking-widest">
              <button
                onClick={scrollToModules}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group cursor-pointer"
              >
                <span>Scroll Down To Modules</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 flex items-center justify-center shadow-md animate-bounce group-hover:border-indigo-500">
                  <ChevronDown className="w-4 h-4 text-indigo-500" />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Sign-In Inspired Dark Showcase Panel */}
          <div className="lg:col-span-5 relative overflow-hidden min-h-[320px] lg:min-h-full flex items-center justify-center p-8 bg-[#131211]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85"
              alt="PULSE Platform Visual"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-55 dark:opacity-40 transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-[#0c0b0a]/70 to-transparent"></div>

            {/* Floating Sign-In Style Glassmorphism Widgets */}
            <div className="relative z-10 w-full max-w-sm space-y-4">
              <div className="p-5 rounded-2xl bg-stone-950/90 backdrop-blur-2xl border border-stone-800 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Realtime Node Sync
                  </span>
                  <span className="text-[10px] font-bold text-stone-300">Live 100%</span>
                </div>
                <div className="text-sm font-bold truncate mb-2 text-white">What features matter most in web dev?</div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950/90 backdrop-blur-2xl border border-stone-800 text-white shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-400 border border-indigo-500/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase text-white">AI Proctored</div>
                    <div className="text-[10px] text-stone-300 font-medium">Face & Tab Switch Guard</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">Verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🖼️ 2. 4 PRIMARY HUB CARDS WITH 100% RELIABLE IMAGES & FALLBACKS          */}
      {/* ========================================================================= */}
      <div id="hub-modules">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Platform Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mt-1">
            Choose Your <span className="text-brand-gradient">Consensus Hub</span>
          </h2>
          <p className="text-slate-600 dark:text-stone-400 text-sm font-medium max-w-md mx-auto mt-2">
            Click any module below to browse polls, take proctored tests, fill surveys, or analyze data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HUB_CARDS.map((hub, idx) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={hub.path}
                  className="pro-card rounded-[2.2rem] overflow-hidden border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#151413] shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all flex flex-col justify-between group h-full min-h-[340px] relative"
                >
                  {/* Background Artwork Image with Fallback Gradient */}
                  <div className={`absolute inset-0 z-0 overflow-hidden bg-gradient-to-br ${hub.gradientFallback}`}>
                    <img
                      src={hub.image}
                      alt={hub.title}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-60 dark:opacity-45"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-[#0c0b0a]/75 to-transparent"></div>
                  </div>

                  {/* Top Badge & Glowing Icon */}
                  <div className="relative z-10 p-6 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${hub.badgeColor}`}>
                      {hub.badge}
                    </span>
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${hub.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="relative z-10 p-6 pt-2 text-white mt-auto">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                      {hub.title}
                    </h3>
                    <p className="text-xs text-stone-200 dark:text-stone-300 font-medium leading-relaxed mb-4">
                      {hub.subtitle}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-white pt-3 border-t border-white/15 group-hover:text-indigo-400 transition-colors">
                      <span>Open {hub.title}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 3. HIGHLIGHTED BEST POLLS & EXAMS                                      */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <Flame className="w-4 h-4 text-indigo-500" /> Platform Showcase
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mt-1">
              Top Active <span className="text-brand-gradient">Consensus & Tests</span>
            </h2>
          </div>
          <Link to="/polls" className="hidden sm:flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Voted Poll Showcase */}
          {topPolls[0] && (
            <div className="pro-card rounded-[2.5rem] p-7 border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#151413] shadow-lg flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> #1 Voted Poll
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-stone-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  {topPolls[0].options?.reduce((s: number, o: any) => s + (o.votes || 0), 0) || 0} Votes
                </span>
              </div>

              <Link to={`/poll/${topPolls[0]._id}`}>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 hover:text-indigo-500 transition-colors">
                  {topPolls[0].title}
                </h3>
              </Link>

              {/* Progress Bar Preview */}
              <div className="space-y-2 mb-6">
                {topPolls[0].options?.slice(0, 3).map((opt: any, idx: number) => {
                  const total = topPolls[0].options?.reduce((s: number, o: any) => s + (o.votes || 0), 0) || 1;
                  const pct = Math.round((opt.votes / total) * 100);
                  return (
                    <div key={idx} className="relative overflow-hidden bg-slate-100 dark:bg-stone-900 rounded-xl p-2.5">
                      <div className="absolute inset-y-0 left-0 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-xl transition-all" style={{ width: `${pct}%` }}></div>
                      <div className="relative z-10 flex justify-between text-xs font-bold text-slate-800 dark:text-stone-200">
                        <span className="truncate pr-2">{opt.text}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-black">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to={`/poll/${topPolls[0]._id}`}
                className="btn-primary w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25"
              >
                Participate in Vote <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Top Exam Showcase */}
          {topExams[0] && (
            <div className="pro-card rounded-[2.5rem] p-7 border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#151413] shadow-lg flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-500" /> Featured Assessment
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-stone-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {topExams[0].duration} mins
                </span>
              </div>

              <Link to={`/exams/${topExams[0]._id}`}>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3 hover:text-indigo-600 transition-colors">
                  {topExams[0].title}
                </h3>
              </Link>

              <p className="text-xs text-slate-600 dark:text-stone-400 font-medium line-clamp-3 mb-6">
                {topExams[0].description || 'AI-proctored examination with live tab-monitoring and automated scoring.'}
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-stone-400 mb-6 pt-3 border-t border-slate-100 dark:border-stone-800">
                <span>{topExams[0].questions?.length || 0} Multiple Choice Questions</span>
                <span className="text-indigo-600 dark:text-indigo-400">Proctored Node</span>
              </div>

              <Link
                to={`/exams/${topExams[0]._id}/take`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-colors"
              >
                Take Proctored Exam <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 4. CTA FOOTER BANNER (Redesigned Glassmorphism)                       */}
      {/* ========================================================================= */}
      <div className="rounded-[2.5rem] p-8 md:p-12 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 group">

        {/* Ambient Gradient Background Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

        <div className="relative z-10 max-w-2xl text-center lg:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" /> Instant Decision Network
          </div>

          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white leading-none">
            Ready to Launch Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">Consensus?</span>
          </h2>

          <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-stone-400 max-w-lg">
            Create custom polls, proctored examinations, or interactive surveys in under 60 seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Instant Creation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Real-Time Analytics
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Verifiable Nodes
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 shrink-0">
          <Link
            to={user ? "/create" : "/register"}
            className="btn-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center gap-2.5 group/btn hover:scale-[1.02] transition-all"
          >
            <span>Create Now</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/polls"
            className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-800 dark:text-stone-200 border border-slate-200/80 dark:border-white/10 font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all shadow-sm"
          >
            Browse All Polls
          </Link>
        </div>
      </div>



    </div>
  );
}
