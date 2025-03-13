
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export type Tables = {
  users: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
  songs: {
    id: string;
    title: string;
    artist: string;
    album: string;
    cover_art_url: string;
    audio_url: string;
    duration: number;
    user_id: string;
    created_at: string;
  };
};
