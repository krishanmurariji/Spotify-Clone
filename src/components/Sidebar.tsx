
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library, PlusCircle, Heart, Upload, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-x-4 text-sm font-medium transition-colors hover:text-white py-1",
        location.pathname === to ? "text-white" : "text-neutral-400"
      )}
    >
      {icon}
      <span className="truncate w-full">{label}</span>
    </Link>
  );

  return (
    <div className="hidden md:flex flex-col h-full w-[300px] bg-black p-2">
      <div className="flex flex-col gap-y-4 px-5 py-4">
        <div className="flex items-center gap-x-2">
          <div className="bg-white rounded-full p-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM17.521 17.34C17.281 17.699 16.861 17.84 16.5 17.6C13.68 15.919 10.14 15.5 6 16.54C5.58 16.64 5.22 16.34 5.12 15.96C5.02 15.54 5.32 15.18 5.7 15.08C10.14 14.0 14.02 14.48 17.16 16.32C17.52 16.56 17.659 17.02 17.521 17.34ZM18.961 14.14C18.661 14.56 18.121 14.739 17.701 14.439C14.501 12.54 9.76 11.909 5.96 13.089C5.479 13.229 4.979 12.969 4.839 12.509C4.7 12.009 4.96 11.519 5.42 11.379C9.76 10.069 14.921 10.759 18.641 12.939C19.041 13.209 19.241 13.759 18.961 14.14ZM19.081 10.839C15.221 8.639 8.841 8.439 5.161 9.599C4.561 9.779 3.941 9.439 3.761 8.839C3.581 8.239 3.921 7.619 4.521 7.439C8.801 6.139 15.821 6.359 20.161 8.939C20.701 9.239 20.901 9.959 20.581 10.5C20.281 11.02 19.561 11.239 19.081 10.839Z"
                fill="black"
              />
            </svg>
          </div>
          <div className="text-neutral-100 text-lg font-extrabold">TuneVerse</div>
        </div>
        <div className="flex flex-col gap-y-4 mt-4">
          <NavItem to="/" icon={<Home size={20} />} label="Home" />
          <NavItem to="/search" icon={<Search size={20} />} label="Search" />
          <NavItem to="/library" icon={<Library size={20} />} label="Your Library" />
          <div className="mt-4">
            <NavItem to="/playlists" icon={<PlusCircle size={20} />} label="Create Playlist" />
            <NavItem to="/liked-songs" icon={<Heart size={20} />} label="Liked Songs" />
          </div>
          {isAuthenticated && (
            <NavItem to="/upload" icon={<Upload size={20} />} label="Upload Song" />
          )}
        </div>
      </div>
      <div className="mt-auto px-5 py-4">
        <div className="h-[1px] w-full bg-neutral-800 mb-4" />
        {isAuthenticated && user && (
          <div className="mb-4">
            <Link
              to="/profile"
              className="flex items-center gap-x-3 p-2 rounded-lg hover:bg-neutral-800 transition"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-spotify text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            </Link>
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full mt-2 justify-start text-neutral-400 hover:text-white"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
