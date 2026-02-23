"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CardRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  status: string;
  source_type: string;
  source_title: string | null;
  source_url: string | null;
  scripture: string | null;
  connected_topic_ids: string[];
  created_at: string;
};

export async function getCards(): Promise<CardRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as CardRow[]) || [];
}

export async function createCard(form: {
  title: string;
  body: string;
  category: string;
  status: string;
  source_type: string;
  source_title: string;
  source_url: string;
  scripture: string;
  connected_topic_ids: string[];
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("cards")
    .insert({ ...form, user_id: user.id });
  if (error) return { error: error.message };
  revalidatePath("/library");
  revalidatePath("/capture");
  return { success: true };
}

export async function updateCard(
  id: string,
  form: {
    title: string;
    body: string;
    category: string;
    status: string;
    source_type: string;
    source_title: string;
    source_url: string;
    scripture: string;
    connected_topic_ids: string[];
  }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("cards")
    .update(form)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/library");
  revalidatePath("/capture");
  return { success: true };
}

export async function deleteCard(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/library");
  revalidatePath("/capture");
  return { success: true };
}
