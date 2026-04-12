import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

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

export const AuthContext = React.createContext<{
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;
}>({ user: null, setUser: () => { }, logout: () => { } });

function App() {
  const [user, setUser] = React.useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

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
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent user={user} />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

function AppContent({ user }: { user: any }) {
  const location = useLocation();
  const isExamSession = location.pathname.endsWith('/take') || location.pathname.endsWith('/proctor-mobile') || location.pathname === '/connect';

  return (
    <div className="min-h-screen text-gray-100 font-sans relative">
      {/* Macro Neural Spotlight (跟随系统鼠标) */}
      <div 
        className="fixed inset-0 pointer-events-none z-[0] opacity-20"
        style={{
          background: `radial-gradient(circle 800px at var(--mouse-x) var(--mouse-y), rgba(45, 212, 191, 0.1), rgba(14, 165, 233, 0.05), transparent 80%)`
        }}
      />
      
      <div className="mesh-bg"></div>

      {!isExamSession && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyber-500/20 rounded-full mix-blend-screen filter blur-[100px] z-[-1]"></div>
          <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full mix-blend-screen filter blur-[100px] z-[-1]"></div>
          <div className="fixed -bottom-32 left-1/3 w-96 h-96 bg-neon-blue/20 rounded-full mix-blend-screen filter blur-[100px] z-[-1]"></div>
        </>
      )}

      {!isExamSession && <Navbar />}

      <main className={cx(
        "container mx-auto px-4 relative z-10",
        isExamSession ? "py-0 pt-0" : "py-8 pt-24"
      )}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/create" element={user ? <CreatePoll /> : <Navigate to="/login" />} />
          <Route path="/poll/:id" element={<PollDetail />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/exams" element={<Navigate to="/" />} />
          <Route path="/exams/create" element={user ? <CreateExam /> : <Navigate to="/login" />} />
          <Route path="/exams/:id" element={<ExamDetails />} />
          <Route path="/exams/:id/take" element={user ? <ExamTaker /> : <Navigate to="/login" />} />
          <Route path="/exams/:id/proctor-mobile" element={<ProctorMobile />} />
          <Route path="/connect" element={<ConnectDevice />} />
          <Route path="/surveys" element={<Navigate to="/" />} />
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
