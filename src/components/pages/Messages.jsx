import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ChevronLeft, Send, User } from 'lucide-react';
import { Glass, Avatar, Input, Btn } from '../ui/primitives';
import { SAFE_BOTTOM_PADDING, SAFE_TOP_PADDING, NAV_HEIGHT, NAV_TOTAL_HEIGHT } from '../layout/Nav';
import { supabase, formatUsername } from '../../lib/supabase';
import { C } from '../../lib/constants';

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
};

const ConversationItem = ({ conversation, currentUserId, onClick, isActive }) => {
  const otherUser = conversation.user1_id === currentUserId ? conversation.user2 : conversation.user1;
  const lastMessage = conversation.last_message;
  const unread = lastMessage && !lastMessage.read_at && lastMessage.sender_id !== currentUserId;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
        borderRadius: 16,
        cursor: 'pointer',
        border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
        marginBottom: 8,
        transition: 'all 0.2s'
      }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar src={otherUser?.avatar_url} size={52} />
        {unread && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: C.emeraldLight,
            border: `2px solid ${C.bg}`
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: unread ? 600 : 500, color: C.text }}>
            {otherUser?.display_name || otherUser?.username || 'User'}
          </span>
          {lastMessage && (
            <span style={{ fontSize: 11, color: C.muted }}>{formatTime(lastMessage.created_at)}</span>
          )}
        </div>
        <p style={{
          margin: 0,
          fontSize: 13,
          color: unread ? C.textSecondary : C.muted,
          fontWeight: unread ? 500 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {lastMessage?.content || 'Start a conversation'}
        </p>
      </div>
    </div>
  );
};

const ChatView = ({ conversation, currentUserId, onBack, onSend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const inputBarRef = useRef(null);

  const otherUser = conversation.user1_id === currentUserId ? conversation.user2 : conversation.user1;

  useEffect(() => {
    const handleResize = () => {
      if (!window.visualViewport) return;
      const offsetFromBottom = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
      setKeyboardOffset(Math.max(0, offsetFromBottom));
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        const unreadIds = data
          .filter(m => m.sender_id !== currentUserId && !m.read_at)
          .map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadIds);
        }
      }
      setLoading(false);
    };

    loadMessages();

    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        if (payload.new.sender_id !== currentUserId) {
          supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', payload.new.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: newMessage.trim()
    });

    if (!error) {
      setNewMessage('');
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation.id);
      onSend?.();
    }
    setSending(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(5,8,7,0.95)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '12px 16px',
        paddingTop: 'calc(12px + env(safe-area-inset-top))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: 560, margin: '0 auto' }}>
          <button
            onClick={onBack}
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
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <Avatar src={otherUser?.avatar_url} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>
              {otherUser?.display_name || otherUser?.username || 'User'}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{formatUsername(otherUser?.username)}</p>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: keyboardOffset > 0 ? keyboardOffset + 80 : 100
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {loading ? (
            <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <MessageCircle size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ color: C.muted, fontSize: 14 }}>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: 12
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: 18,
                    borderBottomRightRadius: isOwn ? 4 : 18,
                    borderBottomLeftRadius: isOwn ? 18 : 4,
                    background: isOwn ? 'linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(6,95,70,0.5) 100%)' : C.glassDark,
                    border: `1px solid ${isOwn ? 'rgba(16,185,129,0.2)' : C.border}`
                  }}>
                    <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {msg.content}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: 10, color: C.muted, textAlign: isOwn ? 'right' : 'left' }}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        ref={inputBarRef}
        style={{
          position: 'fixed',
          bottom: keyboardOffset > 0 ? keyboardOffset : `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
          left: 0,
          right: 0,
          background: 'rgba(5,8,7,0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: `1px solid ${C.border}`,
          padding: '12px 16px',
          paddingBottom: keyboardOffset > 0 ? 12 : 12,
          zIndex: 100,
          transition: keyboardOffset > 0 ? 'none' : 'bottom 0.1s ease-out'
        }}
      >
        <div style={{ display: 'flex', gap: 12, maxWidth: 560, margin: '0 auto', alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Start a calm conversation..."
            style={{
              flex: 1,
              padding: '14px 18px',
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${C.border}`,
              borderRadius: 24,
              color: C.text,
              fontSize: 16,
              outline: 'none',
              minHeight: 50,
              WebkitAppearance: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            style={{
              width: 50,
              height: 50,
              minWidth: 50,
              minHeight: 50,
              borderRadius: '50%',
              background: newMessage.trim() ? 'linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(6,95,70,0.9) 100%)' : C.glassDark,
              border: `1px solid ${newMessage.trim() ? 'rgba(16,185,129,0.4)' : C.border}`,
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: newMessage.trim() ? '#fff' : C.muted,
              opacity: sending ? 0.5 : 1,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              flexShrink: 0,
              boxShadow: newMessage.trim() ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Messages = ({ onClose, currentUserId, onOpenConversation, initialConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);

  const loadConversations = async () => {
    if (!currentUserId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user_profiles!conversations_user1_id_fkey(*),
        user2:user_profiles!conversations_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      const convosWithMessages = await Promise.all(
        data.map(async (conv) => {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
          return { ...conv, last_message: msgs?.[0] || null };
        })
      );
      setConversations(convosWithMessages);

      if (initialConversationId) {
        const initial = convosWithMessages.find(c => c.id === initialConversationId);
        if (initial) setActiveConversation(initial);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, [currentUserId, initialConversationId]);

  if (activeConversation) {
    return (
      <ChatView
        conversation={activeConversation}
        currentUserId={currentUserId}
        onBack={() => {
          setActiveConversation(null);
          loadConversations();
        }}
        onSend={loadConversations}
      />
    );
  }

  return (
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
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 300, color: C.text }}>Messages</h2>
        </div>

        {loading ? (
          <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <Glass style={{ textAlign: 'center', padding: 48 }}>
            <MessageCircle size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ color: C.muted }}>No conversations yet.</p>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>Start a conversation from someone's profile.</p>
          </Glass>
        ) : (
          <div>
            {conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={currentUserId}
                onClick={() => setActiveConversation(conv)}
                isActive={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const startConversation = async (currentUserId, otherUserId) => {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({ user1_id: currentUserId, user2_id: otherUserId })
    .select('id')
    .single();

  if (error) return null;
  return newConv.id;
};
