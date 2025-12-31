import React, { useState } from 'react';
import { Heart, MessageCircle, DollarSign, Send, Bookmark, MoreHorizontal, Flag, X, Trash2 } from 'lucide-react';
import { Glass, Btn, Input, Avatar } from '../ui/primitives';
import { VideoPlayer, AudioPlayer } from '../ui/MediaPlayers';
import { formatUsername } from '../../lib/supabase';
import { C } from '../../lib/constants';

const ConfirmDeleteModal = ({ onClose, onConfirm, type = 'post', loading }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  }}>
    <div
      onClick={onClose}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    />
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 360,
      background: C.glassDark,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: 24,
      backdropFilter: 'blur(24px)',
      textAlign: 'center'
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(239,68,68,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Trash2 size={24} color="#ef4444" />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 500, color: C.text }}>
        Delete {type}?
      </h3>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: C.muted }}>
        This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: 14,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            cursor: 'pointer',
            color: C.text,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 1,
            padding: 14,
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#ef4444',
            fontSize: 14,
            fontWeight: 500,
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

const ReportModal = ({ onClose, onSubmit, type = 'post' }) => {
  const [category, setCategory] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'harassment', label: 'Harassment' },
    { id: 'spam', label: 'Spam' },
    { id: 'inappropriate', label: 'Inappropriate content' },
    { id: 'other', label: 'Other' }
  ];

  const handleSubmit = () => {
    if (!category) return;
    onSubmit(category);
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      />
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        background: C.glassDark,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 24,
        backdropFilter: 'blur(24px)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: C.muted,
            padding: 8
          }}
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Flag size={24} color={C.emeraldLight} />
            </div>
            <p style={{ margin: 0, fontSize: 16, color: C.text, fontWeight: 500 }}>Report Submitted</p>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: C.muted }}>
              We will review this {type} and take appropriate action.
            </p>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 500, color: C.text }}>
              Report {type}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: C.muted }}>
              Select a reason for reporting
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '14px 16px',
                    background: category === cat.id ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${category === cat.id ? 'rgba(16,185,129,0.3)' : C.border}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: category === cat.id ? C.emeraldLight : C.text,
                    fontSize: 14,
                    fontWeight: 400
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!category}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '14px',
                background: category ? 'linear-gradient(135deg, rgba(16,185,129,0.5) 0%, rgba(6,95,70,0.6) 100%)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${category ? 'rgba(16,185,129,0.25)' : C.border}`,
                borderRadius: 12,
                cursor: category ? 'pointer' : 'not-allowed',
                color: category ? C.text : C.muted,
                fontSize: 14,
                fontWeight: 500,
                opacity: category ? 1 : 0.5
              }}
            >
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const PostCard = ({ post, currentUserId, onLike, onComment, onUserClick, onSave, onDelete, onDeleteComment, autoExpandComments }) => {
  const [showComments, setShowComments] = useState(autoExpandComments || false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isLiked = post.post_likes?.some(l => l.user_id === currentUserId);
  const isSaved = post.saved_posts?.some(s => s.user_id === currentUserId);
  const profile = post.user_profiles;
  const isOwnPost = profile?.id === currentUserId;

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(post.id);
    setDeleting(false);
    setShowDeleteModal(false);
  };

  const handleComment = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    await onComment(post.id, comment);
    setComment('');
    setSubmitting(false);
  };

  const handleReport = (category) => {
    console.log('Report submitted:', { postId: post.id, category });
  };

  return (
    <Glass style={{ marginBottom: 16 }}>
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
          type="post"
        />
      )}
      {showDeleteModal && (
        <ConfirmDeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          type="post"
          loading={deleting}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, cursor: 'pointer' }}
          onClick={() => onUserClick(profile?.id)}
        >
          <Avatar src={profile?.avatar_url} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: C.text }}>
              {profile?.display_name || profile?.username || 'User'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
              {formatUsername(profile?.username || '')}
            </p>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 10,
              color: C.muted,
              borderRadius: 8,
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <>
              <div
                onClick={() => setShowMenu(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 11,
                background: C.glassDark,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 8,
                minWidth: 160,
                backdropFilter: 'blur(16px)'
              }}>
                {isOwnPost && onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 8,
                      color: '#fca5a5',
                      fontSize: 14,
                      textAlign: 'left'
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
                {!isOwnPost && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportModal(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 8,
                      color: '#fca5a5',
                      fontSize: 14,
                      textAlign: 'left'
                    }}
                  >
                    <Flag size={16} />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <p style={{
        fontSize: 16,
        fontWeight: 300,
        lineHeight: 1.8,
        color: C.textSecondary,
        margin: '0 0 18px',
        letterSpacing: '0.2px',
        wordBreak: 'break-word'
      }}>
        {post.content}
      </p>
      {post.image_url && (
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 18, border: `1px solid ${C.border}` }}>
          <img src={post.image_url} alt="" style={{ width: '100%', display: 'block' }} />
        </div>
      )}
      {post.video_url && (
        <div style={{ marginBottom: 18 }}>
          <VideoPlayer src={post.video_url} autoPlay={false} muted={true} loop={false} inFeed={true} />
        </div>
      )}
      {post.audio_url && (
        <div style={{ marginBottom: 18 }}>
          <AudioPlayer src={post.audio_url} isOwnAudio={isOwnPost} />
        </div>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingTop: 18,
        borderTop: `1px solid ${C.border}`,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            background: isLiked ? 'rgba(251,113,133,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLiked ? 'rgba(251,113,133,0.2)' : C.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            minHeight: 44,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: isLiked ? '#fb7185' : C.muted,
            transition: 'all 0.3s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{post.post_likes?.length || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            minHeight: 44,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: C.muted,
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <MessageCircle size={18} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{post.comments?.length || 0}</span>
        </button>
        {onSave && (
          <button
            onClick={() => onSave(post.id)}
            style={{
              background: isSaved ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isSaved ? 'rgba(16,185,129,0.2)' : C.border}`,
              borderRadius: 10,
              padding: '10px 14px',
              minHeight: 44,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: isSaved ? C.emeraldLight : C.muted,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        )}
        <button
          style={{
            background: C.gradientAccent,
            border: '1px solid rgba(204,163,94,0.2)',
            borderRadius: 10,
            padding: '10px 14px',
            minHeight: 44,
            cursor: 'pointer',
            color: C.accentLight,
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <DollarSign size={16} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Tip</span>
        </button>
      </div>
      {showComments && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          {post.comments?.map(c => (
            <div key={c.id} style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 8 }}>
              <span style={{ color: C.emeraldLight, fontWeight: 500, fontSize: 13 }}>
                {formatUsername(c.user_profiles?.username || '')}
              </span>
              <span style={{ color: C.muted, fontSize: 13, marginLeft: 8 }}>{c.content}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Input
              value={comment}
              onChange={setComment}
              placeholder="Add a comment..."
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, minHeight: 48 }}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
            />
            <Btn
              onClick={handleComment}
              disabled={!comment.trim() || submitting}
              style={{ padding: '12px 16px', minWidth: 48, minHeight: 48 }}
            >
              <Send size={16} />
            </Btn>
          </div>
        </div>
      )}
    </Glass>
  );
};
