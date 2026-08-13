"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
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

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  mentionedIds: string[];
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
const TASK_FORM_ID = "task-form-fields";

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

  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [taggedIds, setTaggedIds] = useState<Set<string>>(new Set());
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const nameById = new Map(members.map((m) => [m.id, m.name]));
  const taskId = values.id;

  async function loadComments(id: string) {
    setCommentsLoading(true);
    const supabase = createClient();

    const { data: rows } = await supabase
      .from("task_comments")
      .select("id, body, created_at, author_id")
      .eq("task_id", id)
      .order("created_at", { ascending: true });

    const commentIds = (rows ?? []).map((r) => r.id);
    const { data: mentions } = commentIds.length
      ? await supabase
          .from("comment_mentions")
          .select("comment_id, user_id")
          .in("comment_id", commentIds)
      : { data: [] };

    const mentionsByComment = new Map<string, string[]>();
    for (const m of mentions ?? []) {
      const list = mentionsByComment.get(m.comment_id) ?? [];
      list.push(m.user_id);
      mentionsByComment.set(m.comment_id, list);
    }

    setComments(
      (rows ?? []).map((r) => ({
        ...r,
        mentionedIds: mentionsByComment.get(r.id) ?? [],
      }))
    );
    setCommentsLoading(false);
  }

  useEffect(() => {
    if (open && taskId) {
      loadComments(taskId);
      createClient()
        .auth.getUser()
        .then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    }
    if (!open) {
      setEditingCommentId(null);
      setEditingBody("");
    }
  }, [open, taskId]);

  function startEditComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditingBody(comment.body);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingBody("");
  }

  async function saveEditComment(commentId: string) {
    if (!editingBody.trim() || !taskId) return;
    setSavingEdit(true);
    const supabase = createClient();
    await supabase
      .from("task_comments")
      .update({ body: editingBody.trim() })
      .eq("id", commentId);
    setSavingEdit(false);
    setEditingCommentId(null);
    setEditingBody("");
    loadComments(taskId);
  }

  function toggleTag(id: string) {
    setTaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || !taskId) return;
    setPosting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: newComment } = await supabase
      .from("task_comments")
      .insert({ task_id: taskId, author_id: user!.id, body: commentBody.trim() })
      .select("id")
      .single();

    if (newComment && taggedIds.size > 0) {
      await supabase.from("comment_mentions").insert(
        Array.from(taggedIds).map((userId) => ({
          comment_id: newComment.id,
          user_id: userId,
        }))
      );
    }

    setCommentBody("");
    setTaggedIds(new Set());
    setPosting(false);
    loadComments(taskId);
  }

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
      <DialogContent className="sm:max-w-lg" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex max-h-[85vh] flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{values.id ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-y-auto">
            <form
              id={TASK_FORM_ID}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      <SelectItem value="not_started">{STATUS_LABELS.not_started}</SelectItem>
                      <SelectItem value="in_progress">{STATUS_LABELS.in_progress}</SelectItem>
                      <SelectItem value="done">{STATUS_LABELS.done}</SelectItem>
                      <SelectItem value="blocked">{STATUS_LABELS.blocked}</SelectItem>
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
            </form>

            {taskId && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <p className="text-sm font-semibold">Comments</p>
                <div className="flex flex-col gap-3">
                  {commentsLoading && (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  )}
                  {!commentsLoading && comments.length === 0 && (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {nameById.get(comment.author_id) ?? "Unknown"}
                        </span>
                        <span>
                          {new Date(comment.created_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="mt-1 flex flex-col gap-2">
                          <Textarea
                            value={editingBody}
                            onChange={(e) => setEditingBody(e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={cancelEditComment}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              disabled={savingEdit}
                              onClick={() => saveEditComment(comment.id)}
                            >
                              {savingEdit ? "Saving…" : "Save"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
                          {comment.mentionedIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {comment.mentionedIds.map((id) => (
                                <Badge key={id} variant="secondary">
                                  @{nameById.get(id) ?? "Unknown"}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {comment.author_id === currentUserId && (
                            <button
                              type="button"
                              className="mt-1.5 text-xs text-muted-foreground underline"
                              onClick={() => startEditComment(comment)}
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handlePostComment}
                  className="flex flex-col gap-2 border-t border-border pt-3"
                >
                  <Textarea
                    placeholder="Add a comment…"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    required
                  />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Tag members</span>
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => {
                        const active = taggedIds.has(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleTag(m.id)}
                            className={
                              active
                                ? "rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground"
                                : "rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                            }
                          >
                            {m.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Button type="submit" disabled={posting} className="self-end">
                    {posting ? "Posting…" : "Post comment"}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" form={TASK_FORM_ID} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
