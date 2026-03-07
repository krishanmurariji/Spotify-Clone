import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Pause, Music, Loader2, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserSongs, deleteSong } from "@/services/songService";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Library = () => {
  const { songsList, currentSong, isPlaying, play, pause, resume } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) navigate("/login");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const loadUserSongs = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        try {
          const songs = await fetchUserSongs(user.id);
          setUserSongs(songs);
        } catch (error) {
          console.error("Error fetching user songs:", error);
          toast({ variant: "destructive", title: "Error loading songs", description: "Could not load your songs" });
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
        toast({ title: "Song Deleted", description: "The song has been removed successfully" });
      } catch (error) {
        console.error("Error deleting song:", error);
        toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the song." });
      }
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 overflow-y-auto pb-24 mt-14 md:mt-0">
        <div className="px-4 md:px-8 pt-6 md:pt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">Your Library</h1>
            <Link to="/upload">
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5">
                Upload Music
              </Button>
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userSongs.length === 0 ? (
                <div className="rounded-2xl bg-card border border-border/50 p-12 text-center">
                  <Music size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-display font-semibold mb-2 text-foreground">No uploaded songs yet</h3>
                  <p className="text-muted-foreground mb-6">Start building your collection</p>
                  <Link to="/upload">
                    <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-6">
                      Upload Your First Song
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                  {/* Table header */}
                  <div className="flex items-center px-4 py-3 border-b border-border/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <div className="flex-1">Title</div>
                    <div className="w-40 hidden md:block">Artist</div>
                    <div className="w-40 hidden lg:block">Album</div>
                    <div className="w-20 text-center">Actions</div>
                  </div>
                  {/* Song rows */}
                  {userSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center px-4 py-3 border-b border-border/30 last:border-b-0 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div
                          className="relative h-10 w-10 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => handlePlayPause(song)}
                        >
                          <img src={song.coverArt} alt={song.title} className="object-cover h-full w-full" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentSong?.id === song.id && isPlaying ? (
                              <Pause size={16} className="text-white" />
                            ) : (
                              <Play size={16} className="text-white ml-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className={`text-sm font-medium truncate ${currentSong?.id === song.id ? 'text-primary' : 'text-foreground'}`}>
                            {song.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate md:hidden">{song.artist}</div>
                        </div>
                      </div>
                      <div className="w-40 text-sm text-muted-foreground truncate hidden md:block">{song.artist}</div>
                      <div className="w-40 text-sm text-muted-foreground truncate hidden lg:block">{song.album || '—'}</div>
                      <div className="w-20 flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => handleEdit(song)} className="cursor-pointer gap-2">
                              <Edit size={14} /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(song.id)}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 size={14} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recently Played */}
              {songsList.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recently Played</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {songsList.slice(0, 6).map((song) => (
                      <div
                        key={song.id}
                        className="bg-card p-3 rounded-xl hover:bg-accent transition-colors group cursor-pointer"
                        onClick={() => handlePlayPause(song)}
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-2.5">
                          <img src={song.coverArt} alt={song.title} className="object-cover h-full w-full" />
                          <div className="absolute bottom-2 right-2 h-9 w-9 flex items-center justify-center rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                            {currentSong?.id === song.id && isPlaying ? (
                              <Pause className="text-primary-foreground" size={16} />
                            ) : (
                              <Play className="text-primary-foreground ml-0.5" size={16} />
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-medium truncate text-foreground">{song.title}</div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-card border border-border/50 p-12 text-center">
              <h3 className="text-xl font-display font-semibold mb-2 text-foreground">Log in to see your library</h3>
              <p className="text-muted-foreground mb-6">Create and manage your music collection</p>
              <div className="flex gap-4 justify-center">
                <Link to="/login"><Button variant="outline">Log In</Button></Link>
                <Link to="/signup"><Button className="bg-primary text-primary-foreground">Sign Up</Button></Link>
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
