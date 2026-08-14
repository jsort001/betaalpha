"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
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

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function CalendarSubscribeDialog({
  trigger,
  origin,
  token,
  isAlumni,
}: {
  trigger: React.ReactElement;
  origin: string;
  token: string;
  isAlumni: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentToken, setCurrentToken] = useState(token);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const feedPath = `/api/calendar/${currentToken}/events.ics`;
  const httpsUrl = `${origin}${feedPath}`;
  const webcalUrl = `webcal://${origin.replace(/^https?:\/\//, "")}${feedPath}`;

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(httpsUrl, { width: 220, margin: 1 }).then(setQrDataUrl);
  }, [open, httpsUrl]);

  async function copyUrl() {
    await navigator.clipboard.writeText(httpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function regenerate() {
    if (
      !confirm(
        "Regenerate the subscribe link? Everyone currently subscribed will need to re-subscribe with the new link."
      )
    )
      return;
    setRegenerating(true);
    const supabase = createClient();
    const next = randomToken();
    const { error } = await supabase
      .from("calendar_feed_settings")
      .update({ token: next })
      .eq("id", true);
    if (!error) {
      setCurrentToken(next);
      router.refresh();
    }
    setRegenerating(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscribe to the calendar</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR code to subscribe to the chapter calendar"
              width={220}
              height={220}
              className="rounded-lg border border-border"
            />
          )}
          <p className="text-center text-sm text-muted-foreground">
            Scan with your phone&rsquo;s camera, or add this link in your calendar
            app (Google Calendar, Apple Calendar, Outlook) as a new
            subscription. Chapter events sync automatically.
          </p>

          <div className="flex w-full gap-2">
            <Input readOnly value={httpsUrl} className="text-xs" />
            <Button type="button" variant="outline" onClick={copyUrl}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <Button type="button" variant="secondary" render={<a href={webcalUrl} />}>
            Open in default calendar app
          </Button>
        </div>

        <DialogFooter className="sm:justify-between">
          {isAlumni ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={regenerate}
              disabled={regenerating}
            >
              {regenerating ? "Regenerating…" : "Regenerate link"}
            </Button>
          ) : (
            <span />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
