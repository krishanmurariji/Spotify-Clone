
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      // Toast is already shown in the AuthContext for signup failures
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="flex items-center justify-center p-4 md:p-8">
        <Link to="/" className="flex items-center gap-x-2">
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
          <span className="text-neutral-100 text-xl font-extrabold">TuneVerse</span>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6 bg-neutral-900 p-6 rounded-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Sign up for TuneVerse</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit" className="w-full bg-spotify hover:bg-spotify-light" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </div>
          </form>
          
          <div className="h-[1px] w-full bg-neutral-800" />
          
          <div className="text-center">
            <p className="text-neutral-400">Already have an account?</p>
            <Link to="/login" className="text-white font-medium hover:underline">
              Log in to TuneVerse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
