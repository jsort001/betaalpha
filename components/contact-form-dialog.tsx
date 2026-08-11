"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

export interface ContactFormValues {
  id?: string;
  name: string;
  email: string;
  phone: string;
  pledge_year: string;
  major: string;
  undergrad_grad_date: string;
  grad_degree: string;
  school_attended: string;
  grad_school_grad_date: string;
  job_field: string;
  employer: string;
  job_title: string;
  location: string;
}

const DEFAULT_VALUES: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  pledge_year: "",
  major: "",
  undergrad_grad_date: "",
  grad_degree: "",
  school_attended: "",
  grad_school_grad_date: "",
  job_field: "",
  employer: "",
  job_title: "",
  location: "",
};

const FIELDS: { key: keyof Omit<ContactFormValues, "id" | "name">; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "pledge_year", label: "Pledge Year" },
  { key: "major", label: "Major" },
  { key: "undergrad_grad_date", label: "Undergrad Grad Date" },
  { key: "grad_degree", label: "Grad/Professional Degree" },
  { key: "school_attended", label: "School Attended" },
  { key: "grad_school_grad_date", label: "Grad School Grad Date" },
  { key: "job_field", label: "Current Job Field" },
  { key: "employer", label: "Employer" },
  { key: "job_title", label: "Job Title" },
  { key: "location", label: "Location" },
];

export function ContactFormDialog({
  trigger,
  initial,
}: {
  trigger: React.ReactElement;
  initial?: ContactFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<ContactFormValues>(initial ?? DEFAULT_VALUES);

  function update(key: keyof ContactFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
      pledge_year: values.pledge_year || null,
      major: values.major || null,
      undergrad_grad_date: values.undergrad_grad_date || null,
      grad_degree: values.grad_degree || null,
      school_attended: values.school_attended || null,
      grad_school_grad_date: values.grad_school_grad_date || null,
      job_field: values.job_field || null,
      employer: values.employer || null,
      job_title: values.job_title || null,
      location: values.location || null,
    };

    if (values.id) {
      await supabase.from("contacts").update(payload).eq("id", values.id);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("contacts").insert({ ...payload, created_by: user!.id });
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{values.id ? "Edit contact" : "New contact"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={values[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            ))}
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
