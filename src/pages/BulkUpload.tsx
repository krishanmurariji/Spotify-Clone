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
import { Upload as UploadIcon, Loader2, X, Check, AlertCircle } from "lucide-react";
import { uploadSong, checkSongExists } from "@/services/songService";
import * as mm from 'music-metadata';

interface FileWithMetadata {
  file: File;
  title: string;
  artist: string;
  album: string;
  coverArt: string | null;
  coverArtFile: File | null;
  status: 'pending' | 'processing' | 'success' | 'error' | 'skipped';
  progress: number;
  error?: string;
}

const BulkUpload = () => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { addSong } = usePlayer();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Generate random cover art with gradient
  const generateDefaultCoverArt = async (title: string): Promise<File> => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    const colors = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#30cfd0', '#330867'],
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    gradient.addColorStop(0, randomColor[0]);
    gradient.addColorStop(1, randomColor[1]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = 250;
    const words = title.split(' ');
    let line = '';
    let y = 150;
    
    for (let word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 150, y);
        line = word + ' ';
        y += 30;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 150, y);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob!], 'cover.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.9);
    });
  };

  // Extract metadata from audio file
  const extractMetadata = async (file: File): Promise<FileWithMetadata> => {
    try {
      const metadata = await mm.parseBlob(file);
      const { common } = metadata;
      
      let coverArtFile: File | null = null;
      let coverArt: string | null = null;
      
      if (common.picture && common.picture.length > 0) {
        const picture = common.picture[0];
        const base64String = btoa(
          new Uint8Array(picture.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        coverArt = `data:${picture.format};base64,${base64String}`;
        const blob = await (await fetch(coverArt)).blob();
        coverArtFile = new File([blob], "cover.jpg", { type: picture.format });
      }
      
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const title = common.title || fileName;
      const artist = common.artist || "Unknown Artist";
      const album = common.album || "Unknown Album";
      
      if (!coverArtFile) {
        coverArtFile = await generateDefaultCoverArt(title);
        const reader = new FileReader();
        coverArt = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(coverArtFile!);
        });
      }
      
      return {
        file,
        title,
        artist,
        album,
        coverArt,
        coverArtFile,
        status: 'pending',
        progress: 0,
      };
    } catch (error) {
      console.error("Error extracting metadata:", error);
      
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const coverArtFile = await generateDefaultCoverArt(fileName);
      const reader = new FileReader();
      const coverArt = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(coverArtFile);
      });
      
      return {
        file,
        title: fileName,
        artist: "Unknown Artist",
        album: "Unknown Album",
        coverArt,
        coverArtFile,
        status: 'pending',
        progress: 0,
      };
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const filesWithMetadata = await Promise.all(
        selectedFiles.map(file => extractMetadata(file))
      );
      
      setFiles(filesWithMetadata);
      
      toast({
        title: "Files Processed",
        description: `${filesWithMetadata.length} files ready for upload`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "Error processing some files",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (index: number, field: string, value: string) => {
    const updatedFiles = [...files];
    updatedFiles[index] = { ...updatedFiles[index], [field]: value };
    setFiles(updatedFiles);
  };

  // Upload single file with duplicate check
  const uploadSingleFile = async (fileData: FileWithMetadata, index: number) => {
    try {
      const updatedFiles = [...files];
      updatedFiles[index].status = 'processing';
      setFiles([...updatedFiles]);
      
      // Check if song already exists
      const duplicateCheck = await checkSongExists(
        fileData.title,
        fileData.artist,
        user!.id
      );
      
      if (duplicateCheck.exists) {
        updatedFiles[index].status = 'skipped';
        updatedFiles[index].error = 'Song already exists in your library';
        updatedFiles[index].progress = 100;
        setFiles([...updatedFiles]);
        return { success: true, skipped: true };
      }
      
      // Upload the song (skip duplicate check since we already checked)
      const newSong = await uploadSong(
        fileData.title,
        fileData.artist,
        fileData.album,
        fileData.file,
        fileData.coverArtFile!,
        user!.id,
        user!.email,
        user!.name,
        true // Skip duplicate check in uploadSong since we already checked
      );
      
      addSong(newSong);
      
      updatedFiles[index].status = 'success';
      updatedFiles[index].progress = 100;
      setFiles([...updatedFiles]);
      
      return { success: true, skipped: false };
    } catch (error) {
      const updatedFiles = [...files];
      updatedFiles[index].status = 'error';
      updatedFiles[index].error = error instanceof Error ? error.message : 'Upload failed';
      setFiles([...updatedFiles]);
      
      return { success: false, skipped: false, error };
    }
  };

  // Upload all files
  const handleBulkUpload = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to log in to upload songs",
      });
      return;
    }
    
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Selected",
        description: "Please select files to upload",
      });
      return;
    }
    
    setIsUploading(true);
    
    let skippedCount = 0;
    
    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending' || files[i].status === 'error') {
        const result = await uploadSingleFile(files[i], i);
        if (result.skipped) {
          skippedCount++;
        }
      }
    }
    
    setIsUploading(false);
    
    const successCount = files.filter(f => f.status === 'success').length;
    const errorCount = files.filter(f => f.status === 'error').length;
    
    toast({
      title: "Upload Complete",
      description: `${successCount} uploaded, ${skippedCount} skipped (duplicates), ${errorCount} failed`,
    });
    
    if (errorCount === 0) {
      setTimeout(() => navigate("/library"), 2000);
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-b from-spotify-dark to-black">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8 mt-14 md:mt-0">
        <div className="max-w-5xl mx-auto pt-8 md:pt-16">
          <h1 className="text-3xl font-bold mb-8">Bulk Upload Music</h1>
          
          <div className="space-y-6">
            <div className="bg-neutral-900 p-6 rounded-lg">
              <Label htmlFor="bulkFiles" className="text-lg mb-4 block">
                Select Multiple Audio Files
              </Label>
              <Input
                id="bulkFiles"
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileSelect}
                className="bg-neutral-800 border-neutral-700"
                disabled={isProcessing || isUploading}
              />
              {isProcessing && (
                <p className="text-sm text-blue-500 mt-2 flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Processing files and extracting metadata...
                </p>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Files to Upload ({files.length})
                  </h2>
                  <Button
                    onClick={handleBulkUpload}
                    disabled={isUploading || files.every(f => f.status === 'success' || f.status === 'skipped')}
                    className="bg-spotify hover:bg-spotify-light"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2" size={16} />
                        Upload All
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  {files.map((fileData, index) => (
                    <div
                      key={index}
                      className="bg-neutral-900 p-4 rounded-lg border border-neutral-800"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 flex-shrink-0 bg-neutral-800 rounded overflow-hidden">
                          {fileData.coverArt && (
                            <img
                              src={fileData.coverArt}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            value={fileData.title}
                            onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                            placeholder="Title"
                            className="bg-neutral-800 border-neutral-700 text-sm"
                            disabled={isUploading}
                          />
                          <Input
                            value={fileData.artist}
                            onChange={(e) => updateFileMetadata(index, 'artist', e.target.value)}
                            placeholder="Artist"
                            className="bg-neutral-800 border-neutral-700 text-sm"
                            disabled={isUploading}
                          />
                          <Input
                            value={fileData.album}
                            onChange={(e) => updateFileMetadata(index, 'album', e.target.value)}
                            placeholder="Album"
                            className="bg-neutral-800 border-neutral-700 text-sm"
                            disabled={isUploading}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {fileData.status === 'pending' && (
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-400"
                              disabled={isUploading}
                            >
                              <X size={20} />
                            </button>
                          )}
                          {fileData.status === 'processing' && (
                            <Loader2 className="animate-spin text-blue-500" size={20} />
                          )}
                          {fileData.status === 'success' && (
                            <Check className="text-green-500" size={20} />
                          )}
                          {fileData.status === 'skipped' && (
                            <AlertCircle className="text-yellow-500" size={20} />
                          )}
                          {fileData.status === 'error' && (
                            <AlertCircle className="text-red-500" size={20} />
                          )}
                        </div>
                      </div>

                      {(fileData.status === 'processing' || fileData.status === 'success' || fileData.status === 'skipped') && (
                        <div className="mt-3">
                          <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                fileData.status === 'success' 
                                  ? 'bg-green-500' 
                                  : fileData.status === 'skipped'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${fileData.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {(fileData.status === 'error' || fileData.status === 'skipped') && fileData.error && (
                        <p className={`text-xs mt-2 flex items-center gap-1 ${
                          fileData.status === 'skipped' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          <AlertCircle size={12} />
                          {fileData.error}
                        </p>
                      )}

                      <p className="text-xs text-neutral-500 mt-2">{fileData.file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length === 0 && !isProcessing && (
              <div className="bg-neutral-900 p-8 rounded-lg text-center">
                <UploadIcon size={48} className="mx-auto mb-4 text-neutral-500" />
                <h3 className="text-lg font-semibold mb-2">No Files Selected</h3>
                <p className="text-neutral-400 mb-4">
                  Select multiple audio files to upload them in bulk
                </p>
                <ul className="text-sm text-neutral-500 text-left max-w-md mx-auto space-y-2">
                  <li>• Metadata will be automatically extracted from files</li>
                  <li>• Missing metadata will be auto-generated</li>
                  <li>• Duplicate songs will be automatically skipped</li>
                  <li>• You can edit metadata before uploading</li>
                  <li>• Cover art will be generated if not found in files</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default BulkUpload;
