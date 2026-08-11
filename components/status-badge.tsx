import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/supabase/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

const VARIANTS: Record<TaskStatus, "secondary" | "default" | "destructive" | "outline"> = {
  not_started: "outline",
  in_progress: "secondary",
  done: "default",
  blocked: "destructive",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
