"use client";

import { CardModal } from "@/app/(app)/_components/card-modal";
import {
  CAT_STYLE,
  CATEGORIES,
  SOURCE_ICONS,
} from "@/app/(app)/_lib/constants";
import type { CardRow } from "@/app/actions/cards";
import { useState } from "react";

type Topic = { id: string; number: string; title: string; level: number };

type ModalCard = {
  id?: string;
  title: string;
  body: string;
  category: string;
  status: string;
  source_type: string;
  source_title: string;
  source_url: string;
  scripture: string;
  connected_topic_ids: string[];
};

const EMPTY_CARD = (category: string): ModalCard => ({
  title: "",
  body: "",
  category,
  status: "Unprocessed",
  source_type: "Note",
  source_title: "",
  source_url: "",
  scripture: "",
  connected_topic_ids: [],
});

function KanbanCard({
  card,
  onClick,
}: {
  card: CardRow;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-stone-200 rounded-xl p-3 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
    >
      <h3
        className="text-xs font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        {card.title}
      </h3>
      {card.body && (
        <p className="text-[10px] text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
          {card.body}
        </p>
      )}
      {(card.source_title || card.scripture) && (
        <div className="flex items-center justify-between mt-2 gap-2">
          {card.source_title && (
            <span className="text-[9px] text-stone-400 truncate flex items-center gap-0.5">
              <span>{SOURCE_ICONS[card.source_type] || "📌"}</span>
              <span>{card.source_title}</span>
            </span>
          )}
          {card.scripture && (
            <span className="text-[9px] text-amber-600 font-medium flex-shrink-0">
              {card.scripture}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  category,
  cards,
  onAdd,
  onEdit,
}: {
  category: string;
  cards: CardRow[];
  onAdd: () => void;
  onEdit: (card: CardRow) => void;
}) {
  const s = CAT_STYLE[category] || {
    bg: "#f1f5f9",
    text: "#475569",
    border: "#cbd5e1",
  };

  return (
    <div className="flex flex-col w-64 flex-shrink-0 h-full">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            style={{
              background: s.bg,
              color: s.text,
              border: `1px solid ${s.border}`,
            }}
            className="rounded-full text-[10px] font-bold px-2 py-0.5 tracking-wide"
          >
            {category}
          </span>
          <span className="text-xs text-stone-400">{cards.length}</span>
        </div>
        <button
          onClick={onAdd}
          style={{ color: s.text }}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold hover:opacity-70 transition-opacity"
          title={`Add ${category} card`}
        >
          +
        </button>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
        {cards.map((card) => (
          <KanbanCard key={card.id} card={card} onClick={() => onEdit(card)} />
        ))}
        {cards.length === 0 && (
          <div className="rounded-xl border border-dashed border-stone-200 px-3 py-6 text-center">
            <p className="text-[10px] text-stone-300">No cards yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanClient({
  cards,
  topics,
}: {
  cards: CardRow[];
  topics: Topic[];
}) {
  const [editingCard, setEditingCard] = useState<ModalCard | null>(null);

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-5 py-3 flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-stone-900"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Capture
          </h1>
          <p className="text-xs text-stone-400">
            Capture ideas fast. Triage them later.
          </p>
        </div>
        <span className="text-xs text-stone-400">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </span>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-3 px-4 py-4 min-w-max">
          {/* Column dividers */}
          {CATEGORIES.map((category, i) => (
            <div key={category} className="flex h-full">
              <KanbanColumn
                category={category}
                cards={cards.filter((c) => c.category === category)}
                onAdd={() => setEditingCard(EMPTY_CARD(category))}
                onEdit={(card) =>
                  setEditingCard({
                    ...card,
                    source_title: card.source_title ?? "",
                    source_url: card.source_url ?? "",
                    scripture: card.scripture ?? "",
                    connected_topic_ids: card.connected_topic_ids ?? [],
                  })
                }
              />
              {i < CATEGORIES.length - 1 && (
                <div className="w-px bg-stone-200 mx-1 self-stretch" />
              )}
            </div>
          ))}
        </div>
      </div>

      {editingCard && (
        <CardModal
          card={editingCard}
          topics={topics}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
