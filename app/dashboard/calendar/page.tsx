import { requireCurrentUser } from "@/lib/current-user";
import { Card, CardContent } from "@/components/ui/card";

export default async function CalendarPage() {
  await requireCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground">
          Chapter events calendar.
        </p>
      </div>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Coming soon — this will show chapter events.
        </CardContent>
      </Card>
    </div>
  );
}
