import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import SongCard from "@/components/SongCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { fetchLikedSongs } from "@/services/likedSongsService";
import { Heart } from "lucide-react";

const LikedSongs = () => {
  const { user, isAuthenticated } = useAuth();
  const { songsList } = usePlayer();
  const navigate = useNavigate();
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    loadLikedSongs();
  }, [isAuthenticated, navigate, user]);

  const loadLikedSongs = async () => {
    if (!user) return;
    try {
      const likedIds = await fetchLikedSongs(user.id);
      setLikedSongIds(likedIds);
    } catch (error) {
      console.error("Error loading liked songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const likedSongs = songsList.filter(song => likedSongIds.includes(song.id));

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 overflow-y-auto pb-24 mt-14 md:mt-0">
        <div className="px-4 md:px-8 pt-6 md:pt-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Liked Songs</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {likedSongs.length} {likedSongs.length === 1 ? "song" : "songs"}
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : likedSongs.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-display font-semibold text-foreground">No liked songs yet</p>
              <p className="text-muted-foreground mt-1">Songs you like will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {likedSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
};

export default LikedSongs;
