"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export function ContactsManager({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("contacts").insert({
      name,
      email: email || null,
      phone: phone || null,
      created_by: user!.id,
    });
    setSaving(false);
    setName("");
    setEmail("");
    setPhone("");
    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this contact?")) return;
    const supabase = createClient();
    await supabase.from("contacts").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-56"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-40"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Adding…" : "Add contact"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.phone ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleRemove(contact.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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
