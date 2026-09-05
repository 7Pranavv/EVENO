const flowSteps = [
  {
    dotClass: "bg-[rgba(255,77,28,0.15)] text-accent border border-[rgba(255,77,28,0.3)]",
    num: "1",
    title: "Attendee Registers & Pays",
    desc: "Secure payment via UPI, Cards, Net Banking. Instant confirmation sent.",
  },
  {
    dotClass: "bg-[rgba(0,212,255,0.1)] text-cyan border border-[rgba(0,212,255,0.2)]",
    num: "2",
    title: "Funds Held in Escrow",
    desc: "All collected fees are safely held in Emple Events's secure escrow account.",
  },
  {
    dotClass: "bg-[rgba(245,200,66,0.1)] text-gold border border-[rgba(245,200,66,0.2)]",
    num: "3",
    title: "Event Closes",
    desc: "Registration deadline passes. Total collected amount is calculated.",
  },
  {
    dotClass: "bg-[rgba(100,200,100,0.1)] text-[#7ddf7d] border border-[rgba(100,200,100,0.2)]",
    num: "4",
    title: "Same-Day Bank Transfer",
    desc: "Full amount transferred to organizer's bank account — same day, no waiting.",
  },
];

const features = [
  { icon: "🔒", text: "Bank-grade encrypted payment processing" },
  { icon: "📊", text: "Real-time revenue dashboard for organizers" },
  { icon: "↩️", text: "Auto-refunds if event is cancelled by organizer" },
  { icon: "🏦", text: "Supports all major Indian banks & payment methods" },
  { icon: "📄", text: "GST-compliant invoices generated automatically" },
];

export default function PaymentFlow() {
  return (
    <section className="py-[100px] px-[60px] max-w-[1280px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
        {/* Visual */}
        <div className="bg-surface rounded-[24px] p-10 border border-white/[0.07] relative overflow-hidden">
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              bottom: -60, right: -60, width: 200, height: 200,
              background: "radial-gradient(circle, rgba(245,200,66,0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div className="font-syne text-[0.9rem] font-bold tracking-[0.06em] uppercase text-muted mb-6">
            Payment Journey
          </div>

          {flowSteps.map((step, i) => (
            <div key={i} className={`flex items-start gap-4 py-4 ${i < flowSteps.length - 1 ? "border-b border-white/[0.07]" : ""}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[0.85rem] font-bold font-syne ${step.dotClass}`}>
                {step.num}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[0.9rem] mb-0.5">{step.title}</div>
                <div className="text-muted text-[0.82rem] leading-[1.5]">{step.desc}</div>
              </div>
            </div>
          ))}

          <div className="mt-5 bg-gradient-to-br from-[rgba(245,200,66,0.08)] to-[rgba(245,200,66,0.03)] border border-[rgba(245,200,66,0.2)] rounded-[14px] p-5 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div className="text-[0.85rem] text-gold leading-[1.5]">
              <strong className="block font-semibold mb-0.5">Zero-delay guarantee</strong>
              Funds transfer initiated within hours of event closing.
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="text-[0.75rem] font-semibold tracking-[0.14em] uppercase text-accent mb-3.5">
            Transparent Payments
          </div>
          <h2 className="font-syne font-extrabold tracking-[-0.04em] leading-[1.1] mb-4 text-[clamp(2rem,4vw,3.2rem)]">
            Money where<br />it belongs. Fast.
          </h2>
          <p className="text-muted text-[1.05rem] font-light max-w-[560px] leading-[1.7] mb-10">
            We hold funds safely until your event closes, then transfer everything to you the same
            day. No week-long waits. No complicated withdrawals.
          </p>
          <ul className="flex flex-col gap-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-[0.95rem] text-[var(--text)]">
                <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-base flex-shrink-0 bg-surface2 border border-white/[0.07]">
                  {f.icon}
                </div>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
