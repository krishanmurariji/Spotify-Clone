import React from "react";
import { Play, Pause } from "lucide-react";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import SongActions from "./SongActions";

interface SongCardProps {
  song: Song;
  className?: string;
}

const SongCard: React.FC<SongCardProps> = ({ song, className }) => {
  const { currentSong, isPlaying, play, pause, resume } = usePlayer();
  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;

  const handlePlay = () => {
    if (currentSong?.id === song.id) {
      isPlaying ? pause() : resume();
    } else {
      play(song);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl bg-card p-3 transition-all hover:bg-accent album-hover-effect",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <img
          src={song.coverArt}
          alt={song.title}
          className="object-cover h-full w-full transition-all group-hover:opacity-80"
        />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-primary shadow-lg opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={isCurrentlyPlaying ? "Pause" : "Play"}
        >
          {isCurrentlyPlaying ? (
            <Pause className="text-primary-foreground" size={18} />
          ) : (
            <Play className="text-primary-foreground ml-0.5" size={18} />
          )}
        </button>

        {isCurrentlyPlaying && (
          <div className="absolute bottom-2 left-2 flex items-center gap-x-1">
            <span className="h-1.5 w-1.5 animate-pulse-opacity rounded-full bg-primary"></span>
            <span className="h-1.5 w-1.5 animate-pulse-opacity rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></span>
            <span className="h-1.5 w-1.5 animate-pulse-opacity rounded-full bg-primary" style={{ animationDelay: "0.4s" }}></span>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">{song.title}</h3>
          <p className="truncate text-xs text-muted-foreground mt-0.5">{song.artist}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <SongActions songId={song.id} compact />
        </div>
      </div>
    </div>
  );
};

export default SongCard;
