import { supabase } from "@/integrations/supabase/client";

export const likeSong = async (userId: string, songId: string): Promise<void> => {
  const { error } = await supabase
    .from('liked_songs')
    .insert({ user_id: userId, song_id: songId });

  if (error) {
    throw new Error(`Error liking song: ${error.message}`);
  }
};

export const unlikeSong = async (userId: string, songId: string): Promise<void> => {
  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', userId)
    .eq('song_id', songId);

  if (error) {
    throw new Error(`Error unliking song: ${error.message}`);
  }
};

export const isLiked = async (userId: string, songId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', userId)
    .eq('song_id', songId)
    .maybeSingle();

  if (error) {
    console.error("Error checking if song is liked:", error);
    return false;
  }

  return !!data;
};

export const fetchLikedSongs = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Error fetching liked songs: ${error.message}`);
  }

  return data.map(item => item.song_id);
};
