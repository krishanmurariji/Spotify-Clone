
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
  
  // Load all songs from database
  useEffect(() => {
    const loadSongs = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const songs = await fetchAllSongs();
          setAllSongs(songs);
        } catch (error) {
          console.error("Error loading songs:", error);
          toast({
            variant: "destructive",
            title: "Error loading songs",
            description: "Could not load songs from the database",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadSongs();
  }, [isAuthenticated, toast]);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = allSongs.filter(
      song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery, allSongs]);
  
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-spotify" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Sidebar />
      
      <MobileNav />
      
      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8 mt-14 md:mt-0">
        <div className="sticky top-0 bg-black/50 backdrop-blur-md py-4 z-10">
          <div className="relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-neutral-800 border-neutral-700 focus-visible:ring-spotify"
            />
          </div>
        </div>
        
        <div className="mt-6">
          {searchQuery.trim() === "" ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold mb-4">Search for songs, artists, or albums</h2>
              <p className="text-neutral-400">Find your favorite music</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold mb-4">No results found</h2>
              <p className="text-neutral-400">Try a different search term</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6">Results for "{searchQuery}"</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Songs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {searchResults.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
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
