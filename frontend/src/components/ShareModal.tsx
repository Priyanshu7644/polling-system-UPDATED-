import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, url }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('share-qr');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-bg/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-3xl overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-pink/10 blur-[80px] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Share2 className="w-6 h-6 text-neon-blue" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Share Experience</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                >
                  <X className="w-6 h-6 text-gray-500 group-hover:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* QR Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG 
                      id="share-qr"
                      value={url} 
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <button 
                    onClick={downloadQR}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest"
                  >
                    <Download className="w-3.5 h-3.5" /> Download QR
                  </button>
                </div>

                {/* Info & Action Section */}
                <div className="space-y-6 text-center md:text-left">
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Entity Title</div>
                    <div className="text-xl font-bold text-white leading-tight">{title}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sharable Link</div>
                    <div className="relative group">
                       <input 
                         type="text" 
                         readOnly
                         value={url}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-400 focus:outline-none"
                       />
                       <button 
                         onClick={handleCopy}
                         className="absolute right-2 top-1.5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                       >
                         {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                       </button>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => window.open(url, '_blank')}
                      className="flex-1 px-4 py-3 bg-neon-blue text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Direct
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-5 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em] leading-relaxed text-center">
                  Pulse utilizes encrypted protocols for all data transmission. Share responsibly within your secure synchronized environments.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
