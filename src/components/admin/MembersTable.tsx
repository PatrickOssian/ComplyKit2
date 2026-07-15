"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteMemberAction, removeMemberAction, setMemberRoleAction } from "@/lib/actions";
import type { Member, RoleName } from "@/lib/data/types";
import { ROLES, avaColor, roleMeta } from "@/lib/domain";

interface MembersTableProps {
  members: Member[];
}

export function MembersTable({ members }: MembersTableProps) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<RoleName>("Viewer");
  const [inviteSent, setInviteSent] = useState(false);

  const validEmail = /.+@.+\..+/.test(inviteEmail);

  const closeInvite = () => {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("Viewer");
    setInviteSent(false);
  };

  const sendInvite = async () => {
    if (!validEmail) return;
    await inviteMemberAction(inviteEmail, inviteRole);
    setInviteSent(true);
    refresh();
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setInviteOpen(true)}
          className="text-xs font-medium text-white bg-ck-ink rounded-lg px-3.5 py-2"
        >
          Invite people
        </button>
      </div>
      <div className="bg-white border border-ck-border rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-[2fr_1fr_1fr_100px_100px_30px] gap-2 px-4 py-2.75 text-[10px] tracking-wide uppercase text-ck-muted bg-[#fafafa] border-b border-ck-border">
          <div>Member</div>
          <div>Email</div>
          <div>Role</div>
          <div>Auth</div>
          <div>Last active</div>
          <div />
        </div>
        {members.map((m, i) => {
          const rm = roleMeta(m.role);
          const [avaBg, avaFg] = avaColor(i);
          const ssoLabel = m.status === "Invited" ? "Invited" : m.sso ? "SSO" : "Password";
          const ssoStyle =
            m.status === "Invited"
              ? { color: "#b54708", background: "#fffaeb", borderColor: "#fedf89" }
              : m.sso
                ? { color: "#175cd3", background: "#eff8ff", borderColor: "#d1e3ff" }
                : { color: "#475467", background: "#f2f4f7", borderColor: "#eaecf0" };
          return (
            <div key={m.email} className="grid grid-cols-[2fr_1fr_1fr_100px_100px_30px] gap-2 items-center px-4 py-3 border-t border-[#f2f4f7] text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-full shrink-0 text-[11px] font-semibold flex items-center justify-center"
                  style={{ background: avaBg, color: avaFg }}
                >
                  {m.init}
                </div>
                <div className="min-w-0">
                  <div className="text-ck-ink font-medium truncate flex items-center gap-1.5">
                    {m.name}
                    {m.you && <span className="text-[9px] text-ck-muted bg-[#f2f4f7] px-1.25 py-0.5 rounded">You</span>}
                    {m.advisor && (
                      <span className="text-[9px] font-semibold text-ck-amber bg-ck-amber-bg border border-ck-amber-border px-1.25 py-0.5 rounded">
                        Advisor
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-ck-muted-2 truncate">{m.email}</div>
              <div>
                <select
                  defaultValue={m.role}
                  onChange={async (e) => {
                    await setMemberRoleAction(m.email, e.target.value as RoleName);
                    refresh();
                  }}
                  className="text-[11px] font-semibold border rounded-md px-1.5 py-0.75"
                  style={{ color: rm.fg, background: rm.bg, borderColor: rm.bd }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10.5px] font-medium border rounded-full px-2 py-0.75" style={ssoStyle}>
                  {ssoLabel}
                </span>
              </div>
              <div className="text-ck-muted text-[11px]">{m.last}</div>
              <div>
                {!m.you && (
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Remove ${m.name} from this workspace?`)) return;
                      await removeMemberAction(m.email);
                      refresh();
                    }}
                    className="text-ck-muted hover:text-[#b42318]"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {inviteOpen && (
        <>
          <div className="fixed inset-0 bg-[rgba(16,24,40,0.4)] z-50" onClick={closeInvite} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[92vw] bg-white rounded-2xl z-50 shadow-[0_20px_60px_rgba(16,24,40,0.3)] p-5.5">
            {inviteSent ? (
              <>
                <div className="text-[15px] font-semibold text-ck-ink mb-2">Invitation sent</div>
                <div className="text-xs text-ck-muted-2 mb-4">{inviteEmail} has been invited as {inviteRole}.</div>
                <button onClick={closeInvite} className="w-full text-center text-[13px] font-medium text-white bg-ck-ink rounded-lg py-2.25">
                  Close
                </button>
              </>
            ) : (
              <>
                <div className="text-[15px] font-semibold text-ck-ink mb-4">Invite people</div>
                <div className="text-[11px] text-ck-muted mb-1.25">Email</div>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full box-border text-[13px] text-ck-ink border border-ck-border-2 rounded-lg px-2.75 py-2.25 outline-none mb-3"
                />
                <div className="text-[11px] text-ck-muted mb-1.25">Role</div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as RoleName)}
                  className="w-full text-[13px] text-ck-ink border border-ck-border-2 rounded-lg px-2.75 py-2.25 bg-white mb-3"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="text-[10.5px] text-ck-muted mb-4">
                  Members are synced from your Entra ID directory via SCIM where SSO is enabled.
                </div>
                <div className="flex gap-2.5">
                  <button onClick={closeInvite} className="text-[13px] text-ck-text-2 border border-ck-border-2 rounded-lg px-4 py-2.25">
                    Cancel
                  </button>
                  <button
                    onClick={sendInvite}
                    disabled={!validEmail}
                    className={`flex-1 text-center text-[13px] font-semibold rounded-lg py-2.25 text-white ${validEmail ? "bg-ck-ink" : "bg-ck-border-2 cursor-not-allowed"}`}
                  >
                    Send invite
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
