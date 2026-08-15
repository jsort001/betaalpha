import { cn, parseLocalDate } from "@/lib/utils";

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseLocalDate(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function DueDateBadge({
  dueDate,
  done,
}: {
  dueDate: string | null;
  done?: boolean;
}) {
  if (!dueDate) {
    return <span className="text-sm text-muted-foreground">No due date</span>;
  }

  const diff = daysUntil(dueDate);
  const overdue = !done && diff < 0;
  const dueSoon = !done && diff >= 0 && diff <= 3;

  return (
    <span
      className={cn(
        "text-sm",
        overdue && "font-medium text-destructive",
        dueSoon && "font-medium text-accent-foreground"
      )}
    >
      {parseLocalDate(dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}
      {overdue && " (overdue)"}
      {dueSoon && " (due soon)"}
    </span>
  );
}
