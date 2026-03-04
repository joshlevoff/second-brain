"use server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_CATEGORIES = [
  "Studies",
  "Rules",
  "Articles",
  "Courses",
  "Literature I Love",
];

export type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (data && data.length > 0) return data as CategoryRow[];

  // Seed defaults on first load
  const rows = DEFAULT_CATEGORIES.map((name) => ({ user_id: user.id, name }));
  const { data: seeded } = await supabase
    .from("categories")
    .insert(rows)
    .select();
  return (seeded as CategoryRow[]) || [];
}

export async function createCategory(
  name: string
): Promise<{ error: string } | { category: CategoryRow }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single();
  if (error) return { error: error.message };
  return { category: data as CategoryRow };
}

export async function deleteCategory(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: cat } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!cat) return { error: "Category not found" };

  const { count } = await supabase
    .from("cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("category", cat.name);

  if (count && count > 0) {
    return {
      error: `${count} card${count === 1 ? "" : "s"} use this category. Reassign them first.`,
    };
  }

  await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  return { success: true };
}
