"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import type { AuditEvent } from "@/types";
import { getSecurityAuditChangeEvent, readSecurityAudit } from "@/components/security/security-audit";

export function SecurityAuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    const refresh = () => setEvents(readSecurityAudit());
    refresh();
    const eventName = getSecurityAuditChangeEvent();
    window.addEventListener(eventName, refresh);
    return () => window.removeEventListener(eventName, refresh);
  }, []);

  return (
    <section className="border-t border-border pt-5" aria-labelledby="security-audit-title">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardCheck className="size-4 text-gold" aria-hidden="true" />
        <h2 id="security-audit-title" className="text-base font-semibold">Recent security activity</h2>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No security activity recorded.</p>
      ) : (
        <ol className="divide-y divide-border">
          {events.slice(0, 10).map((event) => (
            <li key={event.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
              <div className="min-w-0">
                <p className="text-sm font-medium">{event.action}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground" dateTime={event.at}>
                {new Date(event.at).toLocaleString()}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}