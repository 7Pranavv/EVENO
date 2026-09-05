const steps = [
  {
    num: "01",
    icon: "🏛️",
    iconClass: "bg-[rgba(255,77,28,0.15)] border border-[rgba(255,77,28,0.25)]",
    title: "Register & List",
    desc: "Create your organizer profile. Add your event or fest with all details — schedule, sub-events, speakers, venue, and registration fee.",
  },
  {
    num: "02",
    icon: "🌍",
    iconClass: "bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]",
    title: "Global Registrations",
    desc: "Your event is published worldwide. Anyone can discover, register, and pay — securely. Fees are held safely in our escrow account.",
  },
  {
    num: "03",
    icon: "⚡",
    iconClass: "bg-[rgba(245,200,66,0.1)] border border-[rgba(245,200,66,0.2)]",
    title: "Same-Day Payout",
    desc: "The moment your event closes, all collected registration fees are transferred directly into your bank account — same day, no delays.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-[100px] px-[60px] max-w-[1280px] mx-auto">
      <div className="text-[0.75rem] font-semibold tracking-[0.14em] uppercase text-accent mb-3.5">
        Simple Process
      </div>
      <h2 className="font-syne font-extrabold tracking-[-0.04em] leading-[1.1] mb-4 text-[clamp(2rem,4vw,3.2rem)]">
        From listing to<br />payout in hours
      </h2>
      <p className="text-muted text-[1.05rem] font-light max-w-[560px] leading-[1.7] mb-[60px]">
        Whether you&apos;re a college running a three-day fest or an individual hosting a single
        workshop — it takes minutes to go live.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px] bg-white/[0.07] rounded-[20px] overflow-hidden border border-white/[0.07]">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-surface hover:bg-surface2 transition-colors duration-300 p-12 relative"
          >
            <div className="font-syne text-[4rem] font-extrabold text-white/[0.05] leading-none mb-4 tracking-[-0.06em]">
              {step.num}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 ${step.iconClass}`}>
              {step.icon}
            </div>
            <div className="font-syne text-[1.15rem] font-bold mb-2.5 tracking-[-0.02em]">
              {step.title}
            </div>
            <p className="text-muted text-[0.9rem] leading-[1.65] font-light">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
