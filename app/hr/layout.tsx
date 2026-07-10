import { AppShell } from "@/components/app-shell";
import { HrGate } from "@/lib/auth";

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <HrGate>
      <AppShell>{children}</AppShell>
    </HrGate>
  );
}
