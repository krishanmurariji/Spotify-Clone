import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're certain the user is not authenticated
    // Give some time for the auth state to load
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigate("/login");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  // Show loading while auth is being checked
  if (user === null && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-spotify" />
      </div>
    );
  }

  return <>{children}</>;
};
