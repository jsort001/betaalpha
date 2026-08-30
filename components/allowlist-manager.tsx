"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reportWriteError } from "@/lib/report-write-error";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { UserRole } from "@/lib/supabase/types";

interface AllowlistEntry {
  email: string;
  name: string;
  assigned_role: UserRole;
}

export function AllowlistManager({
  entries,
  signedUpEmails,
}: {
  entries: AllowlistEntry[];
  signedUpEmails: string[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("undergrad");
  const [saving, setSaving] = useState(false);
  const [sendingNudgeTo, setSendingNudgeTo] = useState<string | null>(null);
  const [nudgeResults, setNudgeResults] = useState<Record<string, string>>({});
  const [statusSortDir, setStatusSortDir] = useState<"asc" | "desc" | null>(null);
  const [pendingRemoveEmail, setPendingRemoveEmail] = useState<string | null>(null);
  const [pendingNudgeEmail, setPendingNudgeEmail] = useState<string | null>(null);
  const signedUpSet = new Set(signedUpEmails);

  function toggleStatusSort() {
    setStatusSortDir((prev) =>
      prev === null ? "asc" : prev === "asc" ? "desc" : null
    );
  }

  const sortedEntries = useMemo(() => {
    if (!statusSortDir) return entries;
    const sorted = [...entries].sort((a, b) => {
      const aSignedUp = signedUpSet.has(a.email) ? 1 : 0;
      const bSignedUp = signedUpSet.has(b.email) ? 1 : 0;
      return aSignedUp - bSignedUp;
    });
    return statusSortDir === "asc" ? sorted : sorted.reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, statusSortDir, signedUpEmails]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("allowlist")
      .upsert({ email: email.trim().toLowerCase(), name, assigned_role: role });
    setSaving(false);
    if (reportWriteError("add to the allowlist", error)) return;
    setEmail("");
    setName("");
    setRole("undergrad");
    router.refresh();
  }

  async function handleRemove(entryEmail: string) {
    setPendingRemoveEmail(null);
    const supabase = createClient();
    const { error } = await supabase.from("allowlist").delete().eq("email", entryEmail);
    reportWriteError("remove from the allowlist", error);
    router.refresh();
  }

  async function handleSendNudge(entryEmail: string) {
    setPendingNudgeEmail(null);
    setSendingNudgeTo(entryEmail);
    const supabase = createClient();
    const { error } = await supabase.functions.invoke("send-nudge", {
      body: { email: entryEmail },
    });
    setSendingNudgeTo(null);
    setNudgeResults((prev) => ({
      ...prev,
      [entryEmail]: error ? `Failed: ${error.message}` : "Reminder sent",
    }));
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

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={toggleStatusSort}
                  className="hover:text-foreground"
                >
                  Status
                  {statusSortDir === "asc" && " ▲"}
                  {statusSortDir === "desc" && " ▼"}
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map((entry) => (
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
                  <div className="flex items-center justify-end gap-2">
                    {nudgeResults[entry.email] && (
                      <span className="text-xs text-muted-foreground">
                        {nudgeResults[entry.email]}
                      </span>
                    )}
                    {!signedUpSet.has(entry.email) && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={sendingNudgeTo === entry.email}
                        onClick={() => setPendingNudgeEmail(entry.email)}
                      >
                        {sendingNudgeTo === entry.email ? "Sending…" : "Remind"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setPendingRemoveEmail(entry.email)}
                    >
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No one on the allowlist yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={pendingRemoveEmail !== null}
        onOpenChange={(open) => !open && setPendingRemoveEmail(null)}
        title="Remove from the allowlist?"
        description={
          pendingRemoveEmail
            ? `${pendingRemoveEmail} will no longer be able to sign in.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => pendingRemoveEmail && handleRemove(pendingRemoveEmail)}
      />
      <ConfirmDialog
        open={pendingNudgeEmail !== null}
        onOpenChange={(open) => !open && setPendingNudgeEmail(null)}
        title="Send a sign-in reminder?"
        description={
          pendingNudgeEmail ? `We'll email ${pendingNudgeEmail} a reminder to sign in.` : ""
        }
        confirmLabel="Send reminder"
        destructive={false}
        onConfirm={() => pendingNudgeEmail && handleSendNudge(pendingNudgeEmail)}
      />
    </div>
  );
}
