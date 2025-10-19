import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId }: VerificationRequest = await req.json();

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store verification code in database (expires in 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    const { error: dbError } = await supabase
      .from("verification_codes")
      .insert({
        user_id: userId,
        code: code,
        expires_at: expiresAt,
        verified: false,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // Send verification email
    const emailResponse = await resend.emails.send({
      from: "TuneVerse <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Email - TuneVerse",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1DB954;">Welcome to TuneVerse!</h1>
          <p>Thank you for signing up. Please verify your email address using the code below:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't create an account with TuneVerse, please ignore this email.</p>
          <p>Best regards,<br>The TuneVerse Team</p>
        </div>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-verification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
