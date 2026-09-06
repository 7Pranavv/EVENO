"use client";

import { useEffect } from "react";
import { refresh, isSessionTokenExpired, useSession } from "@descope/nextjs-sdk/client";
import { getToken } from "@/lib/auth";

// Descope only schedules its own token-refresh timer in reaction to its own
// SDK traffic (login, etc). Since this app talks to our own backend after
// login — not the Descope SDK — that timer never fires again, and the
// session token silently expires while the user is still "logged in",
// causing every authenticated API call to start failing with 401. This
// component proactively refreshes the session on a timer so the token
// getToken() reads is always valid during normal use.
export default function SessionKeepAlive() {
  // Gate on the provider being ready. Descope's module-level SDK starts life
  // as a throwaway instance built with persistTokens:false, and that instance
  // has no getSessionToken method — calling it before <AuthProvider> swaps in
  // the real SDK throws "getSessionToken is not a function" and takes the
  // whole page down. This component sits in the root layout and so races the
  // provider on every single route.
  const { isSessionLoading } = useSession();

  useEffect(() => {
    if (isSessionLoading) return;

    const maybeRefresh = () => {
      const token = getToken();
      if (token && isSessionTokenExpired(token)) {
        refresh().catch(() => {});
      }
    };

    maybeRefresh();
    const interval = setInterval(maybeRefresh, 60 * 1000);
    return () => clearInterval(interval);
  }, [isSessionLoading]);

  return null;
}
