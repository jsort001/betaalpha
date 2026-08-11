import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { BoardTaskTable } from "@/components/board-task-table";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();

  const [{ data: board }, { data: allBoards }, { data: tasks }, { data: members }] =
    await Promise.all([
      supabase
        .from("boards")
        .select("id, name, description, category")
        .eq("id", boardId)
        .maybeSingle(),
      supabase.from("boards").select("id, name").order("name"),
      supabase
        .from("tasks")
        .select(
          "id, title, description, owner_id, due_date, status, priority, recurrence_rule"
        )
        .eq("board_id", boardId)
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("users").select("id, name").order("name"),
    ]);

  if (!board) {
    notFound();
  }

  const nameById = new Map((members ?? []).map((m) => [m.id, m.name]));

  const taskIds = (tasks ?? []).map((t) => t.id);
  const { data: commentRows } = taskIds.length
    ? await supabase.from("task_comments").select("task_id").in("task_id", taskIds)
    : { data: [] };
  const commentCountByTask = new Map<string, number>();
  for (const row of commentRows ?? []) {
    commentCountByTask.set(row.task_id, (commentCountByTask.get(row.task_id) ?? 0) + 1);
  }

  const rows = (tasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    owner_id: t.owner_id,
    due_date: t.due_date,
    status: t.status,
    priority: t.priority,
    recurrence_rule: t.recurrence_rule,
    owner_name: (t.owner_id && nameById.get(t.owner_id)) || null,
    commentCount: commentCountByTask.get(t.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {board.name}
          </h1>
          {board.category && <Badge variant="secondary">{board.category}</Badge>}
        </div>
        {board.description && (
          <p className="text-sm text-muted-foreground">{board.description}</p>
        )}
      </div>

      <BoardTaskTable
        boardId={boardId}
        boards={allBoards ?? []}
        tasks={rows}
        members={members ?? []}
        currentUserId={currentUser.id}
        isAlumni={currentUser.role === "alumni"}
      />
    </div>
  );
}
