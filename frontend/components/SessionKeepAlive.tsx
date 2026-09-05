"use client";

import { useEffect } from "react";
import { refresh, isSessionTokenExpired, getSessionToken } from "@descope/nextjs-sdk/client";

// Descope only schedules its own token-refresh timer in reaction to its own
// SDK traffic (login, etc). Since this app talks to our own backend after
// login — not the Descope SDK — that timer never fires again, and the
// session token silently expires while the user is still "logged in",
// causing every authenticated API call to start failing with 401. This
// component proactively refreshes the session on a timer so the token
// getToken() reads is always valid during normal use.
export default function SessionKeepAlive() {
  useEffect(() => {
    const maybeRefresh = () => {
      const token = getSessionToken();
      if (token && isSessionTokenExpired(token)) {
        refresh().catch(() => {});
      }
    };

    maybeRefresh();
    const interval = setInterval(maybeRefresh, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
