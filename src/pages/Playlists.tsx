import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createPlaylist, fetchUserPlaylists, deletePlaylist } from "@/services/playlistService";
import type { Playlist } from "@/services/playlistService";
import { Plus, Music2, Trash2 } from "lucide-react";

const Playlists = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadPlaylists();
  }, [isAuthenticated, navigate, user]);

  const loadPlaylists = async () => {
    if (!user) return;
    
    try {
      const userPlaylists = await fetchUserPlaylists(user.id);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load playlists",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPlaylistName.trim()) return;

    setCreating(true);
    try {
      await createPlaylist(user.id, newPlaylistName, newPlaylistDescription || undefined);
      toast({
        title: "Playlist Created",
        description: `${newPlaylistName} has been created successfully`,
      });
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setDialogOpen(false);
      loadPlaylists();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create playlist",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    if (!confirm(`Are you sure you want to delete "${playlistName}"?`)) return;

    try {
      await deletePlaylist(playlistId);
      toast({
        title: "Playlist Deleted",
        description: `${playlistName} has been deleted`,
      });
      loadPlaylists();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete playlist",
      });
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-b from-spotify-dark to-black">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8 mt-14 md:mt-0">
        <div className="pt-8 md:pt-16">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Your Playlists</h1>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-spotify hover:bg-spotify-light">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-neutral-800">
                <DialogHeader>
                  <DialogTitle>Create New Playlist</DialogTitle>
                  <DialogDescription>
                    Give your playlist a name and description
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePlaylist} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Playlist Name</Label>
                    <Input
                      id="name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="My Awesome Playlist"
                      className="bg-neutral-800 border-neutral-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Describe your playlist..."
                      className="bg-neutral-800 border-neutral-700"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-spotify hover:bg-spotify-light"
                    disabled={creating || !newPlaylistName.trim()}
                  >
                    {creating ? "Creating..." : "Create Playlist"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <p className="text-neutral-400">Loading...</p>
          ) : playlists.length === 0 ? (
            <div className="text-center py-12">
              <Music2 className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-xl text-neutral-400">No playlists yet</p>
              <p className="text-neutral-500 mt-2">
                Create your first playlist to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-neutral-800/50 p-4 rounded-lg hover:bg-neutral-800 transition cursor-pointer group"
                >
                  <div className="aspect-square bg-neutral-700 rounded mb-3 flex items-center justify-center relative">
                    <Music2 className="w-12 h-12 text-neutral-500" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-500/80 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id, playlist.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-semibold truncate">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-sm text-neutral-400 truncate mt-1">
                      {playlist.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Playlists;
