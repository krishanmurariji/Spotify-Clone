import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-spotify mb-2">TuneVerse</h1>
            <h2 className="text-2xl font-semibold text-white">Check Your Email</h2>
            <p className="text-gray-400 mt-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-gray-400 mt-2">
              Click the link in the email to reset your password.
            </p>
          </div>

          <div className="bg-zinc-900 p-8 rounded-lg text-center">
            <Link to="/login">
              <Button className="w-full bg-spotify hover:bg-spotify/90">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-spotify mb-2">TuneVerse</h1>
          <h2 className="text-2xl font-semibold text-white">Forgot Password</h2>
          <p className="text-gray-400 mt-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-lg">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border-gray-700 text-white"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-spotify hover:bg-spotify/90"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-spotify hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
