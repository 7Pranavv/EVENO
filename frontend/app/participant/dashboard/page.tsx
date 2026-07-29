"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { API_BASE, getId } from "@/lib/api";
import { getUser, getToken, saveAuth } from "@/lib/auth";

interface Event {
  _id: string;
  id?: number;
  title: string;
  date: string;
  location: string;
  totalSeats: number;
  availableSeats: number;
  vendorId?: string;
  price?: number;
}

interface Registration {
  _id: string;
  id?: number;
  participantName: string;
  eventTitle: string;
  amount: number;
  registeredAt: string;
  paymentStatus?: string;
  status?: string;
}

const participantNavItems = [
  { icon: "⚡", label: "Overview",          id: "overview"       },
  { icon: "🔍", label: "Explore Events",    id: "explore"        },
  { icon: "🎟️", label: "My Registrations", id: "registrations"  },
  { icon: "💰", label: "Payments",          id: "payments"       },
  { icon: "⚙️", label: "Settings",          id: "settings"       },
];

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function StatusBadge({ availableSeats, totalSeats }: { availableSeats: number; totalSeats: number }) {
  const pct = (availableSeats / totalSeats) * 100;
  const status = availableSeats === 0 ? "closed" : pct > 30 ? "live" : "upcoming";
  const map = {
    live:     "bg-green-500/10 text-green-400 border-green-500/20",
    upcoming: "bg-[rgba(0,212,255,0.1)] text-cyan-400 border-[rgba(0,212,255,0.2)]",
    closed:   "bg-white/[0.05] text-gray-400 border-white/[0.1]",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${map[status]}`}>
      {status === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />}
      {status}
    </span>
  );
}

function RegStatusBadge({ status }: { status: string }) {
  const isAccepted = status === "accepted" || status === "confirmed";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${
      isAccepted
        ? "bg-green-500/10 text-green-400 border-green-500/20"
        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    }`}>
      {isAccepted ? "confirmed" : status}
    </span>
  );
}

