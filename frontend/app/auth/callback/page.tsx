"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDescope, useSession } from "@descope/nextjs-sdk/client";

export default function AuthCallback() {
  const router = useRouter();
  const sdk = useDescope();
  const { isAuthenticated, isSessionLoading } = useSession();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        try {
          await sdk.oauth.exchange(code);
        } catch (err) {
          console.error("OAuth exchange failed", err);
          router.push("/login");
        }
      }
    };
    handleCallback();
  }, []);

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      router.push("/select-role");
    }
  }, [isAuthenticated, isSessionLoading]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}