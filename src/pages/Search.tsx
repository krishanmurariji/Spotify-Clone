import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import SongCard from "@/components/SongCard";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchAllSongs } from "@/services/songService";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { songsList } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      const timer = setTimeout(() => { if (!isAuthenticated) navigate("/login"); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const loadSongs = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const songs = await fetchAllSongs();
          setAllSongs(songs);
        } catch (error) {
          toast({ variant: "destructive", title: "Error loading songs" });
        } finally {
          setLoading(false);
        }
      }
    };
    loadSongs();
  }, [isAuthenticated, toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") { setSearchResults([]); return; }
    const query = searchQuery.toLowerCase();
    const results = allSongs.filter(
      song =>
        (song.title && song.title.toLowerCase().includes(query)) ||
        (song.artist && song.artist.toLowerCase().includes(query)) ||
        (song.album && song.album.toLowerCase().includes(query))
    );
    setSearchResults(results);
  }, [searchQuery, allSongs]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 overflow-y-auto pb-24 mt-14 md:mt-0">
        <div className="px-4 md:px-8 pt-6 md:pt-8">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Search</h1>
          <div className="relative max-w-lg">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border focus-visible:ring-primary rounded-xl"
            />
          </div>
        </div>

        <div className="px-4 md:px-8 mt-6">
          {searchQuery.trim() === "" ? (
            <div className="text-center py-16">
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display font-semibold text-foreground mb-2">Search for songs</h2>
              <p className="text-muted-foreground">Find your favorite music by title, artist, or album</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-display font-semibold text-foreground mb-2">No results found</h2>
              <p className="text-muted-foreground">Try a different search term</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Results for "{searchQuery}"
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {searchResults.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
};

export default Search;
