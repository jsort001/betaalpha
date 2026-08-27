interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// RFC 5545 requires lines folded at 75 octets; strict clients like
// Outlook reject unfolded long lines.
function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf-8");
  if (bytes.length <= 75) return line;

  const folded: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Don't split a multi-byte UTF-8 character across lines.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    folded.push(bytes.subarray(start, end).toString("utf-8"));
    start = end;
    limit = 74; // continuation lines start with a space, which counts
  }
  return folded.join("\r\n ");
}

// DTSTART/DTEND;VALUE=DATE use an exclusive end date, so a single-day
// all-day event's end is the day after start.
function toIcsDate(date: string): string {
  return date.replaceAll("-", "");
}

function addOneDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Floating (no TZID) local date-time, formatted from the Date object's
// own local getters rather than toISOString — that would reinterpret
// the wall-clock time in UTC and shift it.
function formatIcsLocalDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

function eventDateTime(date: string, time: string): Date {
  const t = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${t}`);
}

export function buildEventsIcs(events: CalendarEvent[], calendarName: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Beta Alpha Chapter//Project Manager//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    ...events.flatMap((event) => {
      let dtstartLine: string;
      let dtendLine: string;

      if (event.start_time) {
        const start = eventDateTime(event.start_date, event.start_time);
        const end = event.end_time
          ? eventDateTime(event.end_date ?? event.start_date, event.end_time)
          : new Date(start.getTime() + 60 * 60 * 1000); // default 1hr duration
        dtstartLine = `DTSTART:${formatIcsLocalDateTime(start)}`;
        dtendLine = `DTEND:${formatIcsLocalDateTime(end)}`;
      } else {
        const dtend = addOneDay(event.end_date ?? event.start_date);
        dtstartLine = `DTSTART;VALUE=DATE:${toIcsDate(event.start_date)}`;
        dtendLine = `DTEND;VALUE=DATE:${toIcsDate(dtend)}`;
      }

      const eventLines = [
        "BEGIN:VEVENT",
        `UID:${event.id}@betaalpha-pm`,
        `DTSTAMP:${now}`,
        dtstartLine,
        dtendLine,
        `SUMMARY:${escapeText(event.title)}`,
      ];
      if (event.description) eventLines.push(`DESCRIPTION:${escapeText(event.description)}`);
      if (event.location) eventLines.push(`LOCATION:${escapeText(event.location)}`);
      eventLines.push("END:VEVENT");
      return eventLines;
    }),
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
