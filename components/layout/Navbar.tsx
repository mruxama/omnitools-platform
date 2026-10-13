"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Search,
  Star,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Calculator,
  Layers,
  Sparkles,
  RefreshCw,
  BookOpen,
  Globe,
  Film,
  Stamp,
  Video,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCw,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "../search/SearchModal";
import { WorkspaceDrawer } from "../tools/WorkspaceDrawer";
import { useFavorites } from "@/lib/hooks/useFavorites";

interface ToolDropdownItem {
  name: string;
  href: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface CategoryGroup {
  name: string;
  href: string;
  tools: ToolDropdownItem[];
}

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();

  // Close tools dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsToolsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Primary top-level category groups for mega-menu
  const categoryGroups: CategoryGroup[] = [
    {
      name: "Media & Studio Tools",
      href: "/tools",
      tools: [
        {
          name: "iPhone Video Converter",
          href: "/iphone-video-converter",
          desc: "Fast lossless MOV/HEVC to MP4",
          icon: Video,
          badge: "New",
        },
        {
          name: "Smart Logo Remover",
          href: "/logo-remover",
          desc: "Inpaint & erase unwanted objects",
          icon: Sparkles,
          badge: "New",
        },
        {
          name: "Bulk Video Rotator",
          href: "/video-rotator",
          desc: "90°, 180°, 270° orientation fix",
          icon: RotateCw,
          badge: "New",
        },
        {
          name: "Video Compressor",
          href: "/video-compressor",
          desc: "CRF, target size, & bitrate controls",
          icon: Film,
          badge: "Popular",
        },
        {
          name: "Bulk Watermark Studio",
          href: "/bulk-watermark",
          desc: "Batch logos & text for images & video",
          icon: Stamp,
        },
      ],
    },
    {
      name: "PDF Toolkit",
      href: "/tools/pdf",
      tools: [
        {
          name: "Merge PDF",
          href: "/tools/pdf/merge",
          desc: "Combine multiple PDFs in order",
          icon: Layers,
        },
        {
          name: "Compress PDF",
          href: "/tools/pdf/compress",
          desc: "Reduce document file size",
          icon: FileText,
        },
        {
          name: "Split PDF",
          href: "/tools/pdf/split",
          desc: "Extract pages or separate files",
          icon: FileText,
        },
        {
          name: "PDF to JPG / JPG to PDF",
          href: "/tools/pdf/pdf-to-jpg",
          desc: "High-resolution page conversions",
          icon: ImageIcon,
        },
      ],
    },
    {
      name: "Image & Conversion",
      href: "/tools/image",
      tools: [
        {
          name: "Bulk HEIC to JPG & PNG",
          href: "/heic-to-jpg",
          desc: "Fast parallel iPhone photo conversion",
          icon: ImageIcon,
          badge: "New",
        },
        {
          name: "AI Image Upscaler",
          href: "/image-upscaler",
          desc: "2× & 4× local super-resolution",
          icon: Sparkles,
          badge: "Popular",
        },
        {
          name: "Universal Converter",
          href: "/convert",
          desc: "Convert 200+ formats client-side",
          icon: RefreshCw,
        },
        {
          name: "Image Compressor",
          href: "/tools/image/compress",
          desc: "Shrink PNG, JPG, WebM with preview",
          icon: ImageIcon,
        },
      ],
    },
    {
      name: "Productivity & Utilities",
      href: "/tools/productivity",
      tools: [
        {
          name: "Web-Check OSINT",
          href: "/web-check",
          desc: "Domain DNS, SSL, & server audit",
          icon: Globe,
        },
        {
          name: "Calculators Suite",
          href: "/tools/calculators",
          desc: "Percentage, discount, loan, unit convert",
          icon: Calculator,
        },
        {
          name: "QR Code Generator",
          href: "/tools/productivity/qr-code",
          desc: "Custom styled high-res QR codes",
          icon: Zap,
        },
        {
          name: "Multi-Step Workflows",
          href: "/convert/workflow",
          desc: "Automate chained conversions",
          icon: Sparkles,
        },
      ],
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1 group"
          >
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Omni<span className="text-primary">Tools</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {/* Mega Dropdown for All Tools */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsToolsDropdownOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none ${
                  isToolsDropdownOpen || pathname.startsWith("/tools")
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
                aria-expanded={isToolsDropdownOpen}
              >
                <Layers className="w-4 h-4" />
                <span>Explore Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isToolsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mega Menu Overlay Dropdown */}
              {isToolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[720px] bg-card border border-border shadow-2xl rounded-2xl p-4 grid grid-cols-2 gap-4 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                  {categoryGroups.map((group) => (
                    <div key={group.name} className="space-y-1.5">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {group.name}
                        </span>
                        <Link
                          href={group.href}
                          onClick={() => setIsToolsDropdownOpen(false)}
                          className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          View all <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="space-y-0.5">
                        {group.tools.map((tool) => {
                          const ToolIconComp = tool.icon;
                          const isCurrent = pathname === tool.href;
                          return (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              onClick={() => setIsToolsDropdownOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                                isCurrent
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-muted/70 text-card-foreground group"
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                <ToolIconComp className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {tool.name}
                                  </span>
                                  {tool.badge && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary">
                                      {tool.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {tool.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="col-span-2 pt-2 border-t border-border flex items-center justify-between px-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>100% In-Browser Privacy • Zero File Uploads</span>
                    </div>
                    <Link
                      href="/tools"
                      onClick={() => setIsToolsDropdownOpen(false)}
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Browse Complete Catalog (30+ Tools) <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Quick Links */}
            <Link
              href="/convert"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === "/convert"
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Converter
            </Link>

            <Link
              href="/video-compressor"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.includes("video-compressor")
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Video className="w-4 h-4" />
              Video Compressor
            </Link>

            <Link
              href="/image-upscaler"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.includes("upscaler")
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Upscaler
            </Link>

            <Link
              href="/tools/bulk-watermark"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.includes("watermark")
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Stamp className="w-4 h-4" />
              Watermark
            </Link>

            <Link
              href="/blog"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/blog")
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
          </nav>

          {/* Right Action Icons: Search, Workspace/Favorites, ThemeToggle, Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              aria-label="Search tools (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline text-xs">Search tools...</span>
              <kbd className="hidden sm:inline-flex items-center text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Workspace / Favorites Button */}
            <button
              onClick={() => setIsWorkspaceOpen(true)}
              className="relative p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              title="Saved tools & recent history"
              aria-label="Open workspace"
            >
              <Star className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground focus:outline-none shadow-sm"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-card/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 max-h-[80vh] overflow-y-auto">
            {/* Quick Search inside Mobile Menu */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-primary" />
                <span>Search 30+ free tools...</span>
              </div>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</span>
            </button>

            {/* Quick Featured Shortcuts on Mobile */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/video-compressor"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:border-primary"
              >
                <Video className="w-4 h-4 text-primary" />
                <span>Video Compressor</span>
              </Link>
              <Link
                href="/image-upscaler"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:border-primary"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Upscaler</span>
              </Link>
              <Link
                href="/convert"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:border-primary"
              >
                <RefreshCw className="w-4 h-4 text-primary" />
                <span>Converter</span>
              </Link>
              <Link
                href="/tools/bulk-watermark"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:border-primary"
              >
                <Stamp className="w-4 h-4 text-primary" />
                <span>Watermark</span>
              </Link>
            </div>

            {/* Accordion Categories */}
            <div className="pt-2 border-t border-border space-y-1">
              <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tool Categories
              </div>

              {categoryGroups.map((group) => {
                const isExpanded = mobileExpandedCategory === group.name;
                return (
                  <div key={group.name} className="border border-border/60 rounded-xl overflow-hidden bg-background/50">
                    <button
                      onClick={() =>
                        setMobileExpandedCategory(isExpanded ? null : group.name)
                      }
                      className="w-full flex items-center justify-between p-3 text-left text-xs font-semibold text-foreground hover:bg-muted/50"
                    >
                      <span>{group.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-2 pt-0 space-y-1 bg-muted/20">
                        {group.tools.map((tool) => (
                          <Link
                            key={tool.name}
                            href={tool.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <span>{tool.name}</span>
                            {tool.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary">
                                {tool.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* All Tools & Blog Link */}
            <div className="pt-2 border-t border-border flex flex-col gap-1">
              <Link
                href="/tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  All 30+ Tools Directory
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Guides & Blog
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Workspace Favorites & History Drawer */}
      <WorkspaceDrawer isOpen={isWorkspaceOpen} onClose={() => setIsWorkspaceOpen(false)} />
    </>
  );
}
