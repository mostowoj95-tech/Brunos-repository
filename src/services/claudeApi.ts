import { getApiKey } from "../storage/apiKeyStore";
import type { ClaudeEventsResponse, ExtractedEvent } from "../types/event";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-opus-5";

const PROMPT_TEMPLATE = (deviceTimezone: string) => `You are extracting calendar event information from a photo of an event flyer or listing screenshot.

Return ONLY valid JSON (no markdown fences, no commentary) matching this schema:

{
  "events": [
    {
      "title": string,
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM" | null,
      "end_time": "HH:MM" | null,
      "location": string | null,
      "description": string | null,
      "timezone": string
    }
  ]
}

Rules:
- If the photo shows multiple distinct events (e.g. a season brochure with several dates), return one object per event.
- If no end time is given, estimate a reasonable duration for the type of event (e.g. concerts ~2 hours) and compute end_time.
- If a field truly cannot be determined, use null — do not guess wildly.
- Infer timezone from any location mentioned (e.g. Switzerland → "Europe/Zurich"); default to the device's local timezone if nothing is inferable (device timezone will be provided below).
- Preserve original-language event titles, performer names, and diacritics exactly (e.g. "Fazıl Say", not "Fazil Say").
- description should combine performer/lineup info and the flyer's blurb text, concise.

Device timezone: ${deviceTimezone}`;

export class ClaudeApiError extends Error {}
export class MissingApiKeyError extends ClaudeApiError {}
export class NoEventsFoundError extends ClaudeApiError {}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export async function extractEventsFromImage(
  base64Image: string,
  mediaType: string,
  deviceTimezone: string
): Promise<ExtractedEvent[]> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new MissingApiKeyError("No Anthropic API key saved.");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: PROMPT_TEMPLATE(deviceTimezone),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ClaudeApiError(`Claude API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  if (data.stop_reason === "refusal") {
    throw new ClaudeApiError("Claude declined to process this image.");
  }

  const textBlock = data.content?.find((block: { type: string }) => block.type === "text");
  if (!textBlock?.text) {
    throw new ClaudeApiError("Claude returned no text content.");
  }

  let parsed: ClaudeEventsResponse;
  try {
    parsed = JSON.parse(stripMarkdownFences(textBlock.text));
  } catch {
    throw new ClaudeApiError("Couldn't read this image, try a clearer photo.");
  }

  if (!Array.isArray(parsed.events) || parsed.events.length === 0) {
    throw new NoEventsFoundError("No events found in this image.");
  }

  return parsed.events;
}
