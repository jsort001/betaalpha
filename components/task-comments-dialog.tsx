"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/lib/task-types";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  mentionedIds: string[];
}

export function TaskCommentsDialog({
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [taggedIds, setTaggedIds] = useState<Set<string>>(new Set());
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const nameById = new Map(members.map((m) => [m.id, m.name]));

  async function loadComments() {
    setLoading(true);
    const supabase = createClient();

    const { data: rows } = await supabase
      .from("task_comments")
      .select("id, body, created_at, author_id")
      .eq("task_id", taskId)
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
    setLoading(false);
  }

  useEffect(() => {
    if (open) {
      loadComments();
      createClient()
        .auth.getUser()
        .then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    } else {
      setEditingCommentId(null);
      setEditingBody("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function startEditComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditingBody(comment.body);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingBody("");
  }

  async function saveEditComment(commentId: string) {
    if (!editingBody.trim()) return;
    setSavingEdit(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("task_comments")
      .update({ body: editingBody.trim() })
      .eq("id", commentId);
    setSavingEdit(false);
    if (reportWriteError("save the comment", error)) return;
    setEditingCommentId(null);
    setEditingBody("");
    loadComments();
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

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: newComment, error: commentError } = await supabase
      .from("task_comments")
      .insert({ task_id: taskId, author_id: user!.id, body: body.trim() })
      .select("id")
      .single();
    if (reportWriteError("post the comment", commentError)) {
      setPosting(false);
      return;
    }

    if (newComment && taggedIds.size > 0) {
      const { error: mentionError } = await supabase.from("comment_mentions").insert(
        Array.from(taggedIds).map((userId) => ({
          comment_id: newComment.id,
          user_id: userId,
        }))
      );
      reportWriteError("tag the selected members", mentionError);
    }

    setBody("");
    setTaggedIds(new Set());
    setPosting(false);
    loadComments();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex max-h-[80vh] flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 overflow-y-auto">
            {loading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {!loading && comments.length === 0 && (
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

          <form onSubmit={handlePost} className="flex flex-col gap-2 border-t border-border pt-4">
            <Textarea
              placeholder="Add a comment…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
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
      </DialogContent>
    </Dialog>
  );
}
