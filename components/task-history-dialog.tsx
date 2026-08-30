"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { summarizeHistoryEntry, type HistoryRow } from "@/lib/task-history";
import type { Member } from "@/lib/task-types";

function completionDuration(rows: HistoryRow[]): string | null {
  const created = rows.find((r) => r.change_type === "created");
  if (!created) return null;

  const completed = rows.find((r) => {
    if (r.change_type !== "status_changed") return false;
    const details = r.details as { new?: Record<string, unknown> } | null;
    return details?.new?.status === "done";
  });
  if (!completed) return null;

  const ms =
    new Date(completed.created_at).getTime() - new Date(created.created_at).getTime();
  const hours = ms / (1000 * 60 * 60);
  if (hours < 24) {
    const rounded = Math.max(1, Math.round(hours));
    return `Completed in ${rounded} hour${rounded === 1 ? "" : "s"}`;
  }
  const days = Math.round(hours / 24);
  return `Completed in ${days} day${days === 1 ? "" : "s"}`;
}

export function TaskHistoryDialog({
  taskId,
  members,
  trigger,
}: {
  taskId: string;
  members: Member[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<HistoryRow[]>([]);

  const nameById = new Map(members.map((m) => [m.id, m.name]));
  const duration = completionDuration(rows);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("task_history")
      .select("id, changed_by, change_type, details, created_at")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, [open, taskId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex max-h-[80vh] flex-col gap-4">
          <DialogHeader>
            <DialogTitle>History</DialogTitle>
          </DialogHeader>
          {!loading && duration && (
            <p className="text-sm font-medium text-foreground">{duration}</p>
          )}
          <div className="flex flex-col gap-3 overflow-y-auto">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!loading && rows.length === 0 && (
              <p className="text-sm text-muted-foreground">No history yet.</p>
            )}
            {rows.map((row) => (
              <div key={row.id} className="border-b border-border pb-2 last:border-0">
                <p className="text-sm">{summarizeHistoryEntry(row, nameById)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
