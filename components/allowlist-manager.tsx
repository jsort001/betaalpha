"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/supabase/types";

interface AllowlistEntry {
  email: string;
  name: string;
  assigned_role: UserRole;
}

export function AllowlistManager({
  entries,
  signedUpEmails,
  notSignedUpCount,
}: {
  entries: AllowlistEntry[];
  signedUpEmails: string[];
  notSignedUpCount: number;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("undergrad");
  const [saving, setSaving] = useState(false);
  const [sendingNudge, setSendingNudge] = useState(false);
  const [nudgeResult, setNudgeResult] = useState<string | null>(null);
  const signedUpSet = new Set(signedUpEmails);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("allowlist")
      .upsert({ email: email.trim().toLowerCase(), name, assigned_role: role });
    setSaving(false);
    setEmail("");
    setName("");
    setRole("undergrad");
    router.refresh();
  }

  async function handleRemove(entryEmail: string) {
    if (!confirm(`Remove ${entryEmail} from the allowlist?`)) return;
    const supabase = createClient();
    await supabase.from("allowlist").delete().eq("email", entryEmail);
    router.refresh();
  }

  async function handleSendNudge() {
    if (
      !confirm(
        `Send a sign-in reminder email to ${notSignedUpCount} member${notSignedUpCount === 1 ? "" : "s"}?`
      )
    )
      return;
    setSendingNudge(true);
    setNudgeResult(null);
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("send-nudge");
    setSendingNudge(false);
    setNudgeResult(
      error ? `Failed to send: ${error.message}` : `Sent ${data.sent} of ${data.total} reminders.`
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-56"
          />
        </div>
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
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => v && setRole(v as UserRole)}>
            <SelectTrigger className="w-36">
              <SelectValue>
                {(v: UserRole) => (v === "alumni" ? "Alumni" : "Undergrad")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undergrad">Undergrad</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Adding…" : "Add member"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={sendingNudge || notSignedUpCount === 0}
          onClick={handleSendNudge}
        >
          {sendingNudge
            ? "Sending…"
            : `Remind everyone not signed up (${notSignedUpCount})`}
        </Button>
        {nudgeResult && (
          <span className="text-sm text-muted-foreground">{nudgeResult}</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.email}>
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell className="text-muted-foreground">{entry.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {entry.assigned_role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {signedUpSet.has(entry.email) ? (
                    <Badge variant="secondary">Signed up</Badge>
                  ) : (
                    <Badge variant="outline">Not signed up</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleRemove(entry.email)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No one on the allowlist yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
