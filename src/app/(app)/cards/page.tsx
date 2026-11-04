"use client";

import { useState } from "react";
import { TopBar } from "@/components/shell/top-bar";
import { SectionLabel } from "@/components/ui/section-label";
import { VirtualCard } from "@/components/cards/virtual-card";
import { CardActions } from "@/components/cards/card-actions";
import { CvvReveal } from "@/components/cards/cvv-reveal";
import { CardControls } from "@/components/cards/card-controls";
import { useStore } from "@/store/useStore";

export default function CardsPage() {
  const cards = useStore((s) => s.cards);
  const [activeId, setActiveId] = useState(cards[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);
  const [cvvShown, setCvvShown] = useState(false);

  const card = cards.find((c) => c.id === activeId) ?? cards[0];

  return (
    <>
      <TopBar title="Cards" />
      <main className="flex-1 space-y-7 px-5 pb-6 pt-5">
        {cards.length > 1 ? (
          <div className="flex gap-2">
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveId(c.id);
                  setRevealed(false);
                  setCvvShown(false);
                }}
                className={
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors " +
                  (c.id === card.id
                    ? "bg-gold text-gold-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}

        <VirtualCard card={card} revealed={revealed} />

        <CardActions
          card={card}
          revealed={revealed}
          onToggleReveal={() => setRevealed((v) => !v)}
          onShowCvv={() => setCvvShown(true)}
        />

        <CvvReveal cvv={card.cvv} shown={cvvShown} onHide={() => setCvvShown(false)} />

        <div>
          <SectionLabel>Spending</SectionLabel>
          <CardControls card={card} />
        </div>
      </main>
    </>
  );
}