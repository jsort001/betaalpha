import Link from "next/link";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoardFormDialog } from "@/components/board-form-dialog";
import { MyTaskList } from "@/components/my-task-list";

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();

  const [{ data: myTasks }, { data: boards }, { data: openTasks }, { data: members }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, title, description, due_date, status, board_id, owner_id, priority, recurrence_rule"
        )
        .eq("owner_id", currentUser.id)
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("boards").select("id, name, description, category").order("name"),
      supabase.from("tasks").select("board_id, status, due_date").neq("status", "done"),
      supabase.from("users").select("id, name").order("name"),
    ]);

  const boardNameById = new Map((boards ?? []).map((b) => [b.id, b.name]));

  const myTaskIds = (myTasks ?? []).map((t) => t.id);
  const { data: commentRows } = myTaskIds.length
    ? await supabase.from("task_comments").select("task_id").in("task_id", myTaskIds)
    : { data: [] };
  const commentCountByTask = new Map<string, number>();
  for (const row of commentRows ?? []) {
    commentCountByTask.set(row.task_id, (commentCountByTask.get(row.task_id) ?? 0) + 1);
  }

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
          <MyTaskList
            tasks={myTasks.map((task) => ({
              ...task,
              board_name: boardNameById.get(task.board_id),
              commentCount: commentCountByTask.get(task.id) ?? 0,
            }))}
            boards={boards ?? []}
            members={members ?? []}
            isAlumni={currentUser.role === "alumni"}
          />
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
                      {board.category && (
                        <Badge variant="secondary" className="w-fit">
                          {board.category}
                        </Badge>
                      )}
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
                        category: board.category ?? "none",
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
