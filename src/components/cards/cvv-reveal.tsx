"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function CvvReveal({ cvv }: { cvv: string }) {
  const [shown, setShown] = useState(false);
  const timer = useRef<number | null>(null);

  function reveal() {
    setShown(true);
    if (timer.current) window.clearTimeout(timer.current);
    // auto-hide after 5s so the CVV isn't left on screen
    timer.current = window.setTimeout(() => setShown(false), 5000);
  }

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-xs text-muted-foreground">CVV</p>
        <p className="font-mono text-lg tracking-[0.3em]" aria-live="polite">
          {shown ? cvv : "•••"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reveal} disabled={shown}>
        {shown ? "Hiding soon" : "Show CVV"}
      </Button>
    </div>
  );
}