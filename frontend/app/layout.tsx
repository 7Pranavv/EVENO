import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@descope/nextjs-sdk";
import SessionKeepAlive from "@/components/SessionKeepAlive";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
});

// NEXT_PUBLIC_* values are inlined at BUILD time. If this one is missing when
// `next build` runs, AuthProvider silently receives undefined, the Descope SDK
// never initialises, and every auth call fails at runtime with a message that
// points nowhere useful ("You can only use this function after sdk
// initialization"). The old code wrote `process.env.NEXT_PUBLIC_...!`, whose
// `!` reassures TypeScript and does exactly nothing at runtime.
//
// Failing here instead turns a mystery into a one-line fix. Setting the
// variable afterwards requires a REBUILD, not a restart.
function requireDescopeProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_DESCOPE_PROJECT_ID is not set.\n" +
        "It is read at build time, so set it before building:\n" +
        "  - local:  add it to frontend/.env.local\n" +
        "  - Vercel: Project Settings > Environment Variables, then redeploy\n" +
        "  - Docker: pass --build-arg NEXT_PUBLIC_DESCOPE_PROJECT_ID=..."
    );
  }
  return projectId;
}

const descopeProjectId = requireDescopeProjectId();

export const metadata: Metadata = {
  title: "Emple Events — Event Management System",
  description: "Emple Events is a complete event management system for colleges and creators — list events, collect registrations, manage payments, and receive funds the day your event closes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} font-dm`}>
        <AuthProvider projectId={descopeProjectId}>
          <SessionKeepAlive />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}