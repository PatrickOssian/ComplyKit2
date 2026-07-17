import { requirePlatformUser } from "@/lib/platform-context";
import NewTenantForm from "./NewTenantForm";

export default async function NewTenantPage() {
  const platformUser = await requirePlatformUser();
  return <NewTenantForm isPlatformAdmin={platformUser.isPlatformAdmin} />;
}
