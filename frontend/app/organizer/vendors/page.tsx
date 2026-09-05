"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RequireRole from "@/components/RequireRole";
import { api, apiList } from "@/lib/api";

interface VendorService {
  _id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface OrganizerEvent {
  _id: string;
  title: string;
}

const organizerNavItems = [
  { icon: "⚡", label: "Overview",       id: "overview",      href: "/organizer/dashboard" },
  { icon: "🎯", label: "My Events",      id: "events",        href: "/organizer/dashboard" },
  { icon: "👥", label: "Registrations",  id: "registrations", href: "/organizer/dashboard" },
  { icon: "💰", label: "Payments",       id: "payments",      href: "/organizer/dashboard" },
  { icon: "🏪", label: "Vendors",        id: "vendors",       href: "/organizer/vendors"   },
  { icon: "📊", label: "Analytics",      id: "analytics",     href: "/organizer/dashboard" },
  { icon: "⚙️", label: "Settings",       id: "settings",      href: "/organizer/dashboard" },
];

const CATEGORIES = ["All", "Photography", "Catering", "DJ", "Decoration", "Security", "AV Equipment", "Other"];

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    Photography: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Catering: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    DJ: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Decoration: "bg-green-500/10 text-green-400 border-green-500/20",
    Security: "bg-red-500/10 text-red-400 border-red-500/20",
    "AV Equipment": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Other: "bg-white/[0.05] text-muted border-white/[0.1]",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${map[category] || map["Other"]}`}>
      {category}
    </span>
  );
}

// ─── Hire Request Modal ──────────────────────────────────────────────
function HireModal({ service, onClose, onSent }: { service: VendorService; onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({ eventId: "", participantName: "", amount: service.price.toString() });
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    // Only the organizer's own events can be hired against.
    apiList<OrganizerEvent>("/api/events?mine=true")
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, []);

  const handleSend = async () => {
    // Amount was never validated, so an empty box sent NaN and came back as
    // an opaque 500.
    const amount = form.amount === "" ? 0 : Number(form.amount);

    if (!form.eventId || !form.participantName) {
      setError("Pick an event and enter a contact name.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Amount must be a number, zero or more.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // isHireRequest is no longer sent — the server derives it from the
      // caller's role, because a client-set flag skipped the seat check.
      await api("/api/registrations", {
        method: "POST",
        body: JSON.stringify({
          eventId:         form.eventId,
          participantName: form.participantName,
          amount,
          vendorId:        service.vendorId,
        }),
      });
      onSent();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the hire request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-syne font-bold text-xl">Send Hire Request</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl">×</button>
        </div>
        <p className="text-muted text-sm mb-6">Service: <span className="text-white font-medium">{service.name}</span></p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Your Event</label>
            <select className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })}>
              <option value="">{loadingEvents ? "Loading events..." : "Select an event"}</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Your Name / Organization</label>
            <input className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. Rahul Sharma"
              value={form.participantName} onChange={(e) => setForm({ ...form, participantName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Agreed Amount (₹)</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSend} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Sending..." : "Send Request 📩"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function OrganizerVendorsPage() {
  return (
    <RequireRole allow={["organizer"]}>
      <OrganizerVendors />
    </RequireRole>
  );
}

function OrganizerVendors() {
  const [services, setServices] = useState<VendorService[]>([]);
  const [filtered, setFiltered] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [hireService, setHireService] = useState<VendorService | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const [loadError, setLoadError] = useState("");

  const fetchServices = () => {
    setLoading(true);
    apiList<VendorService>("/api/vendors/services/all")
      .then((data) => {
        const available = data.filter((s) => s.available);
        setServices(available);
        setFiltered(available);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Could not load the vendor marketplace."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    let result = services;
    if (selectedCategory !== "All") {
      result = result.filter(s => s.category === selectedCategory);
    }
    if (search.trim()) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [selectedCategory, search, services]);

  const handleHireSent = () => {
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

      {hireService && (
        <HireModal
          service={hireService}
          onClose={() => setHireService(null)}
          onSent={handleHireSent}
        />
      )}

      <Sidebar navItems={organizerNavItems} role="organizer" username="Dubey" />

      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">
        <Header username="Dubey" role="organizer" showNewEventButton={false} />

        <div className="p-8 space-y-6">

          {loadError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-between gap-4">
              <span>{loadError}</span>
              <button onClick={fetchServices} className="underline whitespace-nowrap">Retry</button>
            </div>
          )}


          {/* Success Toast */}
          {successMsg && (
            <div className="fixed top-6 right-6 z-50 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl font-medium text-sm shadow-lg">
              ✅ Hire request sent to the vendor.
            </div>
          )}

          {/* Page Header */}
          <div>
            <h1 className="font-syne font-extrabold text-2xl mb-1">Find Vendors 🏪</h1>
            <p className="text-muted text-sm">Find and hire the right vendors for your event</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 bg-surface border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="🔍 Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-white/[0.1] text-muted hover:text-white hover:border-white/[0.2]"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-4 text-sm text-muted">
            <span><span className="text-white font-semibold">{filtered.length}</span> services found</span>
            <span>•</span>
            <span><span className="text-white font-semibold">{services.length}</span> total available</span>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="text-muted text-center py-20 text-sm">Loading vendors...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-muted text-sm">No services found in this category</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((service) => (
                <div key={service._id}
                  className="bg-surface border border-white/[0.07] rounded-xl p-5 hover:border-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <CategoryBadge category={service.category} />
                    <span className="text-[0.7rem] font-semibold px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">
                      ● Available
                    </span>
                  </div>

                  <h3 className="font-syne font-bold text-base mb-1">{service.name}</h3>
                  <p className="text-muted text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
                    {service.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-syne font-extrabold text-lg text-accent">₹{service.price.toLocaleString()}</span>
                    <button
                      onClick={() => setHireService(service)}
                      className="text-xs bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/30 px-3 py-1.5 rounded-lg font-bold transition-all duration-200">
                      📩 Hire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}