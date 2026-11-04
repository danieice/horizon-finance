"use client";

import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/shell/phone-frame";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = window.setTimeout(() => setLeaving(true), 1600);
    const done = window.setTimeout(onDone, 2100);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <PhoneFrame>
      <div
        className={
          "flex min-h-dvh items-center justify-center bg-[#0a0a0b] transition-opacity duration-500 " +
          (leaving ? "opacity-0" : "opacity-100")
        }
      >
        {/* swap this block for the real logo tomorrow */}
        <div className="flex items-center gap-3 animate-[fadeUp_700ms_ease-out]">
          <span
            className="grid size-11 place-items-center rounded-xl text-xl font-bold text-black"
            style={{ background: "linear-gradient(135deg, #f0d98a, #c9a227)" }}
          >
            H
          </span>
          <span className="text-2xl font-bold tracking-tight text-white">Horizon</span>
        </div>
      </div>
    </PhoneFrame>
  );
}