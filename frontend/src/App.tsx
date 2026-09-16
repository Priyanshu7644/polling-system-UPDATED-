import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';
import CreateExam from './pages/CreateExam';
import ExamDetails from './pages/ExamDetails';
import ExamTaker from './pages/ExamTaker';
import CreateSurvey from './pages/CreateSurvey';
import SurveyTaker from './pages/SurveyTaker';
import Verify from './pages/Verify';
import Profile from './pages/Profile';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import PollAnalytics from './pages/PollAnalytics';
import SurveyAnalytics from './pages/SurveyAnalytics';
import ForgotPassword from './pages/ForgotPassword';
import ProctorMobile from './pages/ProctorMobile';
import ConnectDevice from './pages/ConnectDevice';

import Exams from './pages/Exams';
import Surveys from './pages/Surveys';
import Polls from './pages/Polls';

export const AuthContext = React.createContext<{
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;
}>({ user: null, setUser: () => { }, logout: () => { } });

export const ThemeContext = React.createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => { } });

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function GlobalScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          title="Scroll back to top"
          className="fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/20"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('pulse_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, setUser, logout }}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTopOnNavigate />
          <AppContent user={user} />
          <GlobalScrollToTop />
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

function AppContent({ user }: { user: any }) {
  const location = useLocation();
  const isExamSession = location.pathname.endsWith('/take') || location.pathname.endsWith('/proctor-mobile') || location.pathname === '/connect';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname.startsWith('/verify');

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans relative selection:bg-brand-500/20 selection:text-brand-500 transition-colors duration-300">
      {/* Background Mesh Layer */}
      <div className="mesh-bg"></div>

      {!isExamSession && !isAuthPage && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] opacity-50 dark:opacity-70">
          <div className="absolute -top-24 left-1/4 w-[500px] h-[350px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full filter blur-[100px] animate-blob"></div>
          <div className="absolute top-1/3 -right-20 w-[450px] h-[400px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full filter blur-[110px] animate-blob" style={{ animationDelay: '3s' }}></div>
        </div>
      )}

      {!isExamSession && !isAuthPage && <Navbar />}

      <main className={cx(
        "relative z-10",
        (isExamSession || isAuthPage) ? "p-0 m-0 w-full" : "container mx-auto px-4 py-2 sm:py-3"
      )}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/create" element={user ? <CreatePoll /> : <Navigate to="/login" />} />
          <Route path="/poll/:id" element={<PollDetail />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/exams/create" element={user ? <CreateExam /> : <Navigate to="/login" />} />
          <Route path="/exams/:id" element={<ExamDetails />} />
          <Route path="/exams/:id/take" element={user ? <ExamTaker /> : <Navigate to="/login" />} />
          <Route path="/exams/:id/proctor-mobile" element={<ProctorMobile />} />
          <Route path="/connect" element={<ConnectDevice />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/surveys/create" element={user ? <CreateSurvey /> : <Navigate to="/login" />} />
          <Route path="/surveys/:id" element={user ? <SurveyTaker /> : <Navigate to="/login" />} />
          <Route path="/surveys/:id/results" element={user ? <SurveyAnalytics /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={user ? <AnalyticsDashboard /> : <Navigate to="/login" />} />
          <Route path="/poll/:id/analytics" element={user ? <PollAnalytics /> : <Navigate to="/login" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
