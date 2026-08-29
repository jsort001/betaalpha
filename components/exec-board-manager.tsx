"use client";

import { useState } from "react";
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
import { EXEC_POSITIONS, type ExecPosition } from "@/lib/supabase/types";

interface ExecBoardMember {
  id: string;
  name: string;
  position: string;
}

export function ExecBoardManager({
  members,
  isAlumni,
}: {
  members: ExecBoardMember[];
  isAlumni: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [position, setPosition] = useState<ExecPosition>(EXEC_POSITIONS[0]);
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("exec_board").insert({ name, position });
    setSaving(false);
    if (reportWriteError("add the exec board member", error)) return;
    setName("");
    setPosition(EXEC_POSITIONS[0]);
    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this exec board member?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("exec_board").delete().eq("id", id);
    reportWriteError("remove the exec board member", error);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {isAlumni && (
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
            <Label>Position</Label>
            <Select
              value={position}
              onValueChange={(v) => v && setPosition(v as ExecPosition)}
            >
              <SelectTrigger className="w-56">
                <SelectValue>{(v: ExecPosition) => v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EXEC_POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Adding…" : "Add member"}
          </Button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              {isAlumni && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.position}
                </TableCell>
                {isAlumni && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleRemove(member.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAlumni ? 3 : 2} className="text-center text-muted-foreground">
                  No exec board members yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
