import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MeetingMinutesDetailsDialog({
  trigger,
  title,
  dateLabel,
  body,
}: {
  trigger: React.ReactElement;
  title: string;
  dateLabel: string;
  body: string;
}) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto text-sm">
          <p className="text-muted-foreground">{dateLabel}</p>
          <p className="whitespace-pre-wrap">{body}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
