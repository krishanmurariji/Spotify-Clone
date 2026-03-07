import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Home, Search, Library, User, Music2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar-bg/95 backdrop-blur-xl border-b border-border/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Music2 className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-foreground">TuneVerse</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-sidebar-bg border-r border-border/50 w-[260px]">
            <div className="flex flex-col h-full">
              <div className="p-4">
                <div className="flex items-center gap-x-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Music2 className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className="font-display font-bold text-foreground">TuneVerse</span>
                </div>
              </div>

              <div className="flex flex-col gap-y-1 px-3 py-4">
                {[
                  { to: "/", icon: <Home size={20} />, label: "Home" },
                  { to: "/search", icon: <Search size={20} />, label: "Search" },
                  { to: "/library", icon: <Library size={20} />, label: "Library" },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
                    onClick={() => setOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="h-px w-full bg-border/50 my-3" />

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
                      onClick={() => setOpen(false)}
                    >
                      <User size={20} />
                      <span>{user?.name}</span>
                    </Link>
                    <button
                      className="flex items-center gap-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-accent transition w-full text-left"
                      onClick={() => { logout(); setOpen(false); }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition" onClick={() => setOpen(false)}>Log in</Link>
                    <Link to="/signup" className="flex items-center gap-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition" onClick={() => setOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNav;
