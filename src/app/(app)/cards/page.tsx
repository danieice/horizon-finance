"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shell/top-bar";
import { VirtualCard } from "@/components/cards/virtual-card";
import { CvvReveal } from "@/components/cards/cvv-reveal";
import { CardControls } from "@/components/cards/card-controls";
import { useStore } from "@/store/useStore";

export default function CardsPage() {
  const cards = useStore((s) => s.cards);
  const [activeId, setActiveId] = useState(cards[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);

  const card = cards.find((c) => c.id === activeId) ?? cards[0];

  return (
    <>
      <TopBar title="Cards" />
      <main className="flex-1 space-y-6 px-5 py-5">
        {cards.length > 1 ? (
          <div className="flex gap-2">
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveId(c.id);
                  setRevealed(false);
                }}
                className={
                  "rounded-full px-3 py-1 text-xs transition-colors " +
                  (c.id === card.id
                    ? "bg-gold text-gold-foreground"
                    : "border border-border text-muted-foreground")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}

        <VirtualCard card={card} revealed={revealed} />

        <Button variant="outline" className="w-full" onClick={() => setRevealed((v) => !v)}>
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {revealed ? "Hide card number" : "Show card number"}
        </Button>

        <CvvReveal cvv={card.cvv} />
        <CardControls card={card} />
      </main>
    </>
  );
}