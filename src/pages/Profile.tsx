import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Trash2, 
  Key, 
  Mail, 
  User as UserIcon, 
  Shield,
  Check,
  Edit2,
  X,
  LogOut,
  ChevronRight,
  Heart,
  Music,
  Upload,
  Clock
} from "lucide-react";
import { z } from "zod";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export default function Profile() {
  const { user, updateProfile, resetPassword, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Name cannot be empty",
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name });
      setIsEditingName(false);
      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: publicUrl });
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload avatar",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatar_url) return;

    setLoading(true);
    try {
      const urlParts = user.avatar_url.split('/avatars/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('avatars').remove([filePath]);
      }

      await updateProfile({ avatar_url: '' });
      
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      });
    } catch (error) {
      console.error("Avatar removal error:", error);
      toast({
        variant: "destructive",
        title: "Removal failed",
        description: "Failed to remove avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(newPassword);
      setShowPasswordChange(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 overflow-y-auto px-2 pb-24 md:px-8 mt-14 md:mt-0">
        <div className="max-w-6xl mx-auto pt-8 md:pt-16 space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-neutral-400">Manage your account settings and preferences</p>
          </div>

          {/* Profile Header Card */}
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
            <div className="bg-gradient-to-r from-spotify/20 via-green-500/20 to-emerald-500/20 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-neutral-900 shadow-2xl">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="text-5xl md:text-6xl bg-gradient-to-br from-spotify to-green-400 text-black font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Avatar Upload Overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-white mb-1" />
                        <span className="text-xs text-white font-medium">Change</span>
                      </>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-neutral-800 border-neutral-700 text-2xl md:text-4xl font-bold h-auto py-2 max-w-md"
                          disabled={loading}
                          autoFocus
                        />
                        <Button
                          size="icon"
                          onClick={handleUpdateProfile}
                          disabled={loading || name === user.name}
                          className="bg-spotify hover:bg-spotify/90 h-10 w-10 flex-shrink-0"
                        >
                          <Check size={20} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setName(user.name);
                            setIsEditingName(false);
                          }}
                          className="h-10 w-10 flex-shrink-0 hover:bg-white/10"
                        >
                          <X size={20} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 justify-center md:justify-start">
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                          {user.name}
                        </h2>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsEditingName(true)}
                          className="h-9 w-9 hover:bg-white/10"
                        >
                          <Edit2 size={18} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-neutral-300 justify-center md:justify-start mb-4">
                    <Mail size={18} />
                    <span className="text-lg">{user.email}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.avatar_url && (
                      <Button
                        onClick={handleRemoveAvatar}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="border-neutral-700 hover:bg-neutral-800"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Photo
                      </Button>
                    )}
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      size="sm"
                      className="bg-spotify hover:bg-spotify/90"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {user.avatar_url ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Account Information */}
            <Card className="bg-neutral-900 border-neutral-800 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-spotify/20 rounded-lg">
                    <UserIcon className="h-5 w-5 text-spotify" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Account Information</CardTitle>
                    <CardDescription>Manage your personal details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Display Name</label>
                  <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-800/80 transition-colors">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">This is how others see you</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingName(true)}
                      className="hover:bg-neutral-700"
                    >
                      <Edit2 size={14} className="mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Email Address</label>
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={16} className="text-neutral-400" />
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <p className="text-xs text-neutral-500">Your email address cannot be changed</p>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Security Settings */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Security</CardTitle>
                      <CardDescription>Account security</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!showPasswordChange ? (
                    <Button
                      onClick={() => setShowPasswordChange(true)}
                      variant="outline"
                      className="w-full border-neutral-700 hover:bg-neutral-800 justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Key size={16} />
                        <span>Change Password</span>
                      </div>
                      <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-3">
                      <div className="space-y-2">
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          disabled={loading}
                        />
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="bg-neutral-800 border-neutral-700 text-white"
                          disabled={loading}
                        />
                        <p className="text-xs text-neutral-500">
                          8+ chars with uppercase, lowercase, number & special char
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={loading}
                          size="sm"
                          className="flex-1 bg-spotify hover:bg-spotify/90"
                        >
                          {loading ? "Updating..." : "Update"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowPasswordChange(false);
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          variant="ghost"
                          size="sm"
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <Separator className="bg-neutral-800" />

                  <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full justify-between border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </div>
                    <ChevronRight size={16} />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Access</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/library">
                <Card className="bg-neutral-900 border-neutral-800 hover:border-spotify hover:bg-neutral-800/50 transition-all cursor-pointer group">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-spotify/20 rounded-lg group-hover:bg-spotify/30 transition-colors">
                        <Music className="h-6 w-6 text-spotify" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-0.5">Your Library</h3>
                        <p className="text-sm text-neutral-400">View your songs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/liked-songs">
                <Card className="bg-neutral-900 border-neutral-800 hover:border-spotify hover:bg-neutral-800/50 transition-all cursor-pointer group">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-spotify/20 rounded-lg group-hover:bg-spotify/30 transition-colors">
                        <Heart className="h-6 w-6 text-spotify" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-0.5">Liked Songs</h3>
                        <p className="text-sm text-neutral-400">Your favorites</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/upload">
                <Card className="bg-neutral-900 border-neutral-800 hover:border-spotify hover:bg-neutral-800/50 transition-all cursor-pointer group">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-spotify/20 rounded-lg group-hover:bg-spotify/30 transition-colors">
                        <Upload className="h-6 w-6 text-spotify" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-0.5">Upload</h3>
                        <p className="text-sm text-neutral-400">Add new music</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
}
