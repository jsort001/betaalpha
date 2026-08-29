import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { BoardTrashManager } from "@/components/board-trash-manager";

export default async function TrashAdminPage() {
  const currentUser = await requireCurrentUser();
  if (currentUser.role !== "alumni") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, category, deleted_at")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Trash</h1>
        <p className="text-sm text-muted-foreground">
          Deleted boards and their tasks. Restore a board or delete it forever.
        </p>
      </div>
      <BoardTrashManager
        boards={(boards ?? []).map((b) => ({ ...b, deleted_at: b.deleted_at! }))}
      />
    </div>
  );
}
