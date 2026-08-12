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

interface Board {
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
  isAlumni,
  draggable,
}: {
  task: TaskRow;
  boardId: string;
  boards: Board[];
  members: Member[];
  isAlumni: boolean;
  draggable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !draggable,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: isDragging ? 10 : undefined,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        PRIORITY_BORDER[task.priority] ?? PRIORITY_BORDER.normal,
        draggable && "cursor-grab touch-none active:cursor-grabbing"
      )}
      {...(draggable ? { ...attributes, ...listeners } : {})}
    >
      <CardContent className="flex flex-col gap-2 py-3">
        <p className="text-sm font-medium">{task.title}</p>
        <p className="text-xs text-muted-foreground">
          {task.owner_name ?? "Unassigned"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <DueDateBadge dueDate={task.due_date} done={task.status === "done"} />
          <Badge variant="outline" className="capitalize">
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
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
          {isAlumni && (
            <TaskFormDialog
              boards={boards}
              defaultBoardId={boardId}
              members={members}
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
  );
}

function Column({
  status,
  tasks,
  boardId,
  boards,
  members,
  currentUserId,
  isAlumni,
}: {
  status: TaskStatus;
  tasks: TaskRow[];
  boardId: string;
  boards: Board[];
  members: Member[];
  currentUserId: string;
  isAlumni: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 ${
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
            isAlumni={isAlumni}
            draggable={isAlumni || task.owner_id === currentUserId}
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            boardId={boardId}
            boards={boards}
            members={members}
            currentUserId={currentUserId}
            isAlumni={isAlumni}
          />
        ))}
      </div>
    </DndContext>
  );
}
