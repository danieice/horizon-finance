import DOMPurify from "dompurify";

// strip all HTML from free-text fields (memos, payee names) before storing/displaying
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}