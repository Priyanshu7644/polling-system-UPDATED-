import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Zap, Activity, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HOSTNAME = window.location.hostname;
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${HOSTNAME}:5000`;

const ConnectDevice: React.FC = () => {
   const [code, setCode] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const navigate = useNavigate();

   const handleConnect = (e: React.FormEvent) => {
      e.preventDefault();
      if (code.length !== 6) return setError('Code must be 6 characters');
      
      setLoading(true);
      setError('');

      const socket = io(SOCKET_URL);
      
      socket.on('connect', () => {
         socket.emit('join-via-code', { code: code.toUpperCase() });
      });

      socket.on('code-accepted', (roomId: string) => {
         socket.disconnect();
         navigate(`/exams/${roomId}/proctor-mobile`);
      });

      socket.on('code-rejected', () => {
         socket.disconnect();
         setError('Invalid or expired pairing code');
         setLoading(false);
      });

      setTimeout(() => {
         if (loading) {
            socket.disconnect();
            setError('Connection timed out');
            setLoading(false);
         }
      }, 5000);
   };

   return (
      <div className="min-h-screen bg-dark-bg text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/10 blur-[100px] pointer-events-none rounded-full"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber-500/10 blur-[100px] pointer-events-none rounded-full"></div>
         
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md glass-card rounded-[3rem] p-10 border border-white/10 shadow-3xl text-center relative z-10"
         >
            <div className="w-20 h-20 bg-gradient-to-br from-neon-pink to-cyber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_#db277744]">
               <Activity className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Connect Device</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-10">Enter pairing code from primary device</p>
            
            <form onSubmit={handleConnect} className="space-y-6">
               <div>
                  <input 
                     type="text" 
                     value={code}
                     onChange={(e) => { setCode(e.target.value); setError(''); }}
                     maxLength={6}
                     placeholder="6-DIGIT CODE"
                     className="w-full bg-black/50 border-2 border-white/10 rounded-2xl p-6 text-center text-3xl font-mono font-black text-white uppercase tracking-[0.3em] focus:outline-none focus:border-neon-pink transition-colors shadow-inner"
                  />
               </div>
               
               <AnimatePresence>
                  {error && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                     >
                        <AlertCircle className="w-4 h-4" /> {error}
                     </motion.div>
                  )}
               </AnimatePresence>

               <button 
                  type="submit" 
                  disabled={loading || code.length !== 6}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
               >
                  {loading ? 'Verifying...' : <><Zap className="w-4 h-4" /> Initialize Camera</>}
               </button>
            </form>
         </motion.div>
      </div>
   );
};

export default ConnectDevice;
