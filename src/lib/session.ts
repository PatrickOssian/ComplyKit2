// Real identity now comes from Better Auth (getAuthUser). Which
// workspace/tenant is currently selected, and the GxP overlay toggle, are
// app-specific UI state that Better Auth has no concept of — those still
// live in a small cookie here. Per the Cloudflare Workers runbook, both
// kinds of session reads must stay in server components / route handlers
// / Server Actions — never in middleware/proxy (cookies() is unsupported
// there on Workers).

import { cookies, headers } from "next/headers";
import { auth } from "./auth";

const COOKIE_NAME = "ck_workspace";

export interface WorkspaceState {
  /** null once signed in but before a tenant/workspace has been chosen. */
  tenantId: string | null;
  /** Resolved once (from real membership data, or the advisor pseudo-tenant
   * shortcut) when a tenant is picked, then carried forward as-is while
   * browsing between orgs — an advisor jumping between client sites keeps
   * their advisor mode even for orgs they have no membership row for. */
  advisorMode: boolean;
  /** Life science / GxP overlay — a session-level preference in this mock phase. */
  gxp: boolean;
}

const DEFAULT_WORKSPACE: WorkspaceState = { tenantId: null, advisorMode: false, gxp: true };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  return { id: result.user.id, name: result.user.name, email: result.user.email };
}

export async function getWorkspace(): Promise<WorkspaceState> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return DEFAULT_WORKSPACE;
  try {
    return { ...DEFAULT_WORKSPACE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WORKSPACE;
  }
}

export async function setWorkspace(data: WorkspaceState): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearWorkspace(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
