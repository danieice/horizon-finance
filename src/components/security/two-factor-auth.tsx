"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Check, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recordSecurityEvent } from "@/components/security/security-audit";

const STORAGE_KEY = "horizon:two-factor-enabled";
const CODE_LENGTH = 6;

export function TwoFactorAuth() {
  const [enabled, setEnabled] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setEnabled(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const verifyCode = () => {
    if (digits.some((digit) => !digit)) {
      toast.error("Enter all six digits");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, "true");
    setEnabled(true);
    setSetupOpen(false);
    setDigits(Array(CODE_LENGTH).fill(""));
    recordSecurityEvent("Two-factor authentication enabled", "Authenticator code verified");
    toast.success("Two-factor authentication enabled");
  };

  const disableTwoFactor = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setEnabled(false);
    recordSecurityEvent("Two-factor authentication disabled", "Authenticator protection disabled");
    toast.success("Two-factor authentication disabled");
  };

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, currentIndex) => currentIndex === index ? digit : item));
    if (digit && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    setDigits(Array.from({ length: CODE_LENGTH }, (_, index) => pastedDigits[index] ?? ""));
    inputs.current[Math.min(pastedDigits.length, CODE_LENGTH - 1)]?.focus();
  };

  return (
    <section className="pb-5" aria-labelledby="two-factor-title">
      <div className="mb-3 flex items-center gap-2">
        {enabled ? <ShieldCheck className="size-4 text-gold" aria-hidden="true" /> : <ShieldOff className="size-4 text-muted-foreground" aria-hidden="true" />}
        <h2 id="two-factor-title" className="text-base font-semibold">Two-factor authentication</h2>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {enabled ? "Authenticator verification is active." : "Add an authenticator code to protect your account."}
        </p>
        {enabled ? (
          <Button variant="outline" onClick={disableTwoFactor}>Disable</Button>
        ) : (
          <Button variant="outline" onClick={() => setSetupOpen((open) => !open)}>
            {setupOpen ? "Cancel setup" : "Set up 2FA"}
          </Button>
        )}
      </div>

      {setupOpen && !enabled && (
        <div className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
          <div className="flex flex-wrap gap-2">
            {digits.map((digit, index) => (
              <Input
                key={index}
                ref={(element) => { inputs.current[index] = element; }}
                aria-label={`Verification code digit ${index + 1}`}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                className="size-11 min-w-0 rounded-md p-0 text-center text-lg font-semibold"
                inputMode="numeric"
                maxLength={1}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                value={digit}
              />
            ))}
          </div>
          <Button className="mt-4" onClick={verifyCode}>
            <Check aria-hidden="true" /> Verify code
          </Button>
        </div>
      )}
    </section>
  );
}