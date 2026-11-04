import { ThemeToggle } from "./theme-toggle";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-5 py-3.5 backdrop-blur-md">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <ThemeToggle />
    </header>
  );
}