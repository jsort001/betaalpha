import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/event-form-dialog";
import { CalendarGrid } from "@/components/calendar-grid";
import { CalendarSubscribeDialog } from "@/components/calendar-subscribe-dialog";

export default async function CalendarPage() {
  const currentUser = await requireCurrentUser();
  const supabase = await createClient();

  const [{ data: events }, { data: feedSettings }, origin] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, description, location, start_date, end_date, start_time, end_time")
      .order("start_date", { ascending: true }),
    supabase.from("calendar_feed_settings").select("token").eq("id", true).single(),
    getSiteOrigin(),
  ]);

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
        <div className="flex gap-2">
          {feedSettings && (
            <CalendarSubscribeDialog
              origin={origin}
              token={feedSettings.token}
              isAlumni={isAlumni}
              trigger={
                <Button size="sm" variant="outline">
                  Subscribe
                </Button>
              }
            />
          )}
          {isAlumni && (
            <EventFormDialog trigger={<Button size="sm">New event</Button>} />
          )}
        </div>
      </div>

      <CalendarGrid events={events ?? []} isAlumni={isAlumni} />
    </div>
  );
}
