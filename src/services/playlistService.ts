import { supabase } from "@/integrations/supabase/client";

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const createPlaylist = async (
  userId: string,
  name: string,
  description?: string
): Promise<Playlist> => {
  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: userId, name, description })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating playlist: ${error.message}`);
  }

  return data;
};

export const fetchUserPlaylists = async (userId: string): Promise<Playlist[]> => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching playlists: ${error.message}`);
  }

  return data;
};

export const addSongToPlaylist = async (
  playlistId: string,
  songId: string
): Promise<void> => {
  // Get the current max position in the playlist
  const { data: maxPositionData } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = maxPositionData ? maxPositionData.position + 1 : 0;

  const { error } = await supabase
    .from('playlist_songs')
    .insert({
      playlist_id: playlistId,
      song_id: songId,
      position: nextPosition
    });

  if (error) {
    throw new Error(`Error adding song to playlist: ${error.message}`);
  }
};

export const removeSongFromPlaylist = async (
  playlistId: string,
  songId: string
): Promise<void> => {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId);

  if (error) {
    throw new Error(`Error removing song from playlist: ${error.message}`);
  }
};

export const deletePlaylist = async (playlistId: string): Promise<void> => {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);

  if (error) {
    throw new Error(`Error deleting playlist: ${error.message}`);
  }
};
