import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { AllowlistManager } from "@/components/allowlist-manager";

export default async function AllowlistAdminPage() {
  const currentUser = await requireCurrentUser();
  if (currentUser.role !== "alumni") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const [{ data: entries }, { data: users }] = await Promise.all([
    supabase.from("allowlist").select("email, name, assigned_role").order("name"),
    supabase.from("users").select("email"),
  ]);

  const signedUpEmails = new Set((users ?? []).map((u) => u.email));
  const notSignedUpCount = (entries ?? []).filter(
    (e) => !signedUpEmails.has(e.email)
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Allowlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage who can sign in and what role they get.
        </p>
      </div>
      <AllowlistManager
        entries={entries ?? []}
        signedUpEmails={[...signedUpEmails]}
        notSignedUpCount={notSignedUpCount}
      />
    </div>
  );
}
