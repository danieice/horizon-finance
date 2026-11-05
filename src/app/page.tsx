"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/welcome/splash-screen";
import { WelcomeScreen } from "@/components/welcome/welcome-screen";

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;
  return <WelcomeScreen />;
}