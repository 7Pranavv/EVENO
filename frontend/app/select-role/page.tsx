"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useUser } from "@descope/nextjs-sdk/client";
import { saveUser, Role } from "@/lib/auth";
import { api } from "@/lib/api";

const HOME_FOR: Record<Role, string> = {
  organizer:   "/organizer/dashboard",
  vendor:      "/vendor/dashboard",
  participant: "/participant/dashboard",
  admin:       "/admin/dashboard",
};

interface Profile {
  descopeId: string;
  name: string;
  email: string;
  role: Role;
  college?: string;
}

export default function SelectRole() {
  const [role, setRole] = useState<Exclude<Role, "admin">>("participant");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();

  // A returning user already has a role — sending them through this screen on
  // every login silently overwrites it with whatever button they happen to
  // press. Only ask when there's genuinely nothing stored yet.
  useEffect(() => {
    if (isSessionLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    api<Profile>("/api/users/me")
      .then((profile) => {
        saveUser({
          id:       profile.descopeId,
          name:     profile.name,
          email:    profile.email,
          role:     profile.role,
          college:  profile.college,
          vendorId: profile.role === "vendor" ? profile.descopeId : undefined,
        });
        router.replace(HOME_FOR[profile.role] ?? "/participant/dashboard");
      })
      .catch(() => setChecking(false)); // 404 = first login, show the picker
  }, [isAuthenticated, isSessionLoading]);

  const handleContinue = async () => {
    setSaving(true);
    setError("");

    const name  = user?.name || user?.email || "User";
    const email = user?.email || "";

    try {
      const profile = await api<Profile>("/api/users/sync", {
        method: "POST",
        body: JSON.stringify({ name, email, role }),
      });

      saveUser({
        id:       profile.descopeId,
        name:     profile.name,
        email:    profile.email,
        role:     profile.role,
        college:  profile.college,
        vendorId: profile.role === "vendor" ? profile.descopeId : undefined,
      });

      router.replace(HOME_FOR[profile.role] ?? "/participant/dashboard");
    } catch (err) {
      // The profile is what every dashboard reads its role from, so a failed
      // sync must not navigate on as if it had worked.
      setError(err instanceof Error ? err.message : "Could not save your role. Try again.");
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-white/[0.07] rounded-[24px] p-10">

        <div className="mb-8 text-center">
          <h1 className="font-syne font-extrabold text-2xl mb-2">Who are you?</h1>
          <p className="text-muted text-sm">Select your role to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mb-8">
          {[
            { value: "organizer",   icon: "🏛️", label: "Organizer",   desc: "List events, collect payments" },
            { value: "participant", icon: "🎟️", label: "Participant", desc: "Discover and register for events" },
            { value: "vendor",      icon: "🏪", label: "Vendor",      desc: "Offer services to organizers" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value as typeof role)}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                role === r.value
                  ? "border-accent/40 bg-accent/10"
                  : "border-white/[0.07] hover:border-white/20 bg-bg"
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <div>
                <div className="font-medium text-sm">{r.label}</div>
                <div className="text-muted text-xs">{r.desc}</div>
              </div>
              {role === r.value && <span className="ml-auto text-accent">✓</span>}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-accent to-accent2 text-white font-medium rounded-xl hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}
