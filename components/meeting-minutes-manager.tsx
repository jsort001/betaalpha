"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { parseLocalDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingMinutesFormDialog } from "@/components/meeting-minutes-form-dialog";
import { MeetingMinutesDetailsDialog } from "@/components/meeting-minutes-details-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface MeetingMinutes {
  id: string;
  title: string;
  meeting_date: string;
  body: string;
}

function formatMeetingDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MeetingMinutesManager({ minutes }: { minutes: MeetingMinutes[] }) {
  const router = useRouter();
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setPendingRemoveId(null);
    const supabase = createClient();
    const { error } = await supabase.from("meeting_minutes").delete().eq("id", id);
    reportWriteError("delete the minutes", error);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {minutes.map((entry) => {
        const dateLabel = formatMeetingDate(entry.meeting_date);
        return (
          <Card key={entry.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{entry.title}</p>
                <p className="text-sm text-muted-foreground">{dateLabel}</p>
              </div>
              <div className="flex gap-2">
                <MeetingMinutesDetailsDialog
                  trigger={
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  }
                  title={entry.title}
                  dateLabel={dateLabel}
                  body={entry.body}
                />
                <MeetingMinutesFormDialog
                  trigger={
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  }
                  initial={{
                    id: entry.id,
                    title: entry.title,
                    meeting_date: entry.meeting_date,
                    body: entry.body,
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setPendingRemoveId(entry.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {minutes.length === 0 && (
        <p className="text-sm text-muted-foreground">No meeting minutes yet.</p>
      )}

      <ConfirmDialog
        open={pendingRemoveId !== null}
        onOpenChange={(open) => !open && setPendingRemoveId(null)}
        title="Delete these minutes?"
        description="This action can't be undone."
        confirmLabel="Delete"
        onConfirm={() => pendingRemoveId && handleRemove(pendingRemoveId)}
      />
    </div>
  );
}
