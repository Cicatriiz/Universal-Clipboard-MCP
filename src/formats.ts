import { Format } from "./types";

export const SUPPORTED_FORMATS: Format[] = Object.values(Format);

export function listFormats(): Format[] {
  return SUPPORTED_FORMATS;
}

export function detectFormat(content: string): Format {
  // Basic detection logic, to be expanded later
  if (content.trim().startsWith("{") && content.trim().endsWith("}")) {
    try {
      JSON.parse(content);
      return Format.JSON;
    } catch (e) {
      // Not valid JSON
    }
  }
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return Format.HTML;
  }
  // Add more rules for markdown, jira, etc.
  return Format.PlainText;
}
