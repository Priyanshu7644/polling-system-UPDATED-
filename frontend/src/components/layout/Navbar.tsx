import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { LogOut, User as UserIcon, Activity, Menu, X, Home, PlusCircle, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
      if (window.scrollY <= 80) setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100]">
      <AnimatePresence mode="wait">
        {!isScrolled ? (
          <motion.div 
            key="wide-nav"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="px-4 py-4"
          >
            <div className="container mx-auto">
              <div className="glass rounded-[2rem] px-8 py-4 flex justify-between items-center max-w-7xl mx-auto border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="bg-gradient-to-tr from-cyber-500 to-neon-pink p-1 rounded-xl group-hover:scale-110 transition-transform duration-300 w-10 h-10 flex items-center justify-center relative shadow-lg shadow-cyber-500/20">
                    <Activity className="w-5 h-5 text-white relative z-10" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter text-white uppercase italic">Pulse</span>
                </Link>

                <div className="flex items-center space-x-6">
                  {user ? (
                    <>
                       <div className="hidden md:flex flex-col items-end">
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] leading-none mb-1">Authenticated Node</span>
                          <span className="text-sm font-black text-cyber-500 uppercase italic">{user.username}</span>
                       </div>
                       <Link to="/profile" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyber-500 hover:text-black transition-all">
                          <UserIcon className="w-5 h-5" />
                       </Link>
                       <button onClick={handleLogout} className="text-gray-500 hover:text-neon-pink transition-colors"><LogOut className="w-5 h-5" /></button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-6">
                      <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white">Sign In</Link>
                      <Link to="/register" className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10">Enlist</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="compact-nav"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed top-6 left-6 flex flex-col items-start gap-4 z-[110]"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* The Metamorphic Hub Button (Top-Left, Auto-Opens on Hover) */}
            <div className="w-14 h-14 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center group relative shadow-2xl overflow-hidden cursor-pointer hover:scale-110 active:scale-95 transition-all">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyber-500/10 to-neon-pink/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isOpen ? <X className="w-6 h-6 text-white z-10" /> : <Menu className="w-6 h-6 text-white z-10" />}
            </div>

            {/* Neural Menu Nodes (Vertical Stack with Isolated Stretching) */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex flex-col gap-2.5 p-1"
                >
                   {[
                     { to: "/", icon: Home, label: "Home Hub", color: "hover:bg-cyber-500 hover:text-black", show: true },
                     { to: "/create", icon: PlusCircle, label: "Initialize", color: "hover:bg-neon-pink hover:text-white", show: !!user },
                     { to: "/analytics", icon: LayoutDashboard, label: "Analytics", color: "hover:bg-sky-500 hover:text-black", show: !!user },
                     { to: "/profile", icon: UserIcon, label: "Profile", color: "hover:bg-white hover:text-black", show: !!user },
                     { onClick: handleLogout, icon: LogOut, label: "Disconnect", color: "hover:bg-red-500 hover:text-white", show: !!user },
                     { to: "/login", icon: Activity, label: "Sign In", color: "hover:bg-white hover:text-black", show: !user }
                   ].filter(item => item.show).map((item, idx) => {
                      const Tag = (item.to ? Link : 'button') as any;
                      return (
                        <Tag 
                          key={idx}
                          to={item.to}
                          onClick={() => { if (item.onClick) item.onClick(); setIsOpen(false); }}
                          className={`group flex items-center gap-0 hover:gap-4 w-12 hover:w-44 h-12 rounded-2xl bg-black/80 backdrop-blur-3xl border border-white/10 transition-all duration-300 px-[14px] overflow-hidden whitespace-nowrap relative shadow-2xl ${item.color}`}
                        >
                           <item.icon className="w-5 h-5 shrink-0" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             {item.label}
                           </span>
                        </Tag>
                      );
                   })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
