import React, { useEffect, useState } from "react";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import SongCard from "@/components/SongCard";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllSongs } from "@/services/songService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Pause, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { songsList, setSongsList, currentSong, isPlaying, play, pause, resume } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) navigate("/login");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const loadSongs = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const songs = await fetchAllSongs();
          setSongsList(songs);
        } catch (error) {
          console.error("Error loading songs:", error);
          toast({ variant: "destructive", title: "Error loading songs", description: "Could not load songs from the database" });
        } finally {
          setLoading(false);
        }
      }
    };
    loadSongs();
  }, [isAuthenticated, toast, setSongsList]);

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

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const featuredSong = songsList[0];

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <div className="px-4 md:px-8 pt-6 md:pt-8">
          <h1 className="text-2xl font-display font-bold text-foreground">Home</h1>
        </div>

        {/* Featured Album Section */}
        {featuredSong && (
          <div className="px-4 md:px-8 mt-6">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Featured</h2>
            <div className="flex flex-col md:flex-row gap-6 p-5 rounded-2xl bg-card border border-border/50">
              <div className="w-full md:w-56 aspect-square rounded-xl overflow-hidden flex-shrink-0 shadow-xl">
                <img src={featuredSong.coverArt} alt={featuredSong.title} className="object-cover h-full w-full" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-primary mb-1">Featured Track</p>
                  <h3 className="text-2xl font-display font-bold text-foreground">{featuredSong.title}</h3>
                  <p className="text-muted-foreground mt-1">{featuredSong.artist} • {featuredSong.album || 'Single'}</p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Button
                    onClick={() => handlePlayPause(featuredSong)}
                    className="bg-primary hover:opacity-90 text-primary-foreground rounded-full px-6 gap-2"
                  >
                    {currentSong?.id === featuredSong.id && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    {currentSong?.id === featuredSong.id && isPlaying ? "Pause" : "Play Now"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popular Songs List */}
        {songsList.length > 0 && (
          <div className="px-4 md:px-8 mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Popular</h2>
              <button className="text-xs font-medium text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-1">
              {songsList.slice(0, 6).map((song, index) => (
                <div
                  key={song.id}
                  className="song-row group cursor-pointer"
                  onClick={() => handlePlayPause(song)}
                >
                  <span className="w-8 text-center text-sm text-muted-foreground font-medium tabular-nums">
                    {currentSong?.id === song.id && isPlaying ? (
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="h-3 w-0.5 animate-pulse-opacity rounded-full bg-primary"></span>
                        <span className="h-4 w-0.5 animate-pulse-opacity rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></span>
                        <span className="h-2 w-0.5 animate-pulse-opacity rounded-full bg-primary" style={{ animationDelay: "0.4s" }}></span>
                      </div>
                    ) : (
                      String(index + 1).padStart(2, '0')
                    )}
                  </span>
                  <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                    <img src={song.coverArt} alt={song.title} className="object-cover h-full w-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${currentSong?.id === song.id ? 'text-primary' : 'text-foreground'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
                    {formatTime(song.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Songs Grid */}
        {songsList.length > 0 && (
          <div className="px-4 md:px-8 mt-10">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">All Songs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {songsList.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </div>
        )}

        {songsList.length === 0 && (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No songs available yet. Upload your first song!</p>
          </div>
        )}
      </div>

      <MusicPlayer />
    </div>
  );
};

export default Index;
