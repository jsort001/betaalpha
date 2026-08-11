import Link from "next/link";
import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { ResourcesNavMenu } from "@/components/resources-nav-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();
  const { data: boards } = await supabase
    .from("boards")
    .select("id, name")
    .order("name");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight">
              Beta Alpha
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/dashboard" className="hover:underline">
                My Tasks
              </Link>
              {boards?.map((board) => (
                <Link
                  key={board.id}
                  href={`/dashboard/boards/${board.id}`}
                  className="hover:underline"
                >
                  {board.name}
                </Link>
              ))}
              <ResourcesNavMenu />
              {currentUser.role === "alumni" && (
                <Link href="/dashboard/admin/allowlist" className="hover:underline">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>{currentUser.name || currentUser.email}</span>
            <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-xs capitalize text-sidebar-accent-foreground">
              {currentUser.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
