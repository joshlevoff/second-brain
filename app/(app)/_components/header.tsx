"use client";

import { NewCardButton } from "@/app/(app)/_components/new-card-button";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_TABS = [
  { href: "/capture", label: "Capture", icon: "📥", disabled: false },
  { href: "/library", label: "Library", icon: "📚", disabled: false },
  { href: "/topics",  label: "Topics",  icon: "🗂",  disabled: false },
  { href: "/studio",  label: "Studio",  icon: "⚡",  disabled: true  },
  { href: "/import",  label: "Import",  icon: "📤",  disabled: true  },
];

export default function AppHeader({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="h-14 flex-shrink-0 border-b border-stone-200 bg-white flex items-center px-5 gap-4">
      {/* Left: logo + subtitle */}
      <div className="flex items-center gap-2.5 flex-shrink-0 w-52">
        <span className="text-2xl leading-none">🧠</span>
        <div className="leading-tight">
          <div
            className="font-bold text-stone-900 text-sm"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Second Brain
          </div>
          <div className="text-[10px] text-stone-400">
            Success Factor Network · Josh
          </div>
        </div>
      </div>

      {/* Center: tab pills */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-0.5 bg-stone-100 rounded-xl p-1">
          {NAV_TABS.map(({ href, label, icon, disabled }) => {
            const active = pathname === href;
            if (disabled) {
              return (
                <span
                  key={href}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-40 cursor-not-allowed text-stone-500"
                  title="Coming soon"
                >
                  <span className="text-base leading-none">{icon}</span>
                  {label}
                </span>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-white shadow-sm text-stone-900"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: search + new card + signout */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <input
          placeholder="Search..."
          className="bg-stone-100 rounded-xl px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-300 w-36"
        />
        <NewCardButton />
        <div className="flex items-center gap-2 border-l border-stone-200 pl-2.5">
          <span className="text-xs text-stone-400 hidden lg:block truncate max-w-[100px]">
            {email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
