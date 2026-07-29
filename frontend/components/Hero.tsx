"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="hero-grid min-h-screen flex flex-col items-center justify-center text-center px-10 pt-[140px] pb-20 relative overflow-hidden">
      {/* Orbs */}
      <div
        className="animate-drift1 absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(255,77,28,0.18) 0%, transparent 70%)",
          filter: "blur(100px)",
          top: -100, left: -100,
        }}
      />
      <div
        className="animate-drift2 absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)",
          filter: "blur(100px)",
          bottom: 50, right: -50,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(245,200,66,0.1) 0%, transparent 70%)",
          filter: "blur(100px)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Eyebrow */}
      <div className="animate-fade-up-1 inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(255,77,28,0.12)] border border-[rgba(255,77,28,0.3)] rounded-full text-[0.8rem] font-medium text-accent2 tracking-widest uppercase mb-7">
        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse2" />
        India&apos;s Event Management System
      </div>

      {/* Title */}
      <h1 className="animate-fade-up-2 font-syne font-extrabold leading-none tracking-[-0.04em] max-w-[900px] mb-6 text-[clamp(3rem,7vw,6.5rem)]">
        Manage Events.<br />
        <span className="gradient-text">Effortlessly.</span>
      </h1>

      {/* Subtitle */}
      <p className="animate-fade-up-3 text-muted max-w-[560px] leading-[1.7] font-light mb-11 text-[clamp(1rem,2vw,1.2rem)]">
        Emple Events is a complete event management system for colleges and creators — list events,
        collect registrations, manage payments, and get paid the same day.
      </p>

      {/* Actions */}
      <div className="animate-fade-up-4 flex gap-4 justify-center flex-wrap mb-[70px]">
        <button
          onClick={() => router.push("/signup")}
          className="px-9 py-4 text-base font-medium rounded-xl text-white border-none cursor-pointer bg-gradient-to-br from-accent to-accent2 shadow-[0_4px_20px_rgba(255,77,28,0.4)] hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(255,77,28,0.5)] transition-all duration-200"
        >
          List Your Event Free →
        </button>
        <button
          onClick={() => router.push("/login")}
          className="px-9 py-4 text-base font-medium rounded-xl bg-transparent text-[var(--text)] border border-white/20 hover:bg-white/[0.06] hover:border-white/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          Explore Events
        </button>
      </div>

      {/* Stats */}
      <div className="animate-fade-up-5 flex gap-12 justify-center flex-wrap">
        {[
          { num: "2,400+", label: "Events Listed" },
          null,
          { num: "₹8.2Cr", label: "Funds Transferred" },
          null,
          { num: "310+", label: "Colleges Onboard" },
          null,
          { num: "Same Day", label: "Payout" },
        ].map((stat, i) =>
          stat === null ? (
            <div key={i} className="w-px bg-white/[0.07] self-stretch" />
          ) : (
            <div key={i} className="text-center">
              <div className="font-syne text-[2rem] font-extrabold tracking-[-0.04em] bg-gradient-to-br from-white to-muted bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                {stat.num}
              </div>
              <div className="text-[0.8rem] text-muted tracking-[0.04em] mt-0.5">{stat.label}</div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
