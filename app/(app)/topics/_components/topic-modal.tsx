"use client";

import { createTopic, deleteTopic, updateTopic } from "@/app/actions/topics";
import { LEVEL_COLORS } from "@/app/(app)/_lib/constants";
import { useMemo, useState, useTransition } from "react";

export type TopicRow = {
  id: string;
  user_id?: string;
  number: string;
  title: string;
  emoji: string;
  level: number;
  parent_id: string | null;
  related_topic_ids: string[];
  created_at?: string;
};

const QUICK_EMOJIS = ["📚", "🧠", "💡", "🗂", "✍️", "🔬", "🎯", "⚡", "🌱", "🔑"];

function getNextNumber(
  parentId: string | null,
  level: number,
  siblings: TopicRow[],
  parentNumber: string | null
): string {
  if (level === 0) {
    const maxNum = siblings.reduce((max, s) => {
      const n = parseInt(s.number);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return String(maxNum + 1);
  }
  const pNum = parentNumber!;
  const useLetter = level % 2 === 1;
  if (useLetter) {
    const maxCode = siblings.reduce((max, s) => {
      const c = s.number.slice(pNum.length).charAt(0).toLowerCase();
      return c ? Math.max(max, c.charCodeAt(0)) : max;
    }, "a".charCodeAt(0) - 1);
    return pNum + String.fromCharCode(maxCode + 1);
  } else {
    const maxNum = siblings.reduce((max, s) => {
      const n = parseInt(s.number.slice(pNum.length));
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return pNum + String(maxNum + 1);
  }
}

export function TopicModal({
  topic,
  defaultParentId,
  allTopics,
  onClose,
}: {
  topic: TopicRow | null;
  defaultParentId: string | null;
  allTopics: TopicRow[];
  onClose: () => void;
}) {
  const isNew = !topic;
  const [title, setTitle] = useState(topic?.title ?? "");
  const [emoji, setEmoji] = useState(topic?.emoji ?? "");
  const [parentId, setParentId] = useState<string | null>(
    isNew ? defaultParentId : topic?.parent_id ?? null
  );
  const [relatedIds, setRelatedIds] = useState<string[]>(
    topic?.related_topic_ids ?? []
  );
  const [relSearch, setRelSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const parent = parentId ? allTopics.find((t) => t.id === parentId) : null;
  const level = parent ? parent.level + 1 : 0;

  const previewNumber = useMemo(() => {
    if (!isNew) return topic!.number;
    // isNew is true here — no existing topic to exclude from siblings
    const siblings = allTopics.filter((t) => t.parent_id === parentId);
    return getNextNumber(parentId, level, siblings, parent?.number ?? null);
  }, [isNew, topic, parentId, allTopics, level, parent]);

  const filteredRelated = allTopics.filter(
    (t) =>
      t.id !== topic?.id &&
      `${t.number} ${t.title}`
        .toLowerCase()
        .includes(relSearch.toLowerCase())
  );

  const toggleRelated = (id: string) =>
    setRelatedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const getLabel = (id: string) => {
    const t = allTopics.find((x) => x.id === id);
    return t ? `${t.number} ${t.title}` : id;
  };

  const handleSave = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      if (isNew) {
        await createTopic({
          number: previewNumber,
          title: title.trim(),
          emoji,
          level,
          parent_id: parentId,
          related_topic_ids: relatedIds,
        });
      } else {
        await updateTopic(topic!.id, {
          title: title.trim(),
          emoji,
          related_topic_ids: relatedIds,
        });
      }
      onClose();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTopic(topic!.id);
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2
            className="font-bold text-stone-800 text-lg"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {isNew ? "New Topic" : "Edit Topic"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Number preview */}
          <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: LEVEL_COLORS[level] || "#94a3b8" }}
            />
            <span className="text-xs text-stone-500">
              {isNew ? "Will be assigned" : "Number"}:
            </span>
            <span className="font-mono text-sm font-bold text-stone-800">
              {previewNumber}
            </span>
            <span className="text-xs text-stone-400 ml-auto">
              Level {level}
            </span>
          </div>

          {/* Emoji + Title */}
          <div className="flex gap-3">
            <div className="w-16">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                Emoji
              </label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="📚"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-center text-lg focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Topic name..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick emoji picks */}
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-base px-1.5 py-0.5 rounded-lg transition-colors ${
                  emoji === e
                    ? "bg-amber-100 ring-1 ring-amber-400"
                    : "hover:bg-stone-100"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Parent selector (new topics only) */}
          {isNew && (
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                Parent Topic
              </label>
              <select
                value={parentId ?? ""}
                onChange={(e) =>
                  setParentId(e.target.value || null)
                }
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:border-amber-400"
              >
                <option value="">— Root (no parent) —</option>
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {"  ".repeat(t.level)}
                    {t.number} {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Related topics */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
              Related Topics
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {relatedIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] px-2 py-0.5 font-medium"
                >
                  {getLabel(id)}
                  <button
                    onClick={() => toggleRelated(id)}
                    className="hover:text-red-500 text-xs leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              {relatedIds.length === 0 && (
                <span className="text-[10px] text-stone-300 italic">
                  None linked
                </span>
              )}
            </div>
            <input
              value={relSearch}
              onChange={(e) => setRelSearch(e.target.value)}
              placeholder="Search topics to link..."
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400"
            />
            {relSearch && (
              <div className="mt-1 border border-stone-200 rounded-xl overflow-hidden max-h-32 overflow-y-auto">
                {filteredRelated.slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      toggleRelated(t.id);
                      setRelSearch("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-left border-b border-stone-50 last:border-0"
                  >
                    <div
                      className={`w-3 h-3 rounded border-2 flex-shrink-0 ${
                        relatedIds.includes(t.id)
                          ? "bg-amber-500 border-amber-500"
                          : "border-stone-300"
                      }`}
                    />
                    <span className="text-xs text-stone-600">
                      <span className="text-stone-400 font-mono text-[10px] mr-1">
                        {t.number}
                      </span>
                      {t.emoji} {t.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          {topic?.id ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Delete topic?</span>
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
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete
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
              disabled={isPending || !title.trim()}
              className="px-5 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-700 disabled:opacity-40 text-white rounded-xl"
            >
              {isNew ? "Create Topic" : "Save Topic"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
