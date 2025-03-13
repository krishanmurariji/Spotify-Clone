
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlayCircle, Pause, Clock, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchUserSongs } from "@/services/songService";
import { useToast } from "@/hooks/use-toast";

const Library = () => {
  const { songsList, currentSong, isPlaying, play, pause, resume } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  
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
                        <tr className="border-b border-neutral-800">
                          <th className="px-4 py-3 text-left w-12">#</th>
                          <th className="px-4 py-3 text-left">Title</th>
                          <th className="px-4 py-3 text-left hidden md:table-cell">Album</th>
                          <th className="px-4 py-3 text-right">
                            <Clock size={16} />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSongs.map((song, index) => (
                          <tr 
                            key={song.id} 
                            className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handlePlayPause(song)}
                                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white"
                              >
                                {currentSong?.id === song.id && isPlaying ? (
                                  <Pause size={16} />
                                ) : (
                                  <PlayCircle size={16} />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-x-3">
                                <div className="h-10 w-10 rounded overflow-hidden">
                                  <img 
                                    src={song.coverArt} 
                                    alt={song.title}
                                    className="object-cover h-full w-full"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">{song.title}</div>
                                  <div className="text-sm text-neutral-400">{song.artist}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-neutral-400 hidden md:table-cell">
                              {song.album}
                            </td>
                            <td className="px-4 py-3 text-neutral-400 text-right">
                              {formatTime(song.duration)}
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
                    <div key={song.id} className="bg-neutral-800/50 p-3 rounded-md hover:bg-neutral-800 transition-colors">
                      <div className="relative aspect-square w-full overflow-hidden rounded-md mb-3">
                        <img 
                          src={song.coverArt} 
                          alt={song.title}
                          className="object-cover h-full w-full"
                        />
                        <button
                          onClick={() => handlePlayPause(song)}
                          className="absolute bottom-2 right-2 h-10 w-10 flex items-center justify-center rounded-full bg-spotify opacity-0 hover:scale-105 transition-all group-hover:opacity-100"
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
