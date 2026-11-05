"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, ShieldCheck, Zap } from "lucide-react";
import { PhoneFrame } from "@/components/shell/phone-frame";
import { Button } from "@/components/ui/button";

const chips = [
  { icon: Zap, label: "Instant" },
  { icon: Globe, label: "Multi-currency" },
  { icon: ShieldCheck, label: "Secure" },
];

export function WelcomeScreen() {
  return (
    <PhoneFrame>
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#0a0a0b] px-6 pb-10 pt-14 text-white">
        {/* background video */}
        <video
          className="pointer-events-none absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        >
          <source src="/welcome-bg.mp4" type="video/mp4" />
        </video>
        {/* dark overlay so text stays readable */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0.7) 45%, rgba(10,10,11,0.95) 100%)",
          }}
        />

        {/* brand — swap for real logo tomorrow */}
                <div className="relative animate-[fadeUp_600ms_ease-out]">
          <Image src="/logo.png" alt="Horizon Finance" width={140} height={140} priority className="h-auto w-28" />
        </div>

        {/* hero */}
        <div className="relative flex flex-1 flex-col justify-center">
          <div className="animate-[fadeUp_700ms_ease-out]">
            <h1 className="text-[40px] font-extrabold leading-[1.04] tracking-tight drop-shadow-lg">
              MOVE MONEY
              <br />
              <span className="text-gold">YOUR WAY.</span>
            </h1>
            <p className="mt-4 max-w-[17rem] text-sm leading-relaxed text-white/70">
              Send, spend and track across currencies, all in one place. A simulated banking
              experience.
            </p>
          </div>

                    <div className="mt-8 flex gap-2.5 animate-[fadeUp_900ms_ease-out]">
            {chips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-medium text-white/90 backdrop-blur-md"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
                }}
              >
                {/* hairline top highlight — the 'glass edge' */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  }}
                />
                <span
                  className="grid size-5 place-items-center rounded-md"
                  style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.3), rgba(201,162,39,0.1))" }}
                >
                  <Icon className="size-3 text-gold" aria-hidden />
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* actions */}
        <div className="relative space-y-3 animate-[fadeUp_1100ms_ease-out]">
          <Button
            asChild
            className="w-full rounded-full bg-white py-6 text-base font-semibold text-black transition-transform hover:scale-[1.02] hover:bg-white"
          >
            <Link href="/home">Get started</Link>
          </Button>
          <Button
            asChild
            className="w-full rounded-full bg-white/10 py-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20"
          >
            <Link href="/home">Log in</Link>
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
}