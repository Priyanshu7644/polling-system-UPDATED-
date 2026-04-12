import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { AuthContext } from '../App';
import { MessageSquare, Send, Edit2, X, Check, ThumbsUp, Trash2, Reply, BarChart3, Share2, ShieldCheck, Cpu } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import ShareModal from '../components/poll/ShareModal';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function PollDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editOptions, setEditOptions] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const socket: Socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    const fetchData = async () => {
      try {
        const [pollRes, commentsRes] = await Promise.all([
          api.get(`/polls/${id}`),
          api.get(`/comments/${id}`)
        ]);
        
        let voteRes = null;
        if (localStorage.getItem('token')) {
          voteRes = await api.get(`/polls/${id}/my-vote`).catch(() => null);
        }

        setPoll(pollRes.data);
        setEditTitle(pollRes.data.title);
        setEditDesc(pollRes.data.description || '');
        setEditOptions(pollRes.data.options || []);
        setComments(commentsRes.data);
        setLoading(false);

        if (voteRes?.data?.voted) {
          setHasVoted(true);
          setSelectedOption(voteRes.data.optionId);
          setVotedOptionId(voteRes.data.optionId);
        }
        
        socket.on(`pollUpdate:${id}`, (updatedPoll) => {
          setPoll(updatedPoll);
        });

        socket.on(`newComment:${id}`, (comment) => {
          setComments((prev) => [comment, ...prev]);
        });

        socket.on(`commentUpdated:${id}`, (updatedComment) => {
          setComments((prev) => prev.map(c => c._id === updatedComment._id ? updatedComment : c));
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load poll');
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }
    try {
      setError('');
      await api.post(`/polls/${id}/vote`, { optionId: selectedOption });
      setHasVoted(true);
      setVotedOptionId(selectedOption);
      setShowVoteSuccess(true);
      
      // Redirect to specific poll analytics after a longer delay for animation feedback
      setTimeout(() => {
        navigate(`/poll/${id}/analytics`);
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to vote. Have you already voted?');
    }
  };

  const handleComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const text = parentId ? editCommentText : newComment;
    if (!text.trim()) return;
    
    try {
      await api.post(`/comments/${id}`, { text, parentId });
      if (parentId) {
        setReplyingTo(null);
        setEditCommentText('');
      } else {
        setNewComment('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post comment');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return setError('Must be logged in to like');
    try {
      await api.put(`/comments/action/${commentId}/like`);
    } catch (err: any) {
      setError('Failed to like comment');
    }
  };

  const handleEditCommentSubmit = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    try {
      await api.put(`/comments/action/${commentId}`, { text: editCommentText });
      setEditingComment(null);
      setEditCommentText('');
    } catch (err: any) {
      setError('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/action/${commentId}`);
    } catch (err: any) {
      setError('Failed to delete comment');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const validOptions = editOptions.filter(opt => opt.text.trim() !== '');
      const res = await api.put(`/polls/${id}`, { title: editTitle, description: editDesc, options: validOptions });
      setPoll(res.data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update poll');
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-6">
      <div className="w-48 h-48 relative flex items-center justify-center">
         <div className="absolute inset-0 bg-cyber-500/20 blur-[40px] rounded-full animate-pulse"></div>
         <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className="relative z-10"
         >
           <Cpu className="w-16 h-16 text-cyber-500" />
         </motion.div>
      </div>
      <p className="text-[10px] font-black text-cyber-500 uppercase tracking-[0.5em] animate-pulse">Synchronizing Neural Data...</p>
    </div>
  );
  
  if (!poll) return <div className="text-center py-20 text-red-400 font-bold bg-white/5 mx-auto max-w-md rounded-xl backdrop-blur-md">{error || 'Poll not found'}</div>;

  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
  const highestVotes = Math.max(...poll.options.map((o: any) => o.votes));

  const renderComments = (parentId: string | null = null, depth: number = 0): JSX.Element[] | null => {
    const thread = comments.filter((c: any) => (c.parentId || null) === parentId);
    if (!thread.length) return null;

    return thread.map((comment: any, i: number) => (
      <div key={comment._id} className={cx("flex flex-col w-full", depth > 0 ? "ml-4 mt-3 border-l border-white/10 pl-3 md:ml-6 md:pl-4" : "")}>
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', delay: i < 5 ? i * 0.05 : 0 }}
          className={cx("bg-dark-surface/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors", depth > 0 ? "p-3" : "p-4")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={cx("rounded-full bg-cyber-900 flex items-center justify-center font-bold text-cyber-400 ring-1 ring-cyber-500/30", depth > 0 ? "w-5 h-5 text-[9px]" : "w-6 h-6 text-[10px]")}>
              {comment.user.username.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-sm text-gray-200">{comment.user.username}</span>
            {poll.creator?._id === comment.user._id && (
              <span className="text-[10px] font-black tracking-wider text-neon-pink bg-neon-pink/10 px-1.5 py-0.5 rounded-full uppercase">Creator</span>
            )}
            <span className="text-[10px] text-gray-500 ml-auto flex items-center gap-1">
              {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              {comment.isEdited && <span className="italic">(edited)</span>}
            </span>
          </div>

          {editingComment === comment._id ? (
            <div className="mt-2 text-right">
              <input 
                 autoFocus
                 className="w-full bg-dark-bg border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyber-500 mb-2"
                 value={editCommentText}
                 onChange={e => setEditCommentText(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') handleEditCommentSubmit(comment._id);
                   if (e.key === 'Escape') setEditingComment(null);
                 }}
              />
              <button 
                onClick={() => setEditingComment(null)} 
                className="text-xs text-gray-500 hover:text-white mr-3 font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleEditCommentSubmit(comment._id)} 
                className="text-xs text-cyber-400 hover:text-cyber-300 font-bold bg-cyber-500/10 px-3 py-1.5 rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <p className={cx("text-sm leading-relaxed", comment.isDeleted ? "text-gray-500 italic" : "text-gray-400")}>
              {comment.text}
            </p>
          )}

          {!comment.isDeleted && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 relative">
              <button 
                onClick={() => handleLikeComment(comment._id)} 
                className={cx("flex items-center gap-1.5 text-xs font-semibold transition-colors", comment.likes?.includes(user?.id) ? "text-neon-pink" : "text-gray-500 hover:text-white")}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes?.length || 0}
              </button>
              
              {depth < 3 && user && ( // Limit nesting depth visually to 3
                <button 
                  onClick={() => { 
                    setReplyingTo(replyingTo === comment._id ? null : comment._id); 
                    setEditCommentText(''); 
                    setEditingComment(null); 
                  }} 
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-white transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" /> Reply
                </button>
              )}

              {user?.id === comment.user._id && (
                <div className="ml-auto flex gap-3 text-gray-500">
                  <button 
                    onClick={() => { setEditingComment(comment._id); setEditCommentText(comment.text); setReplyingTo(null); }} 
                    className="hover:text-cyber-400 transition-colors"
                    title="Edit Comment"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDeleteComment(comment._id)} 
                    className="hover:text-red-400 transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <div className="mt-4 pt-3 border-t border-white/5">
               <form onSubmit={(e) => handleComment(e, comment._id)} className="relative flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyber-900 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-cyber-400 ring-1 ring-cyber-500/30">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      autoFocus
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      placeholder={`Replying to ${comment.user.username}...`}
                      className="w-full pl-3 pr-10 py-2 bg-dark-bg/80 border border-white/10 rounded-xl focus:ring-1 focus:ring-cyber-500 text-xs text-white placeholder-gray-600 outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      disabled={!editCommentText.trim()}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-cyber-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
               </form>
            </div>
          )}
        </motion.div>

        {/* Recursively render replies */}
        <div className="flex flex-col gap-2 mt-2">
          {renderComments(comment._id, depth + 1)}
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 relative">
      
      {/* Vote Success Overlay */}
      <AnimatePresence>
        {showVoteSuccess && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
             <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-8 relative flex items-center justify-center">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: [0, 1.5, 1] }}
                     className="absolute inset-0 bg-white/10 blur-[80px] rounded-full"
                   />
                   <motion.div
                     initial={{ scale: 0, rotate: -45 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ type: "spring", damping: 10 }}
                     className="relative z-10"
                   >
                     <ShieldCheck className="w-32 h-32 text-white" />
                   </motion.div>
                </div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Vote Decrypted</h2>
                <p className="text-cyber-400 font-bold text-[10px] uppercase tracking-[0.4em]">Neural Link Established</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Column: Poll Voting */}
      <div className="lg:col-span-2">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glow-border rounded-3xl h-full"
        >
          <div className="glass-card rounded-3xl p-8 md:p-10 h-full relative overflow-hidden flex flex-col">
            {/* BG ambient flare */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex-grow">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-gray-300 tracking-wider uppercase mb-4 shadow-sm border border-white/5">
                  Live Pulse
                </span>
                
                {isEditing ? (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-xs font-bold text-cyber-400 uppercase tracking-wider mb-2 block">Poll Title</label>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full text-3xl md:text-5xl font-black bg-dark-bg/50 border border-cyber-500/50 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-cyber-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-cyber-400 uppercase tracking-wider mb-2 block mt-4">Description</label>
                      <textarea 
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="w-full text-lg bg-dark-bg/50 border border-cyber-500/30 rounded-xl px-4 py-3 text-gray-300 outline-none focus:ring-2 focus:ring-cyber-500 transition-all min-h-[100px]"
                        placeholder="Add an optional description"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-cyber-400 uppercase tracking-wider mb-2 block mt-4">Poll Options</label>
                      <div className="space-y-3">
                        {editOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input 
                              type="text" 
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...editOptions];
                                newOpts[idx].text = e.target.value;
                                setEditOptions(newOpts);
                              }}
                              className="w-full bg-dark-bg/50 border border-white/10 rounded-xl px-4 py-2 text-gray-200 outline-none focus:ring-2 focus:ring-neon-pink transition-all"
                              placeholder={`Option ${idx + 1}`}
                            />
                          </div>
                        ))}
                        <button 
                          onClick={() => setEditOptions([...editOptions, { text: '' }])}
                          className="text-sm font-semibold text-neon-pink hover:text-white transition-colors"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button onClick={handleEditSubmit} className="flex items-center gap-2 bg-cyber-600 hover:bg-cyber-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button onClick={() => { setIsEditing(false); setEditTitle(poll.title); setEditDesc(poll.description || ''); setEditOptions(poll.options); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{poll.title}</h1>
                    {poll.description && <p className="text-gray-400 text-lg mb-6">{poll.description}</p>}
                  </>
                )}
                
                <div className="flex items-center text-sm text-gray-400 space-x-6 border-b border-white/10 pb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-500 to-neon-pink p-[1px]">
                      <div className="w-full h-full bg-dark-surface rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                        {poll.creator?.username?.charAt(0) || '?'}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-200">{poll.creator?.username || 'Anonymous'}</span>
                  </div>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></span>
                    <span>{totalVotes} total votes</span>
                  </span>

                  <button 
                    onClick={() => setShareModalOpen(true)}
                    className="flex items-center gap-2 text-gray-400 hover:text-cyber-400 transition-all font-bold text-xs uppercase tracking-widest bg-white/5 hover:bg-cyber-500/10 px-4 py-2 rounded-xl border border-white/5"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  
                  {user && poll.creator && user.id === poll.creator._id && (
                    <div className="ml-auto flex items-center space-x-3">
                      {!isEditing && (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1.5 text-cyber-400 hover:text-cyber-300 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyber-500/10 hover:bg-cyber-500/20 transition-colors border border-cyber-500/20"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                           if (window.confirm('Are you sure you want to delete this poll?')) {
                             try {
                               await api.delete(`/polls/${id}`);
                               window.location.href = '/';
                             } catch (err) {
                               setError('Failed to delete poll');
                             }
                           }
                        }}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="mt-4 mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm">{error}</div>}

              <div className="space-y-4">
                {poll.options.map((option: any) => {
                  const percentage = totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100;
                  const isWinner = hasVoted && option.votes === highestVotes && highestVotes > 0;
                  const isSelected = selectedOption === option._id;
                  
                  return (
                    <motion.div 
                      key={option._id}
                      layout
                      onClick={() => setSelectedOption(option._id)}
                      className={cx(
                        "relative rounded-2xl overflow-hidden transition-all duration-300 min-h-[4rem] group border border-white/5",
                        isSelected 
                          ? "border-neon-pink bg-neon-pink/10 shadow-[0_0_20px_rgba(244,63,94,0.1)] cursor-pointer" 
                          : "bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                      )}
                    >
                      {/* Spring animated progress bar background */}
                      <motion.div 
                        className={cx(
                          "absolute top-0 left-0 h-full z-0",
                          isWinner ? "bg-gradient-to-r from-neon-blue/40 to-neon-purple/40" : "bg-white/10"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: hasVoted ? `${percentage}%` : '0%' }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 p-4 md:px-6 flex justify-between items-center h-full min-h-[4rem]">
                        <div className="flex items-center space-x-4 w-2/3">
                          <div className={cx(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                            isSelected ? "border-neon-pink bg-neon-pink/20" : "border-gray-500 group-hover:border-gray-400"
                          )}>
                            {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 rounded-full bg-neon-pink" />}
                          </div>
                          <span className={cx(
                            "font-bold text-lg truncate",
                            hasVoted && isWinner ? "text-neon-blue drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "text-gray-200"
                          )}>
                            {option.text}
                          </span>
                        </div>
                        
                        {hasVoted && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-end w-1/3"
                          >
                            <span className={cx(
                              "font-black text-2xl",
                              isWinner ? "text-neon-blue" : "text-gray-400"
                            )}>{percentage.toFixed(1)}%</span>
                            <span className="text-xs text-gray-500 font-medium">{option.votes} votes</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {(!hasVoted || (hasVoted && selectedOption !== votedOptionId)) && (
                <div className="mt-10">
                  {!user ? (
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                      <p className="text-gray-400 font-medium mb-3">Join the community to cast your vote</p>
                      <a href="/login" className="inline-block bg-white text-dark-bg font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors">Sign in to Vote</a>
                    </div>
                  ) : (
                    <button
                      onClick={handleVote}
                      disabled={!selectedOption}
                      className={cx(
                        "w-full py-5 rounded-2xl font-black text-white text-xl transition-all duration-300 transform shadow-xl uppercase tracking-wider",
                        selectedOption ? "bg-gradient-to-r from-cyber-600 to-neon-pink hover:scale-[1.02] hover:shadow-neon-pink/30" : "bg-dark-surface border border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                      )}
                    >
                      {hasVoted ? 'Change Vote' : 'Lock In Vote'}
                    </button>
                  )}
                </div>
              )}

              {hasVoted && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => navigate(`/poll/${id}/analytics`)}
                    className="flex items-center gap-2 text-cyber-400 hover:text-white transition-all font-bold text-sm bg-cyber-500/10 hover:bg-cyber-500/20 px-6 py-3 rounded-xl border border-cyber-500/20"
                  >
                    <BarChart3 className="w-4 h-4" /> View Full Analytics
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Discussion Pipeline */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-1 h-full max-h-[800px] flex flex-col"
      >
        <div className="glass-card rounded-3xl p-6 border border-white/10 h-full flex flex-col relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyber-500/10 blur-[60px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-white/10 pb-4">
            <div className="bg-white/10 p-2 rounded-xl text-cyber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Live Feed</h3>
            <span className="ml-auto bg-dark-bg px-2 py-1 rounded-md text-xs font-bold text-gray-400 border border-white/5">{comments.length}</span>
          </div>
          
          {/* Scrollable Comments Area */}
          <div className="flex-grow overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar mb-6">
            <AnimatePresence>
              <div className="flex flex-col gap-4">
                {renderComments(null, 0)}
              </div>
            </AnimatePresence>
            
            {comments.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 space-y-3">
                <MessageSquare className="w-10 h-10" />
                <p className="text-sm font-medium">Be the first to speak.</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
            {user ? (
              <form onSubmit={handleComment} className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Drop a thought..."
                  className="w-full pl-4 pr-12 py-3 bg-dark-bg/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyber-500 focus:border-transparent text-sm text-white placeholder-gray-600 outline-none backdrop-blur-sm transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cyber-400 hover:text-white hover:bg-cyber-500 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-cyber-400"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="bg-dark-bg/50 border border-white/5 p-3 rounded-xl text-center text-xs text-gray-500">
                Sign in to join the conversation
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {poll && (
        <ShareModal 
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          pollTitle={poll.title}
          pollId={id || ''}
        />
      )}
    </div>
  );
}
