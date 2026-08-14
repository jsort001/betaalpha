import Link from "next/link";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { DueDateBadge } from "@/components/due-date-badge";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireCurrentUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const [{ data: boards }, { data: members }] = await Promise.all([
    supabase.from("boards").select("id, name"),
    supabase.from("users").select("id, name"),
  ]);
  const boardNameById = new Map((boards ?? []).map((b) => [b.id, b.name]));
  const memberNameById = new Map((members ?? []).map((m) => [m.id, m.name]));

  let results: {
    id: string;
    title: string;
    board_id: string;
    owner_id: string | null;
    assigned_to_everyone: boolean;
    due_date: string | null;
    status: "not_started" | "in_progress" | "done" | "blocked";
  }[] = [];

  if (query) {
    // Escape characters that would break PostgREST's .or() filter syntax.
    const safe = query.replace(/[,()]/g, " ").trim();
    const { data } = await supabase
      .from("tasks")
      .select("id, title, board_id, owner_id, assigned_to_everyone, due_date, status")
      .or(`title.ilike.%${safe}%,description.ilike.%${safe}%`)
      .order("due_date", { ascending: true, nullsFirst: false });
    results = data ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Search</h1>
        <p className="text-sm text-muted-foreground">
          {query ? `Results for "${query}"` : "Enter a search term above."}
        </p>
      </div>

      {query && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No tasks matched.</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map((task) => (
          <Link key={task.id} href={`/dashboard/boards/${task.board_id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {boardNameById.get(task.board_id)} ·{" "}
                    {task.assigned_to_everyone
                      ? "Everyone"
                      : task.owner_id
                        ? memberNameById.get(task.owner_id) ?? "Unknown"
                        : "Unassigned"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <DueDateBadge dueDate={task.due_date} done={task.status === "done"} />
                  <StatusBadge status={task.status} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
