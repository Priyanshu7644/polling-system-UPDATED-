import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext, ThemeContext } from '../../App';
import { 
  LogOut, User as UserIcon, Activity, Menu, X, 
  Sun, Moon, Zap, BookOpen, ClipboardList, BarChart3, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Polls', path: '/polls', icon: Zap, active: location.pathname === '/polls' },
    { name: 'Exams', path: '/exams', icon: BookOpen, active: location.pathname.startsWith('/exams') },
    { name: 'Surveys', path: '/surveys', icon: ClipboardList, active: location.pathname.startsWith('/surveys') },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, active: location.pathname === '/analytics' },
  ];

  return (
    <header className="relative w-full z-40 px-3 sm:px-6 py-5 pointer-events-auto transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="pro-card rounded-[2.2rem] px-5 sm:px-7 py-3 flex justify-between items-center shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="bg-gradient-to-tr from-[#ff4500] via-[#ff2a4b] to-[#e6005c] p-[1.5px] rounded-2xl group-hover:scale-105 transition-all duration-300 shadow-md shadow-[#ff4500]/25">
              <div className="bg-white dark:bg-slate-950 rounded-[14px] w-9 h-9 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#ff4500] dark:text-[#ff6233]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white uppercase italic flex items-center gap-1">
                Pulse
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-full border border-slate-200/70 dark:border-white/10 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    link.active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.active ? 'text-white' : 'text-brand-500 dark:text-brand-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/40 transition-all shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {user ? (
              /* Sleek User Profile Dropdown Menu */
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all shadow-sm group"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    {user.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">{user.username}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.username}</p>
                        <p className="text-[10px] font-medium text-slate-400 truncate">{user.email || 'Logged In Account'}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-500" />
                        <span>My Profile</span>
                      </Link>

                      <button
                        onClick={() => { setShowUserMenu(false); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-3 pro-card rounded-3xl p-4 border border-slate-200 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl flex flex-col gap-2"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                      link.active
                        ? 'bg-brand-600 text-white font-black'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}

              {user && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2 mt-1">
                  <Link
                    to="/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10"
                  >
                    <Zap className="w-4 h-4" /> Create Poll
                  </Link>
                  <Link
                    to="/exams/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                  >
                    <BookOpen className="w-4 h-4" /> Create Exam
                  </Link>
                  <Link
                    to="/surveys/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  >
                    <ClipboardList className="w-4 h-4" /> Create Survey
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
