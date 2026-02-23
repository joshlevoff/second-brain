"use client";

import { CardModal } from "@/app/(app)/_components/card-modal";
import { CAT_STYLE, SOURCE_ICONS } from "@/app/(app)/_lib/constants";
import { createCard, type CardRow } from "@/app/actions/cards";
import { useEffect, useRef, useState, useTransition } from "react";

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

const UNPROCESSED_STYLE = CAT_STYLE["Unprocessed"];

const EMPTY_UNPROCESSED = (): ModalCard => ({
  title: "",
  body: "",
  category: "Unprocessed",
  status: "Unprocessed",
  source_type: "Note",
  source_title: "",
  source_url: "",
  scripture: "",
  connected_topic_ids: [],
});

const toModalCard = (card: CardRow): ModalCard => ({
  id: card.id,
  title: card.title,
  body: card.body,
  category: card.category,
  status: card.status,
  source_type: card.source_type,
  source_title: card.source_title ?? "",
  source_url: card.source_url ?? "",
  scripture: card.scripture ?? "",
  connected_topic_ids: card.connected_topic_ids ?? [],
});

// ─── Icons ────────────────────────────────────────────────────────────────────

const ListIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="w-4 h-4"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const KanbanIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="w-4 h-4"
  >
    <rect x="3" y="3" width="7" height="18" rx="1" />
    <rect x="14" y="3" width="7" height="12" rx="1" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── List view card ────────────────────────────────────────────────────────────

function ListCard({
  card,
  topics,
  onClick,
}: {
  card: CardRow;
  topics: Topic[];
  onClick: () => void;
}) {
  const getTopicLabel = (id: string) => {
    const t = topics.find((x) => x.id === id);
    return t ? `${t.number} ${t.title}` : null;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-stone-200 rounded-xl px-5 py-4 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <h3
          className="text-sm font-semibold text-stone-800 leading-snug group-hover:text-amber-800 transition-colors"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {card.title}
        </h3>
        <time className="text-[10px] text-stone-400 flex-shrink-0 mt-0.5">
          {relativeDate(card.created_at)}
        </time>
      </div>

      {card.body && (
        <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
          {card.body}
        </p>
      )}

      {(card.source_title ||
        (card.connected_topic_ids ?? []).length > 0 ||
        card.scripture) && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {card.source_title && (
            <span className="inline-flex items-center gap-1 text-[9px] text-stone-500 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5">
              <span>{SOURCE_ICONS[card.source_type] || "📌"}</span>
              <span className="font-medium truncate max-w-[120px]">
                {card.source_title}
              </span>
            </span>
          )}
          {(card.connected_topic_ids ?? []).slice(0, 3).map((id) => {
            const label = getTopicLabel(id);
            return label ? (
              <span
                key={id}
                className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 font-mono"
              >
                {label}
              </span>
            ) : null;
          })}
          {card.scripture && (
            <span className="text-[9px] text-amber-600 font-medium ml-auto flex-shrink-0">
              {card.scripture}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Kanban column (single — Unprocessed only) ────────────────────────────────

function KanbanColumn({
  cards,
  onAdd,
  onEdit,
}: {
  cards: CardRow[];
  onAdd: () => void;
  onEdit: (card: CardRow) => void;
}) {
  const s = UNPROCESSED_STYLE;
  return (
    <div className="flex flex-col w-80 mx-auto h-full">
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
            Unprocessed
          </span>
          <span className="text-xs text-stone-400">{cards.length}</span>
        </div>
        <button
          onClick={onAdd}
          style={{ color: s.text }}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold hover:opacity-70 transition-opacity"
          title="Add card"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => onEdit(card)}
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
          </div>
        ))}
        {cards.length === 0 && (
          <div className="rounded-xl border border-dashed border-stone-200 px-3 py-8 text-center">
            <p className="text-[10px] text-stone-300">Inbox is clear</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function KanbanClient({
  cards,
  topics,
}: {
  cards: CardRow[];
  topics: Topic[];
}) {
  const unprocessed = cards.filter((c) => c.status === "Unprocessed");

  const [view, setView] = useState<"list" | "kanban">("list");
  const [editingCard, setEditingCard] = useState<ModalCard | null>(null);
  const [quickInput, setQuickInput] = useState("");
  const [toast, setToast] = useState(false);
  const [isCapturing, startCapture] = useTransition();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate view preference from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem("capture-view");
    if (stored === "kanban") setView("kanban");
  }, []);

  const changeView = (v: "list" | "kanban") => {
    setView(v);
    localStorage.setItem("capture-view", v);
  };

  const handleQuickCapture = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !quickInput.trim() || isCapturing) return;
    const title = quickInput.trim();
    setQuickInput("");
    startCapture(async () => {
      await createCard({
        title,
        body: "",
        category: "Unprocessed",
        status: "Unprocessed",
        source_type: "Note",
        source_title: "",
        source_url: "",
        scripture: "",
        connected_topic_ids: [],
      });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast(true);
      toastTimer.current = setTimeout(() => setToast(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-5 py-3 flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-stone-900"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            📥 Capture
          </h1>
          <p className="text-xs text-stone-400">Your unprocessed inbox</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-2.5 py-1">
            {unprocessed.length}{" "}
            {unprocessed.length === 1 ? "card" : "cards"}
          </span>
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-stone-200 overflow-hidden">
            <button
              onClick={() => changeView("list")}
              className={`px-2.5 py-1.5 transition-colors ${
                view === "list"
                  ? "bg-stone-900 text-white"
                  : "text-stone-400 hover:text-stone-700 bg-white"
              }`}
              title="List view"
            >
              <ListIcon />
            </button>
            <button
              onClick={() => changeView("kanban")}
              className={`px-2.5 py-1.5 transition-colors border-l border-stone-200 ${
                view === "kanban"
                  ? "bg-stone-900 text-white"
                  : "text-stone-400 hover:text-stone-700 bg-white"
              }`}
              title="Kanban view"
            >
              <KanbanIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Quick capture */}
      <div className="flex-shrink-0 px-5 py-3 bg-white border-b border-stone-100">
        <div className="relative max-w-2xl">
          <input
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleQuickCapture}
            disabled={isCapturing}
            placeholder="Drop an idea here... press Enter to capture"
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors disabled:opacity-50"
          />
          {/* Toast */}
          {toast && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 pointer-events-none">
              Captured ✓
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {view === "list" ? (
          <div className="flex flex-col gap-2 max-w-2xl">
            {unprocessed.length === 0 ? (
              <div className="text-center py-16 text-stone-300">
                <p className="text-sm">Inbox is clear. Nice work.</p>
              </div>
            ) : (
              unprocessed.map((card) => (
                <ListCard
                  key={card.id}
                  card={card}
                  topics={topics}
                  onClick={() => setEditingCard(toModalCard(card))}
                />
              ))
            )}
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <KanbanColumn
              cards={unprocessed}
              onAdd={() => setEditingCard(EMPTY_UNPROCESSED())}
              onEdit={(card) => setEditingCard(toModalCard(card))}
            />
          </div>
        )}
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
