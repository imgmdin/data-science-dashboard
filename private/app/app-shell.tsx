"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BRAND } from "./brand";

type NavItem = { label: string; href: string | null; icon: string };

// Icons are 24x24 stroke paths.
const NAV: NavItem[] = [
  { label: "Overview", href: "/", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
  { label: "Members", href: "/members", icon: "M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3 3 0 100-6 3 3 0 000 6zM21 19v-1a4 4 0 00-3-3.9M16 4.1a3 3 0 010 5.8" },
  { label: "Events", href: "/events", icon: "M4 6h16v14H4zM4 10h16M8 3v6M16 3v6" },
  { label: "Attendance", href: "/attendance", icon: "M5 12l5 5L20 7" },
  { label: "Certificates", href: "/certificates", icon: "M5 4h14v12H5zM9 16v5l3-2 3 2v-5M8 8h8M8 11h5" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-[#220668] text-white md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0">
        <div className="flex items-center gap-3 py-5 pr-4 md:pb-7 md:pt-8">
          <Image src="/DSS_Logo.png" alt={BRAND.society} width={96} height={96} priority className="h-14 w-14 shrink-0 object-contain md:h-24 md:w-24" />
          <div className="min-w-0 leading-tight">
            <div className="text-lg font-semibold">{BRAND.portal}</div>
            <div className="mt-0.5 text-sm text-brand-300">{BRAND.society}</div>
          </div>
        </div>

        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map((item) => {
            const active = item.href !== null && isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-white text-brand-900" : "text-brand-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 px-5 py-6 md:px-10 md:py-9">{children}</div>
    </div>
  );
}
