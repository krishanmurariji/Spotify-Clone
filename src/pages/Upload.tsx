import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePlayer, Song } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { Upload as UploadIcon, Loader2 } from "lucide-react";
import { uploadSong, updateSong } from "@/services/songService";
import * as mm from 'music-metadata';

const Upload = () => {
  const location = useLocation();
  const editSong = location.state?.editSong as Song | undefined;

  const [title, setTitle] = useState(editSong?.title || "");
  const [artist, setArtist] = useState(editSong?.artist || "");
  const [album, setAlbum] = useState(editSong?.album || "");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(editSong?.coverArt || null);
  const [duration, setDuration] = useState<number>(editSong?.duration || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);

  const { addSong, refreshSongs } = usePlayer();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ variant: "destructive", title: "Authentication Required", description: "You need to log in to upload songs" });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast]);

  const extractMetadata = async (file: File) => {
    setIsExtractingMetadata(true);
    try {
      const metadata = await mm.parseBlob(file, { duration: true });
      const { common, format } = metadata;
      if (common.title && !editSong) setTitle(common.title);
      if (common.artist && !editSong) setArtist(common.artist);
      if (common.album && !editSong) setAlbum(common.album);
      if (format.duration) setDuration(Math.round(format.duration));
      if (common.picture && common.picture.length > 0 && !editSong) {
        const picture = common.picture[0];
        const base64String = btoa(new Uint8Array(picture.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const imageUrl = `data:${picture.format};base64,${base64String}`;
        setCoverArtPreview(imageUrl);
        const blob = await (await fetch(imageUrl)).blob();
        const coverFile = new File([blob], "cover.jpg", { type: picture.format });
        setCoverArtFile(coverFile);
      }
      toast({ title: "Metadata Extracted", description: `Duration: ${Math.round(format.duration || 0)}s` });
    } catch (error) {
      toast({ variant: "destructive", title: "Metadata Extraction Failed", description: "Please fill manually." });
    } finally {
      setIsExtractingMetadata(false);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      extractMetadata(file);
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverArtFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverArtPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ variant: "destructive", title: "Authentication Required" }); navigate("/login"); return; }
    if (!title || !artist) { toast({ variant: "destructive", title: "Missing Information", description: "Please fill in title and artist." }); return; }
    if (!editSong && (!audioFile || !coverArtFile)) { toast({ variant: "destructive", title: "Missing Files", description: "Please upload both files." }); return; }

    setIsLoading(true);
    try {
      const roundedDuration = Math.round(duration || 180);
      if (editSong) {
        await updateSong(editSong.id, title, artist, album, audioFile || undefined, coverArtFile || undefined, roundedDuration);
        toast({ title: "Song Updated" });
      } else {
        const newSong = await uploadSong(title, artist, album, audioFile!, coverArtFile!, user.id, user.email, user.name, roundedDuration);
        addSong(newSong);
        toast({ title: "Song Uploaded" });
      }
      setTitle(""); setArtist(""); setAlbum(""); setAudioFile(null); setCoverArtFile(null); setCoverArtPreview(null); setDuration(0);
      navigate("/library");
    } catch (error) {
      toast({ variant: "destructive", title: editSong ? "Update Failed" : "Upload Failed", description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 overflow-y-auto pb-24 mt-14 md:mt-0">
        <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-8">
          <h1 className="text-2xl font-display font-bold text-foreground mb-8">
            {editSong ? "Edit Your Music" : "Upload Your Music"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="audioFile">Audio File {editSong && "(Optional)"}</Label>
                  <Input id="audioFile" type="file" accept="audio/*" onChange={handleAudioFileChange} className="bg-card border-border" />
                  {audioFile && <p className="text-xs text-primary">Selected: {audioFile.name}</p>}
                  {isExtractingMetadata && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> Extracting metadata...
                    </p>
                  )}
                  {duration > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Song Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter song title" className="bg-card border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist</Label>
                  <Input id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Enter artist name" className="bg-card border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="album">Album (Optional)</Label>
                  <Input id="album" value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="Enter album name" className="bg-card border-border" />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-full aspect-square bg-card rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-border/50">
                  {coverArtPreview ? (
                    <img src={coverArtPreview} alt="Cover Art Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <UploadIcon size={48} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">{isExtractingMetadata ? "Loading cover art..." : "Upload Cover Art"}</p>
                    </div>
                  )}
                </div>
                <Label htmlFor="coverArt" className="cursor-pointer bg-card hover:bg-accent text-center w-full py-2.5 rounded-lg transition border border-border/50 text-sm">
                  {coverArtFile || coverArtPreview ? "Change Cover Art" : "Select Cover Art"}
                </Label>
                <Input id="coverArt" type="file" accept="image/*" onChange={handleCoverArtChange} className="hidden" />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={() => navigate("/library")}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:opacity-90 rounded-lg" disabled={isLoading || isExtractingMetadata}>
                {isLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} />{editSong ? "Updating..." : "Uploading..."}</span>
                ) : (editSong ? "Update Song" : "Upload Song")}
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
