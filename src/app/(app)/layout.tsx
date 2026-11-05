import { BottomNav } from "@/components/shell/bottom-nav";
import { PhoneFrame } from "@/components/shell/phone-frame";
import { SecurityGuard } from "@/components/security/security-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <SecurityGuard />
      <div className="flex flex-1 flex-col pb-2">{children}</div>
      <BottomNav />
    </PhoneFrame>
  );
}