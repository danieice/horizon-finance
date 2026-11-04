"use client";

import { useEffect } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { recordSecurityEvent } from "@/components/security/security-audit";
import { useStore } from "@/store/useStore";

const IDLE_TIMEOUT = 2 * 60 * 1000;

export function SecurityGuard() {
  const locked = useStore((state) => state.locked);

  useEffect(() => {
    if (locked) return;

    let timer: number;
    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        useStore.getState().lock();
        recordSecurityEvent("Session locked", "Locked after 2 minutes of inactivity");
      }, IDLE_TIMEOUT);
    };

    const activityEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(timer);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [locked]);

  const unlock = () => {
    recordSecurityEvent("Session unlocked", "Session unlocked by the user");
    useStore.getState().unlock();
  };

  return (
    <Dialog open={locked} onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-muted text-gold">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>Session locked</DialogTitle>
          <DialogDescription>
            Your session was locked after a period of inactivity.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={unlock}>Unlock session</Button>
      </DialogContent>
    </Dialog>
  );
}