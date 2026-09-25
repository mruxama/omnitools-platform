"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  TrendingUp,
  Search,
  Network,
  PenTool,
  BookOpen,
  Settings,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/pages", label: "SEO Pages", icon: FileText },
  { href: "/admin/blog", label: "Blog Posts", icon: BookOpen },
  { href: "/admin/opportunities", label: "Opportunities", icon: Sparkles },
  { href: "/admin/search-console", label: "Search Console", icon: Search },
  { href: "/admin/links", label: "Internal Links", icon: Network },
  { href: "/admin/content", label: "Content Studio", icon: PenTool },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render clean screen without admin dashboard navigation
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/60 p-4 space-y-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-bold text-sm tracking-tight text-foreground">Growth Engine</h2>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">SEO + AEO + GEO Studio</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
              v2.0
            </span>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions & Logout */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          <div className="p-3 bg-muted/30 border border-border/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>SEO Health</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">94 / 100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[94%]" />
            </div>
          </div>

          <Link
            href="/convert"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-primary transition-colors font-medium rounded-lg hover:bg-muted/40"
          >
            <span>View Public Platform</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-semibold rounded-lg"
          >
            <span>Sign Out</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}

