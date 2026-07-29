"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { API_BASE, getId } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Event {
  _id: string;
  id?: number;
  title: string;
  date: string;
  location: string;
  totalSeats: number;
  availableSeats: number;
  price?: number; // ← NEW
}

interface Registration {
  _id: string;
  id?: number;
  participantName: string;
  eventTitle: string;
  amount: number;
  registeredAt: string;
}

// const organizerNavItems = [
//   { icon: "⚡", label: "Overview", id: "overview" },
//   { icon: "🎯", label: "My Events", id: "events" },
//   { icon: "👥", label: "Registrations", id: "registrations" },
//   { icon: "💰", label: "Payments", id: "payments" },
//   { icon: "🏪", label: "Vendors", id: "vendors" },
//   { icon: "📊", label: "Analytics", id: "analytics" },
//   { icon: "⚙️", label: "Settings", id: "settings" },
// ];

const organizerNavItems = [
  { icon: "⚡", label: "Overview",      id: "overview",      href: "/organizer/dashboard" },
  { icon: "🎯", label: "My Events",     id: "events",        href: "/organizer/dashboard" },
  { icon: "👥", label: "Registrations", id: "registrations", href: "/organizer/dashboard" },
  { icon: "💰", label: "Payments",      id: "payments",      href: "/organizer/dashboard" },
  { icon: "🏪", label: "Vendors",       id: "vendors",       href: "/organizer/vendors"   },
  { icon: "📊", label: "Analytics",     id: "analytics",     href: "/organizer/dashboard" },
  { icon: "⚙️", label: "Settings",      id: "settings",      href: "/organizer/dashboard" },
];

