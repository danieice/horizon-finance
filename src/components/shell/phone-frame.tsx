import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-secondary/40">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background shadow-xl">
        {children}
      </div>
    </div>
  );
}