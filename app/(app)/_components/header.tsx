"use client";

import { signOut } from "@/app/actions/auth";

export default function AppHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="font-semibold text-zinc-50">Second Brain</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
