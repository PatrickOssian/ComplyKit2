import { getInviteByToken, getTenant } from "@/lib/data/store";
import AcceptInviteForm from "./AcceptInviteForm";

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ck-page px-6">
      <div className="w-full max-w-[400px] bg-white border border-ck-border rounded-2xl p-7 shadow-[0_1px_2px_rgba(16,24,40,0.04)] text-center">
        <div className="text-[15px] font-semibold text-ck-ink mb-2">Invitationen kan ikke bruges</div>
        <div className="text-[13px] text-ck-muted">{message}</div>
      </div>
    </div>
  );
}

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await getInviteByToken(token);
  if (!invite) {
    return <ErrorScreen message="Denne invitationslink er ugyldig." />;
  }
  if (invite.status === "accepted") {
    return <ErrorScreen message="Denne invitation er allerede blevet brugt." />;
  }
  if (invite.status === "expired" || new Date(invite.expiresAt) < new Date()) {
    return <ErrorScreen message="Denne invitation er udløbet. Kontakt din platform admin for en ny invitation." />;
  }

  const tenant = await getTenant(invite.tenantId);
  if (!tenant) {
    return <ErrorScreen message="Workspacet findes ikke længere." />;
  }

  return <AcceptInviteForm token={token} email={invite.email} tenantName={tenant.name} />;
}
