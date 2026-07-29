// "use client";
// import { useEffect, useState } from "react";
// import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header";
// import { API_BASE } from "@/lib/api";

// const VENDOR_ID = "vendor123";

// const vendorNavItems = [
//   { icon: "⚡", label: "Overview",      id: "overview"  },
//   { icon: "🗂️", label: "My Listing",    id: "listing"   },
//   { icon: "📥", label: "Hire Requests", id: "requests"  },
//   { icon: "💰", label: "Earnings",      id: "earnings"  },
//   { icon: "⚙️", label: "Settings",      id: "settings"  },
// ];

// export default function VendorDashboard() {
//   const [stats, setStats]     = useState<any>(null);
//   const [requests, setRequests] = useState<any[]>([]);
//   const [revenue, setRevenue]   = useState<any[]>([]);
//   const [loading, setLoading]   = useState(true);

//   useEffect(() => { fetchAll(); }, []);

//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const [s, r, rev] = await Promise.all([
//         fetch(`${API_BASE}/api/vendors/${VENDOR_ID}/stats`).then(r => r.json()),
//         fetch(`${API_BASE}/api/vendors/${VENDOR_ID}/requests`).then(r => r.json()),
//         fetch(`${API_BASE}/api/vendors/${VENDOR_ID}/revenue`).then(r => r.json()),
//       ]);
//       setStats(s);
//       setRequests(Array.isArray(r) ? r : []);
//       setRevenue(Array.isArray(rev) ? rev : []);
//     } catch (e) {
//       console.error(e);
//     }
//     setLoading(false);
//   };

//   const handleAction = async (id: string, status: "accepted" | "rejected") => {
//     await fetch(`${API_BASE}/api/registrations/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status }),
//     });
//     fetchAll();
//   };

//   return (
//     <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

//       {/* ✅ Sidebar — navItems, role, username pass kiya */}
//       <Sidebar
//         navItems={vendorNavItems}
//         role="vendor"
//         username="Vendor"
//       />

//       <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">

//         <Header username="Vendor" role="vendor" showNewEventButton={false} />

//         <div className="p-8 space-y-8">

