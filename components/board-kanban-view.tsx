"use client";

import { useRouter } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DueDateBadge } from "@/components/due-date-badge";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskCommentsDialog } from "@/components/task-comments-dialog";
import { TaskHistoryDialog } from "@/components/task-history-dialog";
import { STATUS_LABELS } from "@/components/status-badge";
import type { TaskStatus } from "@/lib/supabase/types";

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

const COLUMNS: TaskStatus[] = ["not_started", "in_progress", "done", "blocked"];

const PRIORITY_BORDER: Record<string, string> = {
  high: "border-l-4 border-l-destructive",
  normal: "border-l-4 border-l-accent",
  low: "border-l-4 border-l-border",
};

function TaskCard({
  task,
  boardId,
  boards,
  members,
  pendingMembers,
}: {
  task: TaskRow;
  boardId: string;
  boards: Board[];
  members: Member[];
  pendingMembers: PendingMember[];
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: isDragging ? 10 : undefined,
      }
    : undefined;

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", task.id);
    router.refresh();
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        PRIORITY_BORDER[task.priority] ?? PRIORITY_BORDER.normal,
        "cursor-grab touch-none active:cursor-grabbing"
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="flex flex-col gap-2 py-3">
        <TaskFormDialog
          boards={boards}
          defaultBoardId={boardId}
          members={members}
          pendingMembers={pendingMembers}
          trigger={
            <div
              className="flex cursor-pointer flex-col gap-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-medium">{task.title}</p>
              {task.description && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {task.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {task.owner_name ?? "Unassigned"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <DueDateBadge dueDate={task.due_date} done={task.status === "done"} />
                <Badge variant="outline" className="capitalize">
                  {task.priority}
                </Badge>
              </div>
            </div>
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <TaskCommentsDialog
            taskId={task.id}
            members={members}
            trigger={
              <Button variant="outline" size="xs" onPointerDown={(e) => e.stopPropagation()}>
                {task.commentCount > 0 ? task.commentCount : "Comment"}
              </Button>
            }
          />
          <TaskHistoryDialog
            taskId={task.id}
            members={members}
            trigger={
              <Button variant="outline" size="xs" onPointerDown={(e) => e.stopPropagation()}>
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
              <Button variant="outline" size="xs" onPointerDown={(e) => e.stopPropagation()}>
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
          <Button
            variant="ghost"
            size="xs"
            className="text-destructive"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Column({
  status,
  tasks,
  boardId,
  boards,
  members,
  pendingMembers,
}: {
  status: TaskStatus;
  tasks: TaskRow[];
  boardId: string;
  boards: Board[];
  members: Member[];
  pendingMembers: PendingMember[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] w-72 shrink-0 flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:w-auto sm:shrink ${
        isOver ? "border-primary bg-muted/60" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            boardId={boardId}
            boards={boards}
            members={members}
            pendingMembers={pendingMembers}
          />
        ))}
      </div>
    </div>
  );
}

export function BoardKanbanView({
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;

    const supabase = createClient();
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    router.refresh();
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            boardId={boardId}
            boards={boards}
            members={members}
            pendingMembers={pendingMembers}
          />
        ))}
      </div>
    </DndContext>
  );
}
