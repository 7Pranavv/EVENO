"use client";

import { useState } from "react";
import Link from "next/link";
import { useDescope } from "@descope/nextjs-sdk/client";
import { useRouter } from "next/navigation";
import { saveUser, descopeError, Role } from "@/lib/auth";
import { api } from "@/lib/api";

const HOME_FOR: Record<string, string> = {
  organizer:   "/organizer/dashboard",
  vendor:      "/vendor/dashboard",
  participant: "/participant/dashboard",
  admin:       "/admin/dashboard",
};

export default function SignupPage() {
  const [role, setRole] = useState<"organizer" | "participant" | "vendor">("organizer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sdk = useDescope();
  const router = useRouter();

  const handleOAuth = async (provider: "google" | "microsoft" | "apple") => {
    setLoading(true);
    setError("");
    try {
      const resp = await sdk.oauth.start(
        provider,
        `${window.location.origin}/auth/callback`
      );
      if (resp.ok && resp.data?.url) {
        window.location.href = resp.data.url;
        return;
      }
      setError(descopeError(resp, "Authentication failed. Please try again."));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await sdk.password.signUp(email, password, { name });
      if (!resp.ok) {
        setError(descopeError(resp, "Signup failed. Please try again."));
        setLoading(false);
        return;
      }

      // The profile is what every dashboard reads its role from, so a failed
      // sync must surface here rather than dropping the user into a
      // dashboard the server won't authorise.
      const profile = await api<{ descopeId: string; name: string; email: string; role: Role; college?: string }>(
        "/api/users/sync",
        {
          method: "POST",
          body: JSON.stringify({
            name: name || email,
            email,
            role,
            college: role === "organizer" ? college : "",
          }),
        }
      );

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
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  const roleDescriptions = {
    organizer: "List events, collect payments, manage registrations",
    participant: "Discover events, register & get digital tickets",
    vendor: "Offer services, get hired by event organizers",
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16 relative overflow-hidden">

      <div className="absolute rounded-full pointer-events-none animate-drift1"
        style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(255,77,28,0.15) 0%, transparent 70%)", filter: "blur(100px)", top: -100, left: -100 }}
      />
      <div className="absolute rounded-full pointer-events-none animate-drift2"
        style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)", filter: "blur(100px)", bottom: -50, right: -50 }}
      />

      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)"
        }}
      />

      <div className="w-full max-w-md relative z-10">

        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse2" />
          <span className="font-syne font-extrabold text-2xl tracking-tight text-[var(--text)]">Eveno</span>
        </Link>

        <div className="bg-surface border border-white/[0.07] rounded-[24px] p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="mb-8">
            <h1 className="font-syne font-extrabold text-[2rem] tracking-[-0.04em] mb-2">Create account</h1>
            <p className="text-muted text-sm font-light">Join thousands of colleges and creators</p>
          </div>

          <div className="flex gap-2 mb-4 p-1 bg-bg rounded-xl border border-white/[0.07]">
            <button
              onClick={() => setRole("organizer")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                role === "organizer"
                  ? "bg-gradient-to-r from-accent to-accent2 text-white shadow-[0_4px_12px_rgba(255,77,28,0.3)]"
                  : "text-muted hover:text-[var(--text)]"
              }`}
            >
              🏛️ Organizer
            </button>
            <button
              onClick={() => setRole("participant")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                role === "participant"
                  ? "bg-gradient-to-r from-accent to-accent2 text-white shadow-[0_4px_12px_rgba(255,77,28,0.3)]"
                  : "text-muted hover:text-[var(--text)]"
              }`}
            >
              🎟️ Participant
            </button>
            <button
              onClick={() => setRole("vendor")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                role === "vendor"
                  ? "bg-gradient-to-r from-accent to-accent2 text-white shadow-[0_4px_12px_rgba(255,77,28,0.3)]"
                  : "text-muted hover:text-[var(--text)]"
              }`}
            >
              🏪 Vendor
            </button>
          </div>

          <p className="text-xs text-muted mb-6 text-center">
            {roleDescriptions[role]}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <button
              title="Continue with Google"
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex-1 flex items-center justify-center py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            <button
              title="Continue with Microsoft"
              onClick={() => handleOAuth("microsoft")}
              disabled={loading}
              className="flex-1 flex items-center justify-center py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                <path fill="#FFB900" d="M13 13h10v10H13z"/>
              </svg>
            </button>

            <button
              title="Continue with Apple"
              onClick={() => handleOAuth("apple")}
              disabled={loading}
              className="flex-1 flex items-center justify-center py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-muted text-xs tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-2 tracking-wide uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-bg border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:bg-surface2 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-2 tracking-wide uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-bg border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:bg-surface2 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-2 tracking-wide uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-bg border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:bg-surface2 transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)] transition-colors text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {role === "organizer" && (
              <div>
                <label className="block text-xs font-medium text-muted mb-2 tracking-wide uppercase">College / Organization</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. IIT Delhi, NIT Warangal"
                  className="w-full bg-bg border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:bg-surface2 transition-all duration-200"
                />
              </div>
            )}

            {role === "vendor" && (
              <div>
                <label className="block text-xs font-medium text-muted mb-2 tracking-wide uppercase">Service Type</label>
                <select className="w-full bg-bg border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-accent/50 transition-all duration-200">
                  <option value="">Select your service</option>
                  <option value="photography">📷 Photography</option>
                  <option value="catering">🍽️ Catering</option>
                  <option value="decoration">🎨 Decoration</option>
                  <option value="sound">🎵 Sound & Music</option>
                  <option value="security">🛡️ Security</option>
                  <option value="transport">🚌 Transport</option>
                  <option value="other">⚙️ Other</option>
                </select>
              </div>
            )}

            <button
              onClick={handleEmailSignup}
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-accent to-accent2 text-white font-medium rounded-xl hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,77,28,0.4)] transition-all duration-200 text-sm disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </div>

          <p className="text-center text-muted text-xs mt-5 leading-relaxed">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-accent hover:text-accent2 transition-colors">Terms</Link>
            {" & "}
            <Link href="/privacy" className="text-accent hover:text-accent2 transition-colors">Privacy Policy</Link>
          </p>

          <p className="text-center text-muted text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:text-accent2 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}