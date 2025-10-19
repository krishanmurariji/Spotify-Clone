import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter a 6-digit verification code",
      });
      return;
    }

    if (!userId) return;

    setLoading(true);
    try {
      const verified = await verifyEmail(userId, code);
      if (verified) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (userData) {
        await supabase.functions.invoke('send-verification', {
          body: { email: userData.email, userId },
        });

        toast({
          title: "Code resent",
          description: "A new verification code has been sent to your email",
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-spotify mb-2">TuneVerse</h1>
          <h2 className="text-2xl font-semibold text-white">Verify Your Email</h2>
          <p className="text-gray-400 mt-2">
            We've sent a 6-digit code to your email
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6 bg-zinc-900 p-8 rounded-lg">
          <div>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest bg-black border-gray-700 text-white"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-spotify hover:bg-spotify/90"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-spotify hover:underline text-sm"
            >
              Didn't receive a code? Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
