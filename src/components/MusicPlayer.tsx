import React from "react";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";

const MusicPlayer = () => {
  const { currentSong, isPlaying, progress, volume, pause, resume, setVolume, seek, next, previous } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTimeInSeconds = (currentSong.duration * progress) / 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-player-bg/95 backdrop-blur-xl border-t border-border/50 px-4 py-2.5 z-50">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-x-3 w-1/4 min-w-0">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
            <img src={currentSong.coverArt} alt={currentSong.title} className="object-cover h-full w-full" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-medium truncate block text-foreground">{currentSong.title}</span>
            <span className="text-xs text-muted-foreground truncate block">{currentSong.artist}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center max-w-lg w-2/4">
          <div className="flex items-center gap-x-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Shuffle size={16} />
            </Button>
            <Button onClick={previous} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <SkipBack size={18} />
            </Button>
            <Button
              onClick={isPlaying ? pause : resume}
              size="icon"
              className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </Button>
            <Button onClick={next} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <SkipForward size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Repeat size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-x-2 w-full mt-1.5">
            <span className="text-[11px] text-muted-foreground w-10 text-right tabular-nums">
              {formatTime(currentTimeInSeconds)}
            </span>
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={(values) => seek(values[0])}
              className="cursor-pointer"
            />
            <span className="text-[11px] text-muted-foreground w-10 tabular-nums">
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-x-2 w-1/4 justify-end">
          <Button
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(values) => setVolume(values[0] / 100)}
            className="w-24 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
