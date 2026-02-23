"use client";

import { signUp } from "@/app/actions/auth";
import Link from "next/link";
import { useState, useTransition } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await signUp({ email, password });
      if (!result) return; // redirect happened
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccessMessage(result.message);
      }
    });
  }

  if (successMessage) {
    return (
      <>
        <h1 className="mb-4 text-center text-xl font-semibold text-zinc-50">
          Check your email
        </h1>
        <p className="rounded-lg border border-green-800 bg-green-950 px-3 py-2 text-sm text-green-400">
          {successMessage}
        </p>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already confirmed?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-300 hover:text-zinc-50"
          >
            Sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-center text-xl font-semibold text-zinc-50">
        Create your account
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Confirm password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-300 hover:text-zinc-50"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
