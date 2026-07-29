"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useUser } from "@descope/nextjs-sdk/client";
import { saveAuth } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

export default function SelectRole() {
  const [role, setRole] = useState<"organizer" | "participant" | "vendor">("participant");
  const router = useRouter();
  const { sessionToken } = useSession();
  const { user } = useUser();

  const handleContinue = async () => {
    const userId = user?.userId || user?.loginIds?.[0] || `user_${Date.now()}`;
    const name = user?.name || user?.email || "User";
    const email = user?.email || "";

    saveAuth(sessionToken, {
      id: userId,
      name,
      email,
      role,
      vendorId: role === "vendor" ? userId : undefined,
    });

    try {
      await fetch(`${API_BASE}/api/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ name, email, role }),
      });
    } catch {
      // non-blocking — profile sync failure shouldn't stop navigation
    }

    if (role === "organizer") router.push("/organizer/dashboard");
    else if (role === "vendor") router.push("/vendor/dashboard");
    else router.push("/participant/dashboard");
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-white/[0.07] rounded-[24px] p-10">
        
        <div className="mb-8 text-center">
          <h1 className="font-syne font-extrabold text-2xl mb-2">Who are you?</h1>
          <p className="text-muted text-sm">Select your role to continue</p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {[
            { value: "organizer", icon: "🏛️", label: "Organizer", desc: "List events, collect payments" },
            { value: "participant", icon: "🎟️", label: "Participant", desc: "Discover and register for events" },
            { value: "vendor", icon: "🏪", label: "Vendor", desc: "Offer services to organizers" },
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
              {role === r.value && (
                <span className="ml-auto text-accent">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3.5 bg-gradient-to-r from-accent to-accent2 text-white font-medium rounded-xl hover:-translate-y-0.5 transition-all duration-200 text-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}