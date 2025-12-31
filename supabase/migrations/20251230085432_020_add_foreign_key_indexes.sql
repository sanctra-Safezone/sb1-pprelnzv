/*
  # Add Foreign Key Indexes for Performance

  1. Performance Improvements
    - Add indexes for all foreign keys to improve query performance
    - Indexes cover: comments, conversations, follows, messages, notifications, post_likes, posts, saved_posts, user_plans
  
  2. Indexed Foreign Keys
    - comments: post_id, user_id
    - conversations: user2_id
    - follows: following_id
    - messages: conversation_id, sender_id
    - notifications: actor_id, post_id, user_id
    - post_likes: user_id
    - posts: user_id
    - saved_posts: post_id
    - user_plans: plan_id
*/

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON public.conversations(user2_id);

-- Follows table indexes
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON public.notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Post likes table indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- Saved posts table indexes
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);

-- User plans table indexes
CREATE INDEX IF NOT EXISTS idx_user_plans_plan_id ON public.user_plans(plan_id);
