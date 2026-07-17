"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { acceptInviteBookkeepingAction } from "@/lib/platform-actions";

export default function AcceptInviteForm({
  token,
  email,
  tenantName,
}: {
  token: string;
  email: string;
  tenantName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signUpError } = await authClient.signUp.email({ email, password, name });
    if (signUpError) {
      setSubmitting(false);
      setError(signUpError.message ?? "Kunne ikke oprette kontoen.");
      return;
    }

    const result = await acceptInviteBookkeepingAction(token);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ck-page px-6">
      <div className="w-full max-w-[400px] bg-white border border-ck-border rounded-2xl p-7 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 rounded-lg bg-ck-accent flex items-center justify-center text-ck-accent-ink font-bold text-sm">
            C
          </div>
          <div className="font-semibold text-[15px] text-ck-ink tracking-tight">ComplyKit</div>
        </div>
        <h1 className="text-lg font-semibold text-ck-ink tracking-tight mb-1">Velkommen til {tenantName}</h1>
        <div className="text-[13px] text-ck-muted mb-6">Opret din konto for at få adgang til workspacet.</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="text-[12.5px] text-ck-text-2 mb-1.5">E-mail</div>
            <input
              value={email}
              disabled
              className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-muted bg-[#f9fafb] outline-none"
            />
          </div>
          <div>
            <div className="text-[12.5px] text-ck-text-2 mb-1.5">Fulde navn</div>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none focus:border-ck-ink"
            />
          </div>
          <div>
            <div className="text-[12.5px] text-ck-text-2 mb-1.5">Adgangskode</div>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-ck-border-2 rounded-xl px-3.5 py-3 text-sm text-ck-ink outline-none focus:border-ck-ink"
            />
          </div>

          {error && <div className="text-[12.5px] text-ck-red -mt-1">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-center bg-ck-ink hover:bg-ck-rail-2 text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Opretter…" : "Opret konto"}
          </button>
        </form>
      </div>
    </div>
  );
}
