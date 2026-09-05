import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-[var(--text)] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-accent text-sm hover:text-accent2 transition-colors">← Back to home</Link>

        <h1 className="font-syne font-extrabold text-3xl mt-6 mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-sm text-muted leading-relaxed">
          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">What we collect</h2>
            <p>
              When you create an account we store your name, email, and role (organizer, participant,
              or vendor). When you register for an event or pay for a service, we store the amount,
              event, and payment status needed to process and reconcile that transaction.
            </p>
          </section>

          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">How we use it</h2>
            <p>
              Your data is used to run the platform: showing you your own events, registrations, and
              earnings, matching organizers with vendors, and processing payments through Razorpay. We
              don't sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">Payments</h2>
            <p>
              Payment processing is handled by Razorpay. We store the order and payment IDs needed to
              verify a transaction, but we never see or store your card, UPI, or bank details directly —
              those stay with Razorpay.
            </p>
          </section>

          <section>
            <h2 className="font-syne font-bold text-lg text-[var(--text)] mb-2">Your data, your control</h2>
            <p>
              You can update your profile information at any time from your dashboard. If you'd like
              your account and data removed entirely, contact us and we'll process the request.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
