import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { BoardCardGrid } from "@/components/board-card-grid";
import { BOARD_CATEGORIES, type BoardCategory } from "@/lib/supabase/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const decoded = decodeURIComponent(rawCategory);

  if (!BOARD_CATEGORIES.includes(decoded as BoardCategory)) {
    notFound();
  }
  const category = decoded as BoardCategory;

  await requireCurrentUser();
  const supabase = await createClient();

  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, description, category")
    .eq("category", category)
    .order("name");

  const boardIds = (boards ?? []).map((b) => b.id);
  const { data: openTasks } = boardIds.length
    ? await supabase
        .from("tasks")
        .select("board_id, status, due_date")
        .neq("status", "done")
        .in("board_id", boardIds)
    : { data: [] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const boardStats = new Map<string, { open: number; overdue: number }>();
  for (const task of openTasks ?? []) {
    const stats = boardStats.get(task.board_id) ?? { open: 0, overdue: 0 };
    stats.open += 1;
    if (task.due_date && new Date(task.due_date) < today) {
      stats.overdue += 1;
    }
    boardStats.set(task.board_id, stats);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {category}
        </h1>
        <p className="text-sm text-muted-foreground">
          Project boards in this category.
        </p>
      </div>
      <BoardCardGrid boards={boards ?? []} boardStats={boardStats} />
    </div>
  );
}
