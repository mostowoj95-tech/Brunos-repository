import * as FileSystem from "expo-file-system";
import type { ExtractedEvent } from "../types/event";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function makeUid(event: ExtractedEvent): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${slugify(event.title)}-${event.date}-${random}@photo-to-ics`;
}

function addOneDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const yyyy = next.getUTCFullYear();
  const mm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(next.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function estimateEndTime(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const endMinutes = (h * 60 + m + 120) % (24 * 60);
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

function buildVevent(event: ExtractedEvent, now: string): string {
  const dateCompact = event.date.replace(/-/g, "");
  const uid = makeUid(event);
  const lines: string[] = ["BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${now}`];

  if (event.start_time) {
    const startCompact = event.start_time.replace(":", "") + "00";
    const endTime = event.end_time ?? estimateEndTime(event.start_time);
    const endCompact = endTime.replace(":", "") + "00";
    lines.push(`DTSTART:${dateCompact}T${startCompact}`);
    lines.push(`DTEND:${dateCompact}T${endCompact}`);
  } else {
    // No start time given — treat as an all-day event.
    lines.push(`DTSTART;VALUE=DATE:${dateCompact}`);
    lines.push(`DTEND;VALUE=DATE:${addOneDay(event.date)}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "TRIGGER:-PT1H", "END:VALARM");
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function generateIcs(events: ExtractedEvent[]): string {
  const now =
    new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Photo to ICS//EN",
    "CALSCALE:GREGORIAN",
    ...events.map((event) => buildVevent(event, now)),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export async function writeIcsFile(events: ExtractedEvent[]): Promise<string> {
  const ics = generateIcs(events);
  const fileName = `events-${Date.now()}.ics`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, ics, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return fileUri;
}
