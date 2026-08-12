import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/event-form-dialog";
import { CalendarGrid } from "@/components/calendar-grid";

export default async function CalendarPage() {
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, location, start_date, end_date")
    .order("start_date", { ascending: true });

  const isAlumni = currentUser.role === "alumni";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Chapter events.</p>
        </div>
        {isAlumni && (
          <EventFormDialog trigger={<Button size="sm">New event</Button>} />
        )}
      </div>

      <CalendarGrid events={events ?? []} isAlumni={isAlumni} />
    </div>
  );
}
