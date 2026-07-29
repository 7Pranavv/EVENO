const numbers = [
  { val: "310", suffix: "+", label: "Colleges &\nInstitutions" },
  { val: "2,400", suffix: "+", label: "Events Successfully\nHosted" },
  { val: "₹8.2", suffix: "Cr", label: "Total Funds\nDisbursed" },
  { val: "0", suffix: " days", label: "Payout Delay\nAfter Event Closes" },
];

export default function Numbers() {
  return (
    <section className="py-20 px-[60px] max-w-[1280px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-white/[0.07] rounded-[20px] overflow-hidden border border-white/[0.07]">
        {numbers.map((n) => (
          <div
            key={n.val}
            className="bg-surface hover:bg-surface2 transition-colors duration-300 py-11 px-9 text-center"
          >
            <div className="font-syne text-[2.8rem] font-extrabold tracking-[-0.05em] bg-gradient-to-br from-white to-muted bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mb-2">
              {n.val}
              <span className="text-accent [-webkit-text-fill-color:var(--accent)]">{n.suffix}</span>
            </div>
            <div className="text-[0.85rem] text-muted leading-[1.4] whitespace-pre-line">{n.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
