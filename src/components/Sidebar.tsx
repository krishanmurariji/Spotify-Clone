import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Search, Library, Heart, Upload, LogOut, FolderUp, User, ChevronRight, Bell, Settings, Music2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex flex-col h-full w-[240px] bg-sidebar-bg border-r border-border/50 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link to="/" className="flex items-center gap-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Music2 className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-display font-bold tracking-tight text-foreground">
            TuneVerse
          </span>
        </Link>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <NavItem to="/" icon={<Home size={18} />} label="Home" />
        <NavItem to="/search" icon={<Search size={18} />} label="Search" />
        <NavItem to="/library" icon={<Library size={18} />} label="Your Library" />
        <NavItem to="/liked-songs" icon={<Heart size={18} />} label="Liked Songs" />

        {isAuthenticated && (
          <>
            <Separator className="my-4 bg-border/50" />
            <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Create
            </p>
            <NavItem to="/upload" icon={<Upload size={18} />} label="Upload Song" />
            <NavItem to="/bulk-upload" icon={<FolderUp size={18} />} label="Bulk Upload" />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <Link
              to="/profile"
              className="flex items-center gap-x-3 p-2.5 rounded-lg hover:bg-accent transition group"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-x-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-accent transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to="/login">
              <button className="w-full py-2 text-sm rounded-lg border border-border text-foreground hover:bg-accent transition">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="w-full py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
