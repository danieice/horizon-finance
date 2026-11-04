"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock, LockKeyhole, ShieldCheck, ShieldOff, type LucideIcon } from "lucide-react";
import type { AuditEvent } from "@/types";
import { getSecurityAuditChangeEvent, readSecurityAudit } from "@/components/security/security-audit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 3;

function getEventStyle(action: string): { Icon: LucideIcon; card: string; icon: string; iconBackground: string; muted: string } {
  const normalizedAction = action.toLowerCase();
  const card = "bg-muted text-foreground";
  const muted = "text-muted-foreground";

  if (normalizedAction.includes("unlocked")) {
    return {
      Icon: CheckCircle2,
      card: `border-gold ${card}`,
      icon: "text-green-700 dark:text-green-400",
      iconBackground: "bg-background/10",
      muted,
    };
  }

  if (normalizedAction.includes("locked")) {
    return {
      Icon: LockKeyhole,
      card: `border-gold ${card}`,
      icon: "text-destructive",
      iconBackground: "bg-background/10",
      muted,
    };
  }

  if (normalizedAction.includes("enabled")) {
    return {
      Icon: ShieldCheck,
      card: `border-gold ${card}`,
      icon: "text-gold",
      iconBackground: "bg-background/10",
      muted,
    };
  }

  if (normalizedAction.includes("disabled")) {
    return {
      Icon: ShieldOff,
      card: `border-gold ${card}`,
      icon: "text-muted-foreground",
      iconBackground: "bg-background/10",
      muted,
    };
  }

  return {
    Icon: ClipboardCheck,
    card: `border-gold ${card}`,
    icon: "text-gold",
    iconBackground: "bg-background/10",
    muted,
  };
}

export function SecurityAuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const refresh = () => setEvents(readSecurityAudit());
    refresh();
    const eventName = getSecurityAuditChangeEvent();
    window.addEventListener(eventName, refresh);
    return () => window.removeEventListener(eventName, refresh);
  }, []);

  const pageCount = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleEvents = events.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <section className="border-t border-border pt-5" aria-labelledby="security-audit-title">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardCheck className="size-4 text-gold" aria-hidden="true" />
        <h2 id="security-audit-title" className="text-base font-semibold">Recent security activity</h2>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No security activity recorded.</p>
      ) : (
        <>
          <ol className="space-y-3" aria-live="polite">
            {visibleEvents.map((event) => {
            const style = getEventStyle(event.action);
            const Icon = style.Icon;

            return (
              <li key={event.id}>
                <article className={`flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 ${style.card}`}>
                  <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md ${style.iconBackground} ${style.icon}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-sm font-semibold">{event.action}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`View date and time for ${event.action}`}
                        title="View date and time"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CalendarDays aria-hidden="true" />
                      </Button>
                    </div>
                    <p className={`mt-1 text-sm ${style.muted}`}>{event.detail}</p>
                  </div>
                </article>
              </li>
            );
            })}
          </ol>
          <nav className="mt-4 flex items-center justify-between" aria-label="Security activity pages">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous sessions"
              title="Previous sessions"
              disabled={currentPage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next sessions"
              title="Next sessions"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </nav>
        </>
      )}

      <Dialog open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session date and time</DialogTitle>
              <DialogDescription>{selectedEvent.action}: {selectedEvent.detail}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border bg-muted p-3">
                <div className="mb-2 flex items-center gap-2 text-gold">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <time className="text-sm font-semibold" dateTime={selectedEvent.at}>
                  {new Date(selectedEvent.at).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              <div className="rounded-md border border-border bg-muted p-3">
                <div className="mb-2 flex items-center gap-2 text-gold">
                  <Clock className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <time className="text-sm font-semibold" dateTime={selectedEvent.at}>
                  {new Date(selectedEvent.at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </time>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}