import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Trash2, Key } from "lucide-react";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export default function Profile() {
  const { user, updateProfile, resetPassword } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name });
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an image file",
      });
      return;
    }

    // Validate file size (max 5MB)
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
      // Extract file path from URL
      const urlParts = user.avatar_url.split('/avatars/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('avatars').remove([filePath]);
      }

      await updateProfile({ avatar_url: '' });
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
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Profile Settings</h1>

      {/* Avatar Section */}
      <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Profile Picture</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="text-2xl bg-spotify text-white">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="bg-spotify hover:bg-spotify/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              {uploadingAvatar ? "Uploading..." : "Upload"}
            </Button>

            {user.avatar_url && (
              <Button
                onClick={handleRemoveAvatar}
                disabled={loading}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Information */}
      <form onSubmit={handleUpdateProfile} className="bg-zinc-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Profile Information</h2>
        
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black border-gray-700 text-white"
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Email</label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="bg-black border-gray-700 text-gray-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || name === user.name}
          className="bg-spotify hover:bg-spotify/90"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Password Section */}
      <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Password</h2>
          {!showPasswordChange && (
            <Button
              onClick={() => setShowPasswordChange(true)}
              variant="outline"
              className="border-spotify text-spotify hover:bg-spotify hover:text-white"
            >
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          )}
        </div>

        {showPasswordChange && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black border-gray-700 text-white"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-400">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black border-gray-700 text-white"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-spotify hover:bg-spotify/90"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowPasswordChange(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
