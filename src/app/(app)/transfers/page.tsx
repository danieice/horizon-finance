import { TopBar } from "@/components/shell/top-bar";

export default function TransfersPage() {
  return (
    <>
      <TopBar title="Send" />
      <main className="flex-1 px-5 py-5">
        <p className="text-muted-foreground">Transfers — Dev 2</p>
      </main>
    </>
  );
}