"use client";

import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatAmount } from "@/lib/currency";
import { useStore } from "@/store/useStore";
import type { Card } from "@/types";

export function CardControls({ card }: { card: Card }) {
  const setCardStatus = useStore((s) => s.setCardStatus);
  const setCardLimit = useStore((s) => s.setCardLimit);

  function toggleFreeze(frozen: boolean) {
    setCardStatus(card.id, frozen ? "frozen" : "active");
    toast.success(frozen ? "Card frozen" : "Card unfrozen");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-medium">Freeze card</p>
          <p className="text-xs text-muted-foreground">Instantly block all spending</p>
        </div>
        <Switch
          checked={card.status === "frozen"}
          onCheckedChange={toggleFreeze}
          aria-label="Freeze card"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Monthly limit</p>
          <p className="font-mono text-sm text-gold">{formatAmount(card.limit, "USD")}</p>
        </div>
        <Slider
          value={[card.limit]}
          min={500}
          max={10000}
          step={100}
          onValueChange={([v]) => setCardLimit(card.id, v)}
          aria-label="Monthly spending limit"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {formatAmount(card.spent, "USD")} spent this month
        </p>
      </div>
    </div>
  );
}