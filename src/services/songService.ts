import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/contexts/PlayerContext";

// Sanitize filename to only allow S3-safe characters
const sanitizeFilename = (filename: string): string => {
  if (!filename || filename.trim().length === 0) {
    return 'unnamed';
  }
  
  const lastDotIndex = filename.lastIndexOf('.');
  let name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
  
  // Only allow alphanumeric, hyphens, and underscores
  let sanitized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace ALL non-alphanumeric with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Trim underscores from start and end
    .trim();
  
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'unnamed';
  }
  
  // Limit name length
  const maxLength = 200 - ext.length;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Sanitize extension too
  const sanitizedExt = ext.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
  
  return sanitized + (sanitizedExt || '.mp3');
};

// Generate unique filename with timestamp
const generateUniqueFilename = (originalFile: File | null | undefined): string => {
  const timestamp = Date.now();
  
  if (!originalFile || !originalFile.name || originalFile.name.trim().length === 0) {
    console.warn('Invalid file or filename, using default');
    return `${timestamp}-unnamed.mp3`;
  }
  
  const sanitized = sanitizeFilename(originalFile.name);
  
  return `${timestamp}-${sanitized}`;
};

// Check if song already exists in database
export const checkSongExists = async (
  title: string,
  artist: string,
  userId: string
): Promise<{ exists: boolean; song?: Song }> => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('title', title.trim())
      .eq('artist', artist.trim())
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking song existence:', error);
      return { exists: false };
    }

    if (data) {
      return {
        exists: true,
        song: {
          id: data.id,
          title: data.title,
          artist: data.artist,
          album: data.album,
          audioUrl: data.audio_url,
          coverArt: data.cover_art_url,
          duration: data.duration,
          uploadedBy: data.user_id
        }
      };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error in checkSongExists:', error);
    return { exists: false };
  }
};

export const ensureUserProfile = async (userId: string, email: string, name: string): Promise<void> => {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error checking user profile:", error);
    throw new Error(`Error checking user profile: ${error.message}`);
  }

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
  album: string | null,
  audioFile: File,
  coverArtFile: File,
  userId: string,
  userEmail: string = '',
  userName: string = '',
  skipDuplicateCheck: boolean = false
): Promise<Song> => {
  try {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!title || title.trim().length === 0) {
      throw new Error('Song title is required');
    }

    if (!artist || artist.trim().length === 0) {
      throw new Error('Artist name is required');
    }

    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error('Valid audio file is required');
    }

    if (!coverArtFile || !(coverArtFile instanceof File)) {
      throw new Error('Valid cover art file is required');
    }

    if (!skipDuplicateCheck) {
      const duplicateCheck = await checkSongExists(title, artist, userId);
      if (duplicateCheck.exists) {
        throw new Error(`Song "${title}" by "${artist}" already exists in your library`);
      }
    }

    await ensureUserProfile(userId, userEmail, userName);

    // Generate sanitized filenames
    const audioFileName = generateUniqueFilename(audioFile);
    const coverArtFileName = generateUniqueFilename(coverArtFile);

    const audioPath = `${userId}/${audioFileName}`;
    const coverArtPath = `${userId}/${coverArtFileName}`;

    console.log('Uploading audio to path:', audioPath);
    console.log('Uploading cover art to path:', coverArtPath);

    const { data: audioData, error: audioError } = await supabase.storage
      .from('songs')
      .upload(audioPath, audioFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (audioError) {
      console.error('Error uploading audio:', audioError);
      throw new Error(`Error uploading audio: ${audioError.message}`);
    }

    const { data: coverArtData, error: coverArtError } = await supabase.storage
      .from('covers')
      .upload(coverArtPath, coverArtFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (coverArtError) {
      console.error('Error uploading cover art:', coverArtError);
      await supabase.storage.from('songs').remove([audioPath]);
      throw new Error(`Error uploading cover art: ${coverArtError.message}`);
    }

    const { data: audioUrl } = supabase.storage
      .from('songs')
      .getPublicUrl(audioPath);

    const { data: coverArtUrl } = supabase.storage
      .from('covers')
      .getPublicUrl(coverArtPath);

    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert({
        title: title.trim(),
        artist: artist.trim(),
        album: album?.trim() || null,
        audio_url: audioUrl.publicUrl,
        cover_art_url: coverArtUrl.publicUrl,
        duration: 180,
        user_id: userId
      })
      .select()
      .single();

    if (songError) {
      console.error('Error saving song metadata:', songError);
      await supabase.storage.from('songs').remove([audioPath]);
      await supabase.storage.from('covers').remove([coverArtPath]);
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
  } catch (error) {
    console.error('Upload song error:', error);
    throw error;
  }
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
