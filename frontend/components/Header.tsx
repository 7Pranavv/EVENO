"use client";

interface HeaderProps {
  username: string;
  role: string;
  showNewEventButton?: boolean;
  onNewEvent?: () => void;
}

export default function Header({ username, role, showNewEventButton = false, onNewEvent }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-white/[0.07] px-8 py-4 flex items-center justify-between">
      
      <div>
        <h1 className="font-syne font-extrabold text-xl tracking-tight">Dashboard</h1>
        <p className="text-muted text-xs mt-0.5">Welcome back, {username} 👋</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <input
            placeholder="Search events..."
            className="bg-surface border border-white/[0.07] rounded-xl px-4 py-2 text-sm text-[var(--text)] placeholder:text-muted/50 focus:outline-none focus:border-accent/40 w-52 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">⌘K</span>
        </div>

        {/* Bell */}
        <button className="relative p-2.5 rounded-xl bg-surface border border-white/[0.07] hover:border-white/20 transition-all text-muted hover:text-[var(--text)]">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border-2 border-bg" />
        </button>

        {/* New Event Button - sirf organizer ko dikhega */}
        {showNewEventButton && (
          <button
            onClick={onNewEvent}
            className="px-4 py-2 bg-gradient-to-r from-accent to-accent2 text-white text-sm font-medium rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,77,28,0.35)] transition-all duration-200"
          >
            + New Event
          </button>
        )}
      </div>

    </header>
  );
}