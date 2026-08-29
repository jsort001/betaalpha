import { toast } from "sonner";
import type { PostgrestError } from "@supabase/supabase-js";

// Surfaces a failed Supabase write as an error toast instead of letting
// it vanish silently (dialog closes, refresh shows stale-but-unchanged
// data, user assumes it saved). Returns true when there was an error so
// call sites can bail out before closing their dialog/clearing state:
//
//   const { error } = await supabase.from("tasks").update(...);
//   if (reportWriteError("save the task", error)) return;
export function reportWriteError(
  action: string,
  error: PostgrestError | null
): boolean {
  if (!error) return false;
  toast.error(`Couldn't ${action}`, { description: error.message });
  return true;
}
