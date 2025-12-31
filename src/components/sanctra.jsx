import React, { useState, useEffect, useCallback } from 'react';
import { Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { C } from '../lib/constants';
import { SoundProvider } from '../lib/SoundContext';
import { ToastProvider } from './ui/Toast';

import { Header } from './layout/Header';
import { Nav } from './layout/Nav';
import { Sidebar } from './layout/Sidebar';

import { Auth } from './pages/Auth';
import { Feed } from './feed/Feed';
import { Create } from './pages/Create';
import { Profile } from './pages/Profile';
import { Garden } from './pages/Garden';
import { PlansPage } from './pages/Plans';
import { Notifications } from './pages/Notifications';
import { Messages } from './pages/Messages';
import { Rules } from './pages/Rules';
import { Search } from './pages/Search';
import { AmbientAudio } from './ui/AmbientAudio';
import { StartupOverlay } from './ui/StartupOverlay';

const STARTUP_KEY = 'sanctra_has_entered';

export default function Sanctra() {
  const [hasEntered, setHasEntered] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STARTUP_KEY) === 'true';
  });
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [focusedPostId, setFocusedPostId] = useState(null);

  const handleEnter = () => {
    localStorage.setItem(STARTUP_KEY, 'true');
    setHasEntered(true);
  };

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
    return data;
  }, []);

  const fetchUserPlan = useCallback(async (userId) => {
    const { data } = await supabase
      .from('user_plans')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .maybeSingle();
    return data?.plans?.name || 'free';
  }, []);

  const fetchPosts = useCallback(async (userId) => {
    const { data } = await supabase
      .from('posts')
      .select(`*, user_profiles(*), post_likes(user_id), comments(*, user_profiles(*)), saved_posts(user_id)`)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  }, []);

  const fetchSavedPosts = useCallback(async (userId) => {
    const { data } = await supabase
      .from('saved_posts')
      .select(`*, posts(*, user_profiles(*), post_likes(user_id), comments(*, user_profiles(*)))`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data?.map(s => ({ ...s.posts, saved_posts: [{ user_id: userId }] })) || [];
  }, []);

  const fetchNotifications = useCallback(async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select(`*, actor:user_profiles!notifications_actor_id_fkey(*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return data || [];
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
        const plan = await fetchUserPlan(session.user.id);
        setUserPlan(plan);
        const postsData = await fetchPosts(session.user.id);
        setPosts(postsData);
        const saved = await fetchSavedPosts(session.user.id);
        setSavedPosts(saved);
        const notifs = await fetchNotifications(session.user.id);
        setNotifications(notifs);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
          const plan = await fetchUserPlan(session.user.id);
          setUserPlan(plan);
        } else {
          setUser(null);
          setProfile(null);
          setUserPlan('free');
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchPosts, fetchSavedPosts, fetchNotifications, fetchUserPlan]);

  const handleAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const p = await fetchProfile(session.user.id);
      setProfile(p);
      const plan = await fetchUserPlan(session.user.id);
      setUserPlan(plan);
      const postsData = await fetchPosts(session.user.id);
      setPosts(postsData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPosts([]);
    setSavedPosts([]);
    setUserPlan('free');
    setSidebarOpen(false);
  };

  const handlePost = async (content, mediaFile, mediaType, generatedMediaUrl) => {
    if (!user || !content.trim()) return { success: false, message: 'Content required' };

    if (mediaType) {
      const { data: limitCheck, error: limitError } = await supabase.rpc('check_and_increment_post_count', {
        p_user_id: user.id,
        p_media_type: mediaType
      });

      if (limitError || !limitCheck?.success) {
        return { success: false, message: limitCheck?.message || 'Daily limit reached' };
      }
    }

    let imageUrl = null;
    let videoUrl = null;
    let audioUrl = null;

    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, mediaFile);

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);

        if (mediaType === 'image') imageUrl = publicUrl;
        else if (mediaType === 'video') videoUrl = publicUrl;
        else if (mediaType === 'audio') audioUrl = publicUrl;
      }
    } else if (generatedMediaUrl) {
      try {
        const response = await fetch(generatedMediaUrl);
        if (response.ok) {
          const blob = await response.blob();
          const ext = mediaType === 'audio' ? 'mp3' : mediaType === 'video' ? 'mp4' : 'png';
          const fileName = `${user.id}/ai_${Date.now()}.${ext}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('posts')
            .upload(fileName, blob, { contentType: blob.type });

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('posts')
              .getPublicUrl(fileName);

            if (mediaType === 'image') imageUrl = publicUrl;
            else if (mediaType === 'video') videoUrl = publicUrl;
            else if (mediaType === 'audio') audioUrl = publicUrl;
          }
        }
      } catch (err) {
        console.error('Failed to persist generated media:', err);
        return { success: false, message: 'Failed to save generated media' };
      }
    }

    await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      image_url: imageUrl,
      video_url: videoUrl,
      audio_url: audioUrl,
      media_type: mediaType || null
    });

    const postsData = await fetchPosts(user.id);
    setPosts(postsData);
    setTab('home');
    return { success: true };
  };

  const handleLike = async (postId) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    const isLiked = post?.post_likes?.some(l => l.user_id === user.id);
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      const postOwnerId = post?.user_profiles?.id;
      if (postOwnerId && postOwnerId !== user.id) {
        await supabase.from('notifications').insert({
          user_id: postOwnerId,
          actor_id: user.id,
          type: 'like',
          post_id: postId
        });
      }
    }
    const postsData = await fetchPosts(user.id);
    setPosts(postsData);
  };

  const handleComment = async (postId, content) => {
    if (!user || !content.trim()) return;
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: content.trim() });
    const post = posts.find(p => p.id === postId);
    const postOwnerId = post?.user_profiles?.id;
    if (postOwnerId && postOwnerId !== user.id) {
      await supabase.from('notifications').insert({
        user_id: postOwnerId,
        actor_id: user.id,
        type: 'comment',
        post_id: postId
      });
    }
    const postsData = await fetchPosts(user.id);
    setPosts(postsData);
  };

  const handleSavePost = async (postId) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    const isSaved = post?.saved_posts?.some(s => s.user_id === user.id);
    if (isSaved) {
      await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id });
    }
    const postsData = await fetchPosts(user.id);
    setPosts(postsData);
    const saved = await fetchSavedPosts(user.id);
    setSavedPosts(saved);
  };

  const handleSaveProfile = async (updates) => {
    if (!user) return;
    await supabase.from('user_profiles').update(updates).eq('id', user.id);
    const p = await fetchProfile(user.id);
    setProfile(p);
  };

  const handleDeletePost = async (postId) => {
    if (!user) return;
    await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id);
    const postsData = await fetchPosts(user.id);
    setPosts(postsData);
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
    const postsData = await fetchPosts(user.id);
    setPosts(postsData);
  };

  const [rulesInitialPage, setRulesInitialPage] = useState('index');

  const handleNavigate = (destination) => {
    setSidebarOpen(false);
    setShowNotifications(false);
    setShowPlans(false);
    setShowRules(false);
    setShowMessages(false);
    setShowSearch(false);
    setViewingProfile(null);
    setFocusedPostId(null);

    if (destination === 'plans') setShowPlans(true);
    else if (destination === 'notifications') setShowNotifications(true);
    else if (destination === 'search') setShowSearch(true);
    else if (destination === 'rules' || destination === 'about') {
      setRulesInitialPage('index');
      setShowRules(true);
    }
    else if (destination === 'faq') {
      setRulesInitialPage('faq');
      setShowRules(true);
    }
    else if (destination === 'privacy') {
      setRulesInitialPage('privacy');
      setShowRules(true);
    }
    else if (destination === 'terms') {
      setRulesInitialPage('terms');
      setShowRules(true);
    }
    else if (destination === 'settings') {
      setRulesInitialPage('index');
      setShowRules(true);
    }
    else if (destination === 'messages') setShowMessages(true);
    else setTab(destination);
  };

  const handleUserClick = async (userId) => {
    setShowNotifications(false);
    setShowPlans(false);
    setShowRules(false);
    setShowMessages(false);
    setShowSearch(false);
    setFocusedPostId(null);

    if (!userId || userId === user?.id) {
      setViewingProfile(null);
      setTab('profile');
    } else {
      const p = await fetchProfile(userId);
      if (p) {
        setViewingProfile(p);
        setTab('profile');
      }
    }
  };

  const handleTabChange = (t) => {
    setShowNotifications(false);
    setShowPlans(false);
    setShowRules(false);
    setShowMessages(false);
    setShowSearch(false);
    setViewingProfile(null);
    setFocusedPostId(null);
    setTab(t);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notificationId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
  };

  const handleNotificationClick = async (notification) => {
    setShowNotifications(false);

    if (notification.type === 'follow') {
      if (notification.actor_id) {
        const p = await fetchProfile(notification.actor_id);
        if (p) {
          setViewingProfile(p);
          setTab('profile');
        }
      }
    } else if (notification.type === 'like' || notification.type === 'comment') {
      if (notification.post_id) {
        setFocusedPostId(notification.post_id);
        setTab('home');
      }
    } else if (notification.type === 'tip') {
      if (notification.actor_id) {
        const p = await fetchProfile(notification.actor_id);
        if (p) {
          setViewingProfile(p);
          setTab('profile');
        }
      }
    }
  };

  if (!hasEntered) {
    return <StartupOverlay onEnter={handleEnter} />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Leaf size={48} color={C.emeraldLight} style={{ animation: 'pulse 2s infinite' }} />
      </div>
    );
  }

  if (!user) return <SoundProvider><ToastProvider><Auth onAuth={handleAuth} /></ToastProvider></SoundProvider>;

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <SoundProvider>
    <ToastProvider>
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={profile}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <Header
        user={profile}
        onMenuClick={() => setSidebarOpen(true)}
        onNotifications={() => setShowNotifications(true)}
        onPlansClick={() => setShowPlans(true)}
        unread={unreadCount}
      />

      {showPlans && <PlansPage onBack={() => setShowPlans(false)} currentPlan={userPlan} />}
      {showNotifications && (
        <Notifications
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          loading={false}
          onNotificationClick={handleNotificationClick}
          onMarkRead={handleMarkNotificationRead}
        />
      )}
      {showRules && <Rules onBack={() => setShowRules(false)} initialPage={rulesInitialPage} />}
      {showMessages && (
        <Messages
          onClose={() => setShowMessages(false)}
          currentUserId={user.id}
        />
      )}
      {showSearch && (
        <Search
          onClose={() => setShowSearch(false)}
          onUserClick={handleUserClick}
        />
      )}

      {!showPlans && !showNotifications && !showRules && !showMessages && !showSearch && (
        <>
          {tab === 'home' && (
            <Feed
              posts={posts}
              currentUserId={user.id}
              onLike={handleLike}
              onComment={handleComment}
              onUserClick={handleUserClick}
              onSave={handleSavePost}
              onDelete={handleDeletePost}
              loading={false}
              focusedPostId={focusedPostId}
            />
          )}
          {tab === 'garden' && <Garden user={profile} profile={{ ...profile, plan: userPlan }} />}
          {tab === 'create' && (
            <Create
              onBack={() => setTab('home')}
              onPost={handlePost}
              loading={false}
              userPlan={userPlan}
              currentUserId={user.id}
            />
          )}
          {tab === 'messages' && (
            <Messages
              onClose={() => setTab('home')}
              currentUserId={user.id}
            />
          )}
          {tab === 'profile' && (
            <Profile
              profile={viewingProfile || profile}
              isOwn={!viewingProfile}
              posts={posts}
              savedPosts={savedPosts}
              onBack={viewingProfile ? () => { setViewingProfile(null); setTab('home'); } : null}
              onSave={handleSaveProfile}
              onLogout={handleLogout}
              currentUserId={user.id}
              onLike={handleLike}
              onComment={handleComment}
              onSavePost={handleSavePost}
              onDelete={handleDeletePost}
              onMessage={viewingProfile ? async () => {
                const { startConversation } = await import('./pages/Messages');
                const convId = await startConversation(user.id, viewingProfile.id);
                if (convId) {
                  setShowMessages(true);
                  setViewingProfile(null);
                }
              } : null}
              onPlansClick={() => setShowPlans(true)}
            />
          )}
        </>
      )}

      <Nav tab={tab} setTab={handleTabChange} />
      <AmbientAudio />
    </div>
    </ToastProvider>
    </SoundProvider>
  );
}
