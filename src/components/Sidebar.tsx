import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Library, 
  Heart, 
  Upload, 
  LogOut,
  Music,
  FolderUp,
  Settings,
  User,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NavItem = ({ 
    to, 
    icon, 
    label, 
    badge 
  }: { 
    to: string; 
    icon: React.ReactNode; 
    label: string;
    badge?: string | number;
  }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-x-4 px-4 py-3 rounded-lg text-sm font-medium transition-all group relative",
          isActive 
            ? "bg-neutral-800 text-white" 
            : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
        )}
      >
        <div className={cn(
          "transition-colors",
          isActive && "text-spotify"
        )}>
          {icon}
        </div>
        <span className="truncate flex-1">{label}</span>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-spotify text-black">
            {badge}
          </span>
        )}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-spotify rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <div className="hidden md:flex flex-col h-full w-[280px] bg-black border-r border-neutral-800">
      {/* Header */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-x-3 group">
          <div className="bg-gradient-to-br from-spotify to-green-400 rounded-xl p-2 shadow-lg group-hover:scale-105 transition-transform">
            {/* <Music className="w-6 h-6 text-black" strokeWidth={2.5} /> */}
              <svg
                      width="20"
                      height="20"
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
          <div>
            <div className="text-white text-xl font-bold tracking-tight">TuneVerse</div>
            <div className="text-xs text-neutral-500">Music for everyone</div>
          </div>
        </Link>
      </div>

      <Separator className="bg-neutral-800" />

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="mb-6">
          <NavItem to="/" icon={<Home size={20} />} label="Home" />
          <NavItem to="/search" icon={<Search size={20} />} label="Search" />
          <NavItem to="/library" icon={<Library size={20} />} label="Your Library" />
          {/* Moved Liked Songs directly below Library */}
          <NavItem 
            to="/liked-songs" 
            icon={<Heart size={20} />} 
            label="Liked Songs" 
          />
          {/* Commented out Playlists as requested */}
          {/*
          <NavItem 
            to="/playlists" 
            icon={<Music size={20} />} 
            label="Playlists" 
          />
          */}
        </div>

        {/* <Separator className="bg-neutral-800 my-4" /> */}

        {/* Removed "Your Collection" section */}

        {isAuthenticated && (
          <>
            <Separator className="bg-neutral-800 my-4" />
            
            {/* Upload Section */}
            <div className="space-y-1">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Create
                </h3>
              </div>
              <NavItem 
                to="/upload" 
                icon={<Upload size={20} />} 
                label="Upload Song" 
              />
              <NavItem 
                to="/bulk-upload" 
                icon={<FolderUp size={20} />} 
                label="Bulk Upload" 
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-800">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-x-3 p-3 rounded-lg hover:bg-neutral-800 transition group">
                  <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-spotify transition-all">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-spotify to-green-400 text-black font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-neutral-800 border-neutral-700"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem asChild>
                  <Link 
                    to="/profile" 
                    className="flex items-center cursor-pointer hover:bg-neutral-700"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
               
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 hover:bg-neutral-700 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to="/login">
              <Button 
                variant="outline" 
                className="w-full border-neutral-700 hover:bg-neutral-800"
              >
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button 
                className="w-full bg-spotify hover:bg-spotify/90"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
          <Link to="/privacy" className="hover:text-neutral-300 transition">
            Privacy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-neutral-300 transition">
            Terms
          </Link>
          <span>•</span>
          <Link to="/about" className="hover:text-neutral-300 transition">
            About
          </Link>
        </div>
        <div className="mt-2 text-xs text-neutral-600">
          © 2025 TuneVerse
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
