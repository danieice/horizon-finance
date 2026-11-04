"use client";

import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PrivacyToggleProps {
  variant?: "icon" | "pill";
  className?: string;
}

export function PrivacyToggle({ variant = "icon", className }: PrivacyToggleProps) {
  const privacyMode = useStore((s) => s.privacyMode);
  const togglePrivacy = useStore((s) => s.togglePrivacy);

  const handleToggle = () => {
    togglePrivacy();
    if (!privacyMode) {
      toast.success("Privacy mode active", {
        description: "Balances and values are masked for discretion.",
      });
    } else {
      toast.info("Privacy mode inactive", {
        description: "Account figures are now visible.",
      });
    }
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={privacyMode ? "Show account balances" : "Hide account balances"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border select-none",
          privacyMode
            ? "border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
            : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/40",
          className
        )}
      >
        {privacyMode ? (
          <>
            <EyeOff className="size-3.5 text-gold" />
            <span>Hidden</span>
          </>
        ) : (
          <>
            <Eye className="size-3.5" />
            <span>Visible</span>
          </>
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      aria-label={privacyMode ? "Show account balances" : "Hide account balances"}
      title={privacyMode ? "Show balances" : "Hide balances (Privacy Mode)"}
      className={cn(
        "rounded-full transition-colors",
        privacyMode
          ? "bg-gold/10 text-gold hover:bg-gold/20"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {privacyMode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </Button>
  );
}
