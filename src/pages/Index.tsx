
import React from "react";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import SongCard from "@/components/SongCard";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { songsList } = usePlayer();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-b from-spotify-dark to-black">
      <Sidebar />
      
      <MobileNav />
      
      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8">
        <header className="flex flex-col gap-y-6 mt-10">
          {isAuthenticated ? (
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name}
            </h1>
          ) : (
            <h1 className="text-3xl font-bold">
              Welcome to TuneVerse
            </h1>
          )}
        </header>
        
        <div className="mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Popular Songs</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
            {songsList.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
        
        <div className="mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Made For You</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {songsList.slice(0, 4).map((song, index) => (
              <div key={index} className="flex items-center gap-x-4 rounded-md bg-neutral-800/50 p-4 transition-all hover:bg-neutral-800">
                <div className="flex-shrink-0 relative h-16 w-16">
                  <img 
                    src={song.coverArt} 
                    alt={song.title}
                    className="object-cover h-full w-full rounded-md"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate font-medium">{song.title}</h3>
                  <p className="truncate text-sm text-neutral-400">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Index;
