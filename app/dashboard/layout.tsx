import Link from "next/link";
import Image from "next/image";
import { requireCurrentUser } from "@/lib/current-user";
import { SignOutButton } from "@/components/sign-out-button";
import { ResourcesNavMenu } from "@/components/resources-nav-menu";
import { MobileNav } from "@/components/mobile-nav";
import { Input } from "@/components/ui/input";
import { BOARD_CATEGORIES } from "@/lib/supabase/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requireCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <MobileNav
            brand={
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Beta Alpha crest"
                    width={64}
                    height={72}
                    className="h-16 w-auto"
                    priority
                  />
                  <span className="font-heading text-lg font-bold uppercase tracking-wide">
                    Beta Alpha Project Manager
                  </span>
                </Link>
                <form action="/dashboard/search" method="GET" className="hidden md:block">
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search tasks…"
                    className="h-8 w-48 bg-background text-foreground"
                  />
                </form>
              </div>
            }
          >
            <div className="mt-4 flex flex-col gap-4">
              <form action="/dashboard/search" method="GET" className="md:hidden">
                <Input
                  type="search"
                  name="q"
                  placeholder="Search tasks…"
                  className="h-8 w-full bg-background text-foreground"
                />
              </form>
              <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
                <nav className="flex flex-col gap-4 font-heading text-sm uppercase tracking-wide md:flex-row md:flex-wrap md:items-center">
                  <Link href="/dashboard" className="hover:underline">
                    My Tasks
                  </Link>
                  <Link href="/dashboard/calendar" className="hover:underline">
                    Calendar
                  </Link>
                  {BOARD_CATEGORIES.map((category) => (
                    <Link
                      key={category}
                      href={`/dashboard/categories/${encodeURIComponent(category)}`}
                      className="hover:underline"
                    >
                      {category}
                    </Link>
                  ))}
                  <ResourcesNavMenu />
                  {currentUser.role === "alumni" && (
                    <Link href="/dashboard/admin/allowlist" className="hover:underline">
                      Admin
                    </Link>
                  )}
                </nav>
                <div className="flex items-center justify-end gap-3 text-sm">
                  <span className="text-base">{currentUser.name || currentUser.email}</span>
                  <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-xs capitalize text-sidebar-accent-foreground">
                    {currentUser.role}
                  </span>
                  <SignOutButton />
                </div>
              </div>
            </div>
          </MobileNav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
