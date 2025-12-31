import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (err) {
        setError(err.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const refetch = useCallback(async () => {
    if (!userId) return null;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
    return data;
  }, [userId]);

  return { profile, loading, error, refetch };
};

export const useProfileStats = (userId) => {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      const [followerRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId)
      ]);

      setFollowerCount(followerRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      setLoading(false);
    };

    fetchStats();
  }, [userId]);

  return { followerCount, followingCount, loading };
};

export const useFollow = (currentUserId, targetUserId) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!currentUserId || !targetUserId) {
      setLoading(false);
      return;
    }

    const checkFollow = async () => {
      setLoading(true);

      const [followCheck, followerCountRes, followingCountRes] = await Promise.all([
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)
          .maybeSingle(),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', targetUserId),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', targetUserId)
      ]);

      setIsFollowing(!!followCheck.data);
      setFollowerCount(followerCountRes.count || 0);
      setFollowingCount(followingCountRes.count || 0);
      setLoading(false);
    };

    checkFollow();
  }, [currentUserId, targetUserId]);

  const follow = useCallback(async () => {
    if (!currentUserId || !targetUserId || isFollowing) return;

    setIsFollowing(true);
    setFollowerCount(prev => prev + 1);

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: currentUserId, following_id: targetUserId });

    if (error) {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
    } else {
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        actor_id: currentUserId,
        type: 'follow'
      });
    }
  }, [currentUserId, targetUserId, isFollowing]);

  const unfollow = useCallback(async () => {
    if (!currentUserId || !targetUserId || !isFollowing) return;

    setIsFollowing(false);
    setFollowerCount(prev => prev - 1);

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);

    if (error) {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
    }
  }, [currentUserId, targetUserId, isFollowing]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [isFollowing, follow, unfollow]);

  return { isFollowing, loading, followerCount, followingCount, follow, unfollow, toggleFollow };
};

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      const searchTerm = query.trim().toLowerCase();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (!error && data) {
        setResults(data);
      } else {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, setQuery, results, loading, clear };
};

export const useDelete = (onSuccess) => {
  const [deleting, setDeleting] = useState(false);

  const deletePost = useCallback(async (postId) => {
    setDeleting(true);
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    setDeleting(false);
    if (!error && onSuccess) onSuccess();
    return !error;
  }, [onSuccess]);

  const deleteComment = useCallback(async (commentId) => {
    setDeleting(true);
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    setDeleting(false);
    if (!error && onSuccess) onSuccess();
    return !error;
  }, [onSuccess]);

  const deleteGalleryItem = useCallback(async (itemId) => {
    setDeleting(true);
    const { error } = await supabase.from('gallery_items').delete().eq('id', itemId);
    setDeleting(false);
    if (!error && onSuccess) onSuccess();
    return !error;
  }, [onSuccess]);

  return { deleting, deletePost, deleteComment, deleteGalleryItem };
};
