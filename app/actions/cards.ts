"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CardRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  source_type: string;
  source_title: string | null;
  created_at: string;
};

export async function createCard(payload: {
  title: string;
  body: string;
  category: string;
  source_type: string;
  source_title: string;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase.from("cards").insert({
    user_id: user.id,
    title: payload.title,
    body: payload.body,
    category: payload.category,
    source_type: payload.source_type,
    source_title: payload.source_title || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/capture");
  return { success: true };
}
