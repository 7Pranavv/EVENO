const items = [
  "Techfest IIT Mumbai", "Culturals NIT Trichy", "Hackathon 2025",
  "Mood Indigo IIT Bombay", "Entrepreneurship Summit", "Dance Competition",
  "Science Olympiad", "Sports Fest", "Photography Contest", "Debate Championship",
];

export default function Marquee() {
  const doubled = [...items, ...items];

  return (
    <div className="border-t border-b border-white/[0.07] py-[18px] overflow-hidden bg-surface">
      <div className="animate-marquee flex gap-12 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-syne text-[0.8rem] font-semibold tracking-[0.12em] uppercase text-muted flex items-center gap-4 after:content-['◆'] after:text-[0.5rem] after:text-accent"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
