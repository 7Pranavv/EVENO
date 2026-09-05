"use client";

import { useRouter } from "next/navigation";

const organizerPerks = [
  "Create single events or multi-event fests",
  "Custom registration forms & ticketing",
  "Real-time dashboard with live registrations",
  "Same-day bank transfer after event closes",
  "QR code check-in for attendees",
];

const attendeePerks = [
  "Browse events by category, city, or college",
  "Secure payments with instant confirmation",
  "Digital ticket & QR code on your phone",
  "Automatic refunds if event is cancelled",
  "Save & share events with friends",
];

export default function ForWho() {
  const router = useRouter();

  return (
    <div className="px-[60px] pb-[100px] max-w-[1280px] mx-auto">
      <div className="text-[0.75rem] font-semibold tracking-[0.14em] uppercase text-accent mb-3.5">
        Built For
      </div>
      <h2 className="font-syne font-extrabold tracking-[-0.04em] leading-[1.1] mb-4 text-[clamp(2rem,4vw,3.2rem)]">
        Two sides,<br />one platform
      </h2>
      <p className="text-muted text-[1.05rem] font-light max-w-[560px] leading-[1.7] mb-[60px]">
        Whether you&apos;re organizing or attending, Emple Events makes it seamless.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizer Card */}
        <div className="rounded-[24px] p-14 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#0f1828] to-[#0d1825] border border-[rgba(0,212,255,0.15)]">
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: -80, right: -80, width: 260, height: 260,
              background: "rgba(0,212,255,0.08)",
              filter: "blur(80px)",
            }}
          />
          <span className="inline-block px-3.5 py-1 rounded-full text-[0.75rem] font-semibold tracking-[0.08em] uppercase mb-6 bg-[rgba(0,212,255,0.1)] text-cyan border border-[rgba(0,212,255,0.2)]">
            For Organizers
          </span>
          <h3 className="font-syne text-[1.8rem] font-extrabold tracking-[-0.04em] mb-3">
            Colleges &<br />Individuals
          </h3>
          <p className="text-muted text-[0.95rem] leading-[1.7] font-light mb-8">
            List a single workshop or a full 5-day college fest with multiple sub-events. You get a
            dedicated event page, real-time registrations, and guaranteed same-day settlement.
          </p>
          <ul className="flex flex-col gap-2.5 mb-9">
            {organizerPerks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-[0.9rem] text-[var(--text)]">
                <span className="w-[18px] h-[18px] rounded-full flex-shrink-0 bg-[rgba(0,212,255,0.15)] text-cyan text-[0.65rem] flex items-center justify-center">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push("/signup")}
            className="px-7 py-3.5 rounded-[10px] bg-transparent text-[var(--text)] border border-white/20 hover:bg-white/[0.06] hover:border-white/40 hover:-translate-y-0.5 transition-all duration-200 text-base font-medium"
          >
            Start Listing Events →
          </button>
        </div>

        {/* Attendee Card */}
        <div className="rounded-[24px] p-14 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#180f0a] to-[#1a100a] border border-[rgba(255,77,28,0.15)]">
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: -80, right: -80, width: 260, height: 260,
              background: "rgba(255,77,28,0.1)",
              filter: "blur(80px)",
            }}
          />
          <span className="inline-block px-3.5 py-1 rounded-full text-[0.75rem] font-semibold tracking-[0.08em] uppercase mb-6 bg-[rgba(255,77,28,0.1)] text-accent2 border border-[rgba(255,77,28,0.2)]">
            For Attendees
          </span>
          <h3 className="font-syne text-[1.8rem] font-extrabold tracking-[-0.04em] mb-3">
            Students &<br />Explorers
          </h3>
          <p className="text-muted text-[0.95rem] leading-[1.7] font-light mb-8">
            Discover fests and events from colleges and creators all over the world. Register in
            seconds, pay securely, and carry your ticket digitally.
          </p>
          <ul className="flex flex-col gap-2.5 mb-9">
            {attendeePerks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-[0.9rem] text-[var(--text)]">
                <span className="w-[18px] h-[18px] rounded-full flex-shrink-0 bg-[rgba(255,77,28,0.15)] text-accent text-[0.65rem] flex items-center justify-center">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push("/login")}
            className="px-7 py-3.5 rounded-[10px] text-white border-none bg-gradient-to-br from-accent to-accent2 shadow-[0_4px_20px_rgba(255,77,28,0.4)] hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(255,77,28,0.5)] transition-all duration-200 text-base font-medium"
          >
            Explore Events →
          </button>
        </div>
      </div>
    </div>
  );
}
