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
  isAlumni,
}: {
  boards: Board[];
  boardStats: Map<string, { open: number; overdue: number }>;
  isAlumni: boolean;
}) {
  if (boards.length === 0) {
    return <p className="text-sm text-muted-foreground">No boards yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {boards.map((board) => {
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
            {isAlumni && (
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
  );
}
