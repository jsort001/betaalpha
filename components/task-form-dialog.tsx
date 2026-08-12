"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS } from "@/components/status-badge";
import type { RecurrenceRule, TaskStatus } from "@/lib/supabase/types";

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

const RECURRENCE_LABELS: Record<RecurrenceRule | "none", string> = {
  none: "One-time",
  weekly: "Weekly",
  monthly: "Monthly",
  semester: "Semester",
};

interface Member {
  id: string;
  name: string;
}

interface PendingMember {
  email: string;
  name: string;
}

interface Board {
  id: string;
  name: string;
}

export interface TaskFormValues {
  id?: string;
  board_id: string;
  title: string;
  description: string;
  owner_id: string | null;
  pending_owner_email: string | null;
  due_date: string;
  status: TaskStatus;
  priority: string;
  recurrence_rule: RecurrenceRule | "none";
}

function defaultValues(defaultBoardId: string): TaskFormValues {
  return {
    board_id: defaultBoardId,
    title: "",
    description: "",
    owner_id: null,
    pending_owner_email: null,
    due_date: "",
    status: "not_started",
    priority: "normal",
    recurrence_rule: "none",
  };
}

const PENDING_PREFIX = "pending:";

export function TaskFormDialog({
  boards,
  defaultBoardId,
  members,
  pendingMembers = [],
  trigger,
  initial,
}: {
  boards: Board[];
  defaultBoardId: string;
  members: Member[];
  pendingMembers?: PendingMember[];
  trigger: React.ReactElement;
  initial?: TaskFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<TaskFormValues>(
    initial ?? defaultValues(defaultBoardId)
  );

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function selectOwner(v: string) {
    if (v === "unassigned") {
      setValues((prev) => ({ ...prev, owner_id: null, pending_owner_email: null }));
    } else if (v.startsWith(PENDING_PREFIX)) {
      setValues((prev) => ({
        ...prev,
        owner_id: null,
        pending_owner_email: v.slice(PENDING_PREFIX.length),
      }));
    } else {
      setValues((prev) => ({ ...prev, owner_id: v, pending_owner_email: null }));
    }
  }

  const ownerSelection = values.owner_id
    ? values.owner_id
    : values.pending_owner_email
      ? `${PENDING_PREFIX}${values.pending_owner_email}`
      : "unassigned";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      board_id: values.board_id,
      title: values.title,
      description: values.description || null,
      owner_id: values.owner_id,
      pending_owner_email: values.pending_owner_email,
      due_date: values.due_date || null,
      status: values.status,
      priority: values.priority,
      recurrence_rule:
        values.recurrence_rule === "none" ? null : values.recurrence_rule,
    };

    if (values.id) {
      await supabase.from("tasks").update(payload).eq("id", values.id);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase
        .from("tasks")
        .insert({ ...payload, created_by: user!.id });
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent onPointerDown={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{values.id ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label>Board</Label>
            <Select
              value={values.board_id}
              onValueChange={(v) => v && update("board_id", v)}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string) => boards.find((b) => b.id === v)?.name ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {boards.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Owner</Label>
              <Select value={ownerSelection} onValueChange={(v) => v && selectOwner(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned">
                    {(v: string) => {
                      if (v === "unassigned") return "Unassigned";
                      if (v.startsWith(PENDING_PREFIX)) {
                        const email = v.slice(PENDING_PREFIX.length);
                        const name = pendingMembers.find((p) => p.email === email)?.name;
                        return name ? `${name} (pending signup)` : email;
                      }
                      return members.find((m) => m.id === v)?.name ?? "Unassigned";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                  {pendingMembers.map((p) => (
                    <SelectItem key={p.email} value={`${PENDING_PREFIX}${p.email}`}>
                      {p.name} (pending signup)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="due_date">Due date</Label>
              <Input
                id="due_date"
                type="date"
                value={values.due_date}
                onChange={(e) => update("due_date", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => v && update("status", v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue>{(v: TaskStatus) => STATUS_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not started</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select
                value={values.priority}
                onValueChange={(v) => v && update("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue>{(v: string) => PRIORITY_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Recurrence</Label>
              <Select
                value={values.recurrence_rule}
                onValueChange={(v) =>
                  v && update("recurrence_rule", v as RecurrenceRule | "none")
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: RecurrenceRule | "none") => RECURRENCE_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">One-time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
