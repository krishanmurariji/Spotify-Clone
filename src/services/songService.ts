
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/contexts/PlayerContext";

export const ensureUserProfile = async (userId: string, email: string, name: string): Promise<void> => {
  // Check if the user already exists in the users table
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
    console.error("Error checking user profile:", error);
    throw new Error(`Error checking user profile: ${error.message}`);
  }

  // If user doesn't exist, create the profile
  if (!data) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: name || 'User',
        email: email || '',
      });

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      throw new Error(`Error creating user profile: ${insertError.message}`);
    }

    console.log("User profile created successfully");
  }
};

export const uploadSong = async (
  title: string,
  artist: string,
  album: string,
  audioFile: File,
  coverArtFile: File,
  userId: string,
  userEmail: string = '',
  userName: string = ''
): Promise<Song> => {
  // Ensure user profile exists before proceeding
  await ensureUserProfile(userId, userEmail, userName);

  // Upload audio file
  const audioFileName = `${userId}/${Date.now()}-${audioFile.name}`;
  const { data: audioData, error: audioError } = await supabase.storage
    .from('songs')
    .upload(audioFileName, audioFile);

  if (audioError) {
    throw new Error(`Error uploading audio: ${audioError.message}`);
  }

  // Upload cover art
  const coverArtFileName = `${userId}/${Date.now()}-${coverArtFile.name}`;
  const { data: coverArtData, error: coverArtError } = await supabase.storage
    .from('covers')
    .upload(coverArtFileName, coverArtFile);

  if (coverArtError) {
    // Clean up the audio file if cover art upload fails
    await supabase.storage.from('songs').remove([audioFileName]);
    throw new Error(`Error uploading cover art: ${coverArtError.message}`);
  }

  // Get public URLs
  const { data: audioUrl } = supabase.storage
    .from('songs')
    .getPublicUrl(audioFileName);

  const { data: coverArtUrl } = supabase.storage
    .from('covers')
    .getPublicUrl(coverArtFileName);

  // Store song metadata in the database
  const { data: songData, error: songError } = await supabase
    .from('songs')
    .insert({
      title,
      artist,
      album,
      audio_url: audioUrl.publicUrl,
      cover_art_url: coverArtUrl.publicUrl,
      duration: 180, // Default duration as we can't easily determine it
      user_id: userId
    })
    .select()
    .single();

  if (songError) {
    // Clean up the uploaded files if metadata insertion fails
    await supabase.storage.from('songs').remove([audioFileName]);
    await supabase.storage.from('covers').remove([coverArtFileName]);
    throw new Error(`Error saving song metadata: ${songError.message}`);
  }

  return {
    id: songData.id,
    title: songData.title,
    artist: songData.artist,
    album: songData.album,
    audioUrl: songData.audio_url,
    coverArt: songData.cover_art_url,
    duration: songData.duration,
    uploadedBy: songData.user_id
  };
};

export const fetchAllSongs = async (): Promise<Song[]> => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching songs: ${error.message}`);
  }

  return data.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    audioUrl: song.audio_url,
    coverArt: song.cover_art_url,
    duration: song.duration,
    uploadedBy: song.user_id
  }));
};

export const fetchUserSongs = async (userId: string): Promise<Song[]> => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching user songs: ${error.message}`);
  }

  return data.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    audioUrl: song.audio_url,
    coverArt: song.cover_art_url,
    duration: song.duration,
    uploadedBy: song.user_id
  }));
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`);

  if (error) {
    throw new Error(`Error searching songs: ${error.message}`);
  }

  return data.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    audioUrl: song.audio_url,
    coverArt: song.cover_art_url,
    duration: song.duration,
    uploadedBy: song.user_id
  }));
};
