"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BoardTaskTable } from "@/components/board-task-table";
import { BoardKanbanView } from "@/components/board-kanban-view";
import { TaskFormDialog } from "@/components/task-form-dialog";
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

const STORAGE_KEY = "board-view-mode";

export function BoardView({
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
  const [view, setView] = useState<"list" | "board">("list");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "board") {
      setView(stored);
    }
  }, []);

  function selectView(next: "list" | "board") {
    setView(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "board" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectView("board")}
          >
            Board
          </Button>
        </div>
        <TaskFormDialog
          boards={boards}
          defaultBoardId={boardId}
          members={members}
          pendingMembers={pendingMembers}
          trigger={<Button size="sm">New task</Button>}
        />
      </div>

      {view === "list" ? (
        <BoardTaskTable
          boardId={boardId}
          boards={boards}
          tasks={tasks}
          members={members}
          pendingMembers={pendingMembers}
        />
      ) : (
        <BoardKanbanView
          boardId={boardId}
          boards={boards}
          tasks={tasks}
          members={members}
          pendingMembers={pendingMembers}
        />
      )}
    </div>
  );
}
