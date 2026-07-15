import { redirect } from "next/navigation";
import { getAuthUser, getWorkspace } from "@/lib/session";

export default async function Home() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/signin");
  const workspace = await getWorkspace();
  if (!workspace.tenantId) redirect("/workspace");
  redirect("/dashboard");
}
