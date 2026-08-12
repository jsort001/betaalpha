import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EventDetailsDialog({
  trigger,
  title,
  dateLabel,
  location,
  description,
}: {
  trigger: React.ReactElement;
  title: string;
  dateLabel: string;
  location: string | null;
  description: string | null;
}) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-muted-foreground">
            {dateLabel}
            {location ? ` · ${location}` : ""}
          </p>
          {description && <p className="whitespace-pre-wrap">{description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
