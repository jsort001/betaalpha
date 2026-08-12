"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventFormDialog } from "@/components/event-form-dialog";
import { EventDetailsDialog } from "@/components/event-details-dialog";
import { DeleteEventButton } from "@/components/delete-event-button";
import { cn } from "@/lib/utils";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STORAGE_KEY = "calendar-view-mode";

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthGrid(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const next = new Date(cells[cells.length - 1].date);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  return cells;
}

function formatDateRange(start: string, end: string | null) {
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  const startLabel = new Date(`${start}T00:00:00`).toLocaleDateString(undefined, opts);
  if (!end || end === start) return startLabel;
  const endLabel = new Date(`${end}T00:00:00`).toLocaleDateString(undefined, opts);
  return `${startLabel} – ${endLabel}`;
}

export function CalendarGrid({
  events,
  isAlumni,
}: {
  events: EventRow[];
  isAlumni: boolean;
}) {
  const today = new Date();
  const [mode, setMode] = useState<"grid" | "agenda">("grid");
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "grid" || stored === "agenda") {
      setMode(stored);
    }
  }, []);

  function selectMode(next: "grid" | "agenda") {
    setMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const todayKey = toDateKey(today);

  function eventsOnDay(dateKey: string) {
    return events.filter(
      (e) => e.start_date <= dateKey && (e.end_date ?? e.start_date) >= dateKey
    );
  }

  const upcomingEvents = events.filter((e) => (e.end_date ?? e.start_date) >= todayKey);
  const pastEvents = events
    .filter((e) => (e.end_date ?? e.start_date) < todayKey)
    .slice()
    .reverse();

  function eventCard(event: EventRow) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Button
            variant={mode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectMode("grid")}
          >
            Grid
          </Button>
          <Button
            variant={mode === "agenda" ? "default" : "ghost"}
            size="sm"
            onClick={() => selectMode("agenda")}
          >
            Agenda
          </Button>
        </div>
        {mode === "grid" && (
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {mode === "grid" ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <div className="grid min-w-[640px] grid-cols-7">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="border-b border-border bg-muted/30 p-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {cells.map(({ date, inMonth }) => {
                const dateKey = toDateKey(date);
                const dayEvents = eventsOnDay(dateKey);
                const isToday = dateKey === todayKey;
                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "flex min-h-24 flex-col gap-1 border-b border-r border-border p-1.5 last:border-r-0",
                      !inMonth && "bg-muted/20"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs",
                        inMonth ? "text-foreground" : "text-muted-foreground",
                        isToday &&
                          "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground"
                      )}
                    >
                      {date.getDate()}
                    </span>
                    <div className="flex flex-col gap-1">
                      {dayEvents.map((event) => {
                        const pill = (
                          <Badge
                            variant="secondary"
                            className="w-full cursor-pointer justify-start truncate"
                          >
                            {event.title}
                          </Badge>
                        );
                        return (
                          <EventDetailsDialog
                            key={event.id}
                            trigger={pill}
                            title={event.title}
                            dateLabel={formatDateRange(event.start_date, event.end_date)}
                            location={event.location}
                            description={event.description}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isAlumni && events.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Manage events</h3>
              <div className="flex flex-col gap-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-sm"
                  >
                    <span>
                      {event.title}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatDateRange(event.start_date, event.end_date)}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <EventFormDialog
                        trigger={
                          <Button variant="outline" size="xs">
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          {upcomingEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          )}
          {upcomingEvents.map(eventCard)}

          {pastEvents.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setShowPast((prev) => !prev)}
              >
                {showPast ? "Hide past events" : `Show past events (${pastEvents.length})`}
              </Button>
              {showPast && pastEvents.map(eventCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
