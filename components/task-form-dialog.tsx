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
import type { RecurrenceRule, TaskStatus } from "@/lib/supabase/types";

interface Member {
  id: string;
  name: string;
}

interface TaskFormValues {
  id?: string;
  title: string;
  description: string;
  owner_id: string | null;
  due_date: string;
  status: TaskStatus;
  priority: string;
  recurrence_rule: RecurrenceRule | "none";
}

const DEFAULT_VALUES: TaskFormValues = {
  title: "",
  description: "",
  owner_id: null,
  due_date: "",
  status: "not_started",
  priority: "normal",
  recurrence_rule: "none",
};

export function TaskFormDialog({
  boardId,
  members,
  trigger,
  initial,
}: {
  boardId: string;
  members: Member[];
  trigger: React.ReactElement;
  initial?: TaskFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<TaskFormValues>(initial ?? DEFAULT_VALUES);

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      board_id: boardId,
      title: values.title,
      description: values.description || null,
      owner_id: values.owner_id,
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
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{values.id ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>

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
              <Select
                value={values.owner_id ?? "unassigned"}
                onValueChange={(v) => update("owner_id", v === "unassigned" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
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
                  <SelectValue />
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
                  <SelectValue />
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
                  <SelectValue />
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
