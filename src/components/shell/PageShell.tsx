import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import type { AdvisorIdentity } from "@/lib/data/types";

interface PageShellProps {
  title: string;
  subtitle: string;
  gxpOn: boolean;
  advisor: AdvisorIdentity;
  children: ReactNode;
}

export function PageShell({ title, subtitle, gxpOn, advisor, children }: PageShellProps) {
  return (
    <>
      <AppHeader title={title} subtitle={subtitle} gxpOn={gxpOn} advisor={advisor} />
      <div className="flex-1 overflow-auto bg-ck-page">{children}</div>
    </>
  );
}
