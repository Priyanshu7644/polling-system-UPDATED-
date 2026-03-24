import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Twitter, 
  Linkedin, 
  Send as SendIcon, 
  Code,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollTitle: string;
  pollId: string;
}

export default function ShareModal({ isOpen, onClose, pollTitle, pollId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const shareUrl = `${window.location.origin}/poll/${pollId}`;
  
  const embedCode = `<iframe src="${window.location.origin}/poll/${pollId}" width="100%" height="400px" frameborder="0"></iframe>`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const socialShares = [
    { 
      name: 'TW', 
      icon: <Twitter className="w-4 h-4" />, 
      color: 'bg-[#1DA1F2]',
      url: `https://twitter.com/intent/tweet?text=Check out this poll: ${pollTitle}&url=${encodeURIComponent(shareUrl)}`
    },
    { 
      name: 'LI', 
      icon: <Linkedin className="w-4 h-4" />, 
      color: 'bg-[#0077B5]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    { 
      name: 'WA', 
      icon: <SendIcon className="w-4 h-4" />, 
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(`${pollTitle} - ${shareUrl}`)}`
    }
  ];

  const modalRoot = document.body;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm relative z-10"
          >
            <div className="glass-card rounded-[2rem] border border-white/10 p-5 lg:p-6 shadow-3xl relative overflow-hidden">
              {/* Subtle Pulse Accent */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyber-500/5 blur-[40px] rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <Share2 className="text-cyber-500 w-5 h-5" />
                  <h2 className="text-lg font-black text-white tracking-tight">Share Poll</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* QR Code Section - More Compact */}
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                  <div className="bg-white p-2.5 rounded-xl mb-2.5 shadow-xl">
                    <QRCodeSVG 
                      value={shareUrl} 
                      size={120}
                      level="M"
                    />
                  </div>
                  <p className="text-[9px] font-black text-cyber-500 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                    <QrCode className="w-3 h-3" /> Quick Access
                  </p>
                </div>

                {/* Link Section */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-[11px] text-gray-400 font-medium truncate self-center">
                      {shareUrl}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(shareUrl)}
                      className="bg-cyber-500 hover:bg-cyber-400 text-black px-3.5 py-2 rounded-xl font-black text-[11px] transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="grid grid-cols-3 gap-2">
                  {socialShares.map((social) => (
                    <a 
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl ${social.color} text-white hover:brightness-110 transition-all font-bold group active:scale-95`}
                    >
                      {social.icon}
                      <span className="text-[9px] tracking-tight">{social.name}</span>
                    </a>
                  ))}
                </div>

                {/* Embed Section */}
                <div className="pt-3 border-t border-white/5">
                  <button 
                    onClick={() => setShowEmbed(!showEmbed)}
                    className="w-full flex items-center justify-between text-gray-500 hover:text-white transition-colors group"
                  >
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2">
                        <Code className="w-3.5 h-3.5" /> Embed Link
                      </span>
                      <motion.div animate={{ rotate: showEmbed ? 180 : 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </motion.div>
                  </button>

                  <AnimatePresence>
                      {showEmbed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2.5"
                        >
                            <div className="relative">
                              <textarea 
                                readOnly
                                value={embedCode}
                                className="w-full h-14 bg-black/40 border border-white/10 rounded-xl p-3 text-[9px] font-mono text-cyber-500 focus:outline-none resize-none cursor-pointer"
                                onClick={() => {
                                  copyToClipboard(embedCode);
                                }}
                              />
                              <div className="absolute bottom-1.5 right-1.5 text-[8px] text-gray-600 font-bold uppercase tracking-tighter pointer-events-none">Click to copy</div>
                            </div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, modalRoot);
}
