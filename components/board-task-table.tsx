"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS } from "@/components/status-badge";
import { DueDateBadge } from "@/components/due-date-badge";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskCommentsDialog } from "@/components/task-comments-dialog";
import { TaskHistoryDialog } from "@/components/task-history-dialog";
import type { TaskStatus } from "@/lib/supabase/types";

interface Member {
  id: string;
  name: string;
}

interface PendingMember {
  email: string;
  name: string;
}

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  owner_id: string | null;
  pending_owner_email: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: string;
  recurrence_rule: "weekly" | "monthly" | "semester" | null;
  owner_name: string | null;
  commentCount: number;
}

interface Board {
  id: string;
  name: string;
}

const PENDING_PREFIX = "pending:";

function ownerSelectionFor(task: TaskRow): string {
  if (task.owner_id) return task.owner_id;
  if (task.pending_owner_email) return `${PENDING_PREFIX}${task.pending_owner_email}`;
  return "unassigned";
}

export function BoardTaskTable({
  boardId,
  boards,
  tasks,
  members,
  pendingMembers = [],
}: {
  boardId: string;
  boards: Board[];
  tasks: TaskRow[];
  members: Member[];
  pendingMembers?: PendingMember[];
}) {
  const router = useRouter();
  const [showCompleted, setShowCompleted] = useState(false);

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const visibleTasks = showCompleted
    ? tasks
    : tasks.filter((t) => t.status !== "done");

  async function updateStatus(taskId: string, status: TaskStatus) {
    const supabase = createClient();
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    router.refresh();
  }

  async function updateOwner(taskId: string, selection: string) {
    const supabase = createClient();
    const payload =
      selection === "unassigned"
        ? { owner_id: null, pending_owner_email: null }
        : selection.startsWith(PENDING_PREFIX)
          ? { owner_id: null, pending_owner_email: selection.slice(PENDING_PREFIX.length) }
          : { owner_id: selection, pending_owner_email: null };
    await supabase.from("tasks").update(payload).eq("id", taskId);
    router.refresh();
  }

  function ownerSelectLabel(v: string) {
    if (v === "unassigned") return "Unassigned";
    if (v.startsWith(PENDING_PREFIX)) {
      const email = v.slice(PENDING_PREFIX.length);
      const name = pendingMembers.find((p) => p.email === email)?.name;
      return name ? `${name} (pending)` : email;
    }
    return members.find((m) => m.id === v)?.name ?? "Unassigned";
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", taskId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {completedCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted((prev) => !prev)}
          >
            {showCompleted ? "Hide completed" : `Show completed (${completedCount})`}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:hidden">
        {visibleTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="flex flex-col gap-2 py-3">
              <p className="text-sm font-medium">
                {task.title}
                {task.recurrence_rule && (
                  <span className="ml-2 text-xs capitalize text-muted-foreground">
                    ({task.recurrence_rule})
                  </span>
                )}
              </p>
              <Select
                value={ownerSelectionFor(task)}
                onValueChange={(v) => v && updateOwner(task.id, v)}
              >
                <SelectTrigger size="sm" className="w-[180px]">
                  <SelectValue placeholder="Unassigned">
                    {(v: string) => ownerSelectLabel(v)}
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
              <div className="flex flex-wrap items-center gap-2">
                <DueDateBadge dueDate={task.due_date} done={task.status === "done"} />
                <Badge variant="outline" className="capitalize">
                  {task.priority}
                </Badge>
              </div>
              <Select
                value={task.status}
                onValueChange={(v) => v && updateStatus(task.id, v as TaskStatus)}
              >
                <SelectTrigger size="sm" className="w-[150px]">
                  <SelectValue>{(v: TaskStatus) => STATUS_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">{STATUS_LABELS.not_started}</SelectItem>
                  <SelectItem value="in_progress">{STATUS_LABELS.in_progress}</SelectItem>
                  <SelectItem value="done">{STATUS_LABELS.done}</SelectItem>
                  <SelectItem value="blocked">{STATUS_LABELS.blocked}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <TaskCommentsDialog
                  taskId={task.id}
                  members={members}
                  trigger={
                    <Button variant="outline" size="sm">
                      {task.commentCount > 0 ? task.commentCount : "Comment"}
                    </Button>
                  }
                />
                <TaskHistoryDialog
                  taskId={task.id}
                  members={members}
                  trigger={
                    <Button variant="outline" size="sm">
                      History
                    </Button>
                  }
                />
                <TaskFormDialog
                  boards={boards}
                  defaultBoardId={boardId}
                  members={members}
                  pendingMembers={pendingMembers}
                  trigger={
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  }
                  initial={{
                    id: task.id,
                    board_id: boardId,
                    title: task.title,
                    description: task.description ?? "",
                    owner_id: task.owner_id,
                    pending_owner_email: task.pending_owner_email,
                    due_date: task.due_date ?? "",
                    status: task.status,
                    priority: task.priority,
                    recurrence_rule: task.recurrence_rule ?? "none",
                  }}
                />
                <TaskFormDialog
                  boards={boards}
                  defaultBoardId={boardId}
                  members={members}
                  pendingMembers={pendingMembers}
                  trigger={
                    <Button variant="outline" size="sm">
                      Clone
                    </Button>
                  }
                  initial={{
                    board_id: boardId,
                    title: `${task.title} (Copy)`,
                    description: task.description ?? "",
                    owner_id: task.owner_id,
                    pending_owner_email: task.pending_owner_email,
                    due_date: task.due_date ?? "",
                    status: "not_started",
                    priority: task.priority,
                    recurrence_rule: task.recurrence_rule ?? "none",
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {visibleTasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {tasks.length === 0
              ? "No tasks on this board yet."
              : 'All tasks are done. Click "Show completed" above to see them.'}
          </p>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>History</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  {task.title}
                  {task.recurrence_rule && (
                    <span className="ml-2 text-xs capitalize text-muted-foreground">
                      ({task.recurrence_rule})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={ownerSelectionFor(task)}
                    onValueChange={(v) => v && updateOwner(task.id, v)}
                  >
                    <SelectTrigger size="sm" className="w-[160px]">
                      <SelectValue placeholder="Unassigned">
                        {(v: string) => ownerSelectLabel(v)}
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
                </TableCell>
                <TableCell>
                  <DueDateBadge dueDate={task.due_date} done={task.status === "done"} />
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(v) => v && updateStatus(task.id, v as TaskStatus)}
                  >
                    <SelectTrigger size="sm" className="w-[130px]">
                      <SelectValue>
                        {(v: TaskStatus) => STATUS_LABELS[v]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">{STATUS_LABELS.not_started}</SelectItem>
                      <SelectItem value="in_progress">{STATUS_LABELS.in_progress}</SelectItem>
                      <SelectItem value="done">{STATUS_LABELS.done}</SelectItem>
                      <SelectItem value="blocked">{STATUS_LABELS.blocked}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {task.priority}
                </TableCell>
                <TableCell>
                  <TaskCommentsDialog
                    taskId={task.id}
                    members={members}
                    trigger={
                      <Button variant="outline" size="sm">
                        {task.commentCount > 0 ? task.commentCount : "Comment"}
                      </Button>
                    }
                  />
                </TableCell>
                <TableCell>
                  <TaskHistoryDialog
                    taskId={task.id}
                    members={members}
                    trigger={
                      <Button variant="outline" size="sm">
                        History
                      </Button>
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TaskFormDialog
                      boards={boards}
                      defaultBoardId={boardId}
                      members={members}
                      pendingMembers={pendingMembers}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                      initial={{
                        id: task.id,
                        board_id: boardId,
                        title: task.title,
                        description: task.description ?? "",
                        owner_id: task.owner_id,
                        pending_owner_email: task.pending_owner_email,
                        due_date: task.due_date ?? "",
                        status: task.status,
                        priority: task.priority,
                        recurrence_rule: task.recurrence_rule ?? "none",
                      }}
                    />
                    <TaskFormDialog
                      boards={boards}
                      defaultBoardId={boardId}
                      members={members}
                      pendingMembers={pendingMembers}
                      trigger={
                        <Button variant="outline" size="sm">
                          Clone
                        </Button>
                      }
                      initial={{
                        board_id: boardId,
                        title: `${task.title} (Copy)`,
                        description: task.description ?? "",
                        owner_id: task.owner_id,
                        pending_owner_email: task.pending_owner_email,
                        due_date: task.due_date ?? "",
                        status: "not_started",
                        priority: task.priority,
                        recurrence_rule: task.recurrence_rule ?? "none",
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visibleTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {tasks.length === 0
                    ? "No tasks on this board yet."
                    : 'All tasks are done. Click "Show completed" above to see them.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