//           {loading ? (
//             <div className="text-muted text-center mt-20 text-lg">Loading...</div>
//           ) : (
//             <>
//               {/* ── STATS CARDS ── */}
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                 {[
//                   { icon: "💰", label: "Total Earnings",   value: `₹${((stats?.totalEarnings || 0)/1000).toFixed(1)}K`, badge: "+18.2%",       badgeColor: "text-green-400 bg-green-500/10" },
//                   { icon: "📥", label: "Pending Requests", value: stats?.pendingRequests ?? 0,                           badge: "Action needed!", badgeColor: "text-red-400 bg-red-500/10"   },
//                   { icon: "✅", label: "Completed Jobs",   value: stats?.completedJobs ?? 0,                             badge: "This month",    badgeColor: "text-cyan-400 bg-cyan-500/10" },
//                   { icon: "🏆", label: "Rating",           value: `${stats?.rating ?? 4.8} ⭐`,                          badge: "Top Vendor!",   badgeColor: "text-yellow-400 bg-yellow-500/10" },
//                 ].map((c) => (
//                   <div key={c.label} className="bg-surface border border-white/[0.07] rounded-2xl p-5">
//                     <div className="flex items-start justify-between mb-3">
//                       <span className="text-2xl">{c.icon}</span>
//                       <span className={`text-[0.7rem] font-medium px-2 py-0.5 rounded-full ${c.badgeColor}`}>{c.badge}</span>
//                     </div>
//                     <div className="font-syne font-extrabold text-2xl tracking-tight mb-1">{c.value}</div>
//                     <div className="text-muted text-xs">{c.label}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* ── HIRE REQUESTS + RECENT EARNINGS ── */}
//               <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

//                 {/* Hire Requests Table */}
//                 <div className="xl:col-span-2 bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
//                   <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
//                     <h2 className="font-syne font-bold text-base">Hire Requests</h2>
//                     <span className="text-xs text-accent cursor-pointer hover:underline">View all →</span>
//                   </div>

//                   {requests.length === 0 ? (
//                     <div className="text-muted text-center py-12 text-sm">No hire requests yet.</div>
//                   ) : (
//                     <div className="overflow-x-auto">
//                       <table className="w-full">
//                         <thead>
//                           <tr className="border-b border-white/[0.05]">
//                             {["Event", "Organizer", "Amount", "Status", "Action"].map(h => (
//                               <th key={h} className="text-left px-6 py-3 text-[0.7rem] font-semibold text-muted uppercase tracking-wider">{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {requests.map((r: any) => (
//                             <tr key={r._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
//                               <td className="px-6 py-4 text-sm font-medium">{r.eventTitle || "—"}</td>
//                               <td className="px-6 py-4 text-sm text-muted">{r.participantName || "—"}</td>
//                               <td className="px-6 py-4 text-sm font-syne font-bold text-yellow-400">₹{r.amount || 0}</td>
//                               <td className="px-6 py-4">
//                                 <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border ${
//                                   r.status === "accepted" ? "bg-green-500/10 text-green-400 border-green-500/20"
//                                   : r.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20"
//                                   : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
//                                 }`}>
//                                   {r.status || "pending"}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4">
//                                 {r.status === "pending" && (
//                                   <div className="flex gap-2">
//                                     <button onClick={() => handleAction(r._id, "accepted")}
//                                       className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg transition-colors font-bold">
//                                       ✓ Accept
//                                     </button>
//                                     <button onClick={() => handleAction(r._id, "rejected")}
//                                       className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg transition-colors">
//                                       ✗ Reject
//                                     </button>
//                                   </div>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>

//                 {/* Recent Earnings */}
//                 <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
//                   <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
//                     <h2 className="font-syne font-bold text-base">Recent Earnings</h2>
//                     <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//                   </div>
//                   <div className="divide-y divide-white/[0.04]">
//                     {revenue.length === 0 ? (
//                       <div className="text-muted text-center py-12 text-sm">No earnings yet.</div>
//                     ) : (
//                       revenue.slice(0, 5).map((r: any) => (
//                         <div key={r._id} className="flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors">
//                           <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
//                             {(r.participantName || "?")[0].toUpperCase()}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="text-sm font-medium truncate">{r.participantName}</div>
//                             <div className="text-muted text-xs truncate">{r.eventTitle}</div>
//                           </div>
//                           <div className="text-right flex-shrink-0">
//                             <div className="text-sm font-syne font-bold text-green-400">+₹{r.amount || 0}</div>
//                             <div className="text-muted text-[0.65rem]">{new Date(r.registeredAt).toLocaleDateString("en-IN")}</div>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── QUICK ACTIONS + EARNINGS BREAKDOWN ── */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//                 {/* Quick Actions */}
//                 <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
//                   <h2 className="font-syne font-bold text-base mb-5">Quick Actions</h2>
//                   <div className="grid grid-cols-2 gap-3">
//                     {[
//                       { icon: "🖊️", label: "Edit Listing",  desc: "Update your service" },
//                       { icon: "📥", label: "Hire Requests", desc: "View all requests"    },
//                       { icon: "💸", label: "Withdraw",      desc: "Transfer earnings"    },
//                       { icon: "⭐", label: "Reviews",       desc: "See your ratings"     },
//                     ].map((a) => (
//                       <button key={a.label} className="flex items-start gap-3 p-4 bg-bg rounded-xl border border-white/[0.07] hover:border-yellow-400/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 text-left">
//                         <span className="text-xl flex-shrink-0">{a.icon}</span>
//                         <div>
//                           <div className="text-sm font-medium">{a.label}</div>
//                           <div className="text-muted text-xs mt-0.5">{a.desc}</div>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Earnings Breakdown */}
//                 <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
//                   <h2 className="font-syne font-bold text-base mb-5">Earnings Breakdown</h2>
//                   {revenue.length === 0 ? (
//                     <div className="text-muted text-center py-4 text-sm">No data yet.</div>
//                   ) : (
//                     <>
//                       <div className="space-y-4">
//                         {revenue.map((r: any) => {
//                           const maxAmt = Math.max(...revenue.map((x: any) => x.amount || 1));
//                           const pct = Math.round(((r.amount || 0) / maxAmt) * 100);
//                           return (
//                             <div key={r._id}>
//                               <div className="flex justify-between items-center mb-1.5">
//                                 <span className="text-sm text-[var(--text)]">{r.participantName}</span>
//                                 <span className="font-syne font-bold text-sm text-yellow-400">₹{r.amount}</span>
//                               </div>
//                               <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
//                                 <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
//                                   style={{ width: `${pct}%` }} />
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>

//                       <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-between gap-3">
//                         <div>
//                           <div className="text-sm font-semibold text-yellow-400">
//                             ₹{((stats?.totalEarnings || 0) / 1000).toFixed(1)}K ready for payout
//                           </div>
//                           <div className="text-muted text-xs mt-0.5">Weekly transfer available</div>
//                         </div>
//                         <button className="bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
//                           Withdraw
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }




"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { API_BASE } from "@/lib/api";
import { getUser, getToken } from "@/lib/auth";

const vendorNavItems = [
  { icon: "⚡", label: "Overview",      id: "overview",  href: "/vendor/dashboard"  },
  { icon: "🗂️", label: "My Listing",    id: "listing",   href: "/vendor/listings"   },
  { icon: "📥", label: "Hire Requests", id: "requests",  href: "/vendor/dashboard"  },
  { icon: "💰", label: "Earnings",      id: "earnings",  href: "/vendor/dashboard"  },
  { icon: "⚙️", label: "Settings",      id: "settings",  href: "/vendor/dashboard"  },
];

export default function VendorDashboard() {
  const [stats, setStats]       = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [revenue, setRevenue]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  const user     = getUser();
  const VENDOR_ID = user?.vendorId || "vendor123";
  const username  = user?.name || "Vendor";

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, r, rev] = await Promise.all([
        fetch(`${API_BASE}/api/vendors/${VENDOR_ID}/stats`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then(r => r.json()),
        fetch(`${API_BASE}/api/vendors/${VENDOR_ID}/requests`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then(r => r.json()),
        fetch(`${API_BASE}/api/vendors/${VENDOR_ID}/revenue`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then(r => r.json()),
      ]);
      setStats(s);
      setRequests(Array.isArray(r) ? r : []);
      setRevenue(Array.isArray(rev) ? rev : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    const res = await fetch(`${API_BASE}/api/vendors/${VENDOR_ID}/withdraw`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      alert("Withdraw nahi ho paya. Login karke try karo.");
      return;
    }
    fetchAll();
  };

  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    const res = await fetch(`${API_BASE}/api/registrations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert("Request update nahi ho paya. Login karke try karo.");
      return;
    }
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

      <Sidebar navItems={vendorNavItems} role="vendor" username={username} />

      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">

        <Header username={username} role="vendor" showNewEventButton={false} />

        <div className="p-8 space-y-8">

          {loading ? (
            <div className="text-muted text-center mt-20 text-lg">Loading...</div>
          ) : (
            <>
              {/* ── STATS CARDS ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "💰", label: "Total Earnings",   value: `₹${((stats?.totalEarnings || 0)/1000).toFixed(1)}K`, badge: "+18.2%",        badgeColor: "text-green-400 bg-green-500/10"   },
                  { icon: "📥", label: "Pending Requests", value: stats?.pendingRequests ?? 0,                           badge: "Action needed!", badgeColor: "text-red-400 bg-red-500/10"     },
                  { icon: "✅", label: "Completed Jobs",   value: stats?.completedJobs ?? 0,                             badge: "This month",     badgeColor: "text-cyan-400 bg-cyan-500/10"   },
                  { icon: "🏆", label: "Rating",           value: `${stats?.rating ?? 4.8} ⭐`,                          badge: "Top Vendor!",    badgeColor: "text-yellow-400 bg-yellow-500/10" },
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
                          const maxAmt = Math.max(...revenue.map((x: any) => x.amount || 1));
                          const pct = Math.round(((r.amount || 0) / maxAmt) * 100);
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