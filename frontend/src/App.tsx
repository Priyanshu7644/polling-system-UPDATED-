import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';
import ExamList from './pages/ExamList';
import CreateExam from './pages/CreateExam';
import ExamDetails from './pages/ExamDetails';
import ExamTaker from './pages/ExamTaker';
import SurveyList from './pages/SurveyList';
import CreateSurvey from './pages/CreateSurvey';
import SurveyTaker from './pages/SurveyTaker';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import PollAnalytics from './pages/PollAnalytics';

export const AuthContext = React.createContext<{
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;
}>({ user: null, setUser: () => {}, logout: () => {} });

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

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen text-gray-100 font-sans relative">
          {/* Animated Background Mesh */}
          <div className="mesh-bg"></div>
          
          {/* Floating Blobs for extra atmospheric effect */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyber-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob z-[-1]"></div>
          <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 z-[-1]"></div>
          <div className="fixed -bottom-32 left-1/3 w-96 h-96 bg-neon-blue/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 z-[-1]"></div>

          <Navbar />
          <main className="container mx-auto px-4 py-8 relative z-10 pt-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/create" element={user ? <CreatePoll /> : <Navigate to="/login" />} />
              <Route path="/poll/:id" element={<PollDetail />} />
              <Route path="/exams" element={<ExamList />} />
              <Route path="/exams/create" element={user ? <CreateExam /> : <Navigate to="/login" />} />
              <Route path="/exams/:id" element={<ExamDetails />} />
              <Route path="/exams/:id/take" element={user ? <ExamTaker /> : <Navigate to="/login" />} />
              <Route path="/surveys" element={<SurveyList />} />
              <Route path="/surveys/create" element={user ? <CreateSurvey /> : <Navigate to="/login" />} />
              <Route path="/surveys/:id" element={user ? <SurveyTaker /> : <Navigate to="/login" />} />
              <Route path="/analytics" element={user ? <AnalyticsDashboard /> : <Navigate to="/login" />} />
              <Route path="/poll/:id/analytics" element={user ? <PollAnalytics /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
