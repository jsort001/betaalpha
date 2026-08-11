import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { BoardTaskTable } from "@/components/board-task-table";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();

  const [{ data: board }, { data: tasks }, { data: members }] =
    await Promise.all([
      supabase.from("boards").select("id, name, description").eq("id", boardId).maybeSingle(),
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
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {board.name}
        </h1>
        {board.description && (
          <p className="text-sm text-muted-foreground">{board.description}</p>
        )}
      </div>

      <BoardTaskTable
        boardId={boardId}
        tasks={rows}
        members={members ?? []}
        currentUserId={currentUser.id}
        isAlumni={currentUser.role === "alumni"}
      />
    </div>
  );
}
