import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// `new Date("YYYY-MM-DD")` parses as UTC midnight, which displays as the
// previous day in any timezone behind UTC. Parse the components directly
// so date-only strings (due_date, start_date, end_date) land on local
// midnight instead.
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Only allow same-site relative paths as a post-sign-in redirect target,
// so a crafted `next` query param can't send someone off-site.
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}
