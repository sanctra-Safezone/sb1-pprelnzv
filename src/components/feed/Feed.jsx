import React, { useEffect, useRef } from 'react';
import { Feather } from 'lucide-react';
import { Glass } from '../ui/primitives';
import { PostCard } from './PostCard';
import { SAFE_BOTTOM_PADDING, SAFE_TOP_PADDING } from '../layout/Nav';
import { C } from '../../lib/constants';

export const Feed = ({ posts, currentUserId, onLike, onComment, onUserClick, onSave, onDelete, loading, focusedPostId }) => {
  const focusedRef = useRef(null);

  useEffect(() => {
    if (focusedPostId && focusedRef.current) {
      setTimeout(() => {
        focusedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [focusedPostId]);

  return (
    <div style={{
      paddingBottom: SAFE_BOTTOM_PADDING,
      paddingTop: SAFE_TOP_PADDING,
      paddingLeft: 16,
      paddingRight: 16,
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: C.muted }}>Loading...</p>
          </div>
        ) : posts.length === 0 ? (
          <Glass style={{ textAlign: 'center', padding: 48 }}>
            <Feather size={48} color={C.muted} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>This space is quiet.</p>
            <p style={{ margin: '8px 0 0', color: C.muted, fontSize: 13 }}>Be the first to share something.</p>
          </Glass>
        ) : (
          posts.map(p => (
            <div
              key={p.id}
              ref={p.id === focusedPostId ? focusedRef : null}
              style={{
                transition: 'all 0.3s',
                borderRadius: 20,
                outline: p.id === focusedPostId ? `2px solid ${C.emeraldLight}` : 'none',
                outlineOffset: 4
              }}
            >
              <PostCard
                post={p}
                currentUserId={currentUserId}
                onLike={onLike}
                onComment={onComment}
                onUserClick={onUserClick}
                onSave={onSave}
                onDelete={onDelete}
                autoExpandComments={p.id === focusedPostId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
