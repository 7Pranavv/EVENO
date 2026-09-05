"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDescope } from "@descope/nextjs-sdk/client";
import { logout as clearAuth } from "@/lib/auth";

interface NavItem {
  icon: string;
  label: string;
  id: string;
  href?: string;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
  username: string;
}

export default function Sidebar({ navItems, role, username }: SidebarProps) {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const sdk = useDescope();

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleLogout = async () => {
    try {
      await sdk.logout();
    } catch {
      // ignore — clear local session regardless
    }
    clearAuth();
    router.push("/login");
  };

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 bg-surface border-r border-white/[0.07] flex flex-col transition-all duration-300 fixed top-0 left-0 h-screen z-50`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.07]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold font-syne">E</span>
        </div>
        {sidebarOpen && (
          <span className="font-syne font-extrabold text-base tracking-tight">Eveno</span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto text-muted hover:text-[var(--text)] transition-colors text-lg"
        >
          {sidebarOpen ? "←" : "→"}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${
              activeNav === item.id
                ? "bg-gradient-to-r from-accent/20 to-accent2/10 text-[var(--text)] border border-accent/20"
                : "text-muted hover:text-[var(--text)] hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
            {sidebarOpen && activeNav === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
            {username[0]}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{username}</div>
              <div className="text-[0.7rem] text-muted truncate capitalize">{role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-muted hover:text-[var(--text)] transition-colors text-sm flex-shrink-0"
          >
            ⏻
          </button>
        </div>
      </div>

    </aside>
  );
}