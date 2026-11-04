import { TopBar } from "@/components/shell/top-bar";

export default function CardsPage() {
  return (
    <>
      <TopBar title="Cards" />
      <main className="flex-1 px-5 py-5">
        <p className="text-muted-foreground">Cards — Dev 1</p>
      </main>
    </>
  );
}