import type { CardRow } from "@/app/actions/cards";

const CATEGORY_STYLES: Record<string, string> = {
  Unprocessed: "bg-zinc-800 text-zinc-400",
  Studies: "bg-blue-950 text-blue-400",
  Rules: "bg-amber-950 text-amber-400",
  Articles: "bg-green-950 text-green-400",
  Courses: "bg-violet-950 text-violet-400",
  "Literature I Love": "bg-rose-950 text-rose-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CardList({ cards }: { cards: CardRow[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">
          No cards yet. Add your first one above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const badgeClass =
          CATEGORY_STYLES[card.category] ?? "bg-zinc-800 text-zinc-400";
        return (
          <div
            key={card.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-50 leading-snug">
                {card.title}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
              >
                {card.category}
              </span>
            </div>

            {/* Body preview */}
            <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
              {card.body}
            </p>

            {/* Footer row */}
            <div className="mt-auto flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-xs text-zinc-500">
                  {card.source_type}
                </span>
                {card.source_title && (
                  <span className="text-xs text-zinc-500 truncate max-w-[120px]">
                    {card.source_title}
                  </span>
                )}
              </div>
              <time className="text-xs text-zinc-600">
                {formatDate(card.created_at)}
              </time>
            </div>
          </div>
        );
      })}
    </div>
  );
}
