const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parses a "YYYY-MM-DD" string as a local date, avoiding UTC-midnight timezone shifts. */
export function parseDateOnly(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatWeekday(date: string): string {
  return WEEKDAYS[parseDateOnly(date).getDay()];
}

/** e.g. "12 MAR 2026" */
export function formatDayKicker(date: string): string {
  const d = parseDateOnly(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

/** e.g. "Thu 12 Mar" */
export function formatShortDate(date: string): string {
  const d = parseDateOnly(date);
  return `${WEEKDAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export interface DayGroup<T> {
  date: string;
  events: T[];
}

/** Groups events by date (ascending), each day's events sorted by start time (timed events first, then all-day). */
export function groupEventsByDate<T extends { date: string; start_time: string | null }>(events: T[]): DayGroup<T>[] {
  const byDate = new Map<string, T[]>();
  for (const event of events) {
    const list = byDate.get(event.date) ?? [];
    list.push(event);
    byDate.set(event.date, list);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayEvents]) => ({
      date,
      events: [...dayEvents].sort((a, b) => (a.start_time ?? "99:99").localeCompare(b.start_time ?? "99:99")),
    }));
}
