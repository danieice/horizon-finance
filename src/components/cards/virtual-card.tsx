"use client";

import { Wifi } from "lucide-react";
import type { Card } from "@/types";

type Props = {
  card: Card;
  revealed: boolean;
};

export function VirtualCard({ card, revealed }: Props) {
  const groups = card.pan.split(" ");
  const frozen = card.status === "frozen";

  return (
    <div
      className="group relative aspect-[1.586/1] w-full overflow-hidden rounded-[20px] text-white shadow-2xl transition-all duration-500"
      style={{
        background: frozen
          ? "linear-gradient(135deg, #3a4452 0%, #1a2028 55%, #0d1116 100%)"
          : "linear-gradient(135deg, #3a3a40 0%, #18181b 40%, #232327 65%, #0a0a0b 100%)",
      }}
    >
      {/* diagonal brushed-metal streaks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "repeating-linear-gradient(110deg, transparent 0 3px, rgba(255,255,255,0.05) 3px 4px)",
        }}
      />
      {/* soft top-left light bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.35), transparent 70%)" }}
      />
      {/* frozen frost overlay */}
      {frozen ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 backdrop-blur-[1px]"
          style={{ background: "linear-gradient(135deg, rgba(180,210,255,0.12), transparent)" }}
        />
      ) : null}

      <div className="relative flex h-full flex-col justify-between p-5">
        {/* top row: brand + contactless */}
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold tracking-tight">Horizon</span>
            <span className="text-[10px] font-medium text-white/40">{card.label}</span>
          </div>
          <Wifi className="size-4 rotate-90 text-white/60" aria-hidden />
        </div>

        {/* realistic EMV chip */}
        <div className="relative">
          <div
            className="relative h-9 w-12 overflow-hidden rounded-[7px]"
            style={{ background: "linear-gradient(135deg, #f0d98a 0%, #c9a227 50%, #9a7b1a 100%)" }}
            aria-hidden
          >
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1.5px] p-[3px] opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-[1px] bg-black/30" />
              ))}
            </div>
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-black/25" />
            <div className="absolute bottom-0 top-0 left-1/2 w-px -translate-x-1/2 bg-black/25" />
          </div>
        </div>

        {/* number */}
        <div className="flex items-center gap-3 font-mono text-[17px] tracking-[0.12em]">
          {groups.map((g, i) => (
            <span key={i} className="tabular-nums">
              {revealed || i === groups.length - 1 ? g : "••••"}
            </span>
          ))}
        </div>

        {/* bottom row */}
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] uppercase tracking-wider text-white/40">Card holder</p>
            <p className="text-sm tracking-wide">{card.holder}</p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="text-[9px] uppercase tracking-wider text-white/40">Expires</p>
            <p className="text-sm tracking-wide">{card.expiry}</p>
          </div>
          {/* Mastercard-style mark */}
          <div className="flex items-center" aria-hidden>
            <span className="size-6 rounded-full bg-[#eb001b]/90" />
            <span className="-ml-3 size-6 rounded-full bg-[#f79e1b]/90 mix-blend-screen" />
          </div>
        </div>
      </div>
    </div>
  );
}