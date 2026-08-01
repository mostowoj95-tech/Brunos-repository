import { getApiKey } from "../storage/apiKeyStore";
import type { ClaudeEventsResponse, ExtractedEvent } from "../types/event";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-opus-5";

const PROMPT_TEMPLATE = (deviceTimezone: string) => `You are extracting calendar event information from a photo of an event flyer or listing screenshot.

For each event, also flag any field that was genuinely hard to read on the photo (blurry, cut off,
ambiguous handwriting/print) and offer 1-3 alternative readings for each flagged field. Most fields
on most events will not be flagged — only flag a field when the photo itself is ambiguous, not when
you're merely inferring something reasonable (e.g. estimating an end time is not a flag).

Rules:
- If the photo shows multiple distinct events (e.g. a season brochure with several dates), return one object per event.
- If no end time is given, estimate a reasonable duration for the type of event (e.g. concerts ~2 hours) and compute end_time.
- If a field truly cannot be determined, use null — do not guess wildly.
- Infer timezone from any location mentioned (e.g. Switzerland → "Europe/Zurich"); default to the device's local timezone if nothing is inferable (device timezone will be provided below).
- Preserve original-language event titles, performer names, and diacritics exactly (e.g. "Fazıl Say", not "Fazil Say").
- description should combine performer/lineup info and the flyer's blurb text, concise.

Device timezone: ${deviceTimezone}`;

const EVENT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string", description: "YYYY-MM-DD" },
    start_time: { type: ["string", "null"], description: "HH:MM" },
    end_time: { type: ["string", "null"], description: "HH:MM" },
    location: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    timezone: { type: "string" },
    flagged_fields: {
      type: "array",
      items: { type: "string" },
      description: "Names of fields on this event that were hard to read on the photo, e.g. [\"location\"]. Empty if none.",
    },
    alternatives: {
      type: "array",
      description: "One entry per flagged field, with alternative readings. Empty if nothing flagged.",
      items: {
        type: "object",
        properties: {
          field: { type: "string" },
          values: { type: "array", items: { type: "string" } },
        },
        required: ["field", "values"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "title",
    "date",
    "start_time",
    "end_time",
    "location",
    "description",
    "timezone",
    "flagged_fields",
    "alternatives",
  ],
  additionalProperties: false,
};

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    events: { type: "array", items: EVENT_SCHEMA },
  },
  required: ["events"],
  additionalProperties: false,
};

export class ClaudeApiError extends Error {}
export class MissingApiKeyError extends ClaudeApiError {}
export class NoEventsFoundError extends ClaudeApiError {}

export async function extractEventsFromImage(
  base64Image: string,
  mediaType: string,
  deviceTimezone: string,
  signal?: AbortSignal
): Promise<ExtractedEvent[]> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new MissingApiKeyError("No Anthropic API key saved.");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      output_config: {
        format: {
          type: "json_schema",
          schema: OUTPUT_SCHEMA,
        },
      },
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
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new ClaudeApiError("Couldn't read this image, try a clearer photo.");
  }

  if (!Array.isArray(parsed.events) || parsed.events.length === 0) {
    throw new NoEventsFoundError("No events found in this image.");
  }

  return parsed.events;
}
