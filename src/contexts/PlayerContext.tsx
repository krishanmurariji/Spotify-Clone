
import React, { createContext, useContext, useState, useRef, useEffect } from "react";

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArt: string;
  audioUrl: string;
  duration: number;
  uploadedBy?: string;
};

type PlayerContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  seek: (position: number) => void;
  next: () => void;
  previous: () => void;
  songsList: Song[];
  addSong: (song: Song) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Mock songs data
const MOCK_SONGS: Song[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverArt: "https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 200,
  },
  {
    id: "2",
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    coverArt: "https://images.pexels.com/photos/1671163/pexels-photo-1671163.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 180,
  },
  {
    id: "3",
    title: "Dance Monkey",
    artist: "Tones and I",
    album: "The Kids Are Coming",
    coverArt: "https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 210,
  },
];

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [songsList, setSongsList] = useState<Song[]>(MOCK_SONGS);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      // Clean up
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const startProgressTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        const calculatedProgress = 
          (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(calculatedProgress);
        
        if (audioRef.current.ended) {
          next();
        }
      }
    }, 1000);
  };

  const play = (song: Song) => {
    if (currentSong?.id === song.id) {
      resume();
      return;
    }

    setCurrentSong(song);
    
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.oncanplaythrough = () => {
        audioRef.current?.play();
        setIsPlaying(true);
        startProgressTimer();
      };
      audioRef.current.load();
    } else {
      const audio = new Audio(song.audioUrl);
      audio.volume = volume;
      audio.oncanplaythrough = () => {
        audio.play();
        setIsPlaying(true);
        startProgressTimer();
      };
      audioRef.current = audio;
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const resume = () => {
    if (audioRef.current && !isPlaying && currentSong) {
      audioRef.current.play();
      setIsPlaying(true);
      startProgressTimer();
    }
  };

  const changeVolume = (newVolume: number) => {
    if (newVolume < 0) newVolume = 0;
    if (newVolume > 1) newVolume = 1;
    
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const seek = (position: number) => {
    if (audioRef.current && currentSong) {
      const seekTime = (position / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(position);
    }
  };

  const getCurrentSongIndex = () => {
    if (!currentSong) return -1;
    return songsList.findIndex(song => song.id === currentSong.id);
  };

  const next = () => {
    const currentIndex = getCurrentSongIndex();
    if (currentIndex >= 0 && currentIndex < songsList.length - 1) {
      play(songsList[currentIndex + 1]);
    } else if (songsList.length > 0) {
      // Wrap around to first song
      play(songsList[0]);
    }
  };

  const previous = () => {
    const currentIndex = getCurrentSongIndex();
    if (currentIndex > 0) {
      play(songsList[currentIndex - 1]);
    } else if (songsList.length > 0) {
      // Wrap around to last song
      play(songsList[songsList.length - 1]);
    }
  };

  const addSong = (song: Song) => {
    setSongsList(prev => [...prev, song]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        volume,
        play,
        pause,
        resume,
        setVolume: changeVolume,
        seek,
        next,
        previous,
        songsList,
        addSong
      }}
    >
      {children}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
