
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { Upload as UploadIcon, Loader2 } from "lucide-react";
import { uploadSong } from "@/services/songService";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addSong, refreshSongs } = usePlayer();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to log in to upload songs",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast]);

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverArtFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setCoverArtPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to log in to upload songs",
      });
      navigate("/login");
      return;
    }
    
    if (!title || !artist || !album || !audioFile || !coverArtFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields and upload both audio and cover art files.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload song to Supabase with user profile info
      const newSong = await uploadSong(
        title,
        artist,
        album,
        audioFile,
        coverArtFile,
        user.id,
        user.email,
        user.name
      );
      
      // Add song to player context
      addSong(newSong);
      
      toast({
        title: "Song Uploaded",
        description: "Your song has been uploaded successfully!",
      });
      
      // Reset form
      setTitle("");
      setArtist("");
      setAlbum("");
      setAudioFile(null);
      setCoverArtFile(null);
      setCoverArtPreview(null);
      
      // Navigate to library
      navigate("/library");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error uploading your song. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-b from-spotify-dark to-black">
      <Sidebar />
      
      <MobileNav />
      
      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8 mt-14 md:mt-0">
        <div className="max-w-3xl mx-auto pt-8 md:pt-16">
          <h1 className="text-3xl font-bold mb-8">Upload Your Music</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Song Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter song title"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist</Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Enter artist name"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="album">Album</Label>
                  <Input
                    id="album"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="Enter album name"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="audioFile">Audio File</Label>
                  <Input
                    id="audioFile"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="bg-neutral-800 border-neutral-700"
                  />
                  {audioFile && (
                    <p className="text-xs text-green-500">
                      Selected: {audioFile.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="w-full aspect-square bg-neutral-800 rounded-md overflow-hidden mb-3 flex items-center justify-center">
                  {coverArtPreview ? (
                    <img 
                      src={coverArtPreview} 
                      alt="Cover Art Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <UploadIcon size={48} className="mx-auto mb-2 text-neutral-500" />
                      <p className="text-neutral-500">Upload Cover Art</p>
                    </div>
                  )}
                </div>
                
                <Label 
                  htmlFor="coverArt" 
                  className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-center w-full py-2 rounded-md transition"
                >
                  {coverArtFile ? "Change Cover Art" : "Select Cover Art"}
                </Label>
                <Input
                  id="coverArt"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverArtChange}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full bg-spotify hover:bg-spotify-light" disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload Song"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Upload;
