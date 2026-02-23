"use client";

import { signInWithMagicLink, signInWithPassword } from "@/app/actions/auth";
import Link from "next/link";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [magicError, setMagicError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const [passwordPending, startPasswordTransition] = useTransition();
  const [magicPending, startMagicTransition] = useTransition();

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    startPasswordTransition(async () => {
      const result = await signInWithPassword({ email, password });
      if (result?.error) setPasswordError(result.error);
    });
  }

  function handleMagicSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMagicError(null);
    startMagicTransition(async () => {
      const result = await signInWithMagicLink({ email });
      if ("error" in result) {
        setMagicError(result.error);
      } else {
        setMagicSent(true);
      }
    });
  }

  return (
    <>
      <h1 className="mb-6 text-center text-xl font-semibold text-zinc-50">
        Sign in
      </h1>

      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          />
        </div>
        {passwordError && (
          <p
            role="alert"
            className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400"
          >
            {passwordError}
          </p>
        )}
        <button
          type="submit"
          disabled={passwordPending}
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {passwordPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative flex items-center gap-3 py-6">
        <span className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-500">or</span>
        <span className="h-px flex-1 bg-zinc-800" />
      </div>

      {magicSent ? (
        <p className="rounded-lg border border-green-800 bg-green-950 px-3 py-2 text-sm text-green-400">
          Check your inbox — we sent a magic link to{" "}
          <strong>{email}</strong>.
        </p>
      ) : (
        <form onSubmit={handleMagicSubmit} className="flex flex-col gap-3">
          {magicError && (
            <p
              role="alert"
              className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400"
            >
              {magicError}
            </p>
          )}
          <button
            type="submit"
            disabled={magicPending || !email}
            className="w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {magicPending ? "Sending…" : "Send magic link"}
          </button>
          <p className="text-center text-xs text-zinc-500">
            We&apos;ll send a link to{" "}
            <span className="text-zinc-300">{email || "your email"}</span>
          </p>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-300 hover:text-zinc-50"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
