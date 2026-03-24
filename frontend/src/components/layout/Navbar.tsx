import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Layers, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300">
      <div className="container mx-auto">
        <div className="glass rounded-2xl px-6 py-3 flex justify-between items-center max-w-7xl mx-auto">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-tr from-cyber-500 to-neon-pink p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyber-500/30">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                Pulse
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {!isHome && (
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
                Explore
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-medium">Welcome</span>
                    <span className="text-sm font-bold text-white leading-tight">{user.username}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-600 to-neon-purple p-[2px]">
                    <div className="w-full h-full bg-dark-surface rounded-[10px] flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-neon-pink p-2 rounded-lg hover:bg-white/5 transition-all" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign in</Link>
                <Link to="/register" className="text-sm font-bold bg-gradient-to-r from-cyber-600 to-neon-purple text-white px-5 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
