import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-50">Your Second Brain</h1>
      <p className="mt-1 text-sm text-zinc-400">Welcome back, {user!.email}</p>
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-500">
          Your notes will appear here.
        </p>
      </div>
    </div>
  );
}
