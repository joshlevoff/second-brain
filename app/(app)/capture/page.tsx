import CardList from "@/app/(app)/_components/card-list";
import CaptureForm from "@/app/(app)/capture/_components/capture-form";
import type { CardRow } from "@/app/actions/cards";
import { createClient } from "@/lib/supabase/server";

export default async function CapturePage() {
  const supabase = await createClient();

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<CardRow[]>();

  return (
    <div className="flex-1 overflow-auto bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-10 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Capture</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Add anything worth keeping. Sort it out later.
          </p>
        </div>

        <CaptureForm />

        <section>
          <h2 className="mb-4 text-sm font-medium text-zinc-500 uppercase tracking-wider">
            {cards?.length ?? 0}{" "}
            {(cards?.length ?? 0) === 1 ? "card" : "cards"}
          </h2>
          <CardList
            cards={cards ?? []}
            emptyMessage="No cards yet. Add your first one above."
          />
        </section>
      </div>
    </div>
  );
}
