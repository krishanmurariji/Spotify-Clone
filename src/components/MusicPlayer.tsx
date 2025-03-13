
import React from "react";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer, Song } from "@/contexts/PlayerContext";

const MusicPlayer = () => {
  const { 
    currentSong, 
    isPlaying, 
    progress, 
    volume,
    play, 
    pause, 
    resume, 
    setVolume, 
    seek, 
    next, 
    previous 
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTimeInSeconds = (currentSong.duration * progress) / 100;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/90 p-2 backdrop-blur-md">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-x-4 w-1/4">
          <div className="relative h-14 w-14 rounded overflow-hidden">
            <img 
              src={currentSong.coverArt} 
              alt={currentSong.title} 
              className="object-cover h-full w-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate">{currentSong.title}</span>
            <span className="text-xs text-neutral-400">{currentSong.artist}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center max-w-lg w-2/4">
          <div className="flex items-center gap-x-4">
            <Button
              onClick={previous}
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white transition"
            >
              <SkipBack size={20} />
            </Button>
            
            <Button
              onClick={isPlaying ? pause : resume}
              variant="secondary"
              size="icon"
              className="rounded-full bg-white text-black hover:scale-105 transition"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            
            <Button
              onClick={next}
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white transition"
            >
              <SkipForward size={20} />
            </Button>
          </div>
          
          <div className="flex items-center gap-x-2 w-full mt-2">
            <span className="text-xs text-neutral-400 w-10 text-right">
              {formatTime(currentTimeInSeconds)}
            </span>
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={(values) => seek(values[0])}
              className="cursor-pointer"
            />
            <span className="text-xs text-neutral-400 w-10">
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-x-2 w-1/4 justify-end">
          <Button
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white transition"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
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
