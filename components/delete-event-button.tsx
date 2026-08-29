"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this event?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    reportWriteError("delete the event", error);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
      Delete
    </Button>
  );
}
