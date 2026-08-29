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

export interface MeetingMinutesFormValues {
  id?: string;
  title: string;
  meeting_date: string;
  body: string;
}

const DEFAULT_VALUES: MeetingMinutesFormValues = {
  title: "",
  meeting_date: "",
  body: "",
};

export function MeetingMinutesFormDialog({
  trigger,
  initial,
}: {
  trigger: React.ReactElement;
  initial?: MeetingMinutesFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<MeetingMinutesFormValues>(initial ?? DEFAULT_VALUES);

  function update(key: keyof MeetingMinutesFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      title: values.title,
      meeting_date: values.meeting_date,
      body: values.body,
    };

    let error;
    if (values.id) {
      ({ error } = await supabase.from("meeting_minutes").update(payload).eq("id", values.id));
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      ({ error } = await supabase
        .from("meeting_minutes")
        .insert({ ...payload, created_by: user!.id }));
    }

    setSaving(false);
    if (reportWriteError("save the minutes", error)) return;
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{values.id ? "Edit minutes" : "New minutes"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minutes-title">Title</Label>
              <Input
                id="minutes-title"
                required
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minutes-date">Meeting date</Label>
              <Input
                id="minutes-date"
                type="date"
                required
                value={values.meeting_date}
                onChange={(e) => update("meeting_date", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="minutes-body">Minutes</Label>
            <Textarea
              id="minutes-body"
              required
              rows={10}
              value={values.body}
              onChange={(e) => update("body", e.target.value)}
            />
          </div>

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
