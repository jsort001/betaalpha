"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setConfirmOpen(false);
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    reportWriteError("delete the event", error);
    router.refresh();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        onClick={() => setConfirmOpen(true)}
      >
        Delete
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this event?"
        description="This action can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
