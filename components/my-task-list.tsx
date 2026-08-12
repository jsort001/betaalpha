"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
import type { RecurrenceRule, TaskStatus } from "@/lib/supabase/types";

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
  commentCount: number;
}

export function MyTaskList({
  tasks,
  boards,
  members,
  pendingMembers = [],
  isAlumni,
}: {
  tasks: MyTask[];
  boards: Board[];
  members: Member[];
  pendingMembers?: PendingMember[];
  isAlumni: boolean;
}) {
  const router = useRouter();

  async function updateStatus(taskId: string, status: TaskStatus) {
    const supabase = createClient();
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">{task.board_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <DueDateBadge dueDate={task.due_date} />
              <Select
                value={task.status}
                onValueChange={(v) => v && updateStatus(task.id, v as TaskStatus)}
              >
                <SelectTrigger size="sm" className="w-[130px]">
                  <SelectValue>{(v: TaskStatus) => STATUS_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">{STATUS_LABELS.not_started}</SelectItem>
                  <SelectItem value="in_progress">{STATUS_LABELS.in_progress}</SelectItem>
                  <SelectItem value="done">{STATUS_LABELS.done}</SelectItem>
                  <SelectItem value="blocked">{STATUS_LABELS.blocked}</SelectItem>
                </SelectContent>
              </Select>
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
              {isAlumni && (
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
                    due_date: task.due_date ?? "",
                    status: task.status,
                    priority: task.priority,
                    recurrence_rule: task.recurrence_rule ?? "none",
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
