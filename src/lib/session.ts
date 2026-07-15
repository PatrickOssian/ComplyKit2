// Mock session handling for the pre-auth phase. Stands in for a future
// NextAuth session: reads/writes a small signed-ish cookie. Per the
// Cloudflare Workers runbook, session checks must live in server
// components / route handlers / Server Actions — never in middleware/proxy
// (cookies() is unsupported there on Workers).

import { cookies } from "next/headers";

const COOKIE_NAME = "ck_session";

export interface SessionData {
  /** null once signed in but before a tenant/workspace has been chosen. */
  tenantId: string | null;
  advisorMode: boolean;
  /** Life science / GxP overlay — a session-level preference in this mock phase. */
  gxp: boolean;
}

const DEFAULT_SESSION: SessionData = { tenantId: null, advisorMode: false, gxp: true };

export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return { ...DEFAULT_SESSION, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
