"use client";

import { useEffect, useRef } from "react";

type Props = {
  cvv: string;
  shown: boolean;
  onHide: () => void;
};

export function CvvReveal({ cvv, shown, onHide }: Props) {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!shown) return;
    // auto-hide after 5s so the CVV isn't left on screen
    timer.current = window.setTimeout(onHide, 5000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [shown, onHide]);

  if (!shown) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/5 p-4">
      <div>
        <p className="text-xs text-muted-foreground">CVV · hides in 5s</p>
        <p className="font-mono text-xl tracking-[0.4em]" aria-live="polite">
          {cvv}
        </p>
      </div>
    </div>
  );
}