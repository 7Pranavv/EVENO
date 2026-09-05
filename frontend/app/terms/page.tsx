import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-[var(--text)] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-accent text-sm hover:text-accent2 transition-colors">← Back to home</Link>

        <h1 className="font-syne font-extrabold text-3xl mt-6 mb-8">Terms of Service</h1>

        <div className="space-y-8 text-sm text-muted leading-relaxed">
          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">1. Using Emple Events</h2>
            <p>
              Emple Events lets organizers list events and fests, collect registrations, and receive
              payments. Participants can discover and register for events. Vendors can list services
              and get hired by organizers. By using the platform you agree to use it honestly and not
              misrepresent yourself, your event, or your services.
            </p>
          </section>

          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">2. Payments</h2>
            <p>
              Registration fees are collected through Razorpay and held until an event closes, at which
              point funds are made available to the organizer for disbursement. Emple Events is not a
              bank and does not guarantee any particular settlement timeline beyond what is displayed
              in the app.
            </p>
          </section>

          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">3. Accounts</h2>
            <p>
              You are responsible for keeping your account credentials secure. Organizers, vendors, and
              participants each get access scoped to their own data — you should not attempt to access
              another user's account or data.
            </p>
          </section>

          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">4. Cancellations & Refunds</h2>
            <p>
              If an organizer cancels an event, registered participants are entitled to a refund of
              their registration fee. Emple Events is not responsible for losses beyond the registration
              fee itself.
            </p>
          </section>

          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">5. Changes</h2>
            <p>
              These terms may be updated from time to time. Continued use of the platform after a change
              means you accept the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
