"use client";

import { Eye, EyeOff, Snowflake, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import type { Card } from "@/types";

type Props = {
  card: Card;
  revealed: boolean;
  onToggleReveal: () => void;
  onShowCvv: () => void;
};

function ActionButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-1 flex-col items-center gap-2">
      <span
        className={
          "grid size-14 place-items-center rounded-full transition-colors " +
          (active ? "bg-gold text-gold-foreground" : "bg-secondary text-foreground hover:bg-accent")
        }
      >
        {icon}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  );
}

export function CardActions({ card, revealed, onToggleReveal, onShowCvv }: Props) {
  const setCardStatus = useStore((s) => s.setCardStatus);
  const frozen = card.status === "frozen";

  function toggleFreeze() {
    setCardStatus(card.id, frozen ? "active" : "frozen");
    toast.success(frozen ? "Card unfrozen" : "Card frozen");
  }

  return (
    <div className="flex items-start justify-around gap-2">
      <ActionButton
        icon={revealed ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        label={revealed ? "Hide details" : "Show details"}
        active={revealed}
        onClick={onToggleReveal}
      />
      <ActionButton
        icon={<Snowflake className="size-5" />}
        label={frozen ? "Unfreeze" : "Freeze"}
        active={frozen}
        onClick={toggleFreeze}
      />
      <ActionButton
        icon={<KeyRound className="size-5" />}
        label="Show CVV"
        onClick={onShowCvv}
      />
    </div>
  );
}