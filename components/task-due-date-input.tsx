"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { Input } from "@/components/ui/input";

export function TaskDueDateInput({
  taskId,
  dueDate,
  className = "h-8 w-[150px] text-sm",
  onPointerDown,
}: {
  taskId: string;
  dueDate: string | null;
  className?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  const router = useRouter();

  async function updateDueDate(value: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ due_date: value || null })
      .eq("id", taskId);
    reportWriteError("update the due date", error);
    router.refresh();
  }

  return (
    <Input
      type="date"
      value={dueDate ?? ""}
      onChange={(e) => updateDueDate(e.target.value)}
      onPointerDown={onPointerDown}
      className={className}
    />
  );
}
