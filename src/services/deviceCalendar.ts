import * as Calendar from "expo-calendar";

import type { SessionEvent } from "../types/event";

export class CalendarPermissionError extends Error {}

function parseLocalDate(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function estimateEndDate(start: Date): Date {
  return new Date(start.getTime() + 2 * 60 * 60 * 1000);
}

function addOneDay(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

/** Prefer a calendar synced from an Exchange/Outlook account; fall back to the device default. */
async function findBestCalendar(): Promise<Calendar.Calendar> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((cal) => cal.allowsModifications);

  const outlookMatch = writable.find((cal) => {
    const haystack = `${cal.source?.name ?? ""} ${cal.source?.type ?? ""} ${cal.title}`.toLowerCase();
    return haystack.includes("outlook") || haystack.includes("exchange") || haystack.includes("office365");
  });
  if (outlookMatch) return outlookMatch;

  try {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (defaultCalendar.allowsModifications) return defaultCalendar;
  } catch {
    // getDefaultCalendarAsync is unsupported on some Android configurations — fall through.
  }

  const primary = writable.find((cal) => cal.isPrimary);
  if (primary) return primary;

  if (writable.length > 0) return writable[0];

  throw new Error("No writable calendar found on this device.");
}

export async function requestCalendarAccess(): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") {
    throw new CalendarPermissionError("Calendar access was not granted.");
  }
}

export interface AddToDeviceCalendarResult {
  addedCount: number;
  calendarTitle: string;
}

export async function addEventsToDeviceCalendar(events: SessionEvent[]): Promise<AddToDeviceCalendarResult> {
  await requestCalendarAccess();
  const calendar = await findBestCalendar();

  for (const event of events) {
    let startDate: Date;
    let endDate: Date;
    let allDay = false;

    if (event.start_time) {
      startDate = parseLocalDate(event.date, event.start_time);
      endDate = event.end_time ? parseLocalDate(event.date, event.end_time) : estimateEndDate(startDate);
    } else {
      startDate = parseLocalDate(event.date, "00:00");
      endDate = addOneDay(startDate);
      allDay = true;
    }

    await Calendar.createEventAsync(calendar.id, {
      title: event.title,
      startDate,
      endDate,
      allDay,
      location: event.location ?? undefined,
      notes: event.description ?? undefined,
      alarms: [{ relativeOffset: -60 }],
    });
  }

  return { addedCount: events.length, calendarTitle: calendar.title };
}
