export interface HistoryRow {
  id: string;
  changed_by: string | null;
  change_type: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export const FIELD_LABELS: Record<string, string> = {
  title: "title",
  description: "description",
  due_date: "due date",
  priority: "priority",
  recurrence_rule: "recurrence",
  board_id: "board",
  assigned_to_everyone: "assignment",
};

function ownerLabel(
  row: Record<string, unknown> | undefined,
  nameById: Map<string, string>
): string {
  if (!row) return "Unassigned";
  if (row.assigned_to_everyone) return "Everyone";
  const ownerId = row.owner_id as string | null;
  return ownerId ? nameById.get(ownerId) ?? "someone" : "Unassigned";
}

export function summarizeHistoryEntry(
  row: HistoryRow,
  nameById: Map<string, string>
): string {
  const who = row.changed_by ? nameById.get(row.changed_by) ?? "Someone" : "System";

  if (row.change_type === "created") {
    return `${who} created this task`;
  }
  if (row.change_type === "deleted") {
    return `${who} deleted this task`;
  }

  const details = row.details as
    | { old?: Record<string, unknown>; new?: Record<string, unknown> }
    | null;
  const oldRow = details?.old;
  const newRow = details?.new;

  if (row.change_type === "status_changed" && oldRow && newRow) {
    return `${who} changed status: ${oldRow.status} → ${newRow.status}`;
  }

  if (row.change_type === "reassigned" && oldRow && newRow) {
    return `${who} reassigned owner: ${ownerLabel(oldRow, nameById)} → ${ownerLabel(newRow, nameById)}`;
  }

  if (oldRow && newRow) {
    const changedFields = Object.keys(FIELD_LABELS).filter(
      (key) => JSON.stringify(oldRow[key]) !== JSON.stringify(newRow[key])
    );
    if (changedFields.length > 0) {
      return `${who} updated ${changedFields.map((f) => FIELD_LABELS[f]).join(", ")}`;
    }
  }

  return `${who} updated this task`;
}

// task_history.details always carries a full snapshot of the task row
// (created/deleted store it directly, updates nest it under `new`), so
// the task's title/board at the time of the change survives even after
// the task itself is deleted — task_history has no FK/cascade to tasks.
export function taskSnapshotFromDetails(
  row: HistoryRow
): { title?: string; board_id?: string } | null {
  if (!row.details) return null;
  if (row.change_type === "created" || row.change_type === "deleted") {
    return row.details as { title?: string; board_id?: string };
  }
  const details = row.details as { new?: Record<string, unknown> };
  return details.new ? (details.new as { title?: string; board_id?: string }) : null;
}
