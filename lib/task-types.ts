import type { TaskStatus } from "@/lib/supabase/types";

export interface Member {
  id: string;
  name: string;
}

export interface PendingMember {
  email: string;
  name: string;
}

export interface Board {
  id: string;
  name: string;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  owner_id: string | null;
  pending_owner_email: string | null;
  assigned_to_everyone: boolean;
  due_date: string | null;
  status: TaskStatus;
  priority: string;
  recurrence_rule: "weekly" | "monthly" | "semester" | null;
  owner_name: string | null;
  commentCount: number;
}
