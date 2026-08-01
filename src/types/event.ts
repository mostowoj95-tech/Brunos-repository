export interface ExtractedEvent {
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM
  end_time: string | null; // HH:MM
  location: string | null;
  description: string | null;
  timezone: string;
}

export interface ClaudeEventsResponse {
  events: ExtractedEvent[];
}
