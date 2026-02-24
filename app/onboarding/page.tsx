import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_components/onboarding-client";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  // Already completed — skip wizard
  if (profile?.onboarding_complete) redirect("/capture");

  return <OnboardingClient />;
}
