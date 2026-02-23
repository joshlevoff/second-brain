"use client";

import { CAT_STYLE, LEVEL_COLORS, SOURCE_ICONS } from "@/app/(app)/_lib/constants";
import type { CardRow } from "@/app/actions/cards";
import { useMemo, useState } from "react";
import { TopicModal, type TopicRow } from "./topic-modal";

// ─── Tree Item ───────────────────────────────────────────────────────────────

function TopicTreeItem({
  topic,
  allTopics,
  allCards,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAddChild,
  onEdit,
}: {
  topic: TopicRow;
  allTopics: TopicRow[];
  allCards: CardRow[];
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (topic: TopicRow) => void;
}) {
  const children = allTopics.filter((t) => t.parent_id === topic.id);
  const isExpanded = expandedIds.has(topic.id);
  const isSelected = topic.id === selectedId;
  const cardCount = allCards.filter((c) =>
    (c.connected_topic_ids ?? []).includes(topic.id)
  ).length;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg mx-1 transition-colors ${
          isSelected
            ? "bg-amber-50 text-amber-900"
            : "hover:bg-stone-50 text-stone-600"
        }`}
        style={{ paddingLeft: 12 + depth * 14 }}
        onClick={() => onSelect(topic.id)}
      >
        {/* Expand chevron */}
        <button
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-stone-300 hover:text-stone-500"
          onClick={(e) => {
            e.stopPropagation();
            if (children.length > 0) onToggle(topic.id);
          }}
        >
          {children.length > 0 ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <span className="w-3" />
          )}
        </button>

        {/* Level dot */}
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: LEVEL_COLORS[depth] || "#94a3b8" }}
        />

        {/* Number */}
        <span className="font-mono text-[10px] text-stone-400 flex-shrink-0">
          {topic.number}
        </span>

        {/* Emoji + Title */}
        <span className="text-xs flex-1 truncate">
          {topic.emoji && <span className="mr-1">{topic.emoji}</span>}
          {topic.title}
        </span>

        {/* Card count */}
        {cardCount > 0 && (
          <span className="text-[9px] text-stone-400 bg-stone-100 rounded-full px-1.5 py-0.5 flex-shrink-0">
            {cardCount}
          </span>
        )}

        {/* Hover actions */}
        <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(topic.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-amber-600 text-xs"
            title="Add child topic"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(topic);
            }}
            className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-stone-700 text-xs"
            title="Edit topic"
          >
            ✎
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TopicTreeItem
              key={child.id}
              topic={child}
              allTopics={allTopics}
              allCards={allCards}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Topic Detail Panel ───────────────────────────────────────────────────────

function TopicDetail({
  topic,
  allTopics,
  allCards,
  onSelectTopic,
  onEditTopic,
  onAddChild,
}: {
  topic: TopicRow;
  allTopics: TopicRow[];
  allCards: CardRow[];
  onSelectTopic: (id: string) => void;
  onEditTopic: (t: TopicRow) => void;
  onAddChild: (parentId: string) => void;
}) {
  const breadcrumb = useMemo(() => {
    const path: TopicRow[] = [];
    let cur: TopicRow | undefined = topic;
    while (cur) {
      path.unshift(cur);
      cur = allTopics.find((t) => t.id === cur!.parent_id);
    }
    return path;
  }, [topic, allTopics]);

  const children = allTopics.filter((t) => t.parent_id === topic.id);
  const relatedTopics = allTopics.filter((t) =>
    (topic.related_topic_ids ?? []).includes(t.id)
  );
  const linkedCards = allCards.filter((c) =>
    (c.connected_topic_ids ?? []).includes(topic.id)
  );

  const catStyle = (cat: string) =>
    CAT_STYLE[cat] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[11px] text-stone-400 mb-4 flex-wrap">
        {breadcrumb.map((t, i) => (
          <span key={t.id} className="flex items-center gap-1">
            {i > 0 && <span className="text-stone-300">›</span>}
            <button
              onClick={() => onSelectTopic(t.id)}
              className={`hover:text-amber-700 transition-colors ${
                t.id === topic.id ? "text-stone-700 font-semibold" : ""
              }`}
            >
              {t.number} {t.title}
            </button>
          </span>
        ))}
      </nav>

      {/* Title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-stone-400">
              {topic.number}
            </span>
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: LEVEL_COLORS[topic.level] || "#94a3b8" }}
            />
          </div>
          <h2
            className="text-2xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {topic.emoji && <span className="mr-2">{topic.emoji}</span>}
            {topic.title}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddChild(topic.id)}
            className="text-xs text-stone-500 border border-stone-200 rounded-xl px-3 py-1.5 hover:bg-white hover:border-stone-300 transition-colors"
          >
            + Child
          </button>
          <button
            onClick={() => onEditTopic(topic)}
            className="text-xs text-stone-500 border border-stone-200 rounded-xl px-3 py-1.5 hover:bg-white hover:border-stone-300 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Sub-topics */}
      {children.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            Sub-topics ({children.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => onSelectTopic(child.id)}
                className="bg-white border border-stone-200 rounded-xl p-3 text-left hover:border-amber-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        LEVEL_COLORS[child.level] || "#94a3b8",
                    }}
                  />
                  <span className="font-mono text-[10px] text-stone-400">
                    {child.number}
                  </span>
                  {child.emoji && (
                    <span className="text-sm">{child.emoji}</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-stone-700 group-hover:text-amber-800 leading-snug">
                  {child.title}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {
                    allCards.filter((c) =>
                      (c.connected_topic_ids ?? []).includes(child.id)
                    ).length
                  }{" "}
                  cards
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Related topics */}
      {relatedTopics.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            Related
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTopic(t.id)}
                className="inline-flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-3 py-1 text-xs text-stone-600 hover:border-amber-300 hover:text-amber-800 transition-colors"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: LEVEL_COLORS[t.level] || "#94a3b8" }}
                />
                <span className="font-mono text-[10px] text-stone-400">
                  {t.number}
                </span>
                {t.emoji} {t.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Linked cards */}
      <section>
        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
          Linked Cards ({linkedCards.length})
        </h3>
        {linkedCards.length === 0 ? (
          <div className="text-center py-8 text-stone-300">
            <p className="text-sm">No cards linked to this topic yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {linkedCards.map((card) => {
              const s = catStyle(card.category);
              return (
                <div
                  key={card.id}
                  className="bg-white border border-stone-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4
                      className="text-sm font-semibold text-stone-800 leading-snug"
                      style={{
                        fontFamily: "var(--font-playfair), Georgia, serif",
                      }}
                    >
                      {card.title}
                    </h4>
                    <span
                      style={{
                        background: s.bg,
                        color: s.text,
                        border: `1px solid ${s.border}`,
                      }}
                      className="rounded-full text-[9px] font-bold px-2 py-0.5 flex-shrink-0"
                    >
                      {card.category}
                    </span>
                  </div>
                  {card.body && (
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {card.body}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {card.source_title && (
                      <span className="text-[9px] text-stone-400">
                        {SOURCE_ICONS[card.source_type] || "📌"}{" "}
                        {card.source_title}
                      </span>
                    )}
                    {card.scripture && (
                      <span className="text-[9px] text-amber-600 font-medium ml-auto">
                        {card.scripture}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

type ModalState =
  | null
  | { type: "new-root" }
  | { type: "new-child"; parentId: string }
  | { type: "edit"; topic: TopicRow };

export function TopicsClient({
  topics,
  cards,
}: {
  topics: TopicRow[];
  cards: CardRow[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    topics[0]?.id ?? null
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(topics.filter((t) => !t.parent_id).map((t) => t.id))
  );
  const [modal, setModal] = useState<ModalState>(null);

  const rootTopics = topics.filter((t) => !t.parent_id);
  const selectedTopic = topics.find((t) => t.id === selectedId) ?? null;

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const getModalProps = () => {
    if (!modal) return null;
    if (modal.type === "new-root")
      return { topic: null, defaultParentId: null };
    if (modal.type === "new-child")
      return { topic: null, defaultParentId: modal.parentId };
    return { topic: modal.topic, defaultParentId: null };
  };

  const modalProps = getModalProps();

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-5 py-3 flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-stone-900"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Topics
          </h1>
          <p className="text-xs text-stone-400">
            Your Luhmann knowledge tree
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "new-root" })}
          className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-colors"
        >
          + Root Topic
        </button>
      </div>

      {/* Tree + Detail */}
      <div className="flex flex-1 overflow-hidden bg-stone-50">
        {/* Left tree panel */}
        <div className="w-64 flex-shrink-0 border-r border-stone-200 bg-white overflow-y-auto py-2">
          {rootTopics.length === 0 ? (
            <div className="px-4 py-8 text-center text-stone-300">
              <p className="text-xs">No topics yet.</p>
              <p className="text-xs mt-1">
                Click &ldquo;+ Root Topic&rdquo; to start.
              </p>
            </div>
          ) : (
            rootTopics.map((topic) => (
              <TopicTreeItem
                key={topic.id}
                topic={topic}
                allTopics={topics}
                allCards={cards}
                depth={0}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={(id) => {
                  setSelectedId(id);
                  // Auto-expand parent chain
                  setExpandedIds((prev) => {
                    const next = new Set(prev);
                    let cur = topics.find((t) => t.id === id);
                    while (cur?.parent_id) {
                      next.add(cur.parent_id);
                      cur = topics.find((t) => t.id === cur!.parent_id);
                    }
                    return next;
                  });
                }}
                onToggle={toggleExpanded}
                onAddChild={(parentId) =>
                  setModal({ type: "new-child", parentId })
                }
                onEdit={(t) => setModal({ type: "edit", topic: t })}
              />
            ))
          )}
        </div>

        {/* Right detail panel */}
        {selectedTopic ? (
          <TopicDetail
            topic={selectedTopic}
            allTopics={topics}
            allCards={cards}
            onSelectTopic={setSelectedId}
            onEditTopic={(t) => setModal({ type: "edit", topic: t })}
            onAddChild={(parentId) =>
              setModal({ type: "new-child", parentId })
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-300">
            <p className="text-sm">Select a topic to view details</p>
          </div>
        )}
      </div>

      {/* Topic Modal */}
      {modalProps !== null && (
        <TopicModal
          topic={modalProps.topic}
          defaultParentId={modalProps.defaultParentId}
          allTopics={topics}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
