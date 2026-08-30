"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS } from "@/components/status-badge";
import { TaskPrioritySelect } from "@/components/task-priority-select";
import { TaskDueDateInput } from "@/components/task-due-date-input";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskCommentsDialog } from "@/components/task-comments-dialog";
import { TaskHistoryDialog } from "@/components/task-history-dialog";
import type { RecurrenceRule, TaskStatus } from "@/lib/supabase/types";
import type { Board, Member, PendingMember } from "@/lib/task-types";

interface MyTask {
  id: string;
  title: string;
  description: string | null;
  board_id: string;
  board_name: string | undefined;
  due_date: string | null;
  status: TaskStatus;
  priority: string;
  recurrence_rule: RecurrenceRule | null;
  owner_id: string | null;
  assigned_to_everyone: boolean;
  commentCount: number;
}

export function MyTaskList({
  tasks,
  boards,
  members,
  pendingMembers = [],
}: {
  tasks: MyTask[];
  boards: Board[];
  members: Member[];
  pendingMembers?: PendingMember[];
}) {
  const router = useRouter();

  async function updateStatus(taskId: string, status: TaskStatus) {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
    reportWriteError("update the status", error);
    router.refresh();
  }

  function statusSelect(task: MyTask, className: string) {
    return (
      <Select
        value={task.status}
        onValueChange={(v) => v && updateStatus(task.id, v as TaskStatus)}
      >
        <SelectTrigger size="sm" className={className}>
          <SelectValue>{(v: TaskStatus) => STATUS_LABELS[v]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not_started">{STATUS_LABELS.not_started}</SelectItem>
          <SelectItem value="in_progress">{STATUS_LABELS.in_progress}</SelectItem>
          <SelectItem value="done">{STATUS_LABELS.done}</SelectItem>
          <SelectItem value="blocked">{STATUS_LABELS.blocked}</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  function editDialog(task: MyTask) {
    return (
      <TaskFormDialog
        boards={boards}
        defaultBoardId={task.board_id}
        members={members}
        pendingMembers={pendingMembers}
        trigger={
          <Button variant="outline" size="sm">
            Edit
          </Button>
        }
        initial={{
          id: task.id,
          board_id: task.board_id,
          title: task.title,
          description: task.description ?? "",
          owner_id: task.owner_id,
          pending_owner_email: null,
          assigned_to_everyone: task.assigned_to_everyone,
          due_date: task.due_date ?? "",
          status: task.status,
          priority: task.priority,
          recurrence_rule: task.recurrence_rule ?? "none",
        }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:hidden">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">
                  {task.title}
                  {task.assigned_to_everyone && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Everyone)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{task.board_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <TaskDueDateInput taskId={task.id} dueDate={task.due_date} />
                <TaskPrioritySelect taskId={task.id} priority={task.priority} />
                {statusSelect(task, "w-[130px]")}
                <TaskCommentsDialog
                  taskId={task.id}
                  members={members}
                  trigger={
                    <Button variant="outline" size="sm">
                      Comments{task.commentCount > 0 ? ` (${task.commentCount})` : ""}
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
                {editDialog(task)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>History</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  {task.title}
                  {task.assigned_to_everyone && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Everyone)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{task.board_name}</TableCell>
                <TableCell>
                  <TaskDueDateInput taskId={task.id} dueDate={task.due_date} />
                </TableCell>
                <TableCell>{statusSelect(task, "w-[130px]")}</TableCell>
                <TableCell>
                  <TaskPrioritySelect taskId={task.id} priority={task.priority} />
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
                <TableCell className="text-right">{editDialog(task)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
