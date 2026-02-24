"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOnboardingStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("onboarding_complete, template")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function completeOnboarding(template: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Seed pastor topics if that template was selected
  if (template === "pastor") {
    const pastorTopics = [
      { title: "Biblical Theology", emoji: "✝️", number: "1", level: 0, parent_id: null, related_topic_ids: [] },
      { title: "Expository Texts",  emoji: "📖", number: "2", level: 0, parent_id: null, related_topic_ids: [] },
      { title: "Pastoral Care",     emoji: "🤝", number: "3", level: 0, parent_id: null, related_topic_ids: [] },
      { title: "Church Leadership", emoji: "⛪", number: "4", level: 0, parent_id: null, related_topic_ids: [] },
    ];
    const { error } = await supabase
      .from("topics")
      .insert(pastorTopics.map((t) => ({ ...t, user_id: user.id })));
    if (error) return { error: error.message };
  }

  // Mark onboarding complete — upsert handles both new and existing rows
  const { error } = await supabase.from("user_profiles").upsert({
    id: user.id,
    onboarding_complete: true,
    template,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
