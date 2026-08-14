import { timingSafeEqual } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { buildEventsIcs } from "@/lib/ics";

function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: settings } = await supabase
    .from("calendar_feed_settings")
    .select("token")
    .eq("id", true)
    .single();

  if (!settings || !tokensMatch(token, settings.token)) {
    return new Response("Not found", { status: 404 });
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, location, start_date, end_date")
    .order("start_date", { ascending: true });

  const ics = buildEventsIcs(events ?? [], "Beta Alpha Chapter Events");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="betaalpha-events.ics"',
      "Cache-Control": "private, max-age=1800",
    },
  });
}
