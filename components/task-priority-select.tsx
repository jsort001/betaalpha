"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_LABELS } from "@/components/task-form-dialog";

export function TaskPrioritySelect({
  taskId,
  priority,
  className = "w-[110px]",
  onPointerDown,
}: {
  taskId: string;
  priority: string;
  className?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  const router = useRouter();

  async function updatePriority(value: string) {
    const supabase = createClient();
    await supabase.from("tasks").update({ priority: value }).eq("id", taskId);
    router.refresh();
  }

  return (
    <Select value={priority} onValueChange={(v) => v && updatePriority(v)}>
      <SelectTrigger size="sm" className={className} onPointerDown={onPointerDown}>
        <SelectValue>{(v: string) => PRIORITY_LABELS[v]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">{PRIORITY_LABELS.low}</SelectItem>
        <SelectItem value="normal">{PRIORITY_LABELS.normal}</SelectItem>
        <SelectItem value="high">{PRIORITY_LABELS.high}</SelectItem>
      </SelectContent>
    </Select>
  );
}
