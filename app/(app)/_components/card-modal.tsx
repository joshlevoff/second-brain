"use client";

import { createCard, deleteCard, updateCard } from "@/app/actions/cards";
import {
  CAT_STYLE,
  CATEGORIES,
  SOURCE_TYPES,
} from "@/app/(app)/_lib/constants";
import { useState, useTransition } from "react";

const ic = {
  x: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-3.5 h-3.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  trash: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-3.5 h-3.5"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="w-3.5 h-3.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

type Topic = { id: string; number: string; title: string; level: number };

type CardData = {
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

export function CardModal({
  card,
  topics,
  onClose,
}: {
  card: CardData | null;
  topics: Topic[];
  onClose: () => void;
}) {
  const isNew = !card?.id;
  const [form, setForm] = useState({
    title: card?.title ?? "",
    body: card?.body ?? "",
    category: card?.category ?? "Unprocessed",
    status: card?.status ?? "Unprocessed",
    source_type: card?.source_type ?? "Note",
    source_title: card?.source_title ?? "",
    source_url: card?.source_url ?? "",
    scripture: card?.scripture ?? "",
    connected_topic_ids: card?.connected_topic_ids ?? [],
  });
  const [topicSearch, setTopicSearch] = useState("");
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredTopics = topics.filter((t) =>
    `${t.number} ${t.title}`
      .toLowerCase()
      .includes(topicSearch.toLowerCase())
  );

  const toggleTopic = (id: string) =>
    setForm((f) => ({
      ...f,
      connected_topic_ids: f.connected_topic_ids.includes(id)
        ? f.connected_topic_ids.filter((x) => x !== id)
        : [...f.connected_topic_ids, id],
    }));

  const getLabel = (id: string) => {
    const t = topics.find((x) => x.id === id);
    return t ? `${t.number} ${t.title}` : id;
  };

  const handleSave = () => {
    startTransition(async () => {
      const finalForm = {
        ...form,
        status:
          form.category === "Unprocessed" ? "Unprocessed" : "Processed",
      };
      if (isNew) await createCard(finalForm);
      else await updateCard(card!.id!, finalForm);
      onClose();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCard(card!.id!);
      onClose();
    });
  };

  const inputClass =
    "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors";
  const smallInputClass =
    "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 bg-white";
  const labelClass =
    "block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 flex-shrink-0">
          <h2
            className="font-bold text-stone-800 text-lg"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {isNew ? "New Card" : "Edit Card"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            {ic.x}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Title / Atomic Idea</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="One idea, stated as a claim..."
              className={inputClass}
            />
          </div>

          {/* Body */}
          <div>
            <label className={labelClass}>Content</label>
            <textarea
              value={form.body}
              onChange={(e) =>
                setForm((f) => ({ ...f, body: e.target.value }))
              }
              placeholder="Expand the idea in your own words..."
              rows={4}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Source */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Source
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] text-stone-400 mb-1">
                  Type
                </label>
                <select
                  value={form.source_type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, source_type: e.target.value }))
                  }
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-amber-400 bg-white"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] text-stone-400 mb-1">
                  Title / Author
                </label>
                <input
                  value={form.source_title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, source_title: e.target.value }))
                  }
                  placeholder="Book title, article name..."
                  className={smallInputClass}
                />
              </div>
            </div>
            {["URL", "Article", "YouTube"].includes(form.source_type) && (
              <div>
                <label className="block text-[9px] text-stone-400 mb-1">
                  URL
                </label>
                <input
                  value={form.source_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, source_url: e.target.value }))
                  }
                  placeholder="https://..."
                  className={smallInputClass}
                />
              </div>
            )}
          </div>

          {/* Category + Scripture */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:border-amber-400 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Scripture</label>
              <input
                value={form.scripture}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scripture: e.target.value }))
                }
                placeholder="e.g. Proverbs 27:17"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-amber-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Connected Topics */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass}>Connected Topics</label>
              <button
                onClick={() => setShowTopicPicker(!showTopicPicker)}
                className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold"
              >
                {showTopicPicker ? "Done" : "+ Link Topic"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.connected_topic_ids.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] px-2 py-0.5 font-medium"
                >
                  {getLabel(id)}
                  <button
                    onClick={() => toggleTopic(id)}
                    className="hover:text-red-500"
                  >
                    {ic.x}
                  </button>
                </span>
              ))}
              {form.connected_topic_ids.length === 0 && (
                <span className="text-[10px] text-stone-300 italic">
                  None linked
                </span>
              )}
            </div>
            {showTopicPicker && (
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="p-2 border-b border-stone-100">
                  <input
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Search topics..."
                    className="w-full text-xs px-2 py-1 focus:outline-none text-stone-700 placeholder:text-stone-300"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredTopics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTopic(t.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-left border-b border-stone-50 last:border-0"
                    >
                      <div
                        className={`w-3 h-3 rounded border-2 flex-shrink-0 ${
                          form.connected_topic_ids.includes(t.id)
                            ? "bg-amber-500 border-amber-500"
                            : "border-stone-300"
                        }`}
                      />
                      <span
                        style={{ paddingLeft: t.level * 12 }}
                        className="text-xs text-stone-600"
                      >
                        <span className="text-stone-400 font-mono text-[10px] mr-1">
                          {t.number}
                        </span>
                        {t.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
          {card?.id ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">
                  Delete this card?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs font-bold text-red-500 hover:text-red-700"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600"
              >
                {ic.trash} Delete
              </button>
            )
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !form.title.trim()}
              className="px-5 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-700 disabled:opacity-40 text-white rounded-xl flex items-center gap-1.5"
            >
              {ic.check} {isNew ? "Create Card" : "Save Card"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
