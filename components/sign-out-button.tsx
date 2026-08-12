"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className={cn(
        "border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current",
        className
      )}
    >
      Sign out
    </Button>
  );
}
