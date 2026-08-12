"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this event?")) return;
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", eventId);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
      Delete
    </Button>
  );
}
