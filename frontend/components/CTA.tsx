"use client";

import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <div className="px-[60px] pb-[120px] max-w-[1280px] mx-auto">
      <div className="bg-gradient-to-br from-[#0f1728] to-[#0a0d18] border border-[rgba(255,77,28,0.2)] rounded-[32px] py-20 px-20 text-center relative overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            top: -100, left: "50%", transform: "translateX(-50%)",
            width: 500, height: 300,
            background: "radial-gradient(ellipse, rgba(255,77,28,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="text-[0.75rem] font-semibold tracking-[0.14em] uppercase text-accent mb-3.5">
          Get Started Today
        </div>
        <h2 className="font-syne font-extrabold tracking-[-0.04em] leading-[1.1] max-w-[640px] mx-auto mb-4 text-[clamp(2rem,4vw,3.2rem)]">
          Ready to take your<br />event worldwide?
        </h2>
        <p className="text-muted text-[1.05rem] font-light max-w-[560px] mx-auto leading-[1.7] mb-12">
          Join hundreds of colleges and creators already using Emple Events. It&apos;s free to list — we
          only earn when you do.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push("/signup")}
            className="px-9 py-4 text-base font-medium rounded-xl text-white border-none bg-gradient-to-br from-accent to-accent2 shadow-[0_4px_20px_rgba(255,77,28,0.4)] hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(255,77,28,0.5)] transition-all duration-200"
          >
            List Your Event — It&apos;s Free →
          </button>
          <button className="px-9 py-4 text-base font-medium rounded-xl bg-transparent text-[var(--text)] border border-white/20 hover:bg-white/[0.06] hover:border-white/40 hover:-translate-y-0.5 transition-all duration-200">
            Talk to Our Team
          </button>
        </div>
      </div>
    </div>
  );
}
