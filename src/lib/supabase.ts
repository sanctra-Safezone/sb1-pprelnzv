import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  cty_balance: number;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_profiles?: UserProfile;
  post_likes?: { user_id: string }[];
  comments?: Comment[];
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: UserProfile;
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  daily_image_limit: number;
  daily_sound_limit: number;
  can_download: boolean;
  can_sell: boolean;
  has_watermark: boolean;
  price_monthly: number;
};

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow' | 'tip';
  post_id: string | null;
  read_at: string | null;
  created_at: string;
  actor?: UserProfile;
};

export function sanitizeUsername(username: string): string {
  if (!username) return '';
  return username.replace(/^@+/, '').trim();
}

export function formatUsername(username: string): string {
  const clean = sanitizeUsername(username);
  return clean ? `@${clean}` : '';
}
