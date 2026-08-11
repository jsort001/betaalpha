"use client";

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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, STATUS_LABELS } from "@/components/status-badge";
import { DueDateBadge } from "@/components/due-date-badge";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskCommentsDialog } from "@/components/task-comments-dialog";
import type { TaskStatus } from "@/lib/supabase/types";

interface Member {
  id: string;
  name: string;
}

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  owner_id: string | null;
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

export function BoardTaskTable({
  boardId,
  boards,
  tasks,
  members,
  currentUserId,
  isAlumni,
}: {
  boardId: string;
  boards: Board[];
  tasks: TaskRow[];
  members: Member[];
  currentUserId: string;
  isAlumni: boolean;
}) {
  const router = useRouter();

  async function updateStatus(taskId: string, status: TaskStatus) {
    const supabase = createClient();
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    router.refresh();
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", taskId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {isAlumni && (
        <div className="flex justify-end">
          <TaskFormDialog
            boards={boards}
            defaultBoardId={boardId}
            members={members}
            trigger={<Button>New task</Button>}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Comments</TableHead>
              {isAlumni && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isOwner = task.owner_id === currentUserId;
              const canChangeStatus = isAlumni || isOwner;

              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    {task.title}
                    {task.recurrence_rule && (
                      <span className="ml-2 text-xs capitalize text-muted-foreground">
                        ({task.recurrence_rule})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.owner_name ?? "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <DueDateBadge dueDate={task.due_date} done={task.status === "done"} />
                  </TableCell>
                  <TableCell>
                    {canChangeStatus ? (
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
                          <SelectItem value="not_started">Not started</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
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
                  {isAlumni && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TaskFormDialog
                          boards={boards}
                          defaultBoardId={boardId}
                          members={members}
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
                  )}
                </TableRow>
              );
            })}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAlumni ? 7 : 6} className="text-center text-muted-foreground">
                  No tasks on this board yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