function PaymentBadge({ status }: { status?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${
      status === "paid"
        ? "bg-green-500/10 text-green-400 border-green-500/20"
        : status === "failed"
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    }`}>
      {status === "paid" ? "✅ Paid" : status === "failed" ? "❌ Failed" : "⏳ Unpaid"}
    </span>
  );
}

// ─── Edit Profile Modal ──────────────────────────────────────────────
function EditProfileModal({ onClose, onUpdated }: { onClose: () => void; onUpdated: () => void }) {
  const user = getUser();
  const [name, setName] = useState(user?.name || "");
  const [college, setCollege] = useState(user?.college || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ name, college }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Profile update nahi ho paya. Login karke try karo.");
      return;
    }
    if (user) {
      saveAuth(getToken() || "", { ...user, name, college });
    }
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-bold text-xl">Edit Profile</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Full Name</label>
            <input
              className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">College / Organization</label>
            <input
              className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. IIT Delhi"
              value={college} onChange={(e) => setCollege(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent to-accent2 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Register + Pay Modal ───────────────────────────────────────────
function RegisterModal({ event, onClose, onRegistered }: {
  event: Event;
  onClose: () => void;
  onRegistered: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const user                  = getUser();
  const token                 = getToken();
  const participantName       = user?.name || "Participant";
  const amount                = event.price ?? 499;

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // ── FREE EVENT: Razorpay skip, seedha register ──
      if (amount === 0) {
        const regRes = await fetch(`${API_BASE}/api/registrations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            participantName,
            eventId:    getId(event),
            eventTitle: event.title,
            amount:     0,
            vendorId:   event.vendorId || "",
            status:     "pending",
          }),
        });

        if (!regRes.ok) {
          const err = await regRes.json();
          setError(err.message || "Registration failed. Try again.");
          setLoading(false);
          return;
        }

        onRegistered();
        onClose();
        return;
      }

      // ── PAID EVENT: Pehle registration, phir Razorpay ──
      const regRes = await fetch(`${API_BASE}/api/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantName,
          eventId:    getId(event),
          eventTitle: event.title,
          amount,
          vendorId:   event.vendorId || "",
          status:     "pending",
        }),
      });

      if (!regRes.ok) {
        const err = await regRes.json();
        setError(err.message || "Registration failed.");
        setLoading(false);
        return;
      }

      const regData = await regRes.json();
      const registrationId = regData._id;

      // Razorpay Order create karo
      const orderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, registrationId }),
      });

      if (!orderRes.ok) {
        setError("Payment gateway error. Try again.");
        setLoading(false);
        return;
      }

      const orderData = await orderRes.json();

      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Razorpay load nahi hua. Internet check karo.");
        setLoading(false);
        return;
      }

      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        "Emple Events",
        description: event.title,
        order_id:    orderData.orderId,

        handler: async (response: any) => {
          const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              registrationId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            onRegistered();
            onClose();
          } else {
            setError("Payment verify nahi hua. Support se contact karo.");
          }
        },

        prefill: {
          name:  participantName,
          email: user?.email || "",
        },

        theme: { color: "#FF4D1C" },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      setError("Kuch galat hua. Dobara try karo.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="font-syne font-bold text-xl mb-2">Confirm & Pay</h2>
        <p className="text-muted text-sm mb-1">Event: <span className="text-white font-medium">{event.title}</span></p>
        <p className="text-muted text-sm mb-1">Date: <span className="text-white">{event.date}</span></p>
        <p className="text-muted text-sm mb-1">Location: <span className="text-white">{event.location}</span></p>
        <p className="text-muted text-sm mb-1">Seats Left: <span className="text-green-400 font-bold">{event.availableSeats}</span></p>
        <p className="text-muted text-sm mb-6">
          Amount:{" "}
          <span className="text-accent font-bold text-lg">
            {amount === 0 ? "FREE 🎉" : `₹${amount}`}
          </span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent to-accent2 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Processing..." : amount === 0 ? "Register Free 🎟️" : "Pay Now 💳"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function ParticipantDashboard() {
  const [events, setEvents]               = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading]             = useState(true);
  const [registerEvent, setRegisterEvent] = useState<Event | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const user  = getUser();
  const token = getToken();

  const fetchEvents = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchRegistrations = () => {
    fetch(`${API_BASE}/api/registrations/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const totalSpent      = registrations.reduce((s, r) => s + r.amount, 0);
  const availableEvents = events.filter((e) => e.availableSeats > 0).length;
  const paidCount       = registrations.filter((r) => r.paymentStatus === "paid").length;

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-white text-xl">
      Loading events...
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

      {registerEvent && (
        <RegisterModal
          event={registerEvent}
          onClose={() => setRegisterEvent(null)}
          onRegistered={() => { fetchEvents(); fetchRegistrations(); }}
        />
      )}

      {showEditProfile && (
        <EditProfileModal
          onClose={() => setShowEditProfile(false)}
          onUpdated={() => window.location.reload()}
        />
      )}

      <Sidebar navItems={participantNavItems} role="participant" username={user?.name || "Participant"} />

      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">

        <Header username={user?.name || "Participant"} role="participant" showNewEventButton={false} />

        <div className="p-8 space-y-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Events Registered", value: registrations.length, change: "From API ✅",  icon: "🎟️", color: "from-accent/10 to-transparent",    border: "border-accent/20"    },
              { label: "Available Events",  value: availableEvents,       change: "Live from DB", icon: "📅", color: "from-cyan-500/10 to-transparent",  border: "border-cyan-500/20"  },
              { label: "Amount Spent",      value: `₹${totalSpent}`,      change: "This semester",icon: "💸", color: "from-gold/10 to-transparent",       border: "border-gold/20"      },
              { label: "Payments Done",     value: paidCount,             change: "Razorpay ✅",  icon: "✅", color: "from-green-500/10 to-transparent", border: "border-green-500/20" },
            ].map((stat) => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-[0.7rem] text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div className="font-syne font-extrabold text-2xl tracking-tight mb-1">{stat.value}</div>
                <div className="text-muted text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Explore Events + My Registrations */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Explore Events Table */}
            <div className="xl:col-span-2 bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h2 className="font-syne font-bold text-base">Explore Events</h2>
                <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
                  ✅ Live from API
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {["Event", "Date", "Location", "Seats Left", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[0.7rem] font-semibold text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev, i) => (
                      <tr key={getId(ev)} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === events.length - 1 ? "border-none" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm">{ev.title}</div>
                          <div className="text-muted text-xs mt-0.5">
                            {ev.price === 0 ? "FREE 🎉" : `₹${ev.price ?? 499}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">{ev.date}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/[0.08]">
                            📍 {ev.location}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-syne font-bold text-sm text-green-400">
                          {ev.availableSeats}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge availableSeats={ev.availableSeats} totalSeats={ev.totalSeats} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            disabled={ev.availableSeats === 0}
                            onClick={() => setRegisterEvent(ev)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                              ev.availableSeats === 0
                                ? "bg-white/[0.05] text-muted cursor-not-allowed"
                                : "bg-gradient-to-r from-accent to-accent2 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,77,28,0.3)]"
                            }`}
                          >
                            {ev.availableSeats === 0 ? "Full" : ev.price === 0 ? "Register Free" : "Register & Pay"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* My Registrations */}
            <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h2 className="font-syne font-bold text-base">My Registrations</h2>
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
                        <div className="text-sm font-medium truncate">{reg.eventTitle}</div>
                        <div className="text-muted text-xs truncate">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-syne font-bold text-accent mb-1">
                          {reg.amount === 0 ? "FREE" : `₹${reg.amount}`}
                        </div>
                        <PaymentBadge status={reg.amount === 0 ? "paid" : reg.paymentStatus} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions + Payment History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-syne font-bold text-base mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🔍", label: "Explore Events",  desc: "Find new events",   color: "hover:border-accent/30"    },
                  { icon: "🎟️", label: "My Tickets",      desc: "View your tickets", color: "hover:border-cyan/30"      },
                  { icon: "💰", label: "Payment History", desc: "View transactions", color: "hover:border-gold/30"      },
                  { icon: "🏆", label: "Certificates",    desc: "Download yours",    color: "hover:border-green-500/30" },
                  { icon: "🔔", label: "Notifications",   desc: "Event updates",     color: "hover:border-accent/30"    },
                  { icon: "👤", label: "Edit Profile",    desc: "Update your info",  color: "hover:border-cyan/30"      },
                ].map((action) => (
                  <button key={action.label}
                    onClick={action.label === "Edit Profile" ? () => setShowEditProfile(true) : undefined}
                    className={`flex items-start gap-3 p-4 bg-bg rounded-xl border border-white/[0.07] ${action.color} hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 text-left`}>
                    <span className="text-xl flex-shrink-0">{action.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{action.label}</div>
                      <div className="text-muted text-xs mt-0.5">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-syne font-bold text-base mb-5">Payment History</h2>
              <div className="space-y-4">
                {registrations.length === 0 ? (
                  <div className="text-center text-muted text-sm py-4">Koi payment nahi abhi tak</div>
                ) : (
                  registrations.map((reg, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div>
                          <span className="text-sm text-[var(--text)]">{reg.eventTitle}</span>
                          <div className="mt-0.5">
                            <PaymentBadge status={reg.amount === 0 ? "paid" : reg.paymentStatus} />
                          </div>
                        </div>
                        <span className="font-syne font-bold text-sm">
                          {reg.amount === 0 ? "FREE" : `₹${reg.amount}`}
                        </span>
                      </div>
                      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            reg.amount === 0 || reg.paymentStatus === "paid"
                              ? "bg-gradient-to-r from-green-500 to-green-400"
                              : "bg-gradient-to-r from-accent to-accent2"
                          }`}
                          style={{ width: reg.amount === 0 ? "100%" : `${Math.min((reg.amount / 1500) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-xl flex items-center gap-3">
                <span className="text-2xl">💸</span>
                <div>
                  <div className="text-sm font-semibold text-accent">₹{totalSpent} total spent</div>
                  <div className="text-muted text-xs mt-0.5">{paidCount} payments completed</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}