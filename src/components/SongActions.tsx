import React, { useState, useEffect } from "react";
import { Heart, ListPlus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { likeSong, unlikeSong, isLiked } from "@/services/likedSongsService";
import { addSongToPlaylist, fetchUserPlaylists } from "@/services/playlistService";
import type { Playlist } from "@/services/playlistService";

interface SongActionsProps {
  songId: string;
  compact?: boolean;
}

const SongActions: React.FC<SongActionsProps> = ({ songId, compact = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingLike, setLoadingLike] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
      loadPlaylists();
    }
  }, [user, songId]);

  const checkIfLiked = async () => {
    if (!user) return;
    try {
      const result = await isLiked(user.id, songId);
      setLiked(result);
    } catch (error) {
      console.error("Error checking liked status:", error);
    }
  };

  const loadPlaylists = async () => {
    if (!user) return;
    try {
      const userPlaylists = await fetchUserPlaylists(user.id);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to like songs",
      });
      return;
    }

    setLoadingLike(true);
    try {
      if (liked) {
        await unlikeSong(user.id, songId);
        setLiked(false);
        toast({
          title: "Removed from Liked Songs",
        });
      } else {
        await likeSong(user.id, songId);
        setLiked(true);
        toast({
          title: "Added to Liked Songs",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update liked status",
      });
    } finally {
      setLoadingLike(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    if (!user) return;

    try {
      await addSongToPlaylist(playlistId, songId);
      toast({
        title: "Added to Playlist",
        description: `Song added to ${playlistName}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add song to playlist",
      });
    }
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLikeToggle}
        disabled={loadingLike}
        className="hover:bg-white/10"
      >
        <Heart
          className={`h-5 w-5 ${liked ? "fill-spotify text-spotify" : "text-neutral-400"}`}
        />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLikeToggle}
        disabled={loadingLike}
        className="hover:bg-white/10"
      >
        <Heart
          className={`h-5 w-5 ${liked ? "fill-spotify text-spotify" : "text-neutral-400"}`}
        />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="hover:bg-white/10">
              <ListPlus className="mr-2 h-4 w-4" />
              Add to Playlist
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-neutral-800 border-neutral-700">
              {playlists.length === 0 ? (
                <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
              ) : (
                playlists.map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                    className="hover:bg-white/10"
                  >
                    {playlist.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SongActions;
