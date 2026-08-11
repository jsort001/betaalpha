"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactFormDialog } from "@/components/contact-form-dialog";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  pledge_year: string | null;
  major: string | null;
  undergrad_grad_date: string | null;
  grad_degree: string | null;
  school_attended: string | null;
  grad_school_grad_date: string | null;
  job_field: string | null;
  employer: string | null;
  job_title: string | null;
  location: string | null;
}

type SortKey = "name" | "pledge_year";

function pledgeYearValue(value: string | null): number {
  if (!value) return Infinity;
  const match = value.match(/\d{2,4}/);
  if (!match) return Infinity;
  const year = parseInt(match[0], 10);
  return year < 100 ? year + 2000 : year;
}

export function ContactsManager({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedContacts = useMemo(() => {
    const sorted = [...contacts].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name);
      }
      return pledgeYearValue(a.pledge_year) - pledgeYearValue(b.pledge_year);
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [contacts, sortKey, sortDir]);

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this contact?")) return;
    const supabase = createClient();
    await supabase.from("contacts").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ContactFormDialog trigger={<Button>New contact</Button>} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="hover:text-foreground"
                >
                  Name{sortIndicator("name")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("pledge_year")}
                  className="hover:text-foreground"
                >
                  Pledge Year{sortIndicator("pledge_year")}
                </button>
              </TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Employer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.pledge_year ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.job_title ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.employer ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.phone ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.email ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ContactFormDialog
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                      initial={{
                        id: contact.id,
                        name: contact.name,
                        email: contact.email ?? "",
                        phone: contact.phone ?? "",
                        pledge_year: contact.pledge_year ?? "",
                        major: contact.major ?? "",
                        undergrad_grad_date: contact.undergrad_grad_date ?? "",
                        grad_degree: contact.grad_degree ?? "",
                        school_attended: contact.school_attended ?? "",
                        grad_school_grad_date: contact.grad_school_grad_date ?? "",
                        job_field: contact.job_field ?? "",
                        employer: contact.employer ?? "",
                        job_title: contact.job_title ?? "",
                        location: contact.location ?? "",
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleRemove(contact.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No contacts yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
