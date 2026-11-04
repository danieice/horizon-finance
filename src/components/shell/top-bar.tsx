import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-5 py-3.5 backdrop-blur-md">
            <Image src="/logo-icon.png" alt="Horizon Finance" width={120} height={120} className="h-7 w-auto" />
      <ThemeToggle />
    </header>
  );
}