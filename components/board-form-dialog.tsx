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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BOARD_CATEGORIES,
  BOARD_TASK_TEMPLATES,
  RECURRING_BOARD_CATEGORIES,
  RECURRING_BOARD_TITLES,
  type BoardCategory,
} from "@/lib/supabase/types";

export interface BoardFormValues {
  id?: string;
  name: string;
  description: string;
  category: BoardCategory | "none";
}

const CUSTOM_NAME = "custom";
const DEFAULT_VALUES: BoardFormValues = {
  name: RECURRING_BOARD_TITLES[0],
  description: "",
  category: "Intake",
};

function initialNameSelection(name: string): string {
  return (RECURRING_BOARD_TITLES as readonly string[]).includes(name) ? name : CUSTOM_NAME;
}

export function BoardFormDialog({
  trigger,
  initial,
}: {
  trigger: React.ReactElement;
  initial?: BoardFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<BoardFormValues>(initial ?? DEFAULT_VALUES);
  const [nameSelection, setNameSelection] = useState(() =>
    initialNameSelection((initial ?? DEFAULT_VALUES).name)
  );
  const [year, setYear] = useState(() => new Date().getFullYear());

  function selectName(v: string) {
    setNameSelection(v);
    setValues((prev) => ({
      ...prev,
      name: v === CUSTOM_NAME ? "" : v,
      category: v === CUSTOM_NAME ? prev.category : RECURRING_BOARD_CATEGORIES[v] ?? prev.category,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const finalName =
      nameSelection === CUSTOM_NAME ? values.name : `${values.name} ${year}`;

    const payload = {
      name: finalName,
      description: values.description || null,
      category: values.category === "none" ? null : values.category,
    };

    if (values.id) {
      await supabase.from("boards").update(payload).eq("id", values.id);
    } else {
      const { data: newBoard } = await supabase
        .from("boards")
        .insert(payload)
        .select("id")
        .single();

      const template = BOARD_TASK_TEMPLATES[nameSelection];
      if (newBoard && template) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        await supabase.from("tasks").insert(
          template.map((title) => ({
            board_id: newBoard.id,
            title,
            created_by: user!.id,
          }))
        );
      }
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!values.id) return;
    if (
      !confirm(
        `Delete "${values.name}"? This also deletes every task on this board. This can't be undone.`
      )
    )
      return;
    const supabase = createClient();
    await supabase.from("boards").delete().eq("id", values.id);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{values.id ? "Edit board" : "New board"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Select value={nameSelection} onValueChange={(v) => v && selectName(v)}>
              <SelectTrigger>
                <SelectValue>
                  {(v: string) => (v === CUSTOM_NAME ? "Custom" : v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RECURRING_BOARD_TITLES.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_NAME}>Custom</SelectItem>
              </SelectContent>
            </Select>
            {nameSelection === CUSTOM_NAME ? (
              <Input
                placeholder="Board name"
                required
                value={values.name}
                onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              />
            ) : (
              <Input
                type="number"
                placeholder="Year"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="board-description">Description</Label>
            <Textarea
              id="board-description"
              value={values.description}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select
              value={values.category}
              onValueChange={(v) =>
                v && setValues((prev) => ({ ...prev, category: v as BoardCategory | "none" }))
              }
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: BoardCategory | "none") => (v === "none" ? "None" : v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {BOARD_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className={values.id ? "sm:justify-between" : undefined}>
            {values.id && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
