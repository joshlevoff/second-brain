import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 overflow-auto bg-stone-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1
          className="text-2xl font-bold text-stone-900"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Welcome back, {user!.email?.split("@")[0]}
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Your knowledge base is ready.
        </p>
        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            Use <strong>Capture</strong> to capture ideas, <strong>Library</strong> to review your cards, and <strong>Topics</strong> to organise your knowledge tree.
          </p>
        </div>
      </div>
    </div>
  );
}
