import Link from "next/link";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DueDateBadge } from "@/components/due-date-badge";
import { BoardFormDialog } from "@/components/board-form-dialog";

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();

  const [{ data: myTasks }, { data: boards }, { data: openTasks }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, due_date, status, board_id")
        .eq("owner_id", currentUser.id)
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("boards").select("id, name, description").order("name"),
      supabase.from("tasks").select("board_id, status, due_date").neq("status", "done"),
    ]);

  const boardNameById = new Map((boards ?? []).map((b) => [b.id, b.name]));

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
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-primary">
          My Tasks
        </h1>
        {myTasks && myTasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {myTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {boardNameById.get(task.board_id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <DueDateBadge dueDate={task.due_date} />
                    <StatusBadge status={task.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing assigned to you right now.
          </p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-primary">
            Project Boards
          </h2>
          {currentUser.role === "alumni" && (
            <BoardFormDialog trigger={<Button size="sm">New board</Button>} />
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {boards?.map((board) => {
            const stats = boardStats.get(board.id) ?? { open: 0, overdue: 0 };
            return (
              <div key={board.id} className="relative">
                <Link href={`/dashboard/boards/${board.id}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <CardTitle className="pr-16 text-base">{board.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{stats.open} open</span>
                      {stats.overdue > 0 && (
                        <span className="font-medium text-destructive">
                          {stats.overdue} overdue
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
                {currentUser.role === "alumni" && (
                  <div className="absolute right-3 top-3">
                    <BoardFormDialog
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                      initial={{
                        id: board.id,
                        name: board.name,
                        description: board.description ?? "",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
