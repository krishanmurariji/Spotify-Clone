
import { createClient } from '@supabase/supabase-js';

// For Lovable, get the project ID from the config.toml file
const projectId = 'ttgtiwvfxsvvugixzial';

// Set the Supabase URL and anon key directly
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z3Rpd3ZmeHN2dnVnaXh6aWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NDQzNzUsImV4cCI6MjA1NzQyMDM3NX0.5VoQrPYJSTm8Ve00p_tY4Z0vPemfHrrLVPCCVRZYOMk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
