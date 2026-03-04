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
  sort_order: number;
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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (data && data.length > 0) return data as CategoryRow[];

  // Seed defaults on first load
  const rows = DEFAULT_CATEGORIES.map((name, index) => ({
    user_id: user.id,
    name,
    sort_order: index,
  }));
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

  const { data: existing } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: name.trim(), sort_order: sortOrder })
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

export async function renameCategory(
  id: string,
  name: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: null };

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!category) return { error: "Not found" };

  await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);

  await supabase
    .from("cards")
    .update({ category: name })
    .eq("category", category.name)
    .eq("user_id", user.id);

  return { error: null };
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("categories")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("user_id", user.id)
    )
  );
}
