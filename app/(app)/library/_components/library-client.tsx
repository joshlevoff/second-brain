"use client";

import CardList, {
  CATEGORY_STYLES,
} from "@/app/(app)/_components/card-list";
import type { CardRow } from "@/app/actions/cards";
import { useMemo, useState } from "react";

const CATEGORIES = [
  "All",
  "Unprocessed",
  "Studies",
  "Rules",
  "Articles",
  "Courses",
  "Literature I Love",
];

export default function LibraryClient({ cards }: { cards: CardRow[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return cards.filter((card) => {
      const matchesCategory =
        selectedCategory === "All" || card.category === selectedCategory;
      const matchesSearch =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.body.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [cards, selectedCategory, search]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            // For "All" use a neutral active style; for others use their category color
            let activeClass = "bg-zinc-700 text-zinc-50";
            if (active && cat !== "All") {
              activeClass = CATEGORY_STYLES[cat] ?? "bg-zinc-700 text-zinc-50";
            }
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? activeClass
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="sm:ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 sm:w-56"
          />
        </div>
      </div>

      {/* Count */}
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
        {filtered.length} {filtered.length === 1 ? "card" : "cards"}
        {(selectedCategory !== "All" || search) && (
          <span className="ml-1 normal-case tracking-normal text-zinc-600">
            of {cards.length} total
          </span>
        )}
      </p>

      {/* Card grid */}
      <CardList
        cards={filtered}
        emptyMessage={
          search || selectedCategory !== "All"
            ? "No cards match your filters."
            : "No cards yet. Head to Capture to add your first one."
        }
      />
    </div>
  );
}
