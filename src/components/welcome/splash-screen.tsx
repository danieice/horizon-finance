"use client";

import Image from "next/image";
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
                <div className="animate-[fadeUp_700ms_ease-out]">
          <Image src="/logo.png" alt="Horizon Finance" width={200} height={200} priority className="h-auto w-44" />
        </div>
      </div>
    </PhoneFrame>
  );
}