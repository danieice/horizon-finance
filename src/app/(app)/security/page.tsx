import { TopBar } from "@/components/shell/top-bar";
import { SecurityAuditLog } from "@/components/security/security-audit-log";
import { TwoFactorAuth } from "@/components/security/two-factor-auth";

export default function SecurityPage() {
  return (
    <>
      <TopBar title="Security" />
      <main className="flex-1 space-y-5 px-5 py-5">
        <TwoFactorAuth />
        <SecurityAuditLog />
      </main>
    </>
  );
}
