"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { API_BASE } from "@/lib/api";
import { getUser, getToken } from "@/lib/auth";

interface VendorService {
  _id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

const vendorNavItems = [
  { icon: "⚡", label: "Overview",      id: "overview", href: "/vendor/dashboard" },
  { icon: "🗂️", label: "My Listing",    id: "listing",  href: "/vendor/listings"  },
  { icon: "📥", label: "Hire Requests", id: "requests", href: "/vendor/dashboard" },
  { icon: "💰", label: "Earnings",      id: "earnings", href: "/vendor/dashboard" },
  { icon: "⚙️", label: "Settings",      id: "settings", href: "/vendor/dashboard" },
];

const CATEGORIES = ["Photography", "Catering", "DJ", "Decoration", "Security", "AV Equipment", "Other"];

// ─── Add Service Modal ───────────────────────────────────────────────
function AddServiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "Photography", available: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Name aur Price zaroori hain!");
      return;
    }
    const user = getUser();
    const vendorId = user?.vendorId || "vendor123";
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/vendors/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        vendorId,
        name: form.name,
        description: form.description,
        price: parseInt(form.price),
        category: form.category,
        available: form.available,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Service add nahi ho paya. Login karke try karo.");
      return;
    }
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-bold text-xl">Add New Service</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Service Name</label>
            <input className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. Wedding Photography"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Description</label>
            <textarea className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors resize-none"
              placeholder="Apni service ke baare mein batao..."
              rows={3}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Price (₹)</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              placeholder="e.g. 5000"
              value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Category</label>
            <select className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${form.available ? "bg-accent" : "bg-white/[0.1]"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${form.available ? "left-7" : "left-1"}`} />
            </button>
            <span className="text-sm text-muted">Available for hire</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Adding..." : "Add Service ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Service Modal ──────────────────────────────────────────────
function EditServiceModal({ service, onClose, onUpdated }: { service: VendorService; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState({
    name: service.name,
    description: service.description,
    price: service.price.toString(),
    category: service.category,
    available: service.available,
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/vendors/services/${service._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: parseInt(form.price),
        category: form.category,
        available: form.available,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Service update nahi ho paya. Login karke try karo.");
      return;
    }
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-bold text-xl">Edit Service</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Service Name</label>
            <input className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Description</label>
            <textarea className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors resize-none"
              rows={3}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Price (₹)</label>
            <input type="number" className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Category</label>
            <select className="w-full bg-bg border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${form.available ? "bg-accent" : "bg-white/[0.1]"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${form.available ? "left-7" : "left-1"}`} />
            </button>
            <span className="text-sm text-muted">Available for hire</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleUpdate} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Updating..." : "Update Service ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ────────────────────────────────────────────────────
function DeleteServiceModal({ service, onClose, onDeleted }: { service: VendorService; onClose: () => void; onDeleted: () => void }) {
  const handleDelete = async () => {
    const res = await fetch(`${API_BASE}/api/vendors/services/${service._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      alert("Service delete nahi ho paya. Login karke try karo.");
      return;
    }
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-white/[0.1] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="font-syne font-bold text-xl mb-2">Delete Service?</h2>
        <p className="text-muted text-sm mb-6">
          <span className="text-white font-medium">{service.name}</span> permanently delete ho jayega!
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:opacity-90 transition-opacity">Delete 🗑️</button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Badge ──────────────────────────────────────────────────
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

// ─── Main Page ───────────────────────────────────────────────────────
export default function VendorListings() {
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editService, setEditService] = useState<VendorService | null>(null);
  const [deleteService, setDeleteService] = useState<VendorService | null>(null);

  const user = getUser();
  const vendorId = user?.vendorId || "vendor123";
  const username = user?.name || "Vendor";

  const fetchServices = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/vendors/${vendorId}/services`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(data => { setServices(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const totalServices = services.length;
  const availableServices = services.filter(s => s.available).length;
  const avgPrice = services.length > 0
    ? Math.round(services.reduce((s, sv) => s + sv.price, 0) / services.length)
    : 0;

  return (
    <div className="min-h-screen bg-bg flex font-dm text-[var(--text)]">

      {showAdd && <AddServiceModal onClose={() => setShowAdd(false)} onCreated={fetchServices} />}
      {editService && <EditServiceModal service={editService} onClose={() => setEditService(null)} onUpdated={fetchServices} />}
      {deleteService && <DeleteServiceModal service={deleteService} onClose={() => setDeleteService(null)} onDeleted={fetchServices} />}

      <Sidebar navItems={vendorNavItems} role="vendor" username={username} />

      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">
        <Header username={username} role="vendor" showNewEventButton={false} />

        <div className="p-8 space-y-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🗂️", label: "Total Services",     value: totalServices,      badge: "Listed",       badgeColor: "text-cyan-400 bg-cyan-500/10"     },
              { icon: "✅", label: "Available Services",  value: availableServices,  badge: "Active",        badgeColor: "text-green-400 bg-green-500/10"   },
              { icon: "💰", label: "Avg. Price",          value: `₹${avgPrice}`,     badge: "Per service",  badgeColor: "text-yellow-400 bg-yellow-500/10"  },
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

          {/* Services List */}
          <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <h2 className="font-syne font-bold text-base">My Services</h2>
              <button onClick={() => setShowAdd(true)}
                className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90 transition-opacity">
                + Add Service
              </button>
            </div>

            {loading ? (
              <div className="text-muted text-center py-16 text-sm">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🗂️</div>
                <div className="text-muted text-sm">Koi service nahi hai abhi tak</div>
                <button onClick={() => setShowAdd(true)}
                  className="mt-4 text-xs bg-accent text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
                  + Pehli Service Add Karo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                {services.map((service) => (
                  <div key={service._id}
                    className="bg-bg border border-white/[0.07] rounded-xl p-5 hover:border-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <CategoryBadge category={service.category} />
                      <span className={`text-[0.7rem] font-semibold px-2 py-0.5 rounded-full border ${
                        service.available
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-white/[0.05] text-muted border-white/[0.1]"
                      }`}>
                        {service.available ? "● Available" : "○ Unavailable"}
                      </span>
                    </div>

                    <h3 className="font-syne font-bold text-base mb-1">{service.name}</h3>
                    <p className="text-muted text-xs leading-relaxed mb-4 line-clamp-2">
                      {service.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-syne font-extrabold text-lg text-accent">₹{service.price.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditService(service)}
                          className="text-xs bg-white/[0.06] hover:bg-accent/20 px-2.5 py-1 rounded-lg border border-white/[0.08] transition-colors">
                          ✏️ Edit
                        </button>
                        <button onClick={() => setDeleteService(service)}
                          className="text-xs bg-white/[0.06] hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-white/[0.08] transition-colors text-red-400">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}