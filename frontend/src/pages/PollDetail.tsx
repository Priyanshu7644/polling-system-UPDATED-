import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import api, { SOCKET_URL } from '../api';
import { AuthContext } from '../App';
import { 
  MessageSquare, Send, Edit2, ThumbsUp, Trash2, Reply, 
  BarChart3, Share2, Activity, CheckCircle2, Users
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import ShareModal from '../components/ShareModal';

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL);

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
        setComments(commentsRes.data);
        setLoading(false);

        if (voteRes?.data?.voted) {
          setHasVoted(true);
          setSelectedOption(voteRes.data.optionId);
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
      setShowVoteSuccess(true);
      
      setTimeout(() => {
        setShowVoteSuccess(false);
      }, 2000);
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



  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin shadow-[0_0_20px_rgba(99,102,241,0.4)]"></div>
      <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 animate-pulse">Decrypting Consensus Node...</p>
    </div>
  );
  
  if (!poll) return (
    <div className="text-center py-20 text-rose-500 font-bold bg-rose-50 dark:bg-[#151413] border border-rose-200 dark:border-stone-800 mx-auto max-w-md rounded-3xl shadow-xl">
      {error || 'Poll not found'}
    </div>
  );

  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0);
  const highestVotes = Math.max(...poll.options.map((o: any) => o.votes || 0));

  const renderComments = (parentId: string | null = null, depth: number = 0): JSX.Element[] | null => {
    const thread = comments.filter((c: any) => (c.parentId || null) === parentId);
    if (!thread.length) return null;

    return thread.map((comment: any) => (
      <div key={comment._id} className={cx("flex flex-col w-full", depth > 0 ? "ml-3 mt-2.5 border-l-2 border-indigo-500/20 dark:border-stone-800 pl-3 md:ml-4 md:pl-3.5" : "")}>
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cx(
            "p-4 rounded-2xl transition-all bg-white dark:bg-[#151413]/90 border border-slate-200 dark:border-stone-800 shadow-md hover:border-indigo-500/30",
            depth > 0 ? "p-3 bg-slate-50 dark:bg-[#100f0e]" : ""
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-xs font-black text-white shadow-md shrink-0">
              {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-stone-100">{comment.user?.username}</span>
            {poll.creator?._id === comment.user?._id && (
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">Author</span>
            )}
            <span className="text-[10px] text-slate-400 dark:text-stone-500 ml-auto font-semibold">
              {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>

          {editingComment === comment._id ? (
            <div className="mt-2 text-right">
              <input 
                 autoFocus
                 className="w-full bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 mb-2 shadow-sm"
                 value={editCommentText}
                 onChange={e => setEditCommentText(e.target.value)}
              />
              <button 
                onClick={() => setEditingComment(null)} 
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mr-3 font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleEditCommentSubmit(comment._id)} 
                className="btn-primary text-xs px-3.5 py-1.5 rounded-xl shadow-md font-bold"
              >
                Save Edit
              </button>
            </div>
          ) : (
            <p className={cx("text-xs sm:text-sm leading-relaxed", comment.isDeleted ? "text-slate-400 italic" : "text-slate-700 dark:text-stone-300 font-medium")}>
              {comment.text}
            </p>
          )}

          {!comment.isDeleted && (
            <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-slate-100 dark:border-stone-800/80">
              <button 
                onClick={() => handleLikeComment(comment._id)} 
                className={cx("flex items-center gap-1.5 text-xs font-semibold transition-colors", comment.likes?.includes(user?.id) ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-stone-500 hover:text-slate-900 dark:hover:text-stone-200")}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes?.length || 0}
              </button>
              
              {depth < 3 && user && (
                <button 
                  onClick={() => { 
                    setReplyingTo(replyingTo === comment._id ? null : comment._id); 
                    setEditCommentText(''); 
                    setEditingComment(null); 
                  }} 
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-stone-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" /> Reply
                </button>
              )}

              {user?.id === comment.user?._id && (
                <div className="ml-auto flex gap-3 text-slate-400 dark:text-stone-500">
                  <button onClick={() => { setEditingComment(comment._id); setEditCommentText(comment.text); }} className="hover:text-indigo-500 transition-colors">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDeleteComment(comment._id)} className="hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {replyingTo === comment._id && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-stone-800/80">
               <form onSubmit={(e) => handleComment(e, comment._id)} className="relative flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    placeholder={`Reply to ${comment.user?.username}...`}
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl focus:border-indigo-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all shadow-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={!editCommentText.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-indigo-500 disabled:opacity-40 hover:scale-110 transition-transform"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
               </form>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-2.5 mt-2.5">
          {renderComments(comment._id, depth + 1)}
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 py-1 sm:py-2 px-3 sm:px-4 relative">
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={poll.title}
        url={window.location.href}
      />

      {/* Vote Success Banner Alert */}
      <AnimatePresence>
        {showVoteSuccess && (
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between shadow-xl backdrop-blur-md"
          >
             <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider">Vote Recorded Successfully! Realtime live sync active.</span>
             </div>
             <button 
              onClick={() => navigate(`/poll/${id}/analytics`)}
              className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
             >
                View Analytics <BarChart3 className="w-3.5 h-3.5" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Poll Details & Voting Card */}
        <div className="lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] p-5 sm:p-7 border border-slate-200 dark:border-stone-800/80 bg-white/90 dark:bg-[#121110]/95 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Glow Effect */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                    <Activity className="w-3.5 h-3.5 animate-pulse" /> LIVE PULSE NODE
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-stone-900/90 border border-slate-200 dark:border-stone-800 text-slate-700 dark:text-stone-300 text-[10px] font-bold uppercase tracking-wider">
                    {poll.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShareModalOpen(true)}
                    className="p-2 rounded-2xl bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-slate-600 dark:text-stone-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition-all shadow-sm"
                    title="Share Poll"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/poll/${id}/analytics`)}
                    className="p-2 rounded-2xl bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-slate-600 dark:text-stone-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition-all shadow-sm"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-2 leading-snug">
                {poll.title}
              </h1>

              {poll.description && (
                <p className="text-slate-600 dark:text-stone-300 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                  {poll.description}
                </p>
              )}

              {/* Metadata Bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-stone-400 pb-3 mb-4 border-b border-slate-100 dark:border-stone-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                    {poll.creator?.username?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-stone-200">{poll.creator?.username || 'Community'}</span>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  <span>{totalVotes} Total Votes</span>
                </div>
              </div>

              {/* Voting Options */}
              <div className="space-y-3 mb-5">
                {poll.options.map((option: any) => {
                  const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                  const isWinner = hasVoted && option.votes === highestVotes && highestVotes > 0;
                  const isSelected = selectedOption === option._id;

                  return (
                    <div
                      key={option._id}
                      onClick={() => setSelectedOption(option._id)}
                      className={cx(
                        "relative rounded-2xl overflow-hidden p-3.5 sm:p-4 cursor-pointer transition-all border group",
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/15 dark:bg-indigo-500/20 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10"
                          : "border-slate-200 dark:border-stone-800/80 bg-slate-50/80 dark:bg-stone-900/60 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-stone-900/90"
                      )}
                    >
                      {/* Animated Progress Bar */}
                      <div
                        className={cx(
                          "absolute inset-y-0 left-0 transition-all duration-700 rounded-2xl",
                          isWinner 
                            ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-r-2 border-indigo-500" 
                            : isSelected
                            ? "bg-gradient-to-r from-indigo-500/20 to-purple-600/20"
                            : "bg-slate-200/50 dark:bg-stone-800/50"
                        )}
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3 pr-3">
                          <div className={cx(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                            isSelected 
                              ? "border-indigo-500 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]" 
                              : "border-slate-400 dark:border-stone-600 group-hover:border-indigo-500"
                          )}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={cx("font-bold text-xs sm:text-sm transition-colors", isSelected ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-stone-200")}>
                            {option.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
                            {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-xl">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vote Action Footer */}
            <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {user ? (
                <button
                  onClick={handleVote}
                  disabled={!selectedOption}
                  className="btn-primary w-full sm:w-auto px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{hasVoted ? 'Update Choice' : 'Cast Vote Now'}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary w-full text-center py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform"
                >
                  Sign In To Participate
                </Link>
              )}

              <button
                onClick={() => navigate(`/poll/${id}/analytics`)}
                className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-stone-300 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors group"
              >
                <span>Analytics Node</span>
                <BarChart3 className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Live Discussion Feed */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2.5rem] p-5 sm:p-6 border border-slate-200 dark:border-stone-800/80 bg-white/90 dark:bg-[#121110]/95 backdrop-blur-xl shadow-2xl flex flex-col justify-between min-h-[460px] max-h-[540px] relative overflow-hidden"
          >
            {/* Top background accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Feed Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-stone-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase italic text-slate-900 dark:text-white tracking-tight">Live Discussion</h3>
                    <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest">Realtime Community Chat</p>
                  </div>
                </div>

                <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shadow-sm">
                  {comments.length} Messages
                </span>
              </div>

              {/* Scrollable Comments List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 flex items-center justify-center mb-2.5 text-slate-400 dark:text-stone-500">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-1">No comments yet</p>
                    <p className="text-[11px] text-slate-400 dark:text-stone-500 font-medium max-w-xs">Be the first to share your thoughts and influence the discussion!</p>
                  </div>
                ) : (
                  renderComments(null, 0)
                )}
              </div>

              {/* Comment Input Box */}
              <div className="pt-3 border-t border-slate-100 dark:border-stone-800/80 mt-3">
                {user ? (
                  <form onSubmit={(e) => handleComment(e, null)} className="relative flex items-center">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your perspective..."
                      className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 transition-opacity shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl text-center text-xs font-bold text-slate-500 dark:text-stone-400">
                    <Link to="/login" className="text-indigo-500 dark:text-indigo-400 hover:underline font-black">Sign in</Link> to post comments.
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}


