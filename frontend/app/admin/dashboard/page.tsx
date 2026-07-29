"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

const adminNavItems = [
  { icon: "⚡", label: "Overview", id: "overview" },
  { icon: "👥", label: "All Users", id: "users" },
  { icon: "🎯", label: "All Events", id: "events" },
  { icon: "💰", label: "Payments", id: "payments" },
  { icon: "⚙️", label: "Settings", id: "settings" },
];

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "organizer" | "participant" | "vendor";
  status: "active" | "banned";
  joinedAt: string;
}

interface EscrowRow {
  eventId: string;
  event: string;
  organizer: string;
  amount: number;
  status: "held" | "disbursed";
  date: string;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    organizer: "bg-accent/10 text-accent border-accent/20",
    participant: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    vendor: "bg-gold/10 text-yellow-400 border-gold/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${map[role] || map.participant}`}>
      {role}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: "held" | "disbursed" }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${
      status === "held"
        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        : "bg-green-500/10 text-green-400 border-green-500/20"
    }`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [escrow, setEscrow] = useState<EscrowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/users`, { headers: { Authorization: `Bearer ${getToken()}` } }).then((r) => r.json()),
      fetch(`${API_BASE}/api/admin/escrow`, { headers: { Authorization: `Bearer ${getToken()}` } }).then((r) => r.json()),
    ])
      .then(([u, e]) => {
        setUsers(Array.isArray(u) ? u : []);
        setEscrow(Array.isArray(e) ? e : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const totalEscrow = escrow.filter((p) => p.status === "held").reduce((s, p) => s + p.amount, 0);
  const totalDisbursed = escrow.filter((p) => p.status === "disbursed").reduce((s, p) => s + p.amount, 0);
  const heldCount = escrow.filter((p) => p.status === "held").length;

  const handleToggleBan = async (user: AdminUser) => {
    const nextStatus = user.status === "banned" ? "active" : "banned";
    const res = await fetch(`${API_BASE}/api/users/${user._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) {
      alert("User status update nahi ho paya. Login karke try karo.");
      return;
    }
    fetchAll();
  };

  const handleDisburse = async (eventId: string) => {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/disburse`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      alert("Disburse nahi ho paya. Login karke try karo.");
      return;
    }
    fetchAll();
  };

  const handleDisburseAll = async () => {
    const held = escrow.filter((p) => p.status === "held");
    await Promise.all(
      held.map((p) =>
        fetch(`${API_BASE}/api/events/${p.eventId}/disburse`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        })
      )
    );
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

      <Sidebar
        navItems={adminNavItems}
        role="admin"
        username="Admin"
      />

      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">

        <Header
          username="Admin"
          role="admin"
          showNewEventButton={false}
        />

        {loading ? (
          <div className="text-muted text-center mt-20 text-lg">Loading...</div>
        ) : (
        <div className="p-8 space-y-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: users.length, change: "Live from API", icon: "👥", color: "from-cyan-500/10 to-transparent", border: "border-cyan-500/20" },
              { label: "Total Events", value: escrow.length, change: "All time", icon: "🎯", color: "from-accent/10 to-transparent", border: "border-accent/20" },
              { label: "Escrow Balance", value: `₹${(totalEscrow / 100000).toFixed(1)}L`, change: "Pending release", icon: "🔒", color: "from-yellow-500/10 to-transparent", border: "border-yellow-500/20" },
              { label: "Total Disbursed", value: `₹${(totalDisbursed / 1000).toFixed(0)}K`, change: "Live from API", icon: "✅", color: "from-green-500/10 to-transparent", border: "border-green-500/20" },
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

          {/* Payments Table */}
          <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <h2 className="font-syne font-bold text-base">Escrow Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Event", "Organizer", "Amount", "Date", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[0.7rem] font-semibold text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {escrow.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted text-sm">No paid registrations yet.</td></tr>
                  ) : escrow.map((pay, i) => (
                    <tr key={pay.eventId} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === escrow.length - 1 ? "border-none" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm">{pay.event}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{pay.organizer}</td>
                      <td className="px-6 py-4 font-syne font-bold text-sm">
                        ₹{(pay.amount / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{pay.date}</td>
                      <td className="px-6 py-4">
                        <PaymentStatusBadge status={pay.status} />
                      </td>
                      <td className="px-6 py-4">
                        {pay.status === "held" ? (
                          <button
                            onClick={() => handleDisburse(pay.eventId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-accent to-accent2 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,77,28,0.3)] transition-all duration-200"
                          >
                            Disburse
                          </button>
                        ) : (
                          <span className="text-muted text-xs">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users Table + Escrow Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* All Users */}
            <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h2 className="font-syne font-bold text-base">All Users</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {users.length === 0 ? (
                  <div className="px-6 py-8 text-center text-muted text-sm">No users yet.</div>
                ) : users.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent2/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent2">
                      {(user.name || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{user.name || "Unnamed"}</div>
                      <div className="text-muted text-xs truncate">{user.email}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <RoleBadge role={user.role} />
                      <button
                        onClick={() => handleToggleBan(user)}
                        className={`text-[0.65rem] font-semibold ${
                          user.status === "banned"
                            ? "text-green-400 hover:text-green-300"
                            : "text-red-400 hover:text-red-300"
                        } transition-colors`}
                      >
                        {user.status === "banned" ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow Summary */}
            <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-syne font-bold text-base mb-5">Escrow Summary</h2>
              <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="text-sm font-semibold text-yellow-400">₹{(totalEscrow / 100000).toFixed(1)}L in escrow</div>
                  <div className="text-muted text-xs mt-0.5">{heldCount} event{heldCount === 1 ? "" : "s"} pending disbursement</div>
                </div>
                <button
                  onClick={handleDisburseAll}
                  disabled={heldCount === 0}
                  className="ml-auto px-3 py-1.5 bg-gradient-to-r from-accent to-accent2 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0 disabled:opacity-40"
                >
                  Disburse All
                </button>
              </div>
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="text-sm font-semibold text-green-400">₹{(totalDisbursed / 1000).toFixed(0)}K disbursed</div>
                  <div className="text-muted text-xs mt-0.5">Total released to organizers</div>
                </div>
              </div>
            </div>
          </div>

        </div>
        )}
      </main>
    </div>
  );
}
