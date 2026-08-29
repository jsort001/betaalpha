import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MeetingMinutesFormDialog } from "@/components/meeting-minutes-form-dialog";
import { MeetingMinutesManager } from "@/components/meeting-minutes-manager";

export default async function MeetingMinutesPage() {
  await requireCurrentUser();
  const supabase = await createClient();

  const { data: minutes } = await supabase
    .from("meeting_minutes")
    .select("id, title, meeting_date, body")
    .order("meeting_date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Meeting Minutes
          </h1>
          <p className="text-sm text-muted-foreground">
            Minutes for biweekly chapter meetings.
          </p>
        </div>
        <MeetingMinutesFormDialog trigger={<Button size="sm">New minutes</Button>} />
      </div>

      <MeetingMinutesManager minutes={minutes ?? []} />
    </div>
  );
}
