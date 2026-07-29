// import type { Metadata } from "next";
// import { Syne, DM_Sans } from "next/font/google";
// import "./globals.css";

// const syne = Syne({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800"],
//   variable: "--font-syne",
// });

// const dmSans = DM_Sans({
//   subsets: ["latin"],
//   weight: ["300", "400", "500"],
//   style: ["normal", "italic"],
//   variable: "--font-dm-sans",
// });

// export const metadata: Metadata = {
//   title: "Emple Events — Event Management System",
//   description:
//     "Emple Events is a complete event management system for colleges and creators — list events, collect registrations, manage payments, and receive funds the day your event closes.",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={`${syne.variable} ${dmSans.variable} font-dm`}>
//         {children}
//       </body>
//     </html>
//   );
// }



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

export const metadata: Metadata = {
  title: "Emple Events — Event Management System",
  description: "Emple Events is a complete event management system for colleges and creators — list events, collect registrations, manage payments, and receive funds the day your event closes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} font-dm`}>
        <AuthProvider projectId={process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID!}>
          <SessionKeepAlive />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}