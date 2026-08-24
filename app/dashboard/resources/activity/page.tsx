import Link from "next/link";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { summarizeHistoryEntry, taskSnapshotFromDetails } from "@/lib/task-history";

const FEED_LIMIT = 150;

export default async function ActivityPage() {
  await requireCurrentUser();
  const supabase = await createClient();

  const [{ data: history }, { data: users }, { data: boards }] = await Promise.all([
    supabase
      .from("task_history")
      .select("id, task_id, changed_by, change_type, details, created_at")
      .order("created_at", { ascending: false })
      .limit(FEED_LIMIT),
    supabase.from("users").select("id, name"),
    supabase.from("boards").select("id, name"),
  ]);

  const nameById = new Map((users ?? []).map((u) => [u.id, u.name]));
  const boardNameById = new Map((boards ?? []).map((b) => [b.id, b.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Recent task changes across every board, newest first.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {(history ?? []).map((row) => {
          const snapshot = taskSnapshotFromDetails(row);
          const boardName = snapshot?.board_id
            ? boardNameById.get(snapshot.board_id)
            : undefined;

          return (
            <Card key={row.id}>
              <CardContent className="flex flex-col gap-1 py-3">
                <p className="text-sm">{summarizeHistoryEntry(row, nameById)}</p>
                <p className="text-xs text-muted-foreground">
                  {snapshot?.title && (
                    <>
                      <span className="font-medium text-foreground">
                        {snapshot.title}
                      </span>
                      {" · "}
                    </>
                  )}
                  {boardName && snapshot?.board_id ? (
                    <Link
                      href={`/dashboard/boards/${snapshot.board_id}`}
                      className="hover:underline"
                    >
                      {boardName}
                    </Link>
                  ) : (
                    boardName
                  )}
                  {boardName && " · "}
                  {new Date(row.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>
          );
        })}
        {(!history || history.length === 0) && (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
