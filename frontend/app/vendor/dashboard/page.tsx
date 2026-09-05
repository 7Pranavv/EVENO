"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RequireRole from "@/components/RequireRole";
import { api, apiList } from "@/lib/api";
import { getUser } from "@/lib/auth";

const vendorNavItems = [
  { icon: "⚡", label: "Overview",      id: "overview",  href: "/vendor/dashboard"  },
  { icon: "🗂️", label: "My Listing",    id: "listing",   href: "/vendor/listings"   },
  { icon: "📥", label: "Hire Requests", id: "requests",  href: "/vendor/dashboard"  },
  { icon: "💰", label: "Earnings",      id: "earnings",  href: "/vendor/dashboard"  },
  { icon: "⚙️", label: "Settings",      id: "settings",  href: "/vendor/dashboard"  },
];

export default function VendorDashboardPage() {
  return (
    <RequireRole allow={["vendor"]}>
      <VendorDashboard />
    </RequireRole>
  );
}

interface VendorStats {
  totalEarnings: number;
  availableForPayout: number;
  pendingRequests: number;
  completedJobs: number;
}

function VendorDashboard() {
  const [stats, setStats]       = useState<VendorStats | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [revenue, setRevenue]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const user = getUser();
  // RequireRole has already confirmed this is a vendor and refreshed the
  // cached profile, so the id is present. The old "vendor123" fallback showed
  // a stranger's books whenever localStorage was empty.
  const VENDOR_ID = user?.vendorId ?? user?.id ?? "";
  const username  = user?.name || "Vendor";

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, r, rev] = await Promise.all([
        api<VendorStats>(`/api/vendors/${VENDOR_ID}/stats`),
        apiList<any>(`/api/vendors/${VENDOR_ID}/requests`),
        apiList<any>(`/api/vendors/${VENDOR_ID}/revenue`),
      ]);
      setStats(s);
      setRequests(r);
      setRevenue(rev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  // Hoisted out of the render loop — it was recomputed for every row, and
  // spreading a long array into Math.max risks a call-stack overflow.
  const maxRevenue = revenue.reduce((m, r: any) => Math.max(m, r.amount || 0), 1);

  const handleWithdraw = async () => {
    try {
      await api(`/api/vendors/${VENDOR_ID}/withdraw`, { method: "POST" });
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed.");
    }
  };

  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    try {
      await api(`/api/registrations/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the request.");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

      <Sidebar navItems={vendorNavItems} role="vendor" username={username} />

      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">

        <Header username={username} role="vendor" showNewEventButton={false} />

        <div className="p-8 space-y-8">

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={fetchAll} className="underline whitespace-nowrap">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="text-muted text-center mt-20 text-lg">Loading...</div>
          ) : (
            <>
              {/* ── STATS CARDS ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Every figure here comes from the API. The old cards carried a
                    hardcoded 4.8 rating and invented badges like "+18.2%". */}
                {[
                  { icon: "💰", label: "Total Earnings",      value: `₹${(stats?.totalEarnings ?? 0).toLocaleString("en-IN")}`,      badge: "Accepted jobs",  badgeColor: "text-green-400 bg-green-500/10" },
                  { icon: "🏦", label: "Available to Withdraw", value: `₹${(stats?.availableForPayout ?? 0).toLocaleString("en-IN")}`, badge: "Collected",      badgeColor: "text-cyan-400 bg-cyan-500/10"   },
                  { icon: "📥", label: "Pending Requests",    value: stats?.pendingRequests ?? 0,                                     badge: "Awaiting you",   badgeColor: "text-yellow-400 bg-yellow-500/10" },
                  { icon: "✅", label: "Completed Jobs",      value: stats?.completedJobs ?? 0,                                       badge: "All time",       badgeColor: "text-muted bg-white/[0.05]"     },
                ].map((c) => (
                  <div key={c.label} className="bg-surface border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{c.icon}</span>
                      <span className={`text-[0.7rem] font-medium px-2 py-0.5 rounded-full ${c.badgeColor}`}>{c.badge}</span>
                    </div>
                    <div className="font-syne font-extrabold text-2xl tracking-tight mb-1">{c.value}</div>
                    <div className="text-muted text-xs">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* ── HIRE REQUESTS + RECENT EARNINGS ── */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                    <h2 className="font-syne font-bold text-base">Hire Requests</h2>
                    <span className="text-xs text-accent cursor-pointer hover:underline">View all →</span>
                  </div>

                  {requests.length === 0 ? (
                    <div className="text-muted text-center py-12 text-sm">No hire requests yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.05]">
                            {["Event", "Organizer", "Amount", "Status", "Action"].map(h => (
                              <th key={h} className="text-left px-6 py-3 text-[0.7rem] font-semibold text-muted uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {requests.map((r: any) => (
                            <tr key={r._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 text-sm font-medium">{r.eventTitle || "—"}</td>
                              <td className="px-6 py-4 text-sm text-muted">{r.participantName || "—"}</td>
                              <td className="px-6 py-4 text-sm font-syne font-bold text-yellow-400">₹{r.amount || 0}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${
                                  r.status === "accepted" ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : r.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}>
                                  {r.status || "pending"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {r.status === "pending" && (
                                  <div className="flex gap-2">
                                    <button onClick={() => handleAction(r._id, "accepted")}
                                      className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg transition-colors font-bold">
                                      ✓ Accept
                                    </button>
                                    <button onClick={() => handleAction(r._id, "rejected")}
                                      className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg transition-colors">
                                      ✗ Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                    <h2 className="font-syne font-bold text-base">Recent Earnings</h2>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {revenue.length === 0 ? (
                      <div className="text-muted text-center py-12 text-sm">No earnings yet.</div>
                    ) : (
                      revenue.slice(0, 5).map((r: any) => (
                        <div key={r._id} className="flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                            {(r.participantName || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{r.participantName}</div>
                            <div className="text-muted text-xs truncate">{r.eventTitle}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-syne font-bold text-green-400">+₹{r.amount || 0}</div>
                            <div className="text-muted text-[0.65rem]">{new Date(r.registeredAt).toLocaleDateString("en-IN")}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── QUICK ACTIONS + EARNINGS BREAKDOWN ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
                  <h2 className="font-syne font-bold text-base mb-5">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "🖊️", label: "Edit Listing",  desc: "Update your service", href: "/vendor/listings"  },
                      { icon: "📥", label: "Hire Requests", desc: "View all requests",    href: "/vendor/dashboard" },
                      { icon: "💸", label: "Withdraw",      desc: "Transfer earnings",    href: "/vendor/dashboard" },
                      { icon: "⭐", label: "Reviews",       desc: "See your ratings",     href: "/vendor/dashboard" },
                    ].map((a) => (
                      <a key={a.label} href={a.href} className="flex items-start gap-3 p-4 bg-bg rounded-xl border border-white/[0.07] hover:border-yellow-400/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 text-left">
                        <span className="text-xl flex-shrink-0">{a.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{a.label}</div>
                          <div className="text-muted text-xs mt-0.5">{a.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
                  <h2 className="font-syne font-bold text-base mb-5">Earnings Breakdown</h2>
                  {revenue.length === 0 ? (
                    <div className="text-muted text-center py-4 text-sm">No data yet.</div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {revenue.map((r: any) => {
                          const pct = Math.round(((r.amount || 0) / maxRevenue) * 100);
                          return (
                            <div key={r._id}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-[var(--text)]">{r.participantName}</span>
                                <span className="font-syne font-bold text-sm text-yellow-400">₹{r.amount}</span>
                              </div>
                              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-yellow-400">
                            ₹{((stats?.availableForPayout ?? stats?.totalEarnings ?? 0) / 1000).toFixed(1)}K ready for payout
                          </div>
                          <div className="text-muted text-xs mt-0.5">Weekly transfer available</div>
                        </div>
                        <button
                          onClick={handleWithdraw}
                          disabled={!stats?.availableForPayout}
                          className="bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          Withdraw
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}