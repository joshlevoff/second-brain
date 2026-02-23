"use client";

import { CardModal } from "@/app/(app)/_components/card-modal";
import {
  CAT_STYLE,
  CATEGORIES,
  LEVEL_COLORS,
  SOURCE_ICONS,
} from "@/app/(app)/_lib/constants";
import type { CardRow } from "@/app/actions/cards";
import { useMemo, useState } from "react";

const SLIP_CATS = CATEGORIES.filter((c) => c !== "Unprocessed");

const CatBadge = ({ cat }: { cat: string }) => {
  const s = CAT_STYLE[cat] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
      className="inline-block rounded-full font-semibold tracking-wide text-[10px] px-2 py-0.5"
    >
      {cat}
    </span>
  );
};

type Card = CardRow;
type Topic = {
  id: string;
  number: string;
  title: string;
  level: number;
  parent_id: string | null;
};

export function LibraryClient({
  cards,
  topics,
}: {
  cards: Card[];
  topics: Topic[];
}) {
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingCard, setEditingCard] = useState<Card | null | "new">(null);

  const topicsForFilter = useMemo(() => {
    const relevantCards = filterCat
      ? cards.filter((c) => c.category === filterCat)
      : cards;
    const usedIds = new Set(
      relevantCards.flatMap((c) => c.connected_topic_ids || [])
    );
    return topics.filter((t) => usedIds.has(t.id));
  }, [topics, cards, filterCat]);

  const filteredCards = useMemo(() => {
    let r = cards;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.body?.toLowerCase().includes(q)
      );
    }
    if (filterCat) r = r.filter((c) => c.category === filterCat);
    if (filterTopic)
      r = r.filter((c) =>
        (c.connected_topic_ids || []).includes(filterTopic)
      );
    return r;
  }, [cards, search, filterCat, filterTopic]);

  const getTopicLabel = (id: string) => {
    const t = topics.find((x) => x.id === id);
    return t ? `${t.number} ${t.title}` : "";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-5 py-3 flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-stone-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Slip Box
          </h1>
          <p className="text-xs text-stone-400">
            Browse and filter your knowledge base
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="bg-stone-100 rounded-xl pl-4 pr-4 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-300 w-44"
          />
          <button
            onClick={() => setEditingCard("new")}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-colors"
          >
            + New Card
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden bg-stone-50">
        {/* Left Sidebar */}
        <div className="w-52 flex-shrink-0 border-r border-stone-200 bg-white overflow-y-auto py-4">
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-1.5">
            Category
          </p>
          <button
            onClick={() => {
              setFilterCat(null);
              setFilterTopic(null);
            }}
            className={`w-full text-left text-xs px-4 py-2 transition-colors ${
              !filterCat
                ? "text-amber-800 bg-amber-50 font-semibold"
                : "text-stone-500 hover:bg-stone-50"
            }`}
          >
            All{" "}
            <span className="text-stone-400 ml-1">{cards.length}</span>
          </button>
          {SLIP_CATS.map((cat) => {
            const count = cards.filter((c) => c.category === cat).length;
            const s = CAT_STYLE[cat];
            return (
              <button
                key={cat}
                onClick={() => {
                  setFilterCat(filterCat === cat ? null : cat);
                  setFilterTopic(null);
                }}
                className={`w-full text-left text-xs px-4 py-2 transition-colors ${
                  filterCat === cat
                    ? "font-semibold"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
                style={
                  filterCat === cat
                    ? { color: s.text, background: s.bg }
                    : {}
                }
              >
                {cat}{" "}
                <span className="text-stone-400 ml-1">{count}</span>
              </button>
            );
          })}

          {topicsForFilter.length > 0 && (
            <>
              <div className="mx-4 my-3 border-t border-stone-100" />
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-1.5">
                Topic
              </p>
              <button
                onClick={() => setFilterTopic(null)}
                className={`w-full text-left text-xs px-4 py-1.5 transition-colors ${
                  !filterTopic
                    ? "text-amber-800 font-semibold bg-amber-50"
                    : "text-stone-400 hover:bg-stone-50"
                }`}
              >
                All topics
              </button>
              {topicsForFilter.map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setFilterTopic(filterTopic === t.id ? null : t.id)
                  }
                  className={`w-full text-left text-xs py-1.5 transition-colors flex items-center gap-1.5 ${
                    filterTopic === t.id
                      ? "text-amber-800 bg-amber-50 font-semibold"
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                  style={{ paddingLeft: 16 + t.level * 10 }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: LEVEL_COLORS[t.level] || "#94a3b8",
                    }}
                  />
                  <span className="truncate">
                    {t.number} {t.title}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {(filterCat || filterTopic) && (
            <div className="flex items-center gap-2 mb-4 text-xs text-stone-500">
              <span className="text-stone-400">Showing</span>
              {filterCat && <CatBadge cat={filterCat} />}
              {filterCat && filterTopic && (
                <span className="text-stone-300">+</span>
              )}
              {filterTopic && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  {getTopicLabel(filterTopic)}
                </span>
              )}
              <button
                onClick={() => {
                  setFilterCat(null);
                  setFilterTopic(null);
                }}
                className="text-stone-400 hover:text-red-400 ml-1"
              >
                ✕ Clear
              </button>
              <span className="text-stone-300 ml-auto">
                {filteredCards.length} cards
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 max-w-4xl">
            {filteredCards.map((card) => {
              const s =
                CAT_STYLE[card.category] || {
                  bg: "#f1f5f9",
                  text: "#475569",
                  border: "#cbd5e1",
                };
              return (
                <div
                  key={card.id}
                  onClick={() => setEditingCard(card)}
                  className="bg-white border border-stone-200 rounded-xl p-4 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-sm font-semibold text-stone-800 leading-snug group-hover:text-amber-800 transition-colors line-clamp-2"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {card.title}
                    </h3>
                    <CatBadge cat={card.category} />
                  </div>
                  {card.body && (
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
                      {card.body}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      {card.source_type &&
                        card.source_type !== "Note" &&
                        card.source_title && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-stone-500 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5">
                            <span>
                              {SOURCE_ICONS[card.source_type] || "📌"}
                            </span>
                            <span className="font-medium truncate max-w-[100px]">
                              {card.source_title}
                            </span>
                          </span>
                        )}
                      {(card.connected_topic_ids || [])
                        .slice(0, 2)
                        .map((id) => (
                          <span
                            key={id}
                            className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 font-mono"
                          >
                            {getTopicLabel(id)}
                          </span>
                        ))}
                    </div>
                    {card.scripture && (
                      <span className="text-[9px] text-amber-600 font-medium flex-shrink-0">
                        {card.scripture}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-16 text-stone-300">
              <p className="text-sm">No cards match this filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Modal */}
      {editingCard !== null && (
        <CardModal
          card={editingCard === "new" ? null : editingCard}
          topics={topics}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
