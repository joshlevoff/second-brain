"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTopics() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", user.id)
    .order("number", { ascending: true });
  return data || [];
}

export async function createTopic(form: {
  number: string;
  title: string;
  emoji: string;
  level: number;
  parent_id: string | null;
  related_topic_ids: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("topics")
    .insert({ ...form, user_id: user.id });
  if (error) return { error: error.message };
  revalidatePath("/topics");
  return { success: true };
}

export async function updateTopic(
  id: string,
  form: { title: string; emoji: string; related_topic_ids: string[] }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("topics")
    .update(form)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/topics");
  return { success: true };
}

export async function deleteTopic(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: allTopics } = await supabase
    .from("topics")
    .select("id, parent_id")
    .eq("user_id", user.id);
  if (!allTopics) return { error: "Could not fetch topics" };
  const toDelete = new Set<string>();
  const addDesc = (tid: string) => {
    toDelete.add(tid);
    allTopics
      .filter((t) => t.parent_id === tid)
      .forEach((t) => addDesc(t.id));
  };
  addDesc(id);
  const { error } = await supabase
    .from("topics")
    .delete()
    .in("id", Array.from(toDelete))
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/topics");
  return { success: true };
}
