"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@descope/nextjs-sdk/client";
import { api } from "@/lib/api";
import { saveUser, Role } from "@/lib/auth";

interface Profile {
  descopeId: string;
  name: string;
  email: string;
  role: Role;
  college?: string;
  status: string;
}

// Client-side gate. This is UX only — every one of these routes is also
// enforced on the server, because anything here can be bypassed with devtools.
export default function RequireRole({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    if (isSessionLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    api<Profile>("/api/users/me")
      .then((profile) => {
        if (cancelled) return;

        // Keep the local copy in step with the server's answer, so the
        // sidebar and greetings never show a role the backend disagrees with.
        saveUser({
          id:       profile.descopeId,
          name:     profile.name,
          email:    profile.email,
          role:     profile.role,
          college:  profile.college,
          vendorId: profile.role === "vendor" ? profile.descopeId : undefined,
        });

        if (allow.includes(profile.role)) {
          setState("ok");
        } else {
          setState("denied");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/select-role");
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, isSessionLoading]);

  if (state === "checking") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-syne font-bold text-xl mb-2">Not your dashboard</h1>
          <p className="text-muted text-sm mb-6">
            This page is only for {allow.join(" / ")} accounts.
          </p>
          <button
            onClick={() => router.push("/select-role")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent2 text-white text-sm font-bold"
          >
            Go to my dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
