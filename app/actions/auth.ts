"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  return headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;
}

export async function signInWithPassword(payload: {
  email: string;
  password: string;
}): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(payload);
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signInWithMagicLink(payload: {
  email: string;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email: payload.email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function signUp(payload: {
  email: string;
  password: string;
}): Promise<{ error: string } | { success: true; message: string } | void> {
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return {
    success: true,
    message: "Check your email to confirm your account.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
