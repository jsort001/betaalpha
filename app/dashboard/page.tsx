import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BoardFormDialog } from "@/components/board-form-dialog";
import { BoardCardGrid } from "@/components/board-card-grid";
import { MyTaskList } from "@/components/my-task-list";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { PENDING_ALUMNI_EXCEPTIONS } from "@/lib/supabase/types";

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();

  const [
    { data: myTasks },
    { data: boards },
    { data: openTasks },
    { data: members },
    { data: allowlist },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, description, due_date, status, board_id, owner_id, assigned_to_everyone, priority, recurrence_rule"
      )
      .or(`owner_id.eq.${currentUser.id},assigned_to_everyone.eq.true`)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("boards").select("id, name, description, category").order("name"),
    supabase.from("tasks").select("board_id, status, due_date").neq("status", "done"),
    supabase.from("users").select("id, name, email").order("name"),
    currentUser.role === "alumni"
      ? supabase.from("allowlist").select("email, name, assigned_role")
      : Promise.resolve({ data: null }),
  ]);

  const boardNameById = new Map((boards ?? []).map((b) => [b.id, b.name]));
  const signedUpEmails = new Set((members ?? []).map((m) => m.email));
  const pendingMembers = (allowlist ?? [])
    .filter(
      (a) =>
        (a.assigned_role === "undergrad" || PENDING_ALUMNI_EXCEPTIONS.has(a.email)) &&
        !signedUpEmails.has(a.email)
    )
    .map((a) => ({ email: a.email, name: a.name }));

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
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            My Tasks
          </h1>
          {boards && boards.length > 0 && (
            <TaskFormDialog
              boards={boards}
              defaultBoardId={boards[0].id}
              members={members ?? []}
              pendingMembers={pendingMembers}
              trigger={<Button size="sm">New task</Button>}
            />
          )}
        </div>
        {myTasks && myTasks.length > 0 ? (
          <MyTaskList
            tasks={myTasks.map((task) => ({
              ...task,
              board_name: boardNameById.get(task.board_id),
              commentCount: commentCountByTask.get(task.id) ?? 0,
            }))}
            boards={boards ?? []}
            members={members ?? []}
            pendingMembers={pendingMembers}
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
          <BoardFormDialog trigger={<Button size="sm">New board</Button>} />
        </div>
        <BoardCardGrid boards={boards ?? []} boardStats={boardStats} />
      </section>
    </div>
  );
}
