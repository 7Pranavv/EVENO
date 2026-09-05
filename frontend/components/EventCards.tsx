"use client";

import { useRouter } from "next/navigation";

interface EventCard {
  thumbClass: string;
  emoji: string;
  badgeClass: string;
  badge: string;
  seats: string;
  org: string;
  name: string;
  date: string;
  location: string;
  price: string;
  unit: string;
}

const events: EventCard[] = [
  {
    thumbClass: "bg-gradient-to-br from-[#1a0a2e] to-[#2d1050]",
    emoji: "🎭",
    badgeClass: "bg-[rgba(255,77,28,0.2)] text-accent2 border border-[rgba(255,77,28,0.3)]",
    badge: "Fest",
    seats: "🔥 214 registered",
    org: "IIT Delhi",
    name: "Rendezvous 2025 — Annual Cultural Fest",
    date: "Oct 12–15",
    location: "New Delhi",
    price: "₹499",
    unit: "/person",
  },
  {
    thumbClass: "bg-gradient-to-br from-[#0a1a2e] to-[#0d2845]",
    emoji: "💻",
    badgeClass: "bg-[rgba(0,212,255,0.15)] text-cyan border border-[rgba(0,212,255,0.25)]",
    badge: "Hackathon",
    seats: "⚡ 89 teams",
    org: "NIT Warangal",
    name: "BuildSpace 48 — National Hackathon",
    date: "Nov 3–4",
    location: "Warangal",
    price: "₹200",
    unit: "/team",
  },
  {
    thumbClass: "bg-gradient-to-br from-[#1a1a0a] to-[#2d2810]",
    emoji: "🎵",
    badgeClass: "bg-[rgba(245,200,66,0.15)] text-gold border border-[rgba(245,200,66,0.25)]",
    badge: "Cultural",
    seats: "🎟️ 62 left",
    org: "BITS Pilani",
    name: "OASIS 2025 — Music & Arts Festival",
    date: "Oct 22–25",
    location: "Pilani",
    price: "₹799",
    unit: "/person",
  },
];

export default function EventCards() {
  const router = useRouter();

  return (
    <div className="bg-surface border-t border-white/[0.07] py-[100px] px-[60px]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-[0.75rem] font-semibold tracking-[0.14em] uppercase text-accent mb-3.5">
          Live on Emple Events
        </div>
        <h2 className="font-syne font-extrabold tracking-[-0.04em] leading-[1.1] text-[clamp(2rem,4vw,3.2rem)]">
          Events happening now
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-[60px]">
          {events.map((ev) => (
            <div
              key={ev.name}
              className="bg-bg rounded-[20px] overflow-hidden border border-white/[0.07] hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className={`h-[180px] relative flex items-center justify-center text-5xl overflow-hidden ${ev.thumbClass}`}>
                {ev.emoji}
                <span className={`absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold tracking-[0.06em] uppercase ${ev.badgeClass}`}>
                  {ev.badge}
                </span>
                <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[0.7rem] bg-black/50 text-muted backdrop-blur-sm">
                  {ev.seats}
                </span>
              </div>
              <div className="p-[22px]">
                <div className="text-[0.75rem] text-muted mb-1.5 uppercase tracking-[0.06em]">{ev.org}</div>
                <div className="font-syne text-[1.05rem] font-bold tracking-[-0.02em] mb-2.5">{ev.name}</div>
                <div className="flex gap-4 text-[0.8rem] text-muted mb-[18px]">
                  <span>📅 {ev.date}</span>
                  <span>📍 {ev.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-syne text-[1.1rem] font-bold">
                    {ev.price}{" "}
                    <span className="text-[0.75rem] text-muted font-dm font-light">{ev.unit}</span>
                  </div>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-[18px] py-2 bg-accent text-white rounded-lg text-[0.8rem] font-medium hover:bg-[#ff6035] hover:-translate-y-px transition-all duration-200"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
