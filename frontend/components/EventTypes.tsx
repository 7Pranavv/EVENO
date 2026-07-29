const eventTypes = [
  { emoji: "🎓", name: "College Fests", desc: "Multi-day events with multiple sub-events, competitions, and workshops under one banner." },
  { emoji: "💻", name: "Hackathons", desc: "Team-based coding competitions with registration caps, team sizes, and prize announcements." },
  { emoji: "🎭", name: "Cultural Events", desc: "Dance, music, drama, art competitions — open to colleges and independent creators alike." },
  { emoji: "🎤", name: "Workshops & Talks", desc: "Single-session paid workshops, seminars, guest lectures, or masterclasses." },
  { emoji: "🏆", name: "Sports Meets", desc: "Inter-college tournaments and open sports competitions with team registrations." },
  { emoji: "🔬", name: "Science Olympiads", desc: "STEM competitions, robotics events, and science exhibitions with tiered entry fees." },
  { emoji: "🚀", name: "Startup Summits", desc: "Entrepreneurship competitions, pitch events, and business case challenges." },
  { emoji: "📸", name: "Creative Contests", desc: "Photography, design, writing, and other creative competitions with submission portals." },
];

export default function EventTypes() {
  return (
    <div className="bg-surface border-t border-b border-white/[0.07] py-[100px] px-[60px]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-[0.75rem] font-semibold tracking-[0.14em] uppercase text-accent mb-3.5">
          What You Can List
        </div>
        <h2 className="font-syne font-extrabold tracking-[-0.04em] leading-[1.1] text-[clamp(2rem,4vw,3.2rem)]">
          Every kind of event,<br />one place
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-[60px]">
          {eventTypes.map((type) => (
            <div
              key={type.name}
              className="bg-bg rounded-[18px] p-8 border border-white/[0.07] hover:border-[rgba(255,77,28,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default"
            >
              <span className="text-[2rem] mb-4 block">{type.emoji}</span>
              <div className="font-syne text-base font-bold mb-2 tracking-[-0.02em]">{type.name}</div>
              <p className="text-[0.82rem] text-muted leading-[1.6]">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
