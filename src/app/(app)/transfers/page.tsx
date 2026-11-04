import { TopBar } from "@/components/shell/top-bar";
import { TransferWorkspace } from "@/components/transfers/transfer-workspace";

export default function TransfersPage() {
  return (
    <>
      <TopBar title="Transfers" />
      <TransferWorkspace />
    </>
  );
}