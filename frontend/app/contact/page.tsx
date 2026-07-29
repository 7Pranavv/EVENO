import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg text-[var(--text)] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-accent text-sm hover:text-accent2 transition-colors">← Back to home</Link>

        <h1 className="font-syne font-extrabold text-3xl mt-6 mb-4">Get in touch</h1>
        <p className="text-muted text-sm leading-relaxed mb-10 max-w-xl">
          Whether you're a college organizing a fest, a creator hosting a workshop, or a vendor looking
          to get listed — we'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <a
            href="mailto:hello@empleevents.com"
            className="bg-surface border border-white/[0.07] rounded-2xl p-6 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-2xl mb-3">✉️</div>
            <div className="font-syne font-bold text-base mb-1">Email us</div>
            <div className="text-muted text-sm">hello@empleevents.com</div>
          </a>

          <a
            href="mailto:support@empleevents.com"
            className="bg-surface border border-white/[0.07] rounded-2xl p-6 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-2xl mb-3">🛟</div>
            <div className="font-syne font-bold text-base mb-1">Support</div>
            <div className="text-muted text-sm">support@empleevents.com</div>
          </a>
        </div>
      </div>
    </div>
  );
}
