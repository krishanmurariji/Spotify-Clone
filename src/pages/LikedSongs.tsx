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
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

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
    <div className="flex h-full min-h-screen bg-gradient-to-b from-spotify-dark to-black">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8 mt-14 md:mt-0">
        <div className="pt-8 md:pt-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
              <Heart className="w-8 h-8 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Liked Songs</h1>
              <p className="text-neutral-400 mt-1">
                {likedSongs.length} {likedSongs.length === 1 ? "song" : "songs"}
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-neutral-400">Loading...</p>
          ) : likedSongs.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-xl text-neutral-400">No liked songs yet</p>
              <p className="text-neutral-500 mt-2">
                Songs you like will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
