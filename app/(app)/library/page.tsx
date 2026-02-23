import LibraryClient from "@/app/(app)/library/_components/library-client";
import type { CardRow } from "@/app/actions/cards";
import { createClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createClient();

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<CardRow[]>();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">Library</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Browse and filter everything you&apos;ve captured.
        </p>
      </div>

      <LibraryClient cards={cards ?? []} />
    </div>
  );
}