function StatusBadge({ availableSeats, totalSeats }: { availableSeats: number; totalSeats: number }) {
  const pct = (availableSeats / totalSeats) * 100;
  const status = availableSeats === 0 ? "closed" : pct > 30 ? "live" : "upcoming";
  const map = {
    live: "bg-green-500/10 text-green-400 border-green-500/20",
    upcoming: "bg-[rgba(0,212,255,0.1)] text-cyan border-[rgba(0,212,255,0.2)]",
    closed: "bg-white/[0.05] text-muted border-white/[0.1]",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${map[status]}`}>
      {status === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />}
      {status}
    </span>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[0.7rem] text-muted w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Create Event Modal ─────────────────────────────────────────────
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", date: "", location: "", totalSeats: "", price: "" // ← NEW
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.location || !form.totalSeats || !form.price) {
      alert("Saare fields bharo!");
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        title: form.title,
        date: form.date,
        location: form.location,
        totalSeats: parseInt(form.totalSeats),
        availableSeats: parseInt(form.totalSeats),
        price: parseInt(form.price), // ← NEW
      }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Event create nahi ho paya. Login karke try karo.");
      return;
    }
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-bold text-xl">Create New Event</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Event Title</label>
            <input className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. TechFest 2025" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Date</label>
            <input type="date" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Location</label>
            <input className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. New Delhi" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Total Seats</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. 500" value={form.totalSeats}
              onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
          </div>
          {/* ← NEW PRICE FIELD */}
          <div>
            <label className="text-xs text-muted mb-1 block">Ticket Price (₹)</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. 499" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Creating..." : "Create Event ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ───────────────────────────────────────────────────
function DeleteModal({ event, onClose, onDeleted }: { event: Event; onClose: () => void; onDeleted: () => void }) {
  const handleDelete = async () => {
    const res = await fetch(`${API_BASE}/api/events/${getId(event)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      alert("Event delete nahi ho paya. Login karke try karo.");
      return;
    }
    onDeleted();
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="font-syne font-bold text-xl mb-2">Delete Event?</h2>
        <p className="text-muted text-sm mb-6"><span className="text-white font-medium">{event.title}</span> permanently delete ho jayega!</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:opacity-90 transition-opacity">Delete 🗑️</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ─────────────────────────────────────────────────────
function EditModal({ event, onClose, onUpdated }: { event: Event; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState({
    title: event.title,
    date: event.date,
    location: event.location,
    totalSeats: event.totalSeats.toString(),
    availableSeats: event.availableSeats.toString(),
    price: event.price?.toString() || "", // ← NEW
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/events/${getId(event)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        title: form.title,
        date: form.date,
        location: form.location,
        totalSeats: parseInt(form.totalSeats),
        availableSeats: parseInt(form.availableSeats),
        price: parseInt(form.price) || 0, // ← NEW
      }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Event update nahi ho paya. Login karke try karo.");
      return;
    }
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-bold text-xl">Edit Event</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Event Title</label>
            <input className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Date</label>
            <input type="date" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Location</label>
            <input className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Total Seats</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Available Seats</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.availableSeats} onChange={(e) => setForm({ ...form, availableSeats: e.target.value })} />
          </div>
          {/* ← NEW PRICE FIELD */}
          <div>
            <label className="text-xs text-muted mb-1 block">Ticket Price (₹)</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. 499" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleUpdate} disabled={loading} className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Updating..." : "Update Event ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const fetchEvents = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/events`)
      .then((res) => res.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchRegistrations = () => {
    fetch(`${API_BASE}/api/registrations/recent`)
      .then((res) => res.json())
      .then((data) => setRegistrations(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const totalRegistered = events.reduce((s, e) => s + (e.totalSeats - e.availableSeats), 0);
  const liveEvents = events.filter((e) => e.availableSeats > 0).length;
  const totalRevenue = registrations.reduce((s, r) => s + r.amount, 0);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-white text-xl">
      Loading events...
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={fetchEvents} />}
      {deleteEvent && <DeleteModal event={deleteEvent} onClose={() => setDeleteEvent(null)} onDeleted={fetchEvents} />}
      {editEvent && <EditModal event={editEvent} onClose={() => setEditEvent(null)} onUpdated={fetchEvents} />}

      <Sidebar navItems={organizerNavItems} role="organizer" username="Dubey" />

      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">

        <Header username="Dubey" role="organizer" showNewEventButton={true} onNewEvent={() => setShowCreate(true)} />

        <div className="p-8 space-y-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, change: "From API ✅", icon: "💰", color: "from-gold/10 to-transparent", border: "border-gold/20" },
              { label: "Registrations", value: totalRegistered.toLocaleString(), change: "Real data ✅", icon: "👥", color: "from-cyan/10 to-transparent", border: "border-cyan/20" },
              { label: "Live Events", value: liveEvents, change: "Active now", icon: "🔴", color: "from-green-500/10 to-transparent", border: "border-green-500/20" },
              { label: "Total Events", value: events.length, change: "From API ✅", icon: "📈", color: "from-accent/10 to-transparent", border: "border-accent/20" },
            ].map((stat) => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-[0.7rem] text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
                </div>
                <div className="font-syne font-extrabold text-2xl tracking-tight mb-1">{stat.value}</div>
                <div className="text-muted text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Events Table + Recent Registrations */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h2 className="font-syne font-bold text-base">My Events</h2>
                <button onClick={() => setShowCreate(true)}
                  className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90 transition-opacity">
                  + New Event
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {["Event", "Date", "Location", "Registrations", "Seats Left", "Price", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[0.7rem] font-semibold text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev, i) => (
                      <tr key={getId(ev)} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === events.length - 1 ? "border-none" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm">{ev.title}</div>
                          <div className="text-muted text-xs mt-0.5">ID: {getId(ev)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">{ev.date}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/[0.08]">📍 {ev.location}</span>
                        </td>
                        <td className="px-6 py-4 w-36">
                          <div className="text-sm mb-1">{ev.totalSeats - ev.availableSeats}<span className="text-muted text-xs"> / {ev.totalSeats}</span></div>
                          <ProgressBar value={ev.totalSeats - ev.availableSeats} max={ev.totalSeats} />
                        </td>
                        <td className="px-6 py-4 font-syne font-bold text-sm">{ev.availableSeats}</td>
                        {/* ← NEW PRICE COLUMN */}
                        <td className="px-6 py-4 font-syne font-bold text-sm text-accent">
                          ₹{ev.price ?? 0}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge availableSeats={ev.availableSeats} totalSeats={ev.totalSeats} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setEditEvent(ev)}
                              className="text-xs bg-white/[0.06] hover:bg-accent/20 px-2.5 py-1 rounded-lg border border-white/[0.08] transition-colors">✏️ Edit</button>
                            <button onClick={() => setDeleteEvent(ev)}
                              className="text-xs bg-white/[0.06] hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-white/[0.08] transition-colors text-red-400">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Registrations */}
            <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h2 className="font-syne font-bold text-base">Recent Registrations</h2>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <div className="divide-y divide-white/[0.04]">
                {registrations.length === 0 ? (
                  <div className="px-6 py-8 text-center text-muted text-sm">
                    Koi registration nahi abhi tak 🎟️
                  </div>
                ) : (
                  registrations.map((reg, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent2/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent2">
                        {reg.participantName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{reg.participantName}</div>
                        <div className="text-muted text-xs truncate">{reg.eventTitle}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-syne font-bold text-green-400">+₹{reg.amount}</div>
                        <div className="text-muted text-[0.65rem]">
                          {new Date(reg.registeredAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}