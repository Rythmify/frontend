import React, { useState, useEffect } from "react";
import type { Comment } from "../../../../types/comment";
import { likeComment, unlikeComment, deleteComment } from "../../../../services/engagement.service";
import { postReply, getReplies } from "../../../../services/track.service";
import { useAuthStore } from "../../../../stores/auth.store";

interface TrackCommentListProps {
  comments: Comment[];
  trackId: string;
  onCommentDeleted?: (commentId: string) => void;
}

export default function TrackCommentList({ comments, trackId, onCommentDeleted }: TrackCommentListProps) {
  const { user: currentUser } = useAuthStore();
  const [commentList, setCommentList] = useState<Comment[]>(comments);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedThreads, setExpandedThreads] = useState<Record<string, Comment[]>>({});
  const [loadingThreads, setLoadingThreads] = useState<Set<string>>(new Set());

  // LOCAL STORAGE KEY: rythmify_likes_{userId}
  const LIKES_CACHE_KEY = currentUser ? `rythmify_likes_${currentUser.id}` : null;

  // Load likes from backend is_liked_by_me flags, with localStorage as fallback
  useEffect(() => {
    setCommentList(comments);
    
    const initialLikes = new Set<string>();
    
    // 1. Use backend is_liked_by_me flags as primary source of truth
    comments.forEach(c => {
      if (c.is_liked_by_me) {
        initialLikes.add(String(c.comment_id));
      }
    });

    // 2. Only fall back to localStorage if backend returned no like info
    const hasBackendLikeInfo = comments.some(c => c.is_liked_by_me !== undefined);
    if (!hasBackendLikeInfo && LIKES_CACHE_KEY) {
      const cached = localStorage.getItem(LIKES_CACHE_KEY);
      if (cached) {
        try {
          const cachedIds = JSON.parse(cached);
          if (Array.isArray(cachedIds)) {
            cachedIds.forEach(id => initialLikes.add(String(id)));
          }
        } catch (e) {
          console.error("Failed to parse likes cache", e);
        }
      }
    }

    setLikedComments(initialLikes);
  }, [comments, LIKES_CACHE_KEY]);

  // Persist likes to LocalStorage whenever they change
  useEffect(() => {
    if (LIKES_CACHE_KEY) {
      localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(Array.from(likedComments)));
    }
  }, [likedComments, LIKES_CACHE_KEY]);

  const handleFetchReplies = async (commentId: string) => {
    if (expandedThreads[commentId]) {
      const next = { ...expandedThreads };
      delete next[commentId];
      setExpandedThreads(next);
      return;
    }

    setLoadingThreads(prev => new Set(prev).add(commentId));
    try {
      const replies = await getReplies(commentId);
      setExpandedThreads(prev => ({ ...prev, [commentId]: replies }));
    } catch (err) {
      console.error("Failed to fetch replies", err);
    } finally {
      setLoadingThreads(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleLikeToggle = async (comment: any) => {
    const commentIdStr = String(comment.comment_id);
    const isCurrentlyLiked = likedComments.has(commentIdStr);
    const newLikedComments = new Set(likedComments);
    
    const updateComment = (c: Comment) => {
      if (String(c.comment_id) === commentIdStr) {
        return {
          ...c,
          like_count: isCurrentlyLiked ? Math.max(0, c.like_count - 1) : c.like_count + 1
        } as any;
      }
      return c;
    };

    setCommentList(prev => prev.map(updateComment));
    setExpandedThreads(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        next[id] = next[id].map(updateComment);
      });
      return next;
    });

    if (isCurrentlyLiked) newLikedComments.delete(commentIdStr);
    else newLikedComments.add(commentIdStr);
    setLikedComments(newLikedComments);

    try {
      if (isCurrentlyLiked) await unlikeComment(commentIdStr);
      else await likeComment(commentIdStr);
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleReplySubmit = async (targetId: string, parentCommentId: string) => {
    if (!replyText.trim()) return;
    try {
      // Backend only supports replies on main comments, so we use parentCommentId
      const newReply = await postReply(parentCommentId, replyText);
      
      setCommentList(prev => prev.map(c => {
        if (String(c.comment_id) === String(parentCommentId)) {
          return { ...c, reply_count: (c.reply_count || 0) + 1 };
        }
        return c;
      }));

      if (expandedThreads[parentCommentId]) {
        setExpandedThreads(prev => ({
          ...prev,
          [parentCommentId]: [...prev[parentCommentId], newReply]
        }));
      } else {
        handleFetchReplies(parentCommentId);
      }

      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to post reply", err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure?")) return;

    // Optimistic update — remove from UI immediately
    const removedComment = commentList.find(c => String(c.comment_id) === String(commentId));
    const removedFromThreads: Record<string, import("../../../../types/comment").Comment[]> = {};

    setCommentList(prev => prev.filter(c => String(c.comment_id) !== String(commentId)));
    setExpandedThreads(prev => {
      const next = { ...prev };
      if (next[commentId]) {
        removedFromThreads[commentId] = next[commentId];
        delete next[commentId];
      }
      Object.keys(next).forEach(id => {
        const before = next[id].filter(r => String(r.comment_id) === String(commentId));
        if (before.length > 0) {
          removedFromThreads[`reply_${id}`] = before;
          // Decrement reply_count on the parent comment
          setCommentList(currentList => currentList.map(c => 
            String(c.comment_id) === String(id) 
              ? { ...c, reply_count: Math.max(0, (c.reply_count || 0) - 1) } 
              : c
          ));
        }
        next[id] = next[id].filter(r => String(r.comment_id) !== String(commentId));
      });
      return next;
    });

    try {
      await deleteComment(commentId);

      if (likedComments.has(String(commentId))) {
        setLikedComments(prev => {
          const next = new Set(prev);
          next.delete(String(commentId));
          return next;
        });
      }

      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (err: any) {
      // Rollback optimistic update on failure
      if (removedComment) {
        setCommentList(prev => [...prev, removedComment]);
      }
      setExpandedThreads(prev => {
        const next = { ...prev };
        if (removedFromThreads[commentId]) {
          next[commentId] = removedFromThreads[commentId];
        }
        Object.keys(removedFromThreads).forEach(key => {
          if (key.startsWith("reply_")) {
            const parentId = key.replace("reply_", "");
            if (next[parentId]) {
              next[parentId] = [...next[parentId], ...removedFromThreads[key]];
              // Restore reply_count on the parent comment
              setCommentList(currentList => currentList.map(c => 
                String(c.comment_id) === String(parentId) 
                  ? { ...c, reply_count: (c.reply_count || 0) + removedFromThreads[key].length } 
                  : c
              ));
            }
          }
        });
        return next;
      });

      const status = err?.response?.status;
      if (status === 403) {
        alert("You can only delete your own comments.");
      } else {
        alert("Failed to delete comment. Please try again.");
      }
      console.error("Failed to delete", err);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderComment = (comment: Comment, isReply = false, parentId: string) => {
    const commentIdStr = String(comment.comment_id);
    const isLiked = likedComments.has(commentIdStr);
    const isOwner = currentUser?.id === comment.user_id;

    return (
      <div key={commentIdStr} className={`group ${isReply ? 'mt-4 animate-in slide-in-from-left-4 duration-300' : 'relative'}`}>
        <div className="flex gap-4">
          <img
            src={comment.author.avatar_url || "https://picsum.photos/seed/user/80/80"}
            className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover shrink-0 border border-[var(--color-border)] hover:brightness-110 transition-all cursor-pointer`}
            alt={comment.author.display_name}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[var(--color-text-muted)] ${isReply ? 'text-[12px]' : 'text-[13px]'} font-bold hover:text-white cursor-pointer transition-colors text-orange-500/80`}>
                {comment.author.display_name}
              </span>
              {!isReply && (
                <span className="text-[var(--color-text-muted)] text-[11px] opacity-70">
                  at {formatTime(comment.track_timestamp)}
                </span>
              )}
              <span className="text-[var(--color-text-muted)] text-[10px] ml-auto opacity-50">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className={`text-[var(--color-text-hover)] ${isReply ? 'text-[13px]' : 'text-[14px]'} leading-relaxed mb-2 selection:bg-orange-500/30`}>
              {comment.content}
            </p>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => handleLikeToggle(comment)}
                className={`flex items-center gap-1.5 text-[11px] font-bold transition-all duration-200 ${
                  isLiked ? "text-[#f50]" : "text-[var(--color-text-muted)] hover:text-white"
                }`}
              >
                <svg className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {comment.like_count > 0 ? comment.like_count : "Like"}
              </button>
              
              <button 
                onClick={() => {
                  setReplyingTo(replyingTo?.id === commentIdStr ? null : { id: commentIdStr, name: comment.author.display_name });
                  setReplyText(`@${comment.author.display_name} `);
                }}
                className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-[11px] font-bold hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                Reply
              </button>

              {isOwner && (
                <button 
                  onClick={() => handleDelete(commentIdStr)}
                  className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-[11px] font-bold hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              )}
            </div>

            {replyingTo?.id === commentIdStr && (
              <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 border-l border-orange-500/20 pl-3">
                <input
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to @${replyingTo.name}...`}
                  className="flex-1 bg-[#111] border border-[#333] rounded px-4 py-2 text-[13px] text-white focus:border-orange-500 outline-none"
                />
                <button 
                  onClick={() => handleReplySubmit(commentIdStr, parentId)} 
                  className="bg-[#f50] text-white text-[12px] uppercase font-bold px-5 py-2 rounded"
                >
                  Post
                </button>
              </div>
            )}

            {!isReply && Array.isArray(expandedThreads[commentIdStr]) && (
              <div className="ml-4 mt-2 pl-4 border-l-2 border-[#222] flex flex-col gap-4">
                {expandedThreads[commentIdStr].map(reply => renderComment(reply, true, commentIdStr))}
              </div>
            )}

            {!isReply && comment.reply_count > 0 && !expandedThreads[commentIdStr] && (
              <div className="ml-14 mt-3">
                <button 
                  onClick={() => handleFetchReplies(commentIdStr)}
                  className="text-[11px] font-bold text-[#f50] flex items-center gap-1.5 hover:brightness-125 transition-all"
                  disabled={loadingThreads.has(commentIdStr)}
                >
                  <svg className={`w-3 h-3 ${loadingThreads.has(commentIdStr) ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  {loadingThreads.has(commentIdStr) ? 'Loading...' : `View ${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}`}
                </button>
              </div>
            )}
             {!isReply && expandedThreads[commentIdStr] && (
               <div className="ml-14 mt-2">
                 <button 
                    onClick={() => handleFetchReplies(commentIdStr)}
                    className="text-[11px] font-bold text-[var(--color-text-muted)] hover:text-white"
                 >
                   Hide replies
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 border-t border-[var(--color-border)] pt-6">
      <div className="flex items-center gap-2 mb-8 uppercase tracking-widest text-[11px] font-bold text-[var(--color-text-muted)]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        {commentList.length} Comments
      </div>

      <div className="flex flex-col gap-10">
        {commentList.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm italic py-4">No comments yet.</p>
        ) : (
          commentList.map(c => renderComment(c, false, String(c.comment_id)))
        )}
      </div>
    </div>
  );
}
