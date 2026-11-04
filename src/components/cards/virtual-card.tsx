"use client";

import { Eye, EyeOff, Snowflake } from "lucide-react";
import type { Card } from "@/types";

type Props = {
  card: Card;
  revealed: boolean;
};

export function VirtualCard({ card, revealed }: Props) {
  const number = revealed ? card.pan : `•••• •••• •••• ${card.last4}`;
  const frozen = card.status === "frozen";

  return (
    <div
      className="relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-5 text-white shadow-xl"
      style={{
        background:
          "linear-gradient(135deg, #2a2a2e 0%, #121214 45%, #1c1c20 70%, #0a0a0b 100%)",
      }}
    >
      {/* brushed sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(115deg, transparent 0 2px, rgba(255,255,255,0.04) 2px 3px)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium tracking-wide">Horizon</span>
          {frozen ? (
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
              <Snowflake className="size-3" aria-hidden />
              Frozen
            </span>
          ) : null}
        </div>

        {/* gold EMV chip */}
        <div
          aria-hidden
          className="h-8 w-11 rounded-md"
          style={{ background: "linear-gradient(135deg, #e5c76b, #b8901f)" }}
        />

        <div className="space-y-3">
          <p className="font-mono text-lg tracking-[0.15em]">{number}</p>
          <div className="flex items-end justify-between text-xs">
            <div>
              <p className="text-white/50">CARD HOLDER</p>
              <p className="tracking-wide">{card.holder}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50">EXPIRES</p>
              <p className="tracking-wide">{card.expiry}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// re-export so the page can show a reveal toggle label without importing icons twice
export { Eye, EyeOff };