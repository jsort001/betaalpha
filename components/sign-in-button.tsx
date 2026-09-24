"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignInButton({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (next) callbackUrl.searchParams.set("next", next);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
  }

  return (
    <Button onClick={handleSignIn} disabled={loading} size="lg">
      {loading ? "Redirecting…" : "Sign in with Google"}
    </Button>
  );
}
