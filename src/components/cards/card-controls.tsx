"use client";

import { formatAmount } from "@/lib/currency";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/store/useStore";
import type { Card } from "@/types";

export function CardControls({ card }: { card: Card }) {
  const setCardLimit = useStore((s) => s.setCardLimit);
  const pct = Math.min(100, Math.round((card.spent / card.limit) * 100));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">Monthly limit</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatAmount(card.spent, "USD")} of{" "}
            {formatAmount(card.limit, "USD")} used
          </p>
        </div>
        <p className="font-mono text-sm text-gold">
          {formatAmount(card.limit, "USD")}
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4">
        <Slider
          value={[card.limit]}
          min={500}
          max={10000}
          step={100}
          onValueChange={([v]) => setCardLimit(card.id, v)}
          aria-label="Monthly spending limit"
          className="[&_[data-slot=slider-range]]:bg-muted-foreground/40"
        />
      </div>
    </div>
  );
}
