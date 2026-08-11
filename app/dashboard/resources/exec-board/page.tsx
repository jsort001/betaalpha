import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { ExecBoardManager } from "@/components/exec-board-manager";

export default async function ExecBoardPage() {
  const currentUser = await requireCurrentUser();

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("exec_board")
    .select("id, name, position")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Exec Board
        </h1>
        <p className="text-sm text-muted-foreground">
          Current undergrad officers and their positions.
        </p>
      </div>
      <ExecBoardManager
        members={members ?? []}
        isAlumni={currentUser.role === "alumni"}
      />
    </div>
  );
}
