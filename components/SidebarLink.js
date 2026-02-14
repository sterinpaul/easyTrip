"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function SidebarLink({ href, icon, label }) {
  const pathname = usePathname();
  // Exact match for root, startsWith for others
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
        isActive 
          ? "bg-purple-50 dark:bg-white/10 text-purple-600 dark:text-white shadow-lg shadow-purple-500/10" 
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-purple-500 to-pink-500" />
      )}
      <span className={clsx("transition-colors", isActive ? "text-purple-600 dark:text-purple-400" : "group-hover:text-purple-600 dark:group-hover:text-purple-400")}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
