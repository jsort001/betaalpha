import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/unauthorized");
  }

  return profile;
}
