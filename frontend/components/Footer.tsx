import Link from "next/link";

const links = [
  { label: "Browse Events", href: "/login" },
  { label: "For Organizers", href: "/signup" },
  { label: "Pricing", href: "#" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-[60px] py-12 flex items-center justify-between flex-wrap gap-5">
      <div className="font-syne font-extrabold text-xl flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse2" />
        Emple Events
      </div>

      <ul className="flex gap-7 list-none flex-wrap">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-muted text-[0.85rem] hover:text-[var(--text)] transition-colors duration-200">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="text-muted text-[0.8rem]">© 2025 Emple Events. All rights reserved.</div>
    </footer>
  );
}
