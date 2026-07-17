import Link from "next/link";
import { requirePlatformUser } from "@/lib/platform-context";
import { signOutAction } from "@/lib/actions";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const platformUser = await requirePlatformUser();

  return (
    <div className="min-h-screen bg-ck-page">
      <div className="bg-ck-ink text-white px-7 py-3.5 flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-ck-accent flex items-center justify-center text-ck-accent-ink font-bold text-sm">
            C
          </div>
          <div className="font-semibold text-[15px] tracking-tight">ComplyKit Platform</div>
        </div>
        <nav className="flex items-center gap-1 text-[13px]">
          {platformUser.isPlatformAdmin && (
            <Link href="/platform/tenants" className="px-3 py-1.5 rounded-md text-[#c3c9d4] hover:bg-ck-rail-2 hover:text-white">
              Tenants
            </Link>
          )}
          <Link href="/platform/requests" className="px-3 py-1.5 rounded-md text-[#c3c9d4] hover:bg-ck-rail-2 hover:text-white">
            {platformUser.isPlatformAdmin ? "Requests" : "My requests"}
          </Link>
          <Link href="/platform/tenants/new" className="px-3 py-1.5 rounded-md text-[#c3c9d4] hover:bg-ck-rail-2 hover:text-white">
            New tenant
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-[12.5px] text-[#8a93a3]">
          <span>{platformUser.email}</span>
          <form action={signOutAction}>
            <button type="submit" className="text-[#8a93a3] hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="p-7 max-w-[1200px] mx-auto">{children}</div>
    </div>
  );
}
