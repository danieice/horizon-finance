"use client";

import type { AuditEvent } from "@/types";
import { sanitizeText } from "@/lib/sanitize";

const STORAGE_KEY = "horizon:security-audit";
const CHANGE_EVENT = "horizon:security-audit-change";
const MAX_EVENTS = 30;

export function readSecurityAudit(): AuditEvent[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const events: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(events) ? (events as AuditEvent[]) : [];
  } catch {
    return [];
  }
}

export function recordSecurityEvent(action: string, detail: string) {
  const event: AuditEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    action: sanitizeText(action),
    detail: sanitizeText(detail),
    at: new Date().toISOString(),
  };

  try {
    const events = [event, ...readSecurityAudit()].slice(0, MAX_EVENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Keep security controls usable when browser storage is unavailable.
  }
}

export function getSecurityAuditChangeEvent() {
  return CHANGE_EVENT;
}