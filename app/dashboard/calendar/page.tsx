import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/event-form-dialog";
import { DeleteEventButton } from "@/components/delete-event-button";

function formatDateRange(start: string, end: string | null) {
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  const startLabel = new Date(`${start}T00:00:00`).toLocaleDateString(undefined, opts);
  if (!end || end === start) return startLabel;
  const endLabel = new Date(`${end}T00:00:00`).toLocaleDateString(undefined, opts);
  return `${startLabel} – ${endLabel}`;
}

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

      {(!events || events.length === 0) && (
        <p className="text-sm text-muted-foreground">No events yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {events?.map((event) => (
          <Card key={event.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDateRange(event.start_date, event.end_date)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
              {isAlumni && (
                <div className="flex gap-2">
                  <EventFormDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    }
                    initial={{
                      id: event.id,
                      title: event.title,
                      description: event.description ?? "",
                      location: event.location ?? "",
                      start_date: event.start_date,
                      end_date: event.end_date ?? "",
                    }}
                  />
                  <DeleteEventButton eventId={event.id} />
                </div>
              )}
            </CardHeader>
            {event.description && (
              <CardContent className="text-sm text-muted-foreground">
                {event.description}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
