import React from 'react';
import { Bell, ChevronLeft, Heart, MessageCircle, UserPlus, Sparkles } from 'lucide-react';
import { Glass, Avatar } from '../ui/primitives';
import { SAFE_BOTTOM_PADDING, SAFE_TOP_PADDING } from '../layout/Nav';
import { formatUsername } from '../../lib/supabase';
import { C } from '../../lib/constants';

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const NotificationIcon = ({ type }) => {
  const iconProps = { size: 14 };
  switch (type) {
    case 'like': return <Heart {...iconProps} color="#f87171" />;
    case 'comment': return <MessageCircle {...iconProps} color={C.emeraldLight} />;
    case 'follow': return <UserPlus {...iconProps} color="#60a5fa" />;
    case 'tip': return <Sparkles {...iconProps} color={C.accentLight} />;
    default: return <Bell {...iconProps} color={C.muted} />;
  }
};

const NotificationItem = ({ notification, onClick, onMarkRead }) => {
  const isUnread = !notification.read_at;

  const handleClick = () => {
    if (isUnread) onMarkRead?.(notification.id);
    onClick?.(notification);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        marginBottom: 8,
        background: isUnread ? 'rgba(16,185,129,0.08)' : 'transparent',
        border: `1px solid ${isUnread ? 'rgba(16,185,129,0.15)' : C.border}`,
        borderRadius: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        textAlign: 'left',
        minHeight: 80
      }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar src={notification.actor?.avatar_url} size={48} />
        <div style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: C.bg,
          border: `2px solid ${C.bg}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <NotificationIcon type={notification.type} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 600 }}>
            {notification.actor?.display_name || formatUsername(notification.actor?.username)}
          </strong>
          <span style={{ color: C.textSecondary, fontWeight: 400 }}>
            {notification.type === 'like' && ' liked your post'}
            {notification.type === 'comment' && ' commented on your post'}
            {notification.type === 'follow' && ' started following you'}
            {notification.type === 'tip' && ' sent you a tip'}
          </span>
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
          {formatTime(notification.created_at)}
        </p>
      </div>
      {isUnread && (
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: C.emeraldLight,
          flexShrink: 0
        }} />
      )}
    </button>
  );
};

export const Notifications = ({ notifications, onClose, loading, onNotificationClick, onMarkRead }) => (
  <div style={{
    paddingBottom: SAFE_BOTTOM_PADDING,
    paddingTop: SAFE_TOP_PADDING,
    paddingLeft: 16,
    paddingRight: 16,
    minHeight: '100vh'
  }}>
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 10,
            minWidth: 44,
            minHeight: 44,
            cursor: 'pointer',
            color: C.muted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <ChevronLeft size={22} />
        </button>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 300, color: C.text }}>Notifications</h2>
      </div>
      {loading ? (
        <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading...</p>
      ) : notifications.length === 0 ? (
        <Glass style={{ textAlign: 'center', padding: 48 }}>
          <Bell size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>Nothing new.</p>
          <p style={{ margin: '8px 0 0', color: C.muted, fontSize: 13 }}>Breathe.</p>
        </Glass>
      ) : (
        <div>
          {notifications.map(n => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={onNotificationClick}
              onMarkRead={onMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
