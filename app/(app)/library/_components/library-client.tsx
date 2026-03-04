"use client";

import { CardModal } from "@/app/(app)/_components/card-modal";
import {
  CAT_STYLE,
  LEVEL_COLORS,
  SOURCE_ICONS,
} from "@/app/(app)/_lib/constants";
import {
  bulkUpdateCardCategory,
  updateCardCategory,
  type CardRow,
} from "@/app/actions/cards";
import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
  type CategoryRow,
} from "@/app/actions/categories";
import { useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Card = CardRow;
type Topic = {
  id: string;
  number: string;
  title: string;
  level: number;
  parent_id: string | null;
};

type ModalCard = {
  id?: string;
  title: string;
  body: string;
  category: string;
  status: string;
  source_type: string;
  source_title: string | null;
  source_url: string | null;
  scripture: string | null;
  connected_topic_ids: string[];
};

const EMPTY_CARD = (category: string): ModalCard => ({
  title: "",
  body: "",
  category,
  status: "Processed",
  source_type: "Note",
  source_title: null,
  source_url: null,
  scripture: null,
  connected_topic_ids: [],
});

const toModalCard = (card: Card): ModalCard => ({
  id: card.id,
  title: card.title,
  body: card.body,
  category: card.category,
  status: card.status,
  source_type: card.source_type,
  source_title: card.source_title,
  source_url: card.source_url,
  scripture: card.scripture,
  connected_topic_ids: card.connected_topic_ids ?? [],
});

// ─── Icons ────────────────────────────────────────────────────────────────────

const KanbanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <rect x="3" y="3" width="5" height="18" rx="1" />
    <rect x="10" y="3" width="5" height="12" rx="1" />
    <rect x="17" y="3" width="5" height="15" rx="1" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SmallCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SmallXIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── CatBadge ─────────────────────────────────────────────────────────────────

const CatBadge = ({ cat }: { cat: string }) => {
  const s = CAT_STYLE[cat] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  return (
    <span
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
      className="inline-block rounded-full font-semibold tracking-wide text-[10px] px-2 py-0.5"
    >
      {cat}
    </span>
  );
};

// ─── Kanban column ────────────────────────────────────────────────────────────

function KanbanColumn({
  category,
  cards,
  getTopicLabel,
  onAdd,
  onEdit,
  isDragOver,
  draggedCardId,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropCard,
  onCardDragStart,
  onCardDragEnd,
  selectedIds,
  onToggleSelect,
  allInColumnSelected,
  onToggleSelectAll,
  isTouchDevice,
}: {
  category: string;
  cards: Card[];
  getTopicLabel: (id: string) => string;
  onAdd: () => void;
  onEdit: (card: Card) => void;
  isDragOver: boolean;
  draggedCardId: string | null;
  onDragOverColumn: () => void;
  onDragLeaveColumn: () => void;
  onDropCard: (cardId: string) => Promise<void>;
  onCardDragStart: (e: React.DragEvent, cardId: string) => void;
  onCardDragEnd: () => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  allInColumnSelected: boolean;
  onToggleSelectAll: () => void;
  isTouchDevice: boolean;
}) {
  const s = CAT_STYLE[category] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <div
      className={`flex flex-col flex-shrink-0 w-[260px] h-full rounded-xl transition-colors ${
        isDragOver ? "ring-2 ring-amber-400" : ""
      }`}
      style={{ background: isDragOver ? "#fffbeb" : s.bg + "55" }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOverColumn();
      }}
      onDragLeave={onDragLeaveColumn}
      onDrop={async (e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("cardId");
        if (!cardId) return;
        onDragLeaveColumn();
        await onDropCard(cardId);
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
            className="rounded-full text-[10px] font-bold px-2 py-0.5 tracking-wide"
          >
            {category}
          </span>
          <span className="text-xs text-stone-400">{cards.length}</span>
          {cards.length > 0 && (
            <button
              onClick={onToggleSelectAll}
              className="text-[9px] text-stone-400 hover:text-amber-700 underline transition-colors"
            >
              {allInColumnSelected ? "Deselect" : "Select all"}
            </button>
          )}
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

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
        {cards.map((card) => {
          const isSelected = selectedIds.has(card.id);
          const isHovered = hoveredCardId === card.id;
          const showCheckbox = isHovered || isSelected || isTouchDevice;

          return (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => onCardDragStart(e, card.id)}
              onDragEnd={onCardDragEnd}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              className={`relative bg-white rounded-xl border transition-all ${
                isSelected
                  ? "ring-2 ring-amber-400 ring-inset border-amber-300"
                  : "border-stone-200 hover:border-amber-300 hover:shadow-sm"
              } ${draggedCardId === card.id ? "opacity-40" : "opacity-100"}`}
            >
              {/* Checkbox — absolutely positioned, does NOT bubble to card body */}
              <label
                className={`absolute top-2 right-2 z-10 cursor-pointer transition-opacity ${
                  showCheckbox ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(card.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "bg-white border-stone-300 hover:border-amber-400"
                  }`}
                >
                  {isSelected && <CheckIcon />}
                </div>
              </label>

              {/* Card body — click opens modal */}
              <div
                onClick={() => onEdit(card)}
                className="p-3 cursor-pointer group"
              >
                <h3
                  className="text-xs font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors pr-6"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {card.title}
                </h3>
                {card.body && (
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {card.body}
                  </p>
                )}
                {(card.source_title ||
                  (card.connected_topic_ids ?? []).length > 0 ||
                  card.scripture) && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {card.source_type && card.source_type !== "Note" && card.source_title && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-stone-500 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5">
                        <span>{SOURCE_ICONS[card.source_type] || "📌"}</span>
                        <span className="font-medium truncate max-w-[80px]">{card.source_title}</span>
                      </span>
                    )}
                    {(card.connected_topic_ids ?? []).slice(0, 2).map((id) => {
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
                      <span className="text-[9px] text-amber-600 font-medium">
                        {card.scripture}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {cards.length === 0 && (
          <div className="rounded-xl border border-dashed border-stone-200 px-3 py-8 text-center">
            <p className="text-[10px] text-stone-300">No cards</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List view card ───────────────────────────────────────────────────────────

function LibraryListCard({
  card,
  getTopicLabel,
  onClick,
}: {
  card: Card;
  getTopicLabel: (id: string) => string;
  onClick: () => void;
}) {
  const s = CAT_STYLE[card.category] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  return (
    <div
      onClick={onClick}
      className="bg-white border border-stone-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group flex"
    >
      <div className="w-1 flex-shrink-0" style={{ background: s.border }} />
      <div className="flex-1 px-4 py-3">
        <h3
          className="text-sm font-semibold text-stone-800 leading-snug group-hover:text-amber-800 transition-colors"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {card.title}
        </h3>
        {card.body && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {card.body}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {card.source_type && card.source_type !== "Note" && card.source_title && (
            <span className="inline-flex items-center gap-1 text-[9px] text-stone-500 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5">
              <span>{SOURCE_ICONS[card.source_type] || "📌"}</span>
              <span className="font-medium truncate max-w-[120px]">{card.source_title}</span>
            </span>
          )}
          {(card.connected_topic_ids || []).slice(0, 3).map((id) => {
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
            <span className="text-[9px] text-amber-600 font-medium">
              {card.scripture}
            </span>
          )}
          <time className="text-[9px] text-stone-400 ml-auto flex-shrink-0">
            {relativeDate(card.created_at)}
          </time>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function LibraryClient({
  cards: initialCards,
  topics,
  categories: initialCategories,
}: {
  cards: Card[];
  topics: Topic[];
  categories: CategoryRow[];
}) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingCard, setEditingCard] = useState<ModalCard | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Category management
  const [managingCats, setManagingCats] = useState(false);
  const [catInput, setCatInput] = useState("");
  const [catAddError, setCatAddError] = useState<string | null>(null);
  const [catDeleteErrors, setCatDeleteErrors] = useState<Record<string, string>>({});
  // Rename
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  // Reorder
  const [catDraggedId, setCatDraggedId] = useState<string | null>(null);
  const [catDropIndex, setCatDropIndex] = useState<number | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTargetCat, setBulkTargetCat] = useState("");

  const slipCats = categories.map((c) => c.name);
  const modalCategories = ["Unprocessed", ...slipCats];

  useEffect(() => {
    const stored = localStorage.getItem("library-view");
    if (stored === "list") setView("list");
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  useEffect(() => { setSelectedIds(new Set()); setBulkTargetCat(""); }, [view]);
  useEffect(() => { setSelectedIds(new Set()); setBulkTargetCat(""); }, [filterCat, filterTopic]);

  const changeView = (v: "kanban" | "list") => {
    setView(v);
    localStorage.setItem("library-view", v);
  };

  const topicsForFilter = useMemo(() => {
    const relevantCards = filterCat
      ? cards.filter((c) => c.category === filterCat)
      : cards;
    const usedIds = new Set(relevantCards.flatMap((c) => c.connected_topic_ids || []));
    return topics.filter((t) => usedIds.has(t.id));
  }, [topics, cards, filterCat]);

  const baseFilteredCards = useMemo(() => {
    let r = cards;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) => c.title?.toLowerCase().includes(q) || c.body?.toLowerCase().includes(q)
      );
    }
    if (filterTopic)
      r = r.filter((c) => (c.connected_topic_ids || []).includes(filterTopic));
    return r;
  }, [cards, search, filterTopic]);

  const listFilteredCards = useMemo(() => {
    if (!filterCat) return baseFilteredCards;
    return baseFilteredCards.filter((c) => c.category === filterCat);
  }, [baseFilteredCards, filterCat]);

  const visibleColumns = filterCat
    ? slipCats.filter((c) => c === filterCat)
    : slipCats;

  const getTopicLabel = (id: string) => {
    const t = topics.find((x) => x.id === id);
    return t ? `${t.number} ${t.title}` : "";
  };

  // ─── Card move handlers ───────────────────────────────────────────────────

  const handleMoveCard = async (cardId: string, newCategory: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, category: newCategory, status: newCategory === "Unprocessed" ? "Unprocessed" : "Processed" }
          : c
      )
    );
    await updateCardCategory(cardId, newCategory);
  };

  const handleBulkMove = async (targetCategory: string) => {
    const idArray = Array.from(selectedIds);
    setCards((prev) =>
      prev.map((c) =>
        idArray.includes(c.id)
          ? { ...c, category: targetCategory, status: targetCategory === "Unprocessed" ? "Unprocessed" : "Processed" }
          : c
      )
    );
    setSelectedIds(new Set());
    setBulkTargetCat("");
    await bulkUpdateCardCategory(idArray, targetCategory);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = (cat: string) => {
    const colIds = baseFilteredCards.filter((c) => c.category === cat).map((c) => c.id);
    const allSelected = colIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) colIds.forEach((id) => next.delete(id));
      else colIds.forEach((id) => next.add(id));
      return next;
    });
  };

  // ─── Category management handlers ────────────────────────────────────────

  const handleDeleteCategory = async (cat: CategoryRow) => {
    const count = cards.filter((c) => c.category === cat.name).length;
    if (count > 0) {
      setCatDeleteErrors((prev) => ({
        ...prev,
        [cat.id]: `${count} card${count === 1 ? "" : "s"} use this category. Reassign them first.`,
      }));
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setCatDeleteErrors((prev) => { const n = { ...prev }; delete n[cat.id]; return n; });
    if (filterCat === cat.name) setFilterCat(null);
    const result = await deleteCategory(cat.id);
    if ("error" in result) {
      setCategories((prev) =>
        [...prev, cat].sort((a, b) => a.sort_order - b.sort_order)
      );
      setCatDeleteErrors((prev) => ({ ...prev, [cat.id]: result.error }));
    }
  };

  const handleAddCategory = async () => {
    const name = catInput.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setCatAddError("Category already exists.");
      return;
    }
    if (categories.length >= 20) return;
    setCatInput("");
    setCatAddError(null);
    const result = await createCategory(name);
    if ("error" in result) {
      setCatAddError(result.error);
    } else {
      setCategories((prev) => [...prev, result.category]);
    }
  };

  const handleRenameConfirm = async (catId: string) => {
    const name = renameDraft.trim();
    if (!name) return;
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    if (name === cat.name) { setEditingCatId(null); return; }
    if (categories.some((c) => c.id !== catId && c.name.toLowerCase() === name.toLowerCase())) {
      setRenameError("Category already exists.");
      return;
    }
    const oldName = cat.name;
    // Optimistic update
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, name } : c));
    setCards((prev) => prev.map((c) => c.category === oldName ? { ...c, category: name } : c));
    if (filterCat === oldName) setFilterCat(name);
    setEditingCatId(null);
    setRenameError(null);
    const result = await renameCategory(catId, name);
    if (result.error) {
      // Rollback
      setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, name: oldName } : c));
      setCards((prev) => prev.map((c) => c.category === name ? { ...c, category: oldName } : c));
      if (filterCat === name) setFilterCat(oldName);
    }
  };

  // ─── Category reorder handlers ────────────────────────────────────────────

  const handleCatDragStart = (e: React.DragEvent, catId: string) => {
    setCatDraggedId(catId);
    e.dataTransfer.setData("catId", catId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setCatDropIndex(index);
  };

  const handleCatDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const catId = e.dataTransfer.getData("catId");
    if (!catId) { setCatDraggedId(null); setCatDropIndex(null); return; }
    const dragIndex = categories.findIndex((c) => c.id === catId);
    if (dragIndex === -1 || dragIndex === dropIndex) {
      setCatDraggedId(null); setCatDropIndex(null); return;
    }
    const newOrder = [...categories];
    const [dragged] = newOrder.splice(dragIndex, 1);
    const insertAt = dropIndex > dragIndex ? dropIndex - 1 : dropIndex;
    newOrder.splice(insertAt, 0, dragged);
    setCategories(newOrder);
    setCatDraggedId(null);
    setCatDropIndex(null);
    await reorderCategories(newOrder.map((c) => c.id));
  };

  const handleCatDragEnd = () => {
    setCatDraggedId(null);
    setCatDropIndex(null);
  };

  // ─── Derived ─────────────────────────────────────────────────────────────

  const filterBar = (filterCat || filterTopic) && (
    <div className="flex items-center gap-2 mb-4 text-xs text-stone-500 flex-shrink-0">
      <span className="text-stone-400">Showing</span>
      {filterCat && <CatBadge cat={filterCat} />}
      {filterCat && filterTopic && <span className="text-stone-300">+</span>}
      {filterTopic && (
        <span className="bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          {getTopicLabel(filterTopic)}
        </span>
      )}
      <button
        onClick={() => { setFilterCat(null); setFilterTopic(null); }}
        className="text-stone-400 hover:text-red-400 ml-1"
      >
        ✕ Clear
      </button>
      <span className="text-stone-300 ml-auto">{listFilteredCards.length} cards</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-5 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-stone-900" style={{ fontFamily: "Georgia, serif" }}>
            Library
          </h1>
          <p className="text-xs text-stone-400">Browse and filter your knowledge base</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="bg-stone-100 rounded-xl pl-4 pr-4 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-300 w-44"
          />
          <div className="flex items-center rounded-lg border border-stone-200 overflow-hidden">
            <button
              onClick={() => changeView("kanban")}
              className={`px-2.5 py-1.5 transition-colors ${
                view === "kanban" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:text-stone-700"
              }`}
              title="Kanban view"
            >
              <KanbanIcon />
            </button>
            <button
              onClick={() => changeView("list")}
              className={`px-2.5 py-1.5 transition-colors border-l border-stone-200 ${
                view === "list" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:text-stone-700"
              }`}
              title="List view"
            >
              <ListIcon />
            </button>
          </div>
          <button
            onClick={() => setEditingCard(EMPTY_CARD(slipCats[0] ?? "Studies"))}
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

          {/* Category header + gear */}
          <div className="flex items-center justify-between px-4 mb-1.5">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
              Category
            </p>
            <button
              onClick={() => {
                setManagingCats(!managingCats);
                setCatAddError(null);
                setCatDeleteErrors({});
                setEditingCatId(null);
                setRenameError(null);
              }}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              title="Manage categories"
            >
              <GearIcon />
            </button>
          </div>

          {managingCats ? (
            /* ── Manage panel ── */
            <div className="px-3 pb-3">
              <div
                className="space-y-0.5 mb-3"
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setCatDropIndex(null);
                  }
                }}
              >
                {categories.map((cat, index) => {
                  const count = cards.filter((c) => c.category === cat.name).length;
                  const isBeingDragged = catDraggedId === cat.id;
                  const showDropIndicator = catDropIndex === index && catDraggedId !== null && catDraggedId !== cat.id;
                  const isEditing = editingCatId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      draggable
                      onDragStart={(e) => handleCatDragStart(e, cat.id)}
                      onDragOver={(e) => handleCatDragOver(e, index)}
                      onDrop={(e) => handleCatDrop(e, index)}
                      onDragEnd={handleCatDragEnd}
                      className={`rounded-lg transition-all ${
                        showDropIndicator ? "border-t-2 border-amber-400" : ""
                      } ${isBeingDragged ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-center px-1 py-1.5 hover:bg-stone-50 rounded-lg group">
                        {/* Drag handle */}
                        <span
                          className="text-stone-300 hover:text-stone-500 mr-1.5 flex-shrink-0 select-none text-sm cursor-grab active:cursor-grabbing leading-none"
                          title="Drag to reorder"
                        >
                          ⠿
                        </span>

                        {isEditing ? (
                          /* Inline rename input */
                          <div className="flex-1 flex items-center gap-1 min-w-0">
                            <input
                              autoFocus
                              value={renameDraft}
                              onChange={(e) => { setRenameDraft(e.target.value); setRenameError(null); }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameConfirm(cat.id);
                                if (e.key === "Escape") { setEditingCatId(null); setRenameError(null); }
                              }}
                              className="flex-1 min-w-0 border border-amber-300 rounded px-1.5 py-0.5 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => handleRenameConfirm(cat.id)}
                              className="text-green-500 hover:text-green-700 flex-shrink-0"
                              title="Confirm"
                            >
                              <SmallCheckIcon />
                            </button>
                            <button
                              onClick={() => { setEditingCatId(null); setRenameError(null); }}
                              className="text-stone-400 hover:text-stone-600 flex-shrink-0"
                              title="Cancel"
                            >
                              <SmallXIcon />
                            </button>
                          </div>
                        ) : (
                          /* Display mode */
                          <>
                            <span className="text-xs text-stone-700 truncate flex-1">{cat.name}</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] text-stone-400">{count}</span>
                              <button
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setRenameDraft(cat.name);
                                  setRenameError(null);
                                }}
                                className="text-stone-300 hover:text-amber-500 transition-colors"
                                title="Rename"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="text-stone-300 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Per-row errors */}
                      {catDeleteErrors[cat.id] && (
                        <p className="text-[10px] text-red-500 px-2 pb-1 leading-tight">
                          {catDeleteErrors[cat.id]}
                        </p>
                      )}
                      {isEditing && renameError && (
                        <p className="text-[10px] text-red-500 px-2 pb-1 leading-tight">
                          {renameError}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* End drop zone */}
                <div
                  className={`h-3 rounded transition-colors ${
                    catDropIndex === categories.length && catDraggedId !== null
                      ? "border-t-2 border-amber-400"
                      : ""
                  }`}
                  onDragOver={(e) => handleCatDragOver(e, categories.length)}
                  onDrop={(e) => handleCatDrop(e, categories.length)}
                />
              </div>

              {categories.length < 20 ? (
                <div className="flex gap-1.5 mt-1">
                  <input
                    value={catInput}
                    onChange={(e) => { setCatInput(e.target.value); setCatAddError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    placeholder="New category name..."
                    className="flex-1 border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 min-w-0"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-2.5 py-1 bg-stone-900 text-white text-xs rounded-lg hover:bg-stone-700 flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 italic px-1">Maximum reached</p>
              )}
              {catAddError && (
                <p className="text-[10px] text-red-500 mt-1">{catAddError}</p>
              )}

              <button
                onClick={() => setManagingCats(false)}
                className="text-[10px] text-amber-600 hover:text-amber-800 font-medium mt-3 block"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Filter buttons ── */
            <>
              <button
                onClick={() => { setFilterCat(null); setFilterTopic(null); }}
                className={`w-full text-left text-xs px-4 py-2 transition-colors ${
                  !filterCat ? "text-amber-800 bg-amber-50 font-semibold" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                All <span className="text-stone-400 ml-1">{cards.length}</span>
              </button>
              {categories.map((cat) => {
                const count = cards.filter((c) => c.category === cat.name).length;
                const s = CAT_STYLE[cat.name] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilterCat(filterCat === cat.name ? null : cat.name);
                      setFilterTopic(null);
                    }}
                    className={`w-full text-left text-xs px-4 py-2 transition-colors ${
                      filterCat === cat.name ? "font-semibold" : "text-stone-500 hover:bg-stone-50"
                    }`}
                    style={filterCat === cat.name ? { color: s.text, background: s.bg } : {}}
                  >
                    {cat.name} <span className="text-stone-400 ml-1">{count}</span>
                  </button>
                );
              })}
            </>
          )}

          {topicsForFilter.length > 0 && !managingCats && (
            <>
              <div className="mx-4 my-3 border-t border-stone-100" />
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-1.5">
                Topic
              </p>
              <button
                onClick={() => setFilterTopic(null)}
                className={`w-full text-left text-xs px-4 py-1.5 transition-colors ${
                  !filterTopic ? "text-amber-800 font-semibold bg-amber-50" : "text-stone-400 hover:bg-stone-50"
                }`}
              >
                All topics
              </button>
              {topicsForFilter.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterTopic(filterTopic === t.id ? null : t.id)}
                  className={`w-full text-left text-xs py-1.5 transition-colors flex items-center gap-1.5 ${
                    filterTopic === t.id ? "text-amber-800 bg-amber-50 font-semibold" : "text-stone-500 hover:bg-stone-50"
                  }`}
                  style={{ paddingLeft: 16 + t.level * 10 }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: LEVEL_COLORS[t.level] || "#94a3b8" }}
                  />
                  <span className="truncate">{t.number} {t.title}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Main Content */}
        {view === "kanban" ? (
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {(filterCat || filterTopic) && (
              <div className="flex-shrink-0 px-4 pt-4">{filterBar}</div>
            )}
            <div className="flex-1 flex overflow-x-auto gap-3 px-4 py-4">
              {visibleColumns.map((cat) => {
                const colCards = baseFilteredCards.filter((c) => c.category === cat);
                const allInColumnSelected =
                  colCards.length > 0 && colCards.every((c) => selectedIds.has(c.id));
                return (
                  <KanbanColumn
                    key={cat}
                    category={cat}
                    cards={colCards}
                    getTopicLabel={getTopicLabel}
                    onAdd={() => setEditingCard(EMPTY_CARD(cat))}
                    onEdit={(card) => setEditingCard(toModalCard(card))}
                    isDragOver={dragOverColumn === cat}
                    draggedCardId={draggedCardId}
                    onDragOverColumn={() => setDragOverColumn(cat)}
                    onDragLeaveColumn={() => setDragOverColumn(null)}
                    onDropCard={async (cardId) => handleMoveCard(cardId, cat)}
                    onCardDragStart={(e, cardId) => {
                      e.dataTransfer.setData("cardId", cardId);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedCardId(cardId);
                    }}
                    onCardDragEnd={() => {
                      setDraggedCardId(null);
                      setDragOverColumn(null);
                    }}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    allInColumnSelected={allInColumnSelected}
                    onToggleSelectAll={() => handleToggleSelectAll(cat)}
                    isTouchDevice={isTouchDevice}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            {filterBar}
            <div className="flex flex-col gap-2 max-w-4xl">
              {listFilteredCards.map((card) => (
                <LibraryListCard
                  key={card.id}
                  card={card}
                  getTopicLabel={getTopicLabel}
                  onClick={() => setEditingCard(toModalCard(card))}
                />
              ))}
            </div>
            {listFilteredCards.length === 0 && (
              <div className="text-center py-16 text-stone-300">
                <p className="text-sm">No cards match this filter.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Modal */}
      {editingCard !== null && (
        <CardModal
          card={editingCard}
          topics={topics}
          categories={modalCategories}
          onClose={() => setEditingCard(null)}
        />
      )}

      {/* Bulk action bar — kanban only */}
      {view === "kanban" && selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg py-4 px-6 flex items-center gap-4">
          <span className="text-sm text-stone-700 font-medium">
            {selectedIds.size} card{selectedIds.size === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-stone-500">Move to:</span>
            <select
              value={bulkTargetCat}
              onChange={(e) => setBulkTargetCat(e.target.value)}
              className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-amber-400 bg-white"
            >
              <option value="">Select category...</option>
              {modalCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => bulkTargetCat && handleBulkMove(bulkTargetCat)}
              disabled={!bulkTargetCat}
              className="px-4 py-1.5 text-xs font-bold bg-stone-900 hover:bg-stone-700 disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              Move
            </button>
            <button
              onClick={() => { setSelectedIds(new Set()); setBulkTargetCat(""); }}
              className="px-3 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
