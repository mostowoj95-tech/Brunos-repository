export interface ExtractedEvent {
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM
  end_time: string | null; // HH:MM
  location: string | null;
  description: string | null;
  timezone: string;
  /** Field names Claude flagged as hard to read on the source photo, e.g. ["location"]. */
  flagged_fields: string[];
  /** Alternative readings for flagged fields. */
  alternatives: { field: string; values: string[] }[];
}

export interface ClaudeEventsResponse {
  events: ExtractedEvent[];
}

/** An ExtractedEvent with a stable client-side id, used once extraction is complete. */
export interface SessionEvent extends ExtractedEvent {
  id: string;
}
