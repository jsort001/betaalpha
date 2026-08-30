"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface TrashedBoard {
  id: string;
  name: string;
  category: string | null;
  deleted_at: string;
}

export function BoardTrashManager({ boards }: { boards: TrashedBoard[] }) {
  const router = useRouter();
  const [pendingPurge, setPendingPurge] = useState<{ id: string; name: string } | null>(
    null
  );

  async function handleRestore(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("boards")
      .update({ deleted_at: null })
      .eq("id", id);
    reportWriteError("restore the board", error);
    router.refresh();
  }

  async function handlePurge(id: string) {
    setPendingPurge(null);
    const supabase = createClient();
    const { error } = await supabase.from("boards").delete().eq("id", id);
    reportWriteError("permanently delete the board", error);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {boards.map((board) => (
        <Card key={board.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{board.name}</span>
              {board.category && <Badge variant="secondary">{board.category}</Badge>}
              <span className="text-sm text-muted-foreground">
                Deleted{" "}
                {new Date(board.deleted_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleRestore(board.id)}>
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setPendingPurge({ id: board.id, name: board.name })}
              >
                Delete forever
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {boards.length === 0 && (
        <p className="text-sm text-muted-foreground">Trash is empty.</p>
      )}

      <ConfirmDialog
        open={pendingPurge !== null}
        onOpenChange={(open) => !open && setPendingPurge(null)}
        title={pendingPurge ? `Permanently delete "${pendingPurge.name}"?` : ""}
        description="Every task on this board will be permanently deleted too. This action can't be undone."
        confirmLabel="Delete forever"
        onConfirm={() => pendingPurge && handlePurge(pendingPurge.id)}
      />
    </div>
  );
}
