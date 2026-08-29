import Link from "next/link";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  isUntrackedChange,
  summarizeHistoryEntry,
  taskSnapshotFromDetails,
} from "@/lib/task-history";

const DEFAULT_LIMIT = 100;
const LOAD_MORE_STEP = 100;
const MAX_FETCH = 2000;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  await requireCurrentUser();
  const supabase = await createClient();

  const { limit: limitParam } = await searchParams;
  const limit = Math.max(DEFAULT_LIMIT, Number(limitParam) || DEFAULT_LIMIT);
  // Untracked (backend-only) entries get filtered out below, so fetch
  // extra raw rows to still fill out `limit` displayed entries.
  const fetchCount = Math.min(limit * 3, MAX_FETCH);

  const [{ data: rawHistory }, { data: users }, { data: boards }] = await Promise.all([
    supabase
      .from("task_history")
      .select("id, task_id, changed_by, change_type, details, created_at")
      .order("created_at", { ascending: false })
      .limit(fetchCount),
    supabase.from("users").select("id, name"),
    supabase.from("boards").select("id, name"),
  ]);

  const nameById = new Map((users ?? []).map((u) => [u.id, u.name]));
  const boardNameById = new Map((boards ?? []).map((b) => [b.id, b.name]));

  const filtered = (rawHistory ?? []).filter((row) => !isUntrackedChange(row));
  const history = filtered.slice(0, limit);
  const hasMore = filtered.length > limit || (rawHistory ?? []).length === fetchCount;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Recent task changes across every board, newest first.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {history.map((row) => {
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
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        )}
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            render={<Link href={`/dashboard/resources/activity?limit=${limit + LOAD_MORE_STEP}`} />}
          >
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}
