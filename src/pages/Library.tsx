import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlayCircle, Pause, Music, Loader2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserSongs, deleteSong } from "@/services/songService";
import { useToast } from "@/hooks/use-toast";

const Library = () => {
  const { songsList, currentSong, isPlaying, play, pause, resume } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigate("/login");
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);
  
  // Load user's songs when authenticated
  useEffect(() => {
    const loadUserSongs = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        try {
          const songs = await fetchUserSongs(user.id);
          setUserSongs(songs);
        } catch (error) {
          console.error("Error fetching user songs:", error);
          toast({
            variant: "destructive",
            title: "Error loading songs",
            description: "Could not load your songs from the server",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadUserSongs();
  }, [isAuthenticated, user, toast]);
    
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handlePlayPause = (song: Song) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pause() : resume();
    } else {
      play(song);
    }
  };

  const handleEdit = (song: Song) => {
    navigate('/upload', { state: { editSong: song } });
  };

  const handleDelete = async (songId: string) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      try {
        await deleteSong(songId);
        setUserSongs(userSongs.filter(song => song.id !== songId));
        toast({
          title: "Song Deleted",
          description: "The song has been removed successfully",
        });
      } catch (error) {
        console.error("Error deleting song:", error);
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Could not delete the song. Please try again.",
        });
      }
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Sidebar />
      
      <MobileNav />
      
      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8 mt-14 md:mt-0">
        <div className="pt-8 md:pt-16">
          <h1 className="text-3xl font-bold mb-6">Your Library</h1>
          
          {isAuthenticated ? (
            <>
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Uploads</h2>
                  <Link to="/upload">
                    <Button variant="outline" size="sm">
                      Upload Music
                    </Button>
                  </Link>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-spotify" />
                  </div>
                ) : userSongs.length === 0 ? (
                  <div className="bg-neutral-900/50 rounded-lg p-8 text-center">
                    <Music size={48} className="mx-auto mb-4 text-neutral-400" />
                    <h3 className="text-xl font-medium mb-2">No uploaded songs yet</h3>
                    <p className="text-neutral-400 mb-6">Start building your collection by uploading your first song</p>
                    <Link to="/upload">
                      <Button className="bg-spotify hover:bg-spotify-light">
                        Upload Your First Song
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-neutral-900/50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                          <th className="px-4 py-3 text-left font-medium">Song</th>
                          <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Artist</th>
                          <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Album</th>
                          <th className="px-4 py-3 text-center font-medium">Duration</th>
                          <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSongs.map((song) => (
                          <tr 
                            key={song.id} 
                            className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors group"
                            onMouseEnter={() => setHoveredSong(song.id)}
                            onMouseLeave={() => setHoveredSong(null)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-x-3">
                                <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                                  <img 
                                    src={song.coverArt} 
                                    alt={song.title}
                                    className="object-cover h-full w-full"
                                  />
                                  {hoveredSong === song.id && (
                                    <button
                                      onClick={() => handlePlayPause(song)}
                                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white"
                                    >
                                      {currentSong?.id === song.id && isPlaying ? (
                                        <Pause size={20} />
                                      ) : (
                                        <PlayCircle size={20} />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{song.title}</div>
                                  <div className="text-sm text-neutral-400 truncate md:hidden">{song.artist}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-neutral-400 hidden md:table-cell">
                              {song.artist}
                            </td>
                            <td className="px-4 py-3 text-neutral-400 hidden lg:table-cell">
                              {song.album || '-'}
                            </td>
                            <td className="px-4 py-3 text-neutral-400 text-center">
                              {formatTime(song.duration)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(song)}
                                  className="h-8 w-8 p-0 hover:text-spotify"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(song.id)}
                                  className="h-8 w-8 p-0 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Recently Played</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {songsList.slice(0, 6).map((song) => (
                    <div key={song.id} className="bg-neutral-800/50 p-3 rounded-md hover:bg-neutral-800 transition-colors group">
                      <div className="relative aspect-square w-full overflow-hidden rounded-md mb-3">
                        <img 
                          src={song.coverArt} 
                          alt={song.title}
                          className="object-cover h-full w-full"
                        />
                        <button
                          onClick={() => handlePlayPause(song)}
                          className="absolute bottom-2 right-2 h-10 w-10 flex items-center justify-center rounded-full bg-spotify opacity-0 group-hover:opacity-100 hover:scale-105 transition-all"
                        >
                          {currentSong?.id === song.id && isPlaying ? (
                            <Pause className="text-black" size={20} />
                          ) : (
                            <PlayCircle className="text-black" size={20} />
                          )}
                        </button>
                      </div>
                      <div>
                        <div className="font-medium truncate">{song.title}</div>
                        <div className="text-sm text-neutral-400 truncate">{song.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-neutral-900/50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium mb-2">Log in to see your library</h3>
              <p className="text-neutral-400 mb-6">Create and manage your music collection</p>
              <div className="flex gap-4 justify-center">
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-spotify hover:bg-spotify-light">Sign Up</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Library;
