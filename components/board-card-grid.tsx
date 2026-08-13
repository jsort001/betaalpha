import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoardFormDialog } from "@/components/board-form-dialog";
import type { BoardCategory } from "@/lib/supabase/types";

interface Board {
  id: string;
  name: string;
  description: string | null;
  category: BoardCategory | null;
}

export function BoardCardGrid({
  boards,
  boardStats,
}: {
  boards: Board[];
  boardStats: Map<string, { open: number; overdue: number }>;
}) {
  if (boards.length === 0) {
    return <p className="text-sm text-muted-foreground">No boards yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {boards.map((board) => {
        const stats = boardStats.get(board.id) ?? { open: 0, overdue: 0 };
        return (
          <Card key={board.id} className="h-full transition-colors hover:border-primary">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <Link
                href={`/dashboard/boards/${board.id}`}
                className="flex flex-col gap-1 hover:underline"
              >
                <CardTitle className="text-base">{board.name}</CardTitle>
                {board.category && (
                  <Badge variant="secondary" className="w-fit">
                    {board.category}
                  </Badge>
                )}
              </Link>
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
            </CardHeader>
            <Link href={`/dashboard/boards/${board.id}`}>
              <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{stats.open} open</span>
                {stats.overdue > 0 && (
                  <span className="font-medium text-destructive">
                    {stats.overdue} overdue
                  </span>
                )}
              </CardContent>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
