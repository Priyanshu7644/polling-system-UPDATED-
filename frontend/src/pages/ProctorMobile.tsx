import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProctoring } from '../hooks/useProctoring';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ProctorMobile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { localVideoRef } = useProctoring(id as string, true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the camera is allowed
    const timer = setTimeout(() => {
      if (!localVideoRef.current?.srcObject) {
        setError("Camera not detected or permission denied.");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [localVideoRef]);

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md glass-card rounded-[3rem] p-8 border border-white/10 shadow-3xl flex flex-col items-center text-center">
        <h1 className="text-2xl font-black uppercase text-cyber-500 mb-2">Proctoring Active</h1>
        <p className="text-sm text-gray-400 mb-8">This device is securely streaming environment telemetry to the primary exam console.</p>
        
        {error ? (
          <div className="flex flex-col items-center p-6 bg-red-500/10 border border-red-500/20 rounded-2xl w-full">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <span className="text-red-400 font-bold">{error}</span>
            <p className="text-xs text-gray-400 mt-2">Please ensure you have granted camera permissions to this site.</p>
          </div>
        ) : (
          <div className="relative w-full rounded-[2rem] overflow-hidden border-2 border-neon-blue bg-black">
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md">
               <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Stream</span>
            </div>
            
            <video 
              ref={localVideoRef as any}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-80 object-cover" 
            />
            
            <div className="absolute inset-0 pointer-events-none rounded-[2rem] border-4 border-neon-blue/30 scale-[0.98] opacity-50"></div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-neon-blue" />
          <span className="font-bold text-gray-300">Connection Secured with Socket.io</span>
        </div>
      </div>
    </div>
  );
};

export default ProctorMobile;
