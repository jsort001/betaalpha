"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface EventFormValues {
  id?: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}

const DEFAULT_VALUES: EventFormValues = {
  title: "",
  description: "",
  location: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
};

export function EventFormDialog({
  trigger,
  initial,
}: {
  trigger: React.ReactElement;
  initial?: EventFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<EventFormValues>(initial ?? DEFAULT_VALUES);

  function update(key: keyof EventFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      title: values.title,
      description: values.description || null,
      location: values.location || null,
      start_date: values.start_date,
      end_date: values.end_date || null,
      start_time: values.start_time || null,
      end_time: values.start_time ? values.end_time || null : null,
    };

    let error;
    if (values.id) {
      ({ error } = await supabase.from("events").update(payload).eq("id", values.id));
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      ({ error } = await supabase.from("events").insert({ ...payload, created_by: user!.id }));
    }

    setSaving(false);
    if (reportWriteError("save the event", error)) return;
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{values.id ? "Edit event" : "New event"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              required
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-start">Start date</Label>
              <Input
                id="event-start"
                type="date"
                required
                value={values.start_date}
                onChange={(e) => update("start_date", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-end">End date</Label>
              <Input
                id="event-end"
                type="date"
                value={values.end_date}
                onChange={(e) => update("end_date", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-start-time">Start time</Label>
              <Input
                id="event-start-time"
                type="time"
                value={values.start_time}
                onChange={(e) => update("start_time", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-end-time">End time</Label>
              <Input
                id="event-end-time"
                type="time"
                disabled={!values.start_time}
                value={values.end_time}
                onChange={(e) => update("end_time", e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave times blank for an all-day event.
          </p>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
