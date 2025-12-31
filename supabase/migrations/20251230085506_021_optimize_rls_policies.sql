/*
  # Optimize RLS Policies for Performance

  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) in all RLS policies
    - This prevents re-evaluation of auth function for each row
    - Improves query performance at scale
  
  2. Tables Updated
    - user_profiles: 2 policies
    - posts: 2 policies
    - post_likes: 2 policies
    - comments: 2 policies
    - conversations: 2 policies
    - messages: 2 policies
    - notifications: 2 policies
    - user_plans: 3 policies
    - follows: 2 policies
    - saved_posts: 3 policies
    - gallery_items: 3 policies
    - sound_uploads: 4 policies
    - ai_generations: 3 policies
*/

-- user_profiles policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- posts policies
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
CREATE POLICY "Users can create own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- post_likes policies
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;
CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- comments policies
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- conversations policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (user1_id = (select auth.uid()) OR user2_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (user1_id = (select auth.uid()) OR user2_id = (select auth.uid()));

-- messages policies
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = (select auth.uid()) OR conversations.user2_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.messages;
CREATE POLICY "Users can send messages in own conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = (select auth.uid()) OR conversations.user2_id = (select auth.uid()))
    )
  );

-- notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- user_plans policies
DROP POLICY IF EXISTS "Users can view own plan" ON public.user_plans;
CREATE POLICY "Users can view own plan"
  ON public.user_plans FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can subscribe to plan" ON public.user_plans;
CREATE POLICY "Users can subscribe to plan"
  ON public.user_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own plan" ON public.user_plans;
CREATE POLICY "Users can update own plan"
  ON public.user_plans FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- follows policies
DROP POLICY IF EXISTS "Users can follow" ON public.follows;
CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  TO authenticated
  USING (follower_id = (select auth.uid()));

-- saved_posts policies
DROP POLICY IF EXISTS "Users can view own saved posts" ON public.saved_posts;
CREATE POLICY "Users can view own saved posts"
  ON public.saved_posts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unsave posts" ON public.saved_posts;
CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- gallery_items policies
DROP POLICY IF EXISTS "Users can insert own gallery items" ON public.gallery_items;
CREATE POLICY "Users can insert own gallery items"
  ON public.gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own gallery items" ON public.gallery_items;
CREATE POLICY "Users can update own gallery items"
  ON public.gallery_items FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own gallery items" ON public.gallery_items;
CREATE POLICY "Users can delete own gallery items"
  ON public.gallery_items FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- sound_uploads policies
DROP POLICY IF EXISTS "Users can view own sounds" ON public.sound_uploads;
CREATE POLICY "Users can view own sounds"
  ON public.sound_uploads FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own sounds" ON public.sound_uploads;
CREATE POLICY "Users can insert own sounds"
  ON public.sound_uploads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own sounds" ON public.sound_uploads;
CREATE POLICY "Users can update own sounds"
  ON public.sound_uploads FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own sounds" ON public.sound_uploads;
CREATE POLICY "Users can delete own sounds"
  ON public.sound_uploads FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ai_generations policies
DROP POLICY IF EXISTS "Users can view own generations" ON public.ai_generations;
CREATE POLICY "Users can view own generations"
  ON public.ai_generations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own generations" ON public.ai_generations;
CREATE POLICY "Users can insert own generations"
  ON public.ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own generations" ON public.ai_generations;
CREATE POLICY "Users can update own generations"
  ON public.ai_generations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
